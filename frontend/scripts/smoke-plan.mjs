#!/usr/bin/env node
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000"

const sampleProfile = {
  originCountry: "cm",
  destinationCountry: "fr",
  purpose: "study",
  departureDate: new Date().toISOString().slice(0, 10),
  duration: "6",
  passportExpiry: new Date(Date.now() + 31536000000).toISOString().slice(0, 10),
  hasSponsor: true,
  fundsLevel: "medium",
  language: "en",
  notes: "Smoke test",
}

async function run() {
  const response = await fetch(`${baseUrl}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sampleProfile),
  })

  if (!response.ok) {
    throw new Error(`Plan smoke failed with status ${response.status}`)
  }

  const data = await response.json()
  if (!data.summary || typeof data.summary.confidence !== "number") {
    throw new Error("Plan smoke failed: summary missing")
  }

  if (!Array.isArray(data.timeline)) {
    throw new Error("Plan smoke failed: timeline missing")
  }

  console.log("Frontend BFF plan smoke passed", {
    confidence: data.summary.confidence,
    tasks: data.summary.totalTasks,
    docs: data.summary.totalDocuments,
  })
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
