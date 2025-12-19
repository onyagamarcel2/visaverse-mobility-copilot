import { PlanResponse, ProfileInput } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function createPlan(profile: ProfileInput): Promise<PlanResponse> {
  const response = await fetch(`${API_BASE}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to generate plan");
  }

  return response.json();
}
