// Shared TypeScript types for the application

export interface UserProfile {
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

export type VisaPurpose = "study" | "work" | "tourism" | "family" | "business"

export type FundsLevel = "low" | "medium" | "high"

export type Priority = "high" | "medium" | "low"

export type RiskSeverity = "high" | "medium" | "low"

export interface Country {
  code: string
  name: string
  flag?: string
}

export const COUNTRIES: Country[] = [
  { code: "us", name: "United States" },
  { code: "uk", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "in", name: "India" },
  { code: "cn", name: "China" },
  { code: "jp", name: "Japan" },
  { code: "br", name: "Brazil" },
]

export const PURPOSES: Record<VisaPurpose, string> = {
  study: "Study",
  work: "Work",
  tourism: "Tourism",
  family: "Family Reunion",
  business: "Business",
}
