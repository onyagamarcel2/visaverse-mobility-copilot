# VisaVerse Mobility Copilot Frontend

Next.js App Router UI for onboarding and viewing visa plans.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

The app expects the FastAPI backend at `http://localhost:8000` by default (configurable via `NEXT_PUBLIC_API_BASE_URL`).
