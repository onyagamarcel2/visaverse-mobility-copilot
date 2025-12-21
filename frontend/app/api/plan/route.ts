import { NextResponse } from "next/server"

import type { ProfileData } from "@/lib/api"
import { toBackendProfile, toUiPlan } from "@/lib/bff-mappers"
import type { BackendPlanOut } from "@/lib/bff-mappers"

const normalizeBaseUrl = (url?: string | null) => {
  if (!url) return null
  return url.replace(/\/+$/, "")
}

const FASTAPI_BASE_URL =
  normalizeBaseUrl(process.env.FASTAPI_BASE_URL) ??
  normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ??
  "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const profileData: ProfileData = await request.json()
    const backendPayload = toBackendProfile(profileData)

    const response = await fetch(`${FASTAPI_BASE_URL}/api/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
    })

    const plan = (await response.json()) as BackendPlanOut | { error?: { code?: string; message?: string } }

    if (!response.ok) {
      const error = plan?.error ?? { code: "PLAN_BACKEND_ERROR", message: "Failed to generate plan" }
      return NextResponse.json({ error }, { status: response.status })
    }

    const uiPlan = toUiPlan(plan as BackendPlanOut, profileData)
    return NextResponse.json(uiPlan)
  } catch (error) {
    console.error("Error processing plan request:", error)
    return NextResponse.json(
      { error: { code: "PLAN_PROXY_ERROR", message: "Failed to generate plan" } },
      { status: 500 },
    )
  }
}
