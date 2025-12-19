import { NextResponse } from "next/server"
import type { ProfileData } from "@/lib/api"

export async function POST(request: Request) {
  try {
    const profileData: ProfileData = await request.json()

    // Here you would normally call your FastAPI backend
    // For now, return mock data

    const mockResponse = {
      summary: {
        confidence: 0.87,
        estimatedWeeks: 8,
        totalDocuments: 12,
        totalTasks: 8,
      },
      timeline: [
        {
          title: "Initial Document Gathering",
          date: "Week 1-2",
          status: "pending",
          description: "Collect passport, photos, and personal identification documents",
        },
      ],
      checklist: [],
      documents: [],
      risks: [],
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("Error processing plan request:", error)
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 })
  }
}
