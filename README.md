# VisaVerse Mobility Copilot

Production-quality monorepo with a Next.js App Router frontend and FastAPI backend for visa journey planning.

## Features
- Onboarding form to capture mobility profile (origin, destination, purpose, dates, sponsor/funds, language).
- `/api/plan` endpoint returns Pydantic-validated JSON plan with summary, timeline, checklist, documents, risks, and sources.
- Deterministic mock mode when no LLM key is available (`MOCK_MODE=true`).
- Minimal Markdown knowledge base with keyword retrieval; ready to swap for RAG later.
- Docker setup for local development.

## Repository structure
```
backend/              # FastAPI app
frontend/             # Next.js app
kb/                   # Markdown knowledge base
cases/                # Sample mobility profiles
```

## Quickstart
### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend expects the backend at `http://localhost:8000` by default.

### Docker Compose (optional)
```bash
docker-compose up --build
```
Backend is exposed on `8000`, frontend on `3000`.

## Environment variables
- Backend: see `backend/.env.example` for `MOCK_MODE`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS`, etc.
- Frontend: set `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000`).

## Sample request
```bash
curl -X POST http://localhost:8000/api/plan \
  -H "Content-Type: application/json" \
  -d @cases/profile_student.json
```

## Adding RAG later
Replace `backend/app/kb.py` retrieval logic with a vector store client (e.g., Chroma) while keeping the `retrieve_snippets` interface.
