import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from sqlmodel import Session

# Import our new database components
from app.database import GameState, get_session, create_db_and_tables
from app.agent import game_engine

# Initialize the app
app = FastAPI(title="Case Zero API")


# Ensure the database tables are created when the server starts
@app.on_event("startup")
def on_startup():
    create_db_and_tables()


INITIAL_TRANSMISSION = {
    "role": "system",
    "text": "[RADIO LINK ESTABLISHED]\n\nOp-Center: 'Rookie, you are at the Blackwood gates. The entire village vanished overnight, including the Chief. Our last squad went dark at the INRFS camp after reporting an unidentified entity.'\n\n'Your loadout is light: a sidearm, limited rounds, and a combat knife. Conserve your ammo. Breach the village, find out where everyone went, and survive.'\n\n'I am monitoring your vitals remotely. If you lose your bearings, hit [ Call Handler ] and I will give you a tactical read. Keep your eyes open. Over.'\n\n[TRANSMISSION END]\n\nYou stand at the desolate entrance of Blackwood. The silence is deafening.",
}


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Next.js sends here
class PlayerAction(BaseModel):
    email: str
    action: str


# Routes
@app.get("/")
def health_check():
    """healthcheck route"""
    return {"status": "online", "message": "Command center active."}


@app.post("/api/action")
def process_turn(data: PlayerAction, session: Session = Depends(get_session)):
    """Takes the player's action, runs the AI, and returns the narrative."""

    # 1. Fetch the player's save file from Postgres (or create a new one)
    current_state = session.get(GameState, data.email)
    if not current_state:
        current_state = GameState(email=data.email, chat_history=[INITIAL_TRANSMISSION])
        session.add(current_state)

    # 2. Append the new user prompt to the DB History (and limit to 20)
    # We make a copy of the list so SQLAlchemy knows it changed
    new_history = (
        current_state.chat_history.copy() if current_state.chat_history else []
    )
    new_history.append({"role": "user", "text": data.action})
    new_history = new_history[-20:]
    current_state.chat_history = new_history

    # 3. Grab ONLY the last 4 messages to give the AI context
    context_messages = []
    for msg in new_history[-4:]:
        if msg["role"] == "user":
            context_messages.append(HumanMessage(content=msg["text"]))
        elif msg["role"] == "ai":
            context_messages.append(AIMessage(content=msg["text"]))
        elif msg["role"] == "system":
            context_messages.append(AIMessage(content=msg["text"]))

    # 4. Package the state for LangGraph
    ai_input = {
        "messages": context_messages,
        "game_state": current_state,
    }

    # 5. RUN THE GAME MASTER
    print(f"Running AI for {data.email}...")
    max_retries = 3
    final_text = ""

    for attempt in range(max_retries):
        try:
            ai_response = game_engine.invoke(ai_input)
            final_text = ai_response["messages"][-1].content
            break

        except Exception as e:
            print(f"AI Generation Error (Attempt {attempt + 1}/{max_retries}): {e}")
            if attempt == max_retries - 1:
                final_text = "A sudden, violent spike of static rings in your ears, causing your vision to blur. You lose your train of thought. \n\n[TERMINAL ERROR: Data corruption detected. Please rephrase your last action.]"

    # 6. Append the AI's response to the DB History (and limit to 20 again)
    final_history = current_state.chat_history.copy()
    final_history.append({"role": "ai", "text": final_text})
    final_history = final_history[-20:]
    current_state.chat_history = final_history

    # 7. COMMIT TO DATABASE
    # This securely saves the updated health, ammo, trust, and chat history to Postgres!
    session.add(current_state)
    session.commit()
    session.refresh(current_state)

    return {
        "status": "success",
        "response_text": final_text,
        # Base Stats
        "updated_health": current_state.health,
        "updated_ammo": current_state.ammo,
        "current_noise": current_state.noise_level,
        # Faction Trust
        "villager_trust": current_state.villager_trust,
        "cultists_trust": current_state.cultists_trust,
        "leader_trust": current_state.leader_trust,
        # UI Navigation & Inventory
        "current_room": current_state.current_room,
        "inventory": current_state.inventory,
        # Lore & Progression
        "known_npcs": current_state.known_npcs,
        "story_chapter": current_state.story_chapter,
        "has_manor_key": current_state.has_manor_key,
        "has_church_key": current_state.has_church_key,
        "is_over": current_state.is_game_over,
        "is_won": current_state.is_game_won,
    }


@app.get("/api/state/{email}")
def get_save_file(email: str, session: Session = Depends(get_session)):
    """Fetches the player's current save file on page load."""

    # Check the database for the user
    current_state = session.get(GameState, email)

    # If they don't exist yet, tell the frontend it's a new game
    if not current_state:
        return {"status": "new_game", "message": "No save file found. Ready to start."}

    # If they do exist, return their entire state!
    return {
        "status": "success",
        "chat_history": current_state.chat_history,
        "health": current_state.health,
        "ammo": current_state.ammo,
        "current_room": current_state.current_room,
        "inventory": current_state.inventory,
        "noise_level": current_state.noise_level,
        "villager_trust": current_state.villager_trust,
        "cultists_trust": current_state.cultists_trust,
        "leader_trust": current_state.leader_trust,
        "known_npcs": current_state.known_npcs,
        "story_chapter": current_state.story_chapter,
        "has_manor_key": current_state.has_manor_key,
        "has_church_key": current_state.has_church_key,
        "is_game_over": current_state.is_game_over,
        "is_game_won": current_state.is_game_won,
    }


@app.delete("/api/reset/{email}")
def reset_save_file(email: str, session: Session = Depends(get_session)):
    """Deletes the player's save file to start a new game."""
    current_state = session.get(GameState, email)
    if current_state:
        session.delete(current_state)
        session.commit()
    return {"status": "success", "message": "Game reset."}
