# ContextOS 🚀
> **AI-Powered Unified Meeting, Email, and Organizational-Context Management Platform**
> *B.Tech Computer Science Capstone Project*

---

## 🌟 Overview
ContextOS unifies meeting scheduling, WebRTC video calls, live speech transcription, automated AI analysis (extracting decisions, tasks, and commitments), email dispatch, interactive organizational knowledge graphs (`React Flow`), and vector RAG search (`pgvector`) into a single connected system.

Traditional tools answer *"Where is the information?"*.  
**ContextOS answers *"What happened, why, who was involved, what was decided, and what needs to happen next?"***

---

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, TanStack Query, Zustand, React Router v6, React Flow, dnd-kit.
- **Backend**: Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA, WebSockets (STOMP), OpenAPI/Swagger.
- **Database**: PostgreSQL 16 with `pgvector` extension, Redis caching & rate limiting.
- **Real-Time**: WebRTC P2P audio/video conferencing + STOMP WebSocket signaling.
- **AI & RAG**: Pluggable LLM API client, Web Speech API live speech-to-text, dense vector embeddings & RAG Q&A engine.
- **Demo Mode**: `APP_DEMO_MODE=true` allows 100% offline demonstration without external API keys or live email servers.

---

## 📁 Repository Structure
```
capstone/
├── frontend/         # React + Vite + TypeScript + Tailwind CSS UI
├── backend/          # Java 21 + Spring Boot 3 REST & WebSocket API
├── docs/             # PROGRESS.md, ERD, System Architecture Specs
├── docker-compose.yml# Container setup for Postgres + pgvector & Redis
├── .env.example      # Environment variables configuration
└── README.md         # Project documentation
```

---

## 🚀 Quick Start (Demo Mode)

### Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`. Click **"Explore Demo"** or **"Demo Quick Login"** on the auth page to log in as `Admin (host)`.

---

## 📜 License
MIT © 2026 ContextOS Team
