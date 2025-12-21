import { NextResponse } from "next/server"

import { toBackendProfile } from "@/lib/bff-mappers"
import type { ProfileData } from "@/lib/api"

const normalizeBaseUrl = (url?: string | null) => {
  if (!url) return null
  return url.replace(/\/+$/, "")
}

const FASTAPI_BASE_URL =
  normalizeBaseUrl(process.env.FASTAPI_BASE_URL) ??
  normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ??
  "http://localhost:8000"

interface IncomingChatBody {
  message: string
  context?: ProfileData
  history?: Array<{ role: string; content: string }>
}

export async function POST(request: Request) {
  try {
    const body: IncomingChatBody = await request.json()
    if (!body?.message) {
      return NextResponse.json(
        { error: { code: "CHAT_INPUT_ERROR", message: "Message is required" } },
        { status: 400 },
      )
    }

    const payload = {
      message: body.message,
      profile: body.context ? toBackendProfile(body.context) : undefined,
      history: body.history ?? [],
    }

    const response = await fetch(`${FASTAPI_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data?.error ?? { code: "CHAT_BACKEND_ERROR", message: "Failed to process chat" }
      return NextResponse.json({ error }, { status: response.status })
    }

    return NextResponse.json({
      response: data.answer,
      sources: data.sources ?? [],
      suggestedQuestions: data.suggested_questions ?? [],
    })
  } catch (error) {
    console.error("Error processing chat request:", error)
    return NextResponse.json(
      { error: { code: "CHAT_PROXY_ERROR", message: "Failed to process message" } },
      { status: 500 },
    )
  }
}
