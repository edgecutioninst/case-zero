import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from app.database import GameState
from app.agent import game_engine

# Initialize the app
app = FastAPI(title="Case Zero API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Next.js sends here
class PlayerAction(BaseModel):
    email: str
    action: str


MOCK_DB = {}


# Routes
@app.get("/")
def health_check():
    """healthcheck route"""
    return {"status": "online", "message": "Command center active."}


@app.post("/api/action")
def process_turn(data: PlayerAction):
    """Takes the player's action, runs the AI, and returns the narrative."""

    # 1. Fetch the player's save file (or create a new one)
    if data.email not in MOCK_DB:
        MOCK_DB[data.email] = GameState(email=data.email)

    current_state = MOCK_DB[data.email]

    # 2. Package the state for LangGraph
    ai_input = {
        "messages": [HumanMessage(content=data.action)],
        "game_state": current_state,
    }

    # 3. RUN THE GAME MASTER
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
