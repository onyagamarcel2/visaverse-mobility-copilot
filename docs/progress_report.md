# VisaVerse Mobility Copilot – Progress Report (Updated)

## 1) Executive summary
- Monorepo still follows the FastAPI + Next.js App Router + Markdown KB layout (`tree -L 4`), but the frontend API routes now work as a real Backend-for-Frontend (BFF) that proxies to FastAPI using deterministic mappers (`frontend/app/api/{plan,chat}/route.ts`, `frontend/lib/bff-mappers.ts`).
- FastAPI exposes both `/api/plan` and the newly added `/api/chat` with structured error envelopes and MOCK_MODE/LLM support (`backend/app/main.py`, `backend/app/chat_service.py`, `backend/app/schemas.py`).
- Contracts are bridged explicitly: camelCase onboarding payloads are normalized before hitting FastAPI, and `PlanOut` responses are reshaped for UI components. A contracts doc now captures this mapping (`docs/contracts.md`).
- Tooling improved: backend pytest smoke tests, frontend/Next smoke scripts, and root `scripts/dev-smoke.sh` validate plan/chat flows end-to-end. The lint script now runs ESLint flat-config (`frontend/package.json`, `frontend/eslint.config.mjs`).
- Remaining gaps: KB coverage is still small, onboarding UI still stores profiles locally before calling `/api/plan`, CI is manual, and documentation (e.g., `STATUS.md`) lags behind the new architecture. Overall completion is now **≈76%**, with risks concentrated on contract drift regression prevention and limited test depth.

## 2) Current architecture overview
```
Browser UI (Next.js App Router)
  │  - Routes: /, /onboarding, /plan, /chat
  │  - Uses local storage for profile/chat history, renders shadcn UI
  │
  ▼
Next.js API Routes (BFF)
  │  - /api/plan → toBackendProfile() → fetch FASTAPI_BASE_URL/api/plan → toUiPlan()
  │  - /api/chat → toBackendProfile(context) → FASTAPI_BASE_URL/api/chat → reshape ChatOut
  │  - Env: FASTAPI_BASE_URL + NEXT_PUBLIC_API_BASE_URL
  ▼
FastAPI backend
  │  - /api/health, /api/plan, /api/chat
  │  - Plan builder uses KB snippets + rules + MOCK_MODE/LLM
  │  - Chat service (KB-aware mock/LLM) with structured error envelope
  ▼
Markdown Knowledge Base (kb/*.md)
  - Keyword retrieval + rule-based risks appended to every plan
```

## 3) Frontend status
- **Routes & UI** – Landing, onboarding, plan, and chat pages remain feature-rich (`frontend/app/**/page.tsx`). Components rely on shadcn/Radix primitives (`frontend/components/ui/*`). Plan/chat tabs now consume data returned from the BFF.
- **BFF API routes** – `frontend/app/api/plan/route.ts` and `frontend/app/api/chat/route.ts` convert camelCase profiles to backend payloads, call FastAPI via `FASTAPI_BASE_URL`, map results back to the `PlanResponse` + chat UI shape, and return structured errors if FastAPI fails. This removes the previous mock-only behavior.
- **API client** – `frontend/lib/api.ts` now defaults to the Next dev server (`http://localhost:3000`) and expects the BFF routes rather than hitting FastAPI directly. The TypeScript `PlanResponse` aligns with what `toUiPlan()` produces.
- **Mapping layer** – `frontend/lib/bff-mappers.ts` centralizes normalization (enum casing, date coercion, heuristics for `estimatedWeeks`, grouping checklist items). This prevents contract drift and keeps UI components stable.
- **Env setup & lint** – `.env.example` documents both `NEXT_PUBLIC_API_BASE_URL` and `FASTAPI_BASE_URL`. Linting uses the flat-config ESLint pipeline (`frontend/eslint.config.mjs` + updated `package.json` script) so `pnpm lint` runs without the previous “Invalid project directory” warning. (Next CLI still lacks a `lint` command, so we rely on ESLint directly.)
- **Gaps** – Onboarding still writes to `localStorage` before calling `/api/plan`; UI components (e.g., SummaryTab) still show static data rather than binding to fetched responses. Error toasts exist but there is no retry/backoff UX.

## 4) Backend status
- **Endpoints** – `/api/health`, `/api/plan`, `/api/chat` exposed via FastAPI (`backend/app/main.py`). `/api/chat` returns `ChatOut` or an `ErrorEnvelope`, and leverages either deterministic mock answers or OpenAI-backed responses via `chat_service.py`.
- **Schemas** – `backend/app/schemas.py` now includes `ChatIn`, `ChatOut`, `ErrorEnvelope`, and expanded enums. `PlanOut` still enforces canonical timeline/checklist/document/risk structures.
- **Plan pipeline** – `plan_service.build_plan()` retrieves KB snippets, calls `llm_client.generate_plan()`, merges rule-generated risks, and ensures sources/risks are appended with deterministic timestamps.
- **Chat pipeline** – `chat_service.generate_chat_response()` reuses KB snippets (when profile available) and uses MOCK_MODE heuristics; otherwise it calls OpenAI. Suggested prompts and sources accompany every response.
- **Config/CORS** – `FASTAPI_BASE_URL` references remain in BFF; backend CORS still allows `ALLOWED_ORIGINS` (default `http://localhost:3000`). `.env.example` documents `MOCK_MODE`, `OPENAI_API_KEY`, `MAX_SNIPPETS`, etc.
- **Gaps** – No persistence layer, authentication, or rate limiting. Observability (logs/metrics) minimal. Rule set is still small.

## 5) Integration status (contracts, env, normalization)
- **Contracts** – `docs/contracts.md` now describes canonical (PlanOut/ChatOut) vs. UI envelopes and the mapping steps (camelCase→snake_case, heuristics for summary counts). This reduces tribal knowledge risk.
- **Environment variables** – Both frontend and backend now provide `.env.example` files so onboarding is clearer. Docker Compose sets `FASTAPI_BASE_URL=http://backend:8000` and `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`.
- **Normalization** – `toBackendProfile()` and `toUiPlan()` handle enum casing, date coercion, and derived fields. Chat API route also maps `suggested_questions → suggestedQuestions` for UI components.
- **Remaining gaps** – Frontend UI components still rely on `localStorage` and mock data for certain charts/cards (e.g., SummaryTab). Input validation is limited; we risk 422s if onboarding form captures values outside allowed enums.

## 6) Knowledge base status
- Content unchanged: `kb/global_documents.md`, `kb/global_timelines.md`, `kb/country_pairs/*`. Retrieval remains keyword scoring via `retrieve_snippets()`.
- KB snippets are referenced by both `/api/plan` (sources appended) and `/api/chat` (mock answers mention snippet-derived context). Coverage remains thin (two country-pair docs), so personalization suffers.
- Next steps include tagging snippets by country/purpose and exploring TF-IDF/vector search. Until then, deterministic mock responses fill the gaps.

## 7) Testing & Quality status
- **Backend** – `backend/tests/test_api.py` (pytest) exercises `/api/health`, `/api/plan`, and `/api/chat` in MOCK_MODE. `pytest` is now part of `requirements.txt`, and the suite passes locally (`.venv/bin/pytest -q`).
- **Frontend lint** – `pnpm lint` runs ESLint via the flat config, eliminating the old Next CLI warning. (We still rely on developers to use Node 20+ due to Next 16 requirements.)
- **Build** – `pnpm build` still succeeds (Next 16 Turbopack). No automated component/integration tests exist yet.
- **Smoke scripts** – `scripts/dev-smoke.sh` hits backend + BFF plan/chat routes via curl/jq; `frontend/scripts/smoke-plan.mjs` POSTs to `/api/plan` and asserts summary fields. These scripts require running services but give a reproducible sanity check.
- **Gaps** – No automated frontend tests (Playwright/Jest), no CI pipeline invoking these scripts, and manual steps required to ensure Node version alignment.

## 8) Documentation status
- README files now explain the BFF setup, env variables, smoke scripts, and Docker Compose behavior (`README.md`, `frontend/README.md`, `backend/README.md`).
- New docs: `docs/progress_report.md` (this file) and `docs/contracts.md` cover status/contract mapping.
- `STATUS.md` still describes older priorities and should be updated. KB authoring guidelines remain TBD.

## 9) DevOps/Tooling status
- **Scripts** – `scripts/frontend-check.sh` (lint+build), `scripts/dev-smoke.sh` (full stack smoke), `frontend/scripts/smoke-plan.mjs` (BFF smoke). No backend-only script beyond pytest.
- **Docker** – Compose injects both browser and server URLs; backend mounts KB/cases. No CI pipeline yet.
- **Lint/Test automation** – Manual invocation only. Future CI should run pytest, pnpm lint/build, and smoke scripts to guard against regressions.

## 10) Completion scoring + %
| Module | Weight | Status | Notes | Score |
| --- | --- | --- | --- | --- |
| 1. Frontend UI & Navigation | 20% | ⚠️ UI + navigation solid, but some widgets still mock data | BFF feeds plan/chat, but onboarding/summary charts static | 80% |
| 2. Frontend API integration & normalization | 10% | ✅ BFF routes + mappers prevent contract drift | Next API routes proxy to FastAPI with error handling | 85% |
| 3. Backend core API (health/plan) | 15% | ✅ Mature plan pipeline (KB + rules + MOCK_MODE/LLM) | Schema enforcement + deterministic fallback | 90% |
| 4. Backend chat + error envelope | 10% | ⚠️ Chat endpoint implemented with mock/LLM, but no persistence/logging | Error envelopes exist; responses deterministic in mock mode | 80% |
| 5. KB & retrieval grounding | 10% | ⚠️ Stable keyword retrieval but limited corpus | Needs more content/metadata | 70% |
| 6. Rules/risks logic | 5% | ✅ Rules extend PlanOut risks | Still basic but functional | 80% |
| 7. Testing (backend + frontend) | 10% | ⚠️ Pytest + smoke scripts exist, but no frontend/unit CI | Need Playwright/Jest + automated smoke | 60% |
| 8. Documentation | 5% | ⚠️ READMEs + contracts updated, STATUS outdated | Need KB guide + CI docs | 75% |
| 9. DevOps/tooling | 5% | ⚠️ Manual scripts, no CI | Compose/env templates solid | 75% |
|10. Overall polish (empty/error/i18n) | 10% | ⚠️ UI states exist but data binding partial; only EN copy | Accessibility generally good but not audited | 65% |

Weighted completion ≈ **76%**.

## 11) Risks & blockers
1. **Data binding gaps** – Components like SummaryTab still show static values, so regressions might go unnoticed until full data binding occurs.
2. **Test coverage** – Pytest covers only basic flows; no frontend regression tests or automated smoke runner in CI.
3. **Knowledge base depth** – Limited snippets reduce personalization and may mislead users when KB keywords don’t match their route.
4. **Documentation drift** – STATUS.md and onboarding docs lag behind actual architecture, risking confusion for new contributors.
5. **Env/version drift** – Node 20+ is required; without tooling (nvm, volta, etc.), devs may hit the old pnpm/Next errors.

## 12) Next steps (prioritized roadmap)
- **P0 – Bind UI to real plan/chat data (Effort: M)**: Replace hard-coded summary/timeline/checklist data with outputs from the BFF, add loading/error states where needed, and validate enum inputs before posting.
- **P0 – CI & regression safety (Effort: M)**: Add GitHub Actions (or equivalent) to run `pytest`, `pnpm lint`, `pnpm build`, and `scripts/dev-smoke.sh`. Add at least one frontend integration test (Playwright) to cover onboarding → plan.
- **P0 – Contract validation (Effort: M)**: Generate shared TypeScript types from Pydantic (e.g., `pydantic2ts`) and validate BFF responses against them. Expand tests to catch breaking schema changes.
- **P1 – Knowledge base expansion (Effort: M)**: Add more `kb/country_pairs/*.md`, include metadata (origin/destination/purpose), and prepare for TF-IDF/vector retrieval.
- **P1 – Documentation refresh (Effort: S)**: Update `STATUS.md`, add a KB authoring guide, and document smoke test usage/CI expectations.
- **P1 – UX polish (Effort: S)**: Improve chat retry/backoff, include localized copy (EN/FR), and ensure plan exports share actual plan data.
- **P2 – Observability & resilience (Effort: M)**: Add logging/metrics to FastAPI, enforce rate limits for chat/plan endpoints, and handle upstream LLM failures more gracefully.
