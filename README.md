# VisaVerse Mobility Copilot

Production-quality monorepo with a Next.js App Router frontend and FastAPI backend for visa journey planning. The admin-facing control plane now lives in a separate Next.js app (`admin-frontend`) so operator workflows stay isolated from the end-user experience.

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

## Quickstart (dual Next.js apps + FastAPI)
### Backend (FastAPI on :8000)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### End-user frontend (App Router on :3000)
```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

### Admin frontend (control plane on :3001)
```bash
cd admin-frontend
pnpm install
cp .env.example .env.local
pnpm dev -- --port 3001
```
The admin UI reuses the end-user palette. Point `NEXT_PUBLIC_ADMIN_API_BASE_URL` at `http://localhost:8000/admin/api` (or the Compose service) so moderation + KB publishing reach FastAPI.

#### How traffic flows
- Browser → `http://localhost:3000` (end-user Next.js). API routes (`/api/plan`, `/api/chat`) act as a BFF and proxy to FastAPI via `FASTAPI_BASE_URL` so secrets stay server-side.
- Admin operators → `http://localhost:3001` (admin Next.js). Calls go directly to the FastAPI admin router.
- FastAPI → OpenAI (optional) or deterministic mock mode.

Local fonts are self-hosted via [`@fontsource-variable/inter`](https://fontsource.org/fonts/inter) so builds work offline. Common commands:

```bash
pnpm lint
pnpm build
pnpm dev
```

### Docker Compose (optional)
```bash
docker-compose up --build
```
Services: backend `8000`, end-user frontend `3000`, admin frontend `3001`. Compose injects:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`
- `FASTAPI_BASE_URL=http://backend:8000`
- `NEXT_PUBLIC_ADMIN_API_BASE_URL=http://localhost:3001`

## Environment variables
- Backend: see `backend/.env.example` (`MOCK_MODE`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS`, `MAX_SNIPPETS`). `/api/chat` and `/api/plan` both honor `MOCK_MODE` when no key is present.
- End-user frontend: set in `frontend/.env.example`:
  - `NEXT_PUBLIC_API_BASE_URL` → browser calls to the Next.js BFF (default `http://localhost:3000`).
  - `FASTAPI_BASE_URL` → server-to-server URL the BFF uses (default `http://localhost:8000`, or `http://backend:8000` in Docker Compose).
- Admin frontend: `NEXT_PUBLIC_ADMIN_API_BASE_URL` (default `http://localhost:8000/admin/api`).

## Sample requests
```bash
curl -X POST http://localhost:8000/api/plan \
  -H "Content-Type: application/json" \
  -d @cases/profile_student.json

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What documents do I need?"}'
```

## Type contracts (backend → frontend)
Pydantic schemas are the source of truth. Generate synchronized TypeScript interfaces for the frontend with:
```bash
python backend/scripts/generate_ts_contracts.py
```
CI/pytest runs `--check` to ensure `frontend/generated/backend-contracts.ts` stays fresh.

## Smoke + test commands
- `scripts/frontend-check.sh` – runs `pnpm lint` + `pnpm build` in the end-user frontend.
- `frontend/scripts/smoke-plan.mjs` – posts a sample profile to `http://localhost:3000/api/plan` and asserts summary fields.
- `scripts/dev-smoke.sh` – exercises backend `/api/health`, `/api/plan`, `/api/chat` plus the BFF routes (requires `curl` + `jq`).
- `cd backend && pytest -q` – backend contract tests.
- `cd admin-frontend && pnpm lint && pnpm build` – admin app health checks.

## Adding RAG later
Replace `backend/app/kb.py` retrieval logic with a vector store client (e.g., Chroma) while keeping the `retrieve_snippets` interface stable.
