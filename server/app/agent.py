from typing import Annotated, TypedDict
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from pydantic import Field, BaseModel
from app.database import GameState
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# ---------------------------------------------------------
# 1. The Lore Dictionary
# ---------------------------------------------------------
ROOM_LORE = {
    "village_entrance": "A desolate dirt path leading into Blackwood. Thick fog chokes the air, and a biting, unnatural frost clings to the dead trees. The temperature is dropping fast.",
    "old_church": "A crumbling sanctuary. The pews are violently pushed against the walls to form makeshift barricades. Deep, jagged scratch marks tear through the heavy oak altar. The air smells of ozone and old copper.",
    "village_square": "The center of town. Utterly empty. A frozen fountain sits in the middle, the water suspended in jagged ice spikes. The silence here is heavy, broken only by the crunch of frost underfoot.",
    "chiefs_manor": "A grand, decaying mansion looming over the village. The windows are heavily boarded from the *inside*. The interior smells of rot, expensive cigars, and dried blood. This was the epicenter of the cult's influence.",
    "smithy": "A dilapidated stone workshop. The main furnace is dead, filled with strange, blue-tinged ice instead of ash. Rusted, malformed tools are scattered across the floor, some resembling surgical instruments more than hammers.",
    "cultist_camp": "A perimeter of ragged tents pitched between the church and the manor. The fire pit is smoldering. Visceral, geometric symbols are carved deep into the surrounding tree trunks. The sickeningly sweet smell of ritual incense hangs in the freezing air.",
    "inrfs_camp": "The forward operating base of the previous CIA recon team. It is a slaughterhouse. Tactical gear is shredded, and frozen blood coats the radios. Whatever hit them moved too fast for them to fire a single shot.",
    "survivor_hideout": "A cluster of fortified shacks between the church and smithy. Piles of canned food and spent shell casings litter the corners. You can feel eyes watching you from the gaps in the floorboards, but the shadows remain perfectly still.",
}


class AIActionOutput(BaseModel):
    narrative: str = Field(description="The atmospheric story text to show the player.")
    ammo_deducted: int = Field(
        description="Number of bullets the player fired in this turn. Default 0."
    )
    health_deducted: int = Field(
        description="Amount of damage the player takes this turn. Default 0."
    )
    noise_added: int = Field(
        description="Noise generated (e.g.,0 for walking, 5 for running, 20 for shooting). Default 0."
    )
    villager_trust_change: int = Field(
        description="Change in villager trust (can be negative). Default 0."
    )
    cultists_trust_change: int = Field(
        description="Change in cultist trust. Default 0."
    )
    leader_trust_change: int = Field(
        description="Change in leader trust, he will know of the player's every action. Default 0."
    )
    new_notable_event: str = Field(
        description="If the player does something major, summarize it in one sentence. Otherwise, leave empty."
    )
    new_known_npc: str = Field(
        description="If the player meets a new NPC, summarize their name and traits in one sentence. Otherwise, leave empty."
    )
    new_inventory_item: str = Field(
        description="If the player finds a new item (weapon, tool, lore note), name it here. Otherwise, leave empty."
    )
    new_room: str = Field(
        description="If the player moves, output the exact location key (e.g., 'village_square', 'old_church'). Otherwise, leave empty."
    )
    new_story_chapter: int = Field(
        description="If the player enters the Manor (Chapter 2) or the Church (Chapter 3), output the new chapter number. Otherwise 0."
    )
    new_has_manor_key: bool = Field(
        description="Set to true if the player earns or finds the Manor Key this turn. Default false."
    )
    new_has_church_key: bool = Field(
        description="Set to true if the player earns or finds the Church Key this turn. Default false."
    )
    entity_awareness_added: int = Field(
        description="How much the entity becomes aware of the player this turn. Firing guns or making loud noise should add 10-30. Sneaking adds 0. Default 0."
    )


# ---------------------------------------------------------
# 2. The LLM Setup
# ---------------------------------------------------------
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.6,
)

structured_llm = llm.with_structured_output(AIActionOutput)


def build_system_prompt(state: GameState) -> str:
    current_lore = ROOM_LORE.get(state.current_room, "An unknown, pitch-black sector.")

    chapter_rules = ""
    if state.story_chapter == 1:
        chapter_rules = """
        CHAPTER 1 RULES:
        - The Chief's Manor is locked heavy iron. The player CANNOT enter without the Manor Key.
        - They are supposed to go to villagers to gather information, or cultists, or the inrfs camp.
        - The Old Church is sealed shut. The player CANNOT enter.
        - If they try to enter locked areas, describe the impenetrable doors and mock their futile efforts.
        """
    elif state.story_chapter == 2:
        chapter_rules = """
        CHAPTER 2 RULES:
        - The player is exploring the Chief's Manor. 
        - The entity outside is hunting actively. If they go back outside, increase the tension heavily.
        - The Old Church is still locked until they find the Church Key.
        """
    elif state.story_chapter == 3:
        chapter_rules = """
        CHAPTER 3 RULES:
        - The finale. The player has breached the Old Church.
        - The atmosphere should be terrifying, climactic, and deadly. No holding back.
        """

    prompt = f"""You are the Game Master of 'Case Zero', a psychological thriller text game. 
    You are directing a tense, atmospheric slow-burn. Rely on paranoia and sensory details.
    
    {chapter_rules}
        
    YOUR CURRENT CONTEXT:
    - Location: {state.current_room}
    - Environment Details: {current_lore}
    
    PLAYER STATUS (Rookie CIA Agent):
    - Health: {state.health}/100
    - Ammo: {state.ammo} bullets
    - Inventory: {', '.join(state.inventory)}
    - Known NPCs: {state.known_npcs}
    - Has Manor Key: {state.has_manor_key}
    - Has Church Key: {state.has_church_key}
    
    HIDDEN MECHANICS:
    - Noise Level: {state.noise_level} (If high, describe something massive hunting the noise).
    - Entity Awareness: {state.entity_awareness} (If high, the temperature drops violently).
    
    FACTION REPUTATION:
    - Cultist Trust: {state.cultists_trust}/100 
    - Villager Trust: {state.villager_trust}/100 
    - Chief's Trust: {state.leader_trust}/100 

    THE CHIEF IS WATCHING:
    - The Village Chief sees everything. 
    - Notable actions the player has taken: {', '.join(state.notable_events) if state.notable_events else 'None yet.'}
    - Have the Chief or Cultists cryptically taunt the player about these specific past actions to induce paranoia.
    
    WORLD NAVIGATION & STATE (CRITICAL INSTRUCTIONS):
    - If the player successfully moves to a new area, YOU MUST output the exact dictionary key of that location in `new_room` (e.g., 'village_square', 'cultist_camp').
    - If the player finds an item, output it in `new_inventory_item`.
    - If the player earns a key, set the respective key boolean to true.
    
    CORE RULES:
    1. BE CONCISE & PUNCHY: Limit responses to 2-3 short paragraphs. 
    2. SHOW, DON'T TELL: NEVER output raw numbers for hidden mechanics. 
    3. CONSEQUENCES ARE BRUTAL: Punish reckless gameplay.
    4. AGENCY: Never force the player's character to take an action they didn't type.
    5. THE HANDOFF: Always end by prompting the player for their next move, varying your phrasing.
    """
    return prompt


# ---------------------------------------------------------
# 4. The LangGraph State & Engine
# ---------------------------------------------------------
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    game_state: GameState


def generate_narrative(state: AgentState):
    current_game_state = state["game_state"]
    system_instructions = build_system_prompt(current_game_state)
    conversation = [SystemMessage(content=system_instructions)] + state["messages"]

    ai_action: AIActionOutput = structured_llm.invoke(conversation)

    # 1. Base Stats Math
    current_game_state.ammo = max(0, current_game_state.ammo - ai_action.ammo_deducted)
    current_game_state.health = max(
        0, current_game_state.health - ai_action.health_deducted
    )
    current_game_state.noise_level += ai_action.noise_added

    # 2. Trust Math
    current_game_state.villager_trust = max(
        0, min(100, current_game_state.villager_trust + ai_action.villager_trust_change)
    )
    current_game_state.cultists_trust = max(
        0, min(100, current_game_state.cultists_trust + ai_action.cultists_trust_change)
    )
    current_game_state.leader_trust = max(
        0, min(100, current_game_state.leader_trust + ai_action.leader_trust_change)
    )

    # 3. Memory & Lore Updates
    if ai_action.new_notable_event:
        current_game_state.notable_events.append(ai_action.new_notable_event)

    if ai_action.new_known_npc:
        # We generate a unique ID for the new NPC and store their description
        npc_id = f"npc_{len(current_game_state.known_npcs) + 1}"
        current_game_state.known_npcs[npc_id] = ai_action.new_known_npc

    if ai_action.new_inventory_item:
        current_game_state.inventory.append(ai_action.new_inventory_item)

    # 4. World Navigation Updates
    # We check if the room the AI gave us actually exists in our lore dictionary!
    if ai_action.new_room and ai_action.new_room in ROOM_LORE:
        current_game_state.current_room = ai_action.new_room

    if ai_action.new_story_chapter > 0:
        # Ensure chapter only goes up, never backwards
        current_game_state.story_chapter = max(
            current_game_state.story_chapter, ai_action.new_story_chapter
        )

    if ai_action.new_has_manor_key:
        current_game_state.has_manor_key = True

    if ai_action.new_has_church_key:
        current_game_state.has_church_key = True

    if current_game_state.noise_level > 60:
        current_game_state.entity_awareness = min(
            100, current_game_state.entity_awareness + 15
        )

    if current_game_state.health <= 0:
        return {
            "messages": [
                AIMessage(
                    content=ai_action.narrative + "\n\n[YOU DIED. CASE ZERO — CLOSED.]"
                )
            ]
        }

    return {"messages": [AIMessage(content=ai_action.narrative)]}


workflow = StateGraph(AgentState)
workflow.add_node("game_master", generate_narrative)
workflow.add_edge(START, "game_master")
workflow.add_edge("game_master", END)

game_engine = workflow.compile()
