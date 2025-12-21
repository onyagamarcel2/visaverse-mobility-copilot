# VisaVerse Mobility Copilot – Progress Report (Updated)

## 1) Executive summary
- End-user BFF is wired: Next.js API routes normalize onboarding payloads, proxy to FastAPI, and reshape plan/chat responses. Local storage keeps onboarding + chat context stable between pages.
- FastAPI serves `/api/plan` and `/api/chat` in mock or LLM mode, now with structured logs (request_id, mode, latency, sources) and metadata-aware KB retrieval.
- Documentation caught up: dual-app port map, env vars, smoke/test commands, and KB store flow captured in `docs/state_store.md`.
- Gaps: plan widgets still mix mock data, CI absent, and KB coverage—while broader—remains shallow. Overall completion now ~79% with risk on test depth and observability.

## 2) Current architecture overview
```
Browser UI (Next.js App Router)
  │  - Routes: /, /onboarding, /plan, /chat
  │  - Uses local storage for profile + chat history and i18n preference
  │
  ▼
Next.js API Routes (BFF)
  │  - /api/plan → toBackendProfile() → FASTAPI_BASE_URL/api/plan → toUiPlan()
  │  - /api/chat → toBackendProfile(context) → FASTAPI_BASE_URL/api/chat → reshape ChatOut
  │  - Env: FASTAPI_BASE_URL + NEXT_PUBLIC_API_BASE_URL
  ▼
FastAPI backend
  │  - /api/health, /api/plan, /api/chat
  │  - Plan builder uses KB snippets (metadata filtered) + rules + MOCK_MODE/LLM
  │  - Chat service (KB-aware mock/LLM) with structured logging
  ▼
Markdown Knowledge Base (kb/*.md)
  - Metadata-tagged country pairs + global docs
```

## 3) Frontend status
- **Routes & UI** – Landing, onboarding, plan, and chat pages render shadcn components with i18n dictionaries (EN/FR) for key copy. Empty/error states include aria labels and focus-visible styles on icon buttons.
- **BFF API routes** – `frontend/app/api/{plan,chat}/route.ts` normalize camelCase to backend enums/dates and map responses back to UI shapes. Local storage persists `visaverse_profile`, `visaverse_chat_history`, and `visaverse_locale`.
- **Env setup & lint** – `.env.example` documents browser + server URLs. Lint/build commands verified via scripts; pnpm 8+/Node 20+ required.
- **Gaps** – Several plan tabs still rely on placeholder data; no automated frontend tests; minimal analytics.

## 4) Backend status
- **Endpoints** – `/api/health`, `/api/plan`, `/api/chat` with request-scoped structured logs (request_id, mode mock/llm, latency_ms, sources_count).
- **Schemas** – `ProfileIn`, `PlanOut`, `ChatIn/Out`, `ErrorEnvelope` enforced via Pydantic. Rules merge into plan risks.
- **KB retrieval** – `retrieve_snippets()` parses metadata headers and filters by origin/destination/purpose/language/tags before keyword scoring.
- **Gaps** – No persistence or auth; metrics/alerts missing; error envelopes still basic.

## 5) Knowledge base status
- Corpus expanded: multiple `kb/country_pairs/*.md` files now include metadata headers (origin/destination/purpose/language/tags) for targeted retrieval.
- Retrieval filters on metadata when present, then scores remaining content by profile keywords. Global docs remain fallback when metadata absent.

## 6) Testing & Quality status
- **Backend** – `pytest -q` covers health/plan/chat in mock mode.
- **Frontend** – `pnpm lint` + `pnpm build` used for smoke; no Jest/Playwright yet.
- **Admin frontend** – `pnpm lint` + `pnpm build` validated for control plane.
- **Scripts** – `scripts/dev-smoke.sh` and `frontend/scripts/smoke-plan.mjs` exercise plan/chat flows when services are running.
- **Gaps** – CI absent; no automated accessibility checks; limited unit coverage.

## 7) Documentation status
- Root README clarifies dual app ports, env vars, smoke/test commands, and request samples.
- STATUS.md reflects BFF binding, KB expansion, and remaining gaps.
- `docs/state_store.md` documents onboarding → plan → chat storage keys and flows.

## 8) Completion scoring + %
| Module | Weight | Status | Notes | Score |
| --- | --- | --- | --- | --- |
| 1. Frontend UI & Navigation | 20% | ⚠️ Solid pages, some widgets still mock | BFF + i18n + accessibility polish; data binding partial | 82% |
| 2. Frontend API integration & normalization | 10% | ✅ BFF routes stable | Local storage + normalization working | 88% |
| 3. Backend core API (health/plan) | 15% | ✅ Stable with logging | Rules + KB merge, structured logs added | 90% |
| 4. Backend chat + error envelope | 10% | ⚠️ Chat functional with metadata-aware retrieval | Logging added; persistence still missing | 84% |
| 5. KB & retrieval grounding | 10% | ⚠️ Metadata-aware, more docs | Corpus broader but shallow | 78% |
| 6. Rules/risks logic | 5% | ✅ Rules extend PlanOut risks | Still basic but deterministic | 80% |
| 7. Testing (backend + frontend) | 10% | ⚠️ Pytest + lint/build only | No Playwright/Jest/CI | 62% |
| 8. Documentation | 5% | ✅ READMEs + store doc updated | Coverage improved | 90% |
| 9. DevOps/tooling | 5% | ⚠️ Manual scripts, no CI | Compose/env templates solid | 78% |
|10. Overall polish (empty/error/i18n) | 10% | ⚠️ Accessibility/i18n improved | Visual/state polish still needed | 75% |

Weighted completion ≈ **79%**.

## 9) Risks & blockers
1. **Data binding gaps** – Some plan widgets remain mock-driven; real API data could surface layout bugs.
2. **Test coverage** – No automated frontend tests or CI to guard regressions.
3. **Observability gaps** – Logging improved but no metrics/alerting; LLM failures may be silent.
4. **Knowledge base depth** – More country/purpose combinations needed for quality answers.
5. **Env/version drift** – Node 20+/pnpm alignment still manual; developers may hit tooling mismatch without guidance.

## 10) Next steps (prioritized roadmap)
- **P0 – Bind UI to real plan/chat data (Effort: M)**: Replace hard-coded widgets with API responses, add loading/error states, and validate enums before submission.
- **P0 – CI & regression safety (Effort: M)**: GitHub Actions to run pytest, pnpm lint/build, and smoke scripts; add at least one Playwright flow (onboarding → plan).
- **P1 – Contract validation (Effort: M)**: Generate shared TS types from Pydantic; validate BFF responses and add schema tests.
- **P1 – Knowledge base expansion (Effort: M)**: Continue adding metadata-tagged `kb/country_pairs/*`, and prepare TF-IDF/vector retrieval.
- **P1 – Observability & resilience (Effort: M)**: Extend structured logging to metrics, add request/response size tracking, and rate-limit chat/plan endpoints.
- **P1 – UX polish (Effort: S)**: Broaden i18n coverage, refine accessibility focus states, and improve empty/error messaging.
