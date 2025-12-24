// API client for VisaVerse backend

export interface ProfileData {
  originCountry: string
  destinationCountry: string
  purpose: string
  departureDate: string
  duration: string
  passportExpiry: string
  hasSponsor: boolean
  fundsLevel: string
  language: string
  notes?: string
}

export interface PlanResponse {
  summary: {
    confidence: number
    estimatedWeeks: number
    totalDocuments: number
    totalTasks: number
  }
  timeline: Array<{
    title: string
    date: string
    status: "pending" | "completed"
    description: string
  }>
  checklist: Array<{
    category: string
    items: Array<{
      title: string
      priority: "high" | "medium" | "low"
      completed: boolean
    }>
  }>
  documents: Array<{
    category: string
    documents: Array<{
      name: string
      description: string
      requirements: string[]
    }>
  }>
  risks: Array<{
    title: string
    severity: "high" | "medium" | "low"
    description: string
    mitigation: string[]
  }>
}

export interface ChatRequest {
  message: string
  profile?: ProfileData
  history?: Array<{ role: "user" | "assistant"; content: string }>
}

class APIClient {
  private baseURL: string

  constructor() {
    this.baseURL = APIClient.resolveBaseUrl()
  }

  private static normalizeBaseUrl(url?: string | null) {
    if (!url) return ""
    return url.replace(/\/+$/, "")
  }

  private static resolveBaseUrl() {
    const envBase = APIClient.normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)
    if (envBase) return envBase
    if (typeof window !== "undefined") {
      return APIClient.normalizeBaseUrl(window.location.origin)
    }
    return "http://localhost:3000"
  }

  async generatePlan(profileData: ProfileData): Promise<PlanResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error generating plan:", error)
      // Return mock data for development
      return this.getMockPlan()
    }
  }

  async sendChatMessage(payload: ChatRequest): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: payload.message,
        context: payload.profile,
        history: payload.history,
      }),
    })

    let data: any

    try {
      data = await response.json()
    } catch (error) {
      // Ignore JSON parse errors; they will be handled by the ok check below
      console.error("Error parsing chat response:", error)
    }

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        data?.error ||
        `API error: ${response.status}`

      throw new Error(errorMessage)
    }

    if (!data?.response) {
      throw new Error("Unexpected response from the chat service.")
    }

    return data.response as string
  }

  // Mock data for development/testing
  private getMockPlan(): PlanResponse {
    return {
      summary: {
        confidence: 0.85,
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
        {
          title: "Financial Documentation",
          date: "Week 2-3",
          status: "pending",
          description: "Prepare bank statements, proof of funds, and employment letters",
        },
      ],
      checklist: [
        {
          category: "Identity Documents",
          items: [
            { title: "Valid passport (6+ months validity)", priority: "high", completed: false },
            { title: "Passport-sized photos (2-4 recent)", priority: "high", completed: false },
          ],
        },
      ],
      documents: [
        {
          category: "Identity & Personal Documents",
          documents: [
            {
              name: "Valid Passport",
              description: "Original passport with at least 6 months validity",
              requirements: ["Must have at least 2 blank pages", "Should be in good condition"],
            },
          ],
        },
      ],
      risks: [
        {
          title: "Insufficient Processing Time",
          severity: "high",
          description: "If you apply too close to your departure date, you may not receive your visa in time.",
          mitigation: [
            "Apply at least 8-10 weeks before your planned departure",
            "Consider expedited processing if available",
          ],
        },
      ],
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient()
