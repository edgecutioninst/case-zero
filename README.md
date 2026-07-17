# 🎮 Case Zero

> **A narrative-driven survival horror game where an AI acts as the Game Master.**
>
> Every command you type is interpreted by an LLM, which dynamically generates story progression, combat outcomes, world events, and consequences while maintaining a persistent game state.

<p align="center">
  <a href="https://case-zero-liard.vercel.app/landing"><strong>🎮 Live Demo</strong></a>
</p>

![Case Zero Gameplay](https://github.com/user-attachments/assets/628d6a6f-4f2b-4871-b87a-c7f5c862bdb9)

<p align="center">

<img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,fastapi,python,postgresql&theme=dark" />

</p>

<p align="center">

<img src="https://img.shields.io/badge/NextAuth-black?style=for-the-badge&logo=auth0&logoColor=white"/>
<img src="https://img.shields.io/badge/LangGraph-6C47FF?style=for-the-badge"/>
<img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge"/>
<img src="https://img.shields.io/badge/SQLModel-CC6699?style=for-the-badge"/>

</p>

---

# Mission Brief

Blackwood Village has gone silent.

Your squad disappeared after investigating unusual activity near the INRFS camp. The final transmission mentioned something beneath the ice... then the signal vanished.

Armed with only a sidearm, a combat knife, and limited ammunition, every decision matters.

Unlike traditional text adventures, **Case Zero has no predefined dialogue tree.**

Instead, an AI acts as the **Game Master**, interpreting your actions, remembering previous events, updating the world state, and generating unique scenarios in real time.

No two playthroughs are exactly the same.

---

# ✨ Features

## 🤖 AI Game Master

- AI-driven dynamic storytelling
- Context-aware responses
- Persistent narrative memory
- Consequence-based decision making
- Dynamic NPC interactions

---

## 🎲 Survival Gameplay

- Inventory management
- Health system
- Ammunition tracking
- Weapon management
- Branching encounters
- Persistent player progression

---

## 🖥️ Tactical Interface

- Retro military terminal UI
- Animated command console
- Tactical HUD
- Interactive mission map
- Dynamic inventory panel
- Ambient audio system

---

## ⚙️ Backend Systems

- AI-generated game progression
- Structured game state updates
- Persistent save system
- Database-backed player sessions
- REST API powered by FastAPI

---

## ☁️ Deployment

- Frontend deployed on **Vercel**
- Backend deployed on **Render**
- Fully Dockerized
- Local development via Docker Compose


## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- NextAuth

### Backend

- FastAPI
- LangGraph
- LangChain
- SQLModel
- PostgreSQL

### AI

- Google Gemini

### DevOps

- Docker
- Docker Compose
- Render
- Vercel

---

# 🏗️ Architecture

```text
                    Player
                       │
                       ▼
            Next.js Frontend
                       │
                 REST Requests
                       │
                       ▼
                FastAPI Server
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
     LangGraph Agent          PostgreSQL
          │
          ▼
        Gemini 
          │
          ▼
 Structured Game Response
          │
          ▼
 Updated Player State
```

---

# 🧠 AI Pipeline

Every player action follows the same processing pipeline.

```text
Player Input
      │
      ▼
FastAPI Endpoint
      │
      ▼
Load Current Game State
      │
      ▼
LangGraph Agent
      │
      ▼
    Gemini
      │
      ▼
Structured Response
      │
      ▼
Update Database
      │
      ▼
Return New Story + HUD Updates
```

Instead of generating plain text, the AI produces structured responses that describe:

- narrative progression
- player health
- inventory updates
- ammunition changes
- world events
- mission status

allowing the frontend to update the HUD and gameplay consistently.

---

# 📂 Project Structure

```text
case-zero
│
├── client/
│   ├── app/
│   ├── components/
│   ├── providers/
│   ├── public/
│   └── Dockerfile
│
├── server/
│   ├── app/
│   │   ├── agent.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── routes.py
│   │   └── ...
│   ├── Dockerfile
│   └── pyproject.toml
│
└── docker-compose.yml
```

---

# 🚀 Running Locally

## Clone the repository

```bash
git clone https://github.com/edgecutioninst/case-zero.git

cd case-zero
```

---

## Start with Docker

```bash
docker compose up --build
```

The application will be available at

Frontend

```
http://localhost:3000
```

Backend

```
http://localhost:8000
```

---

## Manual Setup

### Frontend

```bash
cd client

npm install

npm run dev
```

---

### Backend

```bash
cd server

uv sync

uv run uvicorn app.main:app --reload
```

---

# Environment Variables

## Client

```env
NEXTAUTH_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_API_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Server

```env
DATABASE_URL=

GOOGLE_API_KEY=

```

---

# 💡 Technical Challenges

## Maintaining Narrative Consistency

Every AI response must respect previous player choices, inventory updates, mission progress, and world events without contradicting earlier interactions.

---

## Structured LLM Output

Instead of relying on free-form text, the backend validates structured responses describing gameplay events, ensuring reliable synchronization between the AI, backend, and frontend HUD.

---

## Persistent Game State

Player statistics, inventory, objectives, and world progression are stored independently from AI responses, allowing the story to continue across multiple sessions.

---

## Immersive Terminal Experience

The interface recreates the feeling of operating through a military command terminal using animated text rendering, tactical HUD elements, mission briefings, and contextual sound effects.

---

# 🎯 Design Goals

Case Zero explores how modern LLMs can move beyond simple chatbots and function as consistent Game Masters capable of driving interactive gameplay.

The project focuses on:

- immersive storytelling
- persistent world state
- structured AI responses
- responsive game interfaces
- scalable backend architecture

---

# 🔮 Future Improvements

- Voice interaction
- Procedural side quests
- Multiple campaign routes
- Save slots
- Achievement system
- Expanded world map
<img width="1919" height="881" alt="Screenshot 2026-07-15 203933" src="https://github.com/user-attachments/assets/2992b5e4-afef-4c98-b8fa-269301dc3cd1" />

---

## Author

**Harsh Kumar**

If you enjoyed the project, consider leaving a ⭐ on the repository.
