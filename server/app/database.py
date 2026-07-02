from pydantic import BaseModel
from typing import List, Optional


class GameState(BaseModel):
    email: str
    health: int = 100
    ammo: int = 8
    current_room: str = "village_entrance"
    inventory: List[str] = ["pistol", "torch"]

    # --- PROGRESSION FLAGS ---
    story_chapter: int = 1
    has_manor_key: bool = False
    has_church_key: bool = False

    # --- FACTION TRUST ---
    villager_trust: int = 0
    cultists_trust: int = 0
    leader_trust: int = 0
    known_npcs: dict = {}

    # --- HIDDEN STATS ---
    noise_level: int = 0
    entity_awareness: int = 0
    notable_events: List[str] = []

    is_game_over: bool = False
    is_game_won: bool = False
