import { describe, expect, it } from "vitest"

import type { ProfileData } from "@/lib/api"
import { toBackendProfile, toUiPlan } from "@/lib/bff-mappers"

const sampleProfile: ProfileData = {
  originCountry: "cm",
  destinationCountry: "fr",
  purpose: "study",
  departureDate: "2025-06-01",
  duration: "6",
  passportExpiry: "2026-12-01",
  hasSponsor: true,
  fundsLevel: "high",
  language: "en",
  notes: "Test profile",
}

describe("bff mappers", () => {
  it("maps UI profile fields to backend payload", () => {
    const payload = toBackendProfile(sampleProfile)

    expect(payload).toMatchObject({
      origin_country: "cm",
      destination_country: "fr",
      purpose: "STUDY",
      duration_months: 6,
      has_sponsor: true,
      proof_of_funds_level: "HIGH",
      language: "EN",
    })
    expect(payload.planned_departure_date).toBe("2025-06-01")
    expect(payload.passport_expiry_date).toBe("2026-12-01")
  })

  it("maps backend plan output to UI summary totals", () => {
    const uiPlan = toUiPlan(
      {
        summary: { title: "", key_advice: [], assumptions: [], confidence: 0.5 },
        timeline: [
          { when: "Week 1", actions: ["Do a thing"], priority: "HIGH" },
          { when: "Week 2-3", actions: ["Next"], priority: "MEDIUM" },
        ],
        checklist: [
          { id: "1", title: "Task A", steps: [], priority: "HIGH", estimated_time: "1d", dependencies: [] },
          { id: "2", title: "Task B", steps: [], priority: "LOW", estimated_time: "1d", dependencies: [] },
        ],
        documents: [
          {
            category: "Identity",
            items: [
              { name: "Passport", why: "Required", priority: "HIGH", common_mistakes: [] },
              { name: "Photo", why: "ID", priority: "MEDIUM", common_mistakes: [] },
            ],
          },
        ],
        risks: [
          {
            id: "r1",
            risk: "Delay",
            why_it_matters: "Slower",
            mitigation: ["Apply early"],
            severity: "LOW",
          },
        ],
        sources: [],
        generated_at: "2025-01-01",
      },
      sampleProfile,
    )

    expect(uiPlan.summary.totalDocuments).toBe(2)
    expect(uiPlan.summary.totalTasks).toBe(2)
    expect(uiPlan.summary.estimatedWeeks).toBe(3)
    expect(uiPlan.timeline).toHaveLength(2)
    expect(uiPlan.documents[0].documents[0].name).toBe("Passport")
  })
})
