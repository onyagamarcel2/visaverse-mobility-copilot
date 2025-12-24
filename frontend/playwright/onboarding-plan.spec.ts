import { test, expect } from "@playwright/test"

test("user completes onboarding and views plan summary", async ({ page }) => {
  await page.goto("/onboarding")

  await page.locator("#originCountry").click()
  await page.getByRole("option", { name: "Cameroon" }).click()

  await page.locator("#destinationCountry").click()
  await page.getByRole("option", { name: "France" }).click()

  await page.getByRole("button", { name: /next/i }).click()

  await page.locator("#purpose").click()
  await page.getByRole("option", { name: "Study" }).click()

  await page.getByLabel(/departure date/i).fill("2025-06-01")
  await page.getByLabel(/duration/i).fill("6")
  await page.getByLabel(/passport expiry/i).fill("2026-12-01")
  await page.getByRole("button", { name: /next/i }).click()

  await page.locator("#fundsLevel").click()
  await page.getByRole("option", { name: "High" }).click()

  await page.getByRole("button", { name: /generate plan/i }).click()

  await page.waitForURL("**/plan", { timeout: 60_000 })
  await expect(page.getByRole("heading", { name: /your mobility plan/i })).toBeVisible()
  await expect(page.getByText(/plan overview/i)).toBeVisible()
})
