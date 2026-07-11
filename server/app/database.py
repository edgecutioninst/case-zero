import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, Field, Column, create_engine, Session
from sqlalchemy import JSON
from typing import List

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


class GameState(SQLModel, table=True):
    email: str = Field(primary_key=True)
    health: int = Field(default=100)
    ammo: int = Field(default=8)
    current_room: str = Field(default="village_entrance")

    known_npcs: dict = Field(default_factory=dict, sa_column=Column(JSON))
    notable_events: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    inventory: List[str] = Field(
        default_factory=lambda: ["pistol", "torch", "knife", "map"],
        sa_column=Column(JSON),
    )

    # --- PROGRESSION FLAGS ---
    story_chapter: int = Field(default=1)
    has_manor_key: bool = Field(default=False)
    has_church_key: bool = Field(default=False)

    # --- FACTION TRUST ---
    villager_trust: int = Field(default=0)
    cultists_trust: int = Field(default=0)
    leader_trust: int = Field(default=0)

    # --- HIDDEN STATS ---
    noise_level: int = Field(default=0)
    entity_awareness: int = Field(default=0)

    is_game_over: bool = Field(default=False)
    is_game_won: bool = Field(default=False)

    # --- COMMUNICATION LOGS ---
    chat_history: List[dict] = Field(default=[], sa_column=Column(JSON))


# Database Connection Setup

engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    """Creates the tables in the database if they don't exist already."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Provides a database session for FastAPI routes."""
    with Session(engine) as session:
        yield session
