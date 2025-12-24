import { defineConfig, devices } from "@playwright/test"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100"

export default defineConfig({
  testDir: "./playwright",
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "../.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000",
      cwd: "../backend",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm dev --hostname 127.0.0.1 --port 3100",
      url: BASE_URL,
      cwd: ".",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
