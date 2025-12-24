# VisaVerse Mobility Copilot — Video Script Brief (Hackathon)

## 1) Analyse du repo

### Commandes exécutées (captures)
```bash
$ git status -sb
## main...origin/main
 M .github/workflows/ci.yml
 M .gitignore
 M README.md
 M backend/.env.example
 M backend/README.md
 M backend/app/chat_service.py
 M backend/app/config.py
 M backend/app/llm_client.py
 M backend/app/main.py
 M backend/app/prompts.py
 M backend/tests/test_api.py
 M docs/contracts.md
 M frontend/app/chat/page.tsx
 M frontend/app/layout.tsx
 M frontend/app/page.tsx
 M frontend/app/plan/page.tsx
 M frontend/components/charts/progress-chart.tsx
 M frontend/components/charts/risk-radar.tsx
 M frontend/components/charts/timeline-gantt.tsx
 M frontend/components/command-palette.tsx
 M frontend/components/navbar.tsx
 M frontend/components/notification-center.tsx
 M frontend/components/onboarding-wizard.tsx
 M frontend/components/plan/checklist-tab.tsx
 M frontend/components/plan/documents-tab.tsx
 M frontend/components/plan/risks-tab.tsx
 M frontend/components/plan/summary-tab.tsx
 M frontend/components/plan/timeline-tab.tsx
 M frontend/components/share-plan-dialog.tsx
 M frontend/components/skip-to-content.tsx
 M frontend/components/theme-toggle.tsx
 M frontend/lib/api.ts
 M frontend/lib/i18n.tsx
 M frontend/lib/store.ts
 M frontend/package.json
 M frontend/pnpm-lock.yaml
 D frontend/public/apple-icon.png
 D frontend/public/icon-dark-32x32.png
 D frontend/public/icon-light-32x32.png
 M frontend/public/icon.svg
 D frontend/public/visaverse-app-icon.jpg
 M frontend/vitest.config.ts
?? admin-frontend/next-env.d.ts
?? admin-frontend/pnpm-lock.yaml
?? backend/app/__init__.py
?? backend/app/middleware.py
?? backend/data.sqlite3
?? backend/scripts/
?? backend/test_admin.sqlite3
?? backend/tests/test_contract_generation.py
?? demo.txt
?? frontend/app/chat/chat-client.tsx
?? frontend/components/plan/no-data.tsx
?? frontend/generated/
?? frontend/lib/checklist-utils.ts
?? frontend/playwright.config.ts
?? frontend/playwright/
?? frontend/public/visaverse-logo.png
?? frontend/test-results/
?? kb/country_pairs/ph_to_au_working_holiday.md
?? kb/country_pairs/sn_to_ca_student_fr.md

$ git log -n 20 --oneline
6ee6a2f implement-steps-8,-9,-and-10
0dddbbf Merge branch 'main' into codex/implement-steps-8,-9,-and-10
aebdf58 feat(kb/backend): expand KB and add basic monitoring
d0f6dae implement-tests-and-minimal-ci-setup
877d052 ci: add minimal GitHub Actions workflow
35b3a91 refactor-chat-page-for-zustand-store
ce4eccb feat(frontend): refactor chat to shared store with gating and retry
e1a5c16 create-separate-admin-front-end-application
cc6be82 docs: admin_backoffice
e77ee4e feat: align bff with backend and refresh progress report
8daef71 Merge pull request #2 from onyagamarcel2/fix-lint-and-build-issues-in-frontend
b59dd84 fix(frontend): make build SSR-safe and add smoke scripts/docs
a392104 mise à jour du frontend
ae82be2 Merge pull request #1 from onyagamarcel2/codex/create-monorepo-for-visaverse-mobility-copilot
7a7a46f docs: add implementation status overview
5cdcb01 first commit

$ tree -L 4
.
├── README.md
├── STATUS.md
├── admin-frontend
│   ├── app
│   │   ├── (auth)
│   │   │   └── login
│   │   ├── (shell)
│   │   │   ├── audit
│   │   │   ├── dashboard
│   │   │   ├── feedback
│   │   │   ├── kb
│   │   │   ├── layout.tsx
│   │   │   ├── models
│   │   │   ├── organizations
│   │   │   ├── prompts
│   │   │   ├── rules
│   │   │   ├── runs
│   │   │   ├── settings
│   │   │   └── users
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/...
├── backend
│   ├── app
│   │   ├── admin_api.py
│   │   ├── chat_service.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── kb.py
│   │   ├── llm_client.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── plan_service.py
│   │   ├── prompts.py
│   │   ├── rules.py
│   │   └── schemas.py
│   ├── tests
│   │   ├── test_admin_api.py
│   │   ├── test_api.py
│   │   └── test_contract_generation.py
│   └── scripts/generate_ts_contracts.py
├── frontend
│   ├── app
│   │   ├── api/chat
│   │   ├── api/plan
│   │   ├── chat
│   │   ├── onboarding
│   │   ├── plan
│   │   └── page.tsx
│   ├── components/...
│   ├── lib/...
│   └── scripts/smoke-plan.mjs
├── kb
│   ├── global_documents.md
│   ├── global_timelines.md
│   └── country_pairs/...
├── scripts
│   ├── dev-smoke.sh
│   └── frontend-check.sh
└── cases
    ├── profile_student.json
    └── profile_tourist.json
```
Note: sortie `tree` tronquée pour lisibilite; elle inclut `node_modules` dans plusieurs sous-dossiers.

### Apps/services
- **frontend** (Next.js App Router): application utilisateur. Dossier `frontend/`.
- **backend** (FastAPI): API principale + admin API. Dossier `backend/`.
- **admin-frontend** (Next.js App Router): backoffice. Dossier `admin-frontend/`.
- **kb**: base de connaissance Markdown. Dossier `kb/`.
- **scripts**: smoke tests et checks. Dossier `scripts/`.
- **cases**: profils exemples. Dossier `cases/`.

## 2) Résumé produit (pour narration)

VisaVerse adresse la complexite des demarches de mobilite internationale: listes de documents, delais, priorites, risques, et manque de clarté sur les prochaines etapes.
La promesse est un plan de visa personnalise en quelques minutes: checklist, timeline, documents requis, risques, et un chat d’assistance.
Les utilisateurs cibles sont les etudiants, travailleurs et voyageurs qui preparaient un dossier sans guide clair.
Le produit combine une base de connaissance (KB) avec un plan genere et un chat contextualise.
Le backend structure les sorties via schemas Pydantic et ajoute des risques via des regles.
Le frontend fournit une experience multi-etapes (onboarding → plan → chat) avec export PDF/ICS.
Un backoffice est fourni pour la curation de la KB et l’audit.
Le systeme propose un mode mock deterministe si aucune cle LLM n’est disponible.
La stack est monorepo, facile a lancer localement et testable via smoke + CI.

**Elevator pitch (1 phrase)**
VisaVerse transforme un parcours visa confus en un plan clair et actionnable, alimente par IA, RAG et une checklist priorisee.

## 3) Parcours demo (scenario video)

### A) Home → Onboarding → Generation du plan → Plan (onglets) → Export → Chat → Backoffice

1) **Home**
   - Route: `frontend/app/page.tsx` (`/`)
   - Montrer: hero, CTA “Start Planning / Commencer”, switch langue.
   - Etat attendu: textes i18n se mettent a jour.

2) **Onboarding**
   - Route: `frontend/app/onboarding/page.tsx` + `frontend/components/onboarding-wizard.tsx`
   - Action: remplir pays, dates, motif, fonds, langue.
   - Etat attendu: validation forte + date picker + loader.

3) **Generation du plan**
   - Appel: `apiClient.generatePlan()` → `/api/plan` (BFF)
   - Etat attendu: skeleton puis affichage complet.

4) **Plan (onglets)**
   - Route: `frontend/app/plan/page.tsx`
   - Tabs: Summary / Timeline / Checklist / Documents / Risks
   - Montrer: total docs, total tasks, timeline, risques.

5) **Export**
   - PDF: bouton “Export PDF” (impression navigateur).
   - ICS: dans la timeline, export calendrier `.ics`.

6) **Chat**
   - Route: `frontend/app/chat/page.tsx`
   - Etat attendu: badge “Envoi...”, suggestion, retry si echec.

7) **Backoffice (si dispo)**
   - Route: `admin-frontend/app/(shell)/*`
   - Montrer: dashboard, KB, audit, metrics.
   - Auth: `/admin/api/auth/login` (bootstrap admin si 1er login).

## 4) Frontend (user app) — details cles

### Routes principales (App Router)
- `/` → `frontend/app/page.tsx`
- `/onboarding` → `frontend/app/onboarding/page.tsx`
- `/plan` → `frontend/app/plan/page.tsx`
- `/chat` → `frontend/app/chat/page.tsx` + `frontend/app/chat/chat-client.tsx`

### Composants majeurs
- `frontend/components/onboarding-wizard.tsx`
- `frontend/components/plan/*` (tabs et skeleton)
- `frontend/components/chat/*`
- `frontend/components/navbar.tsx`

### Etat et stockage
- Zustand store: `frontend/lib/store.ts`
- Keys localStorage:
  - `visaverse_profile`
  - `visaverse_plan`
  - `visaverse_chat_history`
  - `visaverse_locale`
- Hydratation: `hydrateFromStorage()` + `syncPlan()` dans `/plan`.

### Appels reseau
- API client: `frontend/lib/api.ts`
- Base URL: `NEXT_PUBLIC_API_BASE_URL` (fallback `window.location.origin`).
- Endpoints utilises:
  - `/api/plan` (BFF)
  - `/api/chat` (BFF)

### UX
- Loaders: `PlanSkeleton`, messages `messages.plan.loadingMessage`.
- Empty states: onboarding requis, chat sans profil.
- Toasts: `useToast` + erreurs i18n.
- Retry: chat avec badge + cooldown.

### Pret vs mock
- **Pret**: onboarding, plan, chat, export PDF/ICS, notifications, i18n.
- **Mock**: frontend `getMockPlan()` existe si fetch echoue (`frontend/lib/api.ts`).

## 5) BFF Next.js (API routes)

### `POST /api/plan`
- Fichier: `frontend/app/api/plan/route.ts`
- Payload attendu (exemple UI):
```json
{
  "originCountry": "cm",
  "destinationCountry": "fr",
  "purpose": "study",
  "departureDate": "2025-01-15",
  "duration": "6",
  "passportExpiry": "2026-02-01",
  "hasSponsor": true,
  "fundsLevel": "medium",
  "language": "en",
  "notes": "Smoke health"
}
```
- Mapping: `toBackendProfile()` puis `toUiPlan()` (`frontend/lib/bff-mappers.ts`).
- Erreurs: envelope `{ error: { code, message } }`.
- Timeout explicite: **NON IMPLÉMENTÉ** (fetch sans timeout).

### `POST /api/chat`
- Fichier: `frontend/app/api/chat/route.ts`
- Payload attendu (exemple UI):
```json
{
  "message": "Any tips?",
  "context": { "originCountry": "cm", "destinationCountry": "fr", "purpose": "study", "departureDate": "2025-01-15", "duration": "6", "passportExpiry": "2026-02-01", "hasSponsor": true, "fundsLevel": "medium", "language": "en" },
  "history": [{ "role": "user", "content": "Hello" }]
}
```
- Proxy vers `/api/chat` backend.
- Erreurs: envelope `{ error: { code, message } }`.

## 6) Backend FastAPI

### Endpoints exposes
- `GET /api/health` (`backend/app/main.py`)
- `POST /api/plan` (`backend/app/main.py`)
- `POST /api/chat` (`backend/app/main.py`)
- Admin:
  - `POST /admin/api/auth/login`
  - `POST /admin/api/users`
  - `POST /admin/api/kb`
  - `POST /admin/api/kb/{id}/submit`
  - `POST /admin/api/kb/{id}/publish`
  - `GET /admin/api/kb`
  - `GET /admin/api/audit`
  - `GET /admin/api/metrics`

### Schemas Pydantic (extraits)
- `ProfileIn`, `PlanOut`, `ChatIn`, `ChatOut`, `ErrorEnvelope`: `backend/app/schemas.py`.
- Extrait `ProfileIn`:
```python
class ProfileIn(BaseModel):
  origin_country: str
  destination_country: str
  purpose: PurposeEnum
  planned_departure_date: date
  duration_months: int
  passport_expiry_date: date
  has_sponsor: bool
  proof_of_funds_level: PriorityEnum
  language: LanguageEnum
```

### Pipeline plan
- `plan_service.build_plan()`
- `kb.retrieve_snippets()` → KB Markdown (keywords)
- `llm_client.generate_plan()` → LLM ou mock
- `rules.evaluate_rules()` → risques additionnels
- Output valide via `PlanOut.model_validate()`

### Pipeline chat
- `chat_service.generate_chat_response()`
- RAG: `retrieve_snippets()` + prompt
- LLM ou `_mock_chat_answer()`

### Configuration
- `.env.example` (`backend/.env.example`): `OPENROUTER_API_KEY`, `MOCK_MODE`, `ALLOWED_ORIGINS`, `DATABASE_URL`.
- CORS: `ALLOWED_ORIGINS` (3000/3001).

## 7) Knowledge Base (RAG)

### Structure
- `kb/global_documents.md`
- `kb/global_timelines.md`
- `kb/country_pairs/*.md` (ex: `cm_to_fr_student.md`, `ng_to_uk_tourist.md`)

### Retrieval
- `backend/app/kb.py` utilise un scoring par mots-cles (origin/destination/purpose) + metadata frontmatter.
- **Vecteur / embeddings**: **NON IMPLÉMENTÉ**.

### Limites
- Couverture encore partielle (quelques pays).
- Pas de vector store ni reranking avance.

## 8) Backoffice (admin) — si present

### Admin frontend
- Dossier: `admin-frontend/`
- Pages: `admin-frontend/app/(shell)/*` (dashboard, audit, kb, rules, prompts, models, settings, users, runs).

### Admin backend
- Routes dans `backend/app/admin_api.py`.
- Auth: `POST /admin/api/auth/login` (bootstrap admin si 1er login).
- RBAC: roles `admin/editor/reviewer/support/analyst`.

### Ce qui est mock / non implemente
- Endpoints pour `rules`, `prompts`, `models` **NON IMPLÉMENTÉS** (UI pages presentes, API absente).
- Migrations DB (Alembic) **NON IMPLÉMENTÉES**.

## 9) Tests, smoke, CI

### Backend tests
- `backend/tests/test_api.py` (health, plan, chat en mock).
- `backend/tests/test_admin_api.py` (RBAC + workflow KB).
- `backend/tests/test_contract_generation.py` (contracts TS).

### Frontend tests
- Vitest: `frontend/lib/bff-mappers.test.ts`.
- Playwright: `frontend/playwright/onboarding-plan.spec.ts`.

### Scripts
- `scripts/dev-smoke.sh` (backend + BFF + admin metrics).
- `frontend/scripts/smoke-plan.mjs` (BFF plan).

### CI
- `.github/workflows/ci.yml`: lint, build, smoke, vitest, playwright + pytest.

### Warnings connus
- Aucun warning explicite stocke dans ce brief. (Verifier `docs/lint_warning_*.txt` si besoin.)

## 10) Points “WOW” (pour la video)

- Plan visa personnalise (summary + timeline + checklist + documents + risks).
- Chat IA contextualise par profil et KB.
- Export PDF du plan.
- Export calendrier `.ics` depuis la timeline.
- RAG par KB Markdown avec metadata.
- Risques automatiques via regles (delais, passeport, fonds).
- Backoffice pour publier la KB + audit.
- CI complete (lint/build/tests/smoke).

**Punchlines (3)**
1) “On transforme une demarche visa confuse en un plan clair, actionnable, et partageable.”
2) “Chaque plan est alimente par une base de connaissance et un moteur de risque.”
3) “VisaVerse, c’est la checklist intelligente qui accompagne votre mobilite internationale.”

## 11) Limitations + roadmap

### Limitations
- Mode mock active si cle LLM absente ou erreur LLM.
- Retrieval KB par mots-cles uniquement.
- UI backoffice partiellement decouplee de l’API (rules/prompts/models).
- Pas de migrations DB.

### Roadmap courte
1) Ajouter un vector store + reranking pour la KB.
2) Completer l’API admin (rules/prompts/models).
3) Ajouter analytics usage et traces LLM.
4) Couvrir davantage de pays + langues.
5) Ajouter auth utilisateur finale (non admin).

---

# Annexes utiles

## Commandes pour lancer la demo localement
```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev

# Admin frontend
cd admin-frontend
pnpm install
cp .env.example .env.local
pnpm dev -- --port 3001
```

## Happy path demo (reproduire la video)
1) `/` → changer langue.
2) `/onboarding` → remplir formulaire → “Generate Plan”.
3) `/plan` → tabs + export PDF/ICS.
4) `/chat` → envoyer question.
5) `http://localhost:3001` → login admin → KB workflow.

## Payloads de reference

### Backend `POST /api/plan` (canonique)
Source: `cases/profile_student.json`
```json
{
  "origin_country": "CM",
  "destination_country": "FR",
  "purpose": "STUDY",
  "planned_departure_date": "2024-09-01",
  "duration_months": 24,
  "passport_expiry_date": "2026-01-15",
  "has_sponsor": true,
  "proof_of_funds_level": "LOW",
  "language": "FR",
  "notes": "Accepted to master's program in Lyon"
}
```

### Backend `POST /api/chat`
```json
{
  "message": "Quels documents dois-je preparer?",
  "profile": {
    "origin_country": "CM",
    "destination_country": "FR",
    "purpose": "STUDY",
    "planned_departure_date": "2024-09-01",
    "duration_months": 24,
    "passport_expiry_date": "2026-01-15",
    "has_sponsor": true,
    "proof_of_funds_level": "LOW",
    "language": "FR",
    "notes": "Accepted to master's program in Lyon"
  },
  "history": [{"role":"user","content":"Bonjour"}]
}
```

## Variables d’environnement clefs
- Backend: `backend/.env.example`
  - `OPENROUTER_API_KEY`, `MOCK_MODE`, `DATABASE_URL`, `ALLOWED_ORIGINS`
- Frontend: `frontend/.env.example`
  - `NEXT_PUBLIC_API_BASE_URL`, `FASTAPI_BASE_URL`
- Admin frontend: `admin-frontend/.env.example`
  - `NEXT_PUBLIC_ADMIN_API_BASE_URL`
