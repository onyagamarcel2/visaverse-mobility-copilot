# Admin Backoffice Overview

The admin control plane lives in `admin-frontend` (Next.js App Router) and talks to FastAPI endpoints under `/admin/api`. It is
separate from the user-facing application to avoid regressions and enforce least-privilege access.

## Modules
- Authentication & RBAC (roles: admin, editor, reviewer, support, analyst).
- Knowledge base workflow: draft → review → published with audit hashes.
- Rules, prompts, and model configuration registries (version fields scaffolded in the API).
- Observability: metrics summary and audit event listing.

## RBAC
- **admin**: full access, can create users.
- **editor**: create drafts, submit content for review.
- **reviewer**: publish/rollback content.
- **support/analyst**: read-only metrics and audits.

## Workflow
1. Bootstrap an admin user via `/admin/api/auth/login` (first login seeds roles and an admin account).
2. Create KB content with `POST /admin/api/kb` (draft).
3. Submit for review `/admin/api/kb/{id}/submit`.
4. Publish `/admin/api/kb/{id}/publish`; audit records capture before/after hashes.

## Environment variables
- `DATABASE_URL` – Postgres/SQLite connection string (shared across admin endpoints).
- `ALLOWED_ORIGINS` – include both `http://localhost:3000` and `http://localhost:3001` locally.
- `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` – token controls.
- `NEXT_PUBLIC_ADMIN_API_BASE_URL` – admin frontend target for API calls.

## Local run
- `docker-compose up --build` to start Postgres, backend (`:8000`), user app (`:3000`), and admin app (`:3001`).
- `backend/app/seed_kb.py` imports legacy markdown files into the database.
- `pytest backend/tests/test_admin_api.py` exercises the RBAC + KB workflow.
