# VisaVerse Mobility Copilot

Production-quality monorepo with a Next.js App Router frontend and FastAPI backend for visa journey planning. The admin-facing
control plane now lives in a separate Next.js app (`admin-frontend`) so operator workflows stay isolated from the end-user
experience.

## Features
- Onboarding form to capture mobility profile (origin, destination, purpose, dates, sponsor/funds, language).
- `/api/plan` endpoint returns Pydantic-validated JSON plan with summary, timeline, checklist, documents, risks, and sources.
- Deterministic mock mode when no LLM key is available (`MOCK_MODE=true`).
- Minimal Markdown knowledge base with keyword retrieval; ready to swap for RAG later.
- Docker setup for local development.

## Repository structure
```
backend/              # FastAPI app
frontend/             # End-user Next.js app (BFF lives here)
admin-frontend/       # Admin control plane (Next.js)
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
pnpm install
cp .env.example .env.local
pnpm dev
```

### Admin frontend
```
cd admin-frontend
pnpm install
cp .env.example .env.local
pnpm dev -- --port 3001
```
The admin UI is intentionally styled with the same palette as the user app. Point `NEXT_PUBLIC_ADMIN_API_BASE_URL` at the FastAPI
admin surface (default `http://localhost:8000/admin/api`).

By default the browser calls the local Next.js server (`http://localhost:3000`). The Next API routes (`/api/plan`, `/api/chat`) proxy requests to FastAPI using `FASTAPI_BASE_URL`, so backend credentials never leak to the browser.

Local fonts are self-hosted via [`@fontsource-variable/inter`](https://fontsource.org/fonts/inter) to ensure builds work without outbound network access. Common commands:

```bash
pnpm lint
pnpm build
pnpm dev
```

### Docker Compose (optional)
```bash
docker-compose up --build
```
Backend is exposed on `8000`, end-user frontend on `3000`, and the admin app on `3001`. The compose file injects both
`NEXT_PUBLIC_API_BASE_URL` (browser) and `FASTAPI_BASE_URL` (Next server) automatically.

## Environment variables
- Backend: see `backend/.env.example` for `MOCK_MODE`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS`, etc. New `/api/chat` endpoint respects the same mock/LLM switches.
- Frontend: copy `frontend/.env.example` and set:
  - `NEXT_PUBLIC_API_BASE_URL` → where the browser should call the Next.js BFF (usually `http://localhost:3000`).
  - `FASTAPI_BASE_URL` → internal URL the Next.js API routes use to contact FastAPI (usually `http://localhost:8000` locally or `http://backend:8000` in Docker).
- Admin frontend: copy `admin-frontend/.env.example` and set `NEXT_PUBLIC_ADMIN_API_BASE_URL` → FastAPI admin base URL
  (defaults to `http://localhost:8000/admin/api`).

## Sample request
```bash
curl -X POST http://localhost:8000/api/plan \
  -H "Content-Type: application/json" \
  -d @cases/profile_student.json
```

## Smoke testing
- `scripts/frontend-check.sh` – runs `pnpm lint` + `pnpm build`.
- `frontend/scripts/smoke-plan.mjs` – posts a sample profile to `http://localhost:3000/api/plan` and asserts summary fields.
- `scripts/dev-smoke.sh` – exercises backend `/api/health`, `/api/plan`, `/api/chat` plus the corresponding Next.js BFF endpoints (requires `curl` + `jq`).

## Adding RAG later
Replace `backend/app/kb.py` retrieval logic with a vector store client (e.g., Chroma) while keeping the `retrieve_snippets` interface.
