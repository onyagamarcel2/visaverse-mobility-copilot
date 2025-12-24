# VisaVerse Mobility Copilot Backend

FastAPI service that generates visa preparation plans with strict JSON outputs.

## Endpoints
- `GET /api/health` – readiness probe.
- `POST /api/plan` – accepts `ProfileIn` payload and returns canonical `PlanOut`.
- `POST /api/chat` – accepts `ChatIn` (message + optional profile/history) and returns `ChatOut` with suggested follow-up questions. Respects `MOCK_MODE` and the knowledge base snippets for grounding.

## Setup
1. Create a virtual environment and activate it.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
4. Run the API:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Environment variables
- `MOCK_MODE` (true/false): return deterministic mock plan when true or when no API key is set.
- `OPENROUTER_API_KEY`: preferred API key for OpenRouter (GPT‑4o mini). Keep this in `.env`, never in git.
- `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL`, `OPENROUTER_REFERRER`, `OPENROUTER_TITLE`: optional overrides for OpenRouter calls.
- `OPENAI_API_KEY` + `LLM_PROVIDER`: legacy fallback if you want to hit the OpenAI endpoint directly.
- `ALLOWED_ORIGINS`: comma-separated origins for CORS (default `http://localhost:3000`).
- `PORT`: port for running uvicorn (default 8000).
- `MAX_SNIPPETS`: number of KB snippets to attach to the plan (default 5).

## Tests
Install dev dependencies via `pip install -r requirements.txt` (includes `pytest`) and run:

```bash
pytest
```

The suite exercises `/api/health`, `/api/plan`, and `/api/chat` in mock mode to prevent accidental LLM calls.
