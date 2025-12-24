# API Contracts and Mapping

## 1. Backend canonical schemas
- **Request (`ProfileIn`)** – snake_case keys, uppercase enums (`STUDY`, `WORK`, `TOURISM`), ISO `YYYY-MM-DD` dates, numeric `duration_months`.
- **Response (`PlanOut`)** – includes `summary` (title, key_advice, assumptions, confidence), `timeline` (`when`, `actions`, `priority`), `checklist` (flat tasks), `documents` (categories with `items`), `risks`, `sources`, `generated_at`.
- **Chat (`ChatIn`/`ChatOut`)** – `ChatIn` accepts `{message, profile?, history?}` where `profile` is the canonical `ProfileIn`. `ChatOut` returns `{answer, sources[], suggested_questions[]}`. Errors follow `{ "error": { code, message, details? } }`.

## 2. Frontend UI expectations (BFF output)
- **Plan response (`PlanResponse`)** – summary uses `{confidence, estimatedWeeks, totalDocuments, totalTasks}`; `timeline` uses `{title, date, status, description}`; `checklist` grouped by category with items `{title, priority, completed}`; `documents` expose `{name, description, requirements[]}`.
- **Chat response** – UI expects `{response: string, sources?: [], suggestedQuestions?: []}` from `/api/chat`.

## 3. Mapping rules (Next.js API routes)
- `frontend/app/api/plan/route.ts` converts camelCase profile data into canonical backend payload via `toBackendProfile`, uppercasing enums and normalizing dates/durations. The route calls `FASTAPI_BASE_URL/api/plan`, then `toUiPlan` reshapes `PlanOut` into the UI `PlanResponse` by:
  - Deriving `estimatedWeeks` from timeline hints (fallback by purpose).
  - Counting total document items and checklist tasks for summary totals.
  - Transforming backend timeline actions into `{title, description, status}` milestones.
  - Grouping checklist items by priority to match the component structure.
  - Remapping document `why/common_mistakes` into `description/requirements` fields, and normalizing risk severity to lowercase.
- `frontend/app/api/chat/route.ts` proxies `{message, context}` to FastAPI `/api/chat`, converting the optional `context` profile via `toBackendProfile`. The BFF unwraps `ChatOut.answer` into `response`, passes through `sources`, and renames `suggested_questions` -> `suggestedQuestions`.

## 4. Environment variables
- `NEXT_PUBLIC_API_BASE_URL` – browser target for calling the Next.js BFF (`/api/plan`, `/api/chat`). Defaults to `http://localhost:3000` for local dev.
- `FASTAPI_BASE_URL` – server-side target used inside the BFF to reach FastAPI (e.g., `http://localhost:8000` locally, `http://backend:8000` in Docker).
- Backend `.env` still controls `MOCK_MODE`, `OPENROUTER_API_KEY` (or legacy `OPENAI_API_KEY`), and `MAX_SNIPPETS`, affecting both `/api/plan` and `/api/chat`.

## 5. Smoke coverage
- `scripts/dev-smoke.sh` covers backend and BFF health/plan/chat flows with representative payloads.
- `frontend/scripts/smoke-plan.mjs` asserts the UI plan response shape from the BFF.
- `backend/tests/test_api.py` validates canonical endpoints in mock mode to guard against regressions.

## 6. Admin API (control plane)
- Prefix: `/admin/api/*` exposed by FastAPI, consumed by `admin-frontend`.
- Auth: bearer token (`Authorization: Bearer <jwt>`) issued by `/admin/api/auth/login` with roles claim.
- KB workflow:
  - `POST /admin/api/kb` → create draft document + version.
  - `POST /admin/api/kb/{id}/submit` → mark draft as `review`.
  - `POST /admin/api/kb/{id}/publish` → publish latest version and capture audit hashes.
- Users: `POST /admin/api/users` (admin only) seeds operators; first login bootstrap supported for demos.
- Observability: `GET /admin/api/audit` (latest events) and `GET /admin/api/metrics` (counts for UI dashboards).
