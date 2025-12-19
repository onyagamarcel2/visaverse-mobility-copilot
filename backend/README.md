# VisaVerse Mobility Copilot Backend

FastAPI service that generates visa preparation plans with strict JSON outputs.

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
- `LLM_PROVIDER`: optional model name for OpenAI-compatible endpoint.
- `OPENAI_API_KEY`: API key for LLM provider (optional when using mock).
- `ALLOWED_ORIGINS`: comma-separated origins for CORS (default `http://localhost:3000`).
- `PORT`: port for running uvicorn (default 8000).
- `MAX_SNIPPETS`: number of KB snippets to attach to the plan (default 5).
