import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()

    // Here you would normally call your FastAPI backend or AI service
    // For now, return a mock response

    const mockResponses = [
      "Based on your profile, I'd recommend starting your visa application process at least 8 weeks before your departure date.",
      "For proof of funds, you'll typically need bank statements from the last 6 months showing a stable balance.",
      "Make sure your passport has at least 6 months validity beyond your planned return date, with at least 2 blank pages.",
      "You may need to attend a biometrics appointment at a visa application center. These are usually scheduled within 2-3 weeks of submission.",
      "Travel insurance is highly recommended and sometimes required. Look for policies that cover medical emergencies and repatriation.",
    ]

    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error processing chat request:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
