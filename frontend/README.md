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
Set `NEXT_PUBLIC_API_BASE_URL` to point at your backend (defaults to `http://localhost:8000`).

## Notes
Fonts are served locally using `@fontsource-variable/inter` to keep builds reliable in restricted environments.
