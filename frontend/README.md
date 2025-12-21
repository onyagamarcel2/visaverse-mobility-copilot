# Frontend (Next.js)

## Setup
```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Scripts
- `pnpm lint` – run Next.js linting (`next lint`).
- `pnpm build` – build the production bundle without needing external network access (fonts are self-hosted via `@fontsource-variable/inter`).
- `pnpm dev` – start the development server.

## Environment
Copy `.env.example` to `.env.local` and adjust if needed:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
FASTAPI_BASE_URL=http://localhost:8000
```

- `NEXT_PUBLIC_API_BASE_URL` is used by browser code when it needs to make calls directly (defaults to the local Next.js dev server).
- `FASTAPI_BASE_URL` is read by the Next.js API routes (server-only) so they can proxy requests to the FastAPI backend, whether running locally (`http://localhost:8000`) or inside Docker (`http://backend:8000`).

## Notes
Fonts are served locally using `@fontsource-variable/inter` to keep builds reliable in restricted environments.
