import type { ProfileData, PlanResponse } from "@/lib/api"

export interface BackendProfile {
  origin_country: string
  destination_country: string
  purpose: string
  planned_departure_date: string
  duration_months: number
  passport_expiry_date: string
  has_sponsor: boolean
  proof_of_funds_level: string
  language: string
  notes?: string
}

interface BackendSummary {
  title: string
  key_advice: string[]
  assumptions: string[]
  confidence: number
}

interface BackendTimelineItem {
  when: string
  actions: string[]
  priority: string
}

interface BackendChecklistItem {
  id: string
  title: string
  steps: string[]
  priority: string
  estimated_time: string
  dependencies: string[]
}

interface BackendDocumentItem {
  name: string
  why: string
  priority: string
  common_mistakes: string[]
}

interface BackendDocumentCategory {
  category: string
  items: BackendDocumentItem[]
}

interface BackendRiskItem {
  id: string
  risk: string
  why_it_matters: string
  mitigation: string[]
  severity: string
}

export interface BackendPlanOut {
  summary: BackendSummary
  timeline?: BackendTimelineItem[]
  checklist?: BackendChecklistItem[]
  documents?: BackendDocumentCategory[]
  risks?: BackendRiskItem[]
  sources?: Array<{ title: string; ref: string }>
  generated_at?: string
}

const PURPOSE_MAP: Record<string, string> = {
  study: "STUDY",
  work: "WORK",
  tourism: "TOURISM",
  family: "TOURISM",
  business: "WORK",
}

const LANGUAGE_MAP: Record<string, string> = {
  en: "EN",
  fr: "FR",
}

const FUNDS_MAP: Record<string, string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
}

const ensureIsoDate = (value?: string): string => {
  if (!value) {
    return new Date().toISOString().slice(0, 10)
  }
  const maybeDate = new Date(value)
  if (Number.isNaN(maybeDate.getTime())) {
    return new Date().toISOString().slice(0, 10)
  }
  return maybeDate.toISOString().slice(0, 10)
}

export const toBackendProfile = (profile: ProfileData): BackendProfile => {
  return {
    origin_country: profile.originCountry,
    destination_country: profile.destinationCountry,
    purpose: PURPOSE_MAP[profile.purpose] ?? profile.purpose?.toUpperCase() ?? "TOURISM",
    planned_departure_date: ensureIsoDate(profile.departureDate),
    duration_months: Math.max(parseInt(profile.duration || "0", 10) || 1, 1),
    passport_expiry_date: ensureIsoDate(profile.passportExpiry),
    has_sponsor: Boolean(profile.hasSponsor),
    proof_of_funds_level: FUNDS_MAP[profile.fundsLevel] ?? profile.fundsLevel?.toUpperCase() ?? "MEDIUM",
    language: LANGUAGE_MAP[profile.language] ?? profile.language?.toUpperCase() ?? "EN",
    notes: profile.notes?.trim() || undefined,
  }
}

const parseWeekLabel = (label?: string): number | undefined => {
  if (!label) return undefined
  const match = label.match(/(\d+)(?:\s*-\s*(\d+))?/)
  if (!match) return undefined
  const [, start, end] = match
  if (end) return Number(end)
  return Number(start)
}

const estimateWeeks = (plan: BackendPlanOut, profile?: ProfileData): number => {
  const weekHints = plan.timeline?.map((item) => parseWeekLabel(item.when)).filter((value): value is number => Boolean(value))
  if (weekHints && weekHints.length > 0) {
    return Math.max(...weekHints)
  }
  const purpose = profile?.purpose ?? "tourism"
  if (purpose === "tourism") return 4
  if (purpose === "study") return 10
  if (purpose === "work" || purpose === "business") return 8
  return 6
}

const summarizeDocuments = (documents?: BackendDocumentCategory[]): number => {
  if (!documents) return 0
  return documents.reduce((total, category) => total + (category.items?.length ?? 0), 0)
}

const toUiTimeline = (timeline?: BackendTimelineItem[]): PlanResponse["timeline"] => {
  if (!timeline) return []
  return timeline.map((item) => {
    const actions = item.actions ?? []
    const description = actions.length > 0 ? actions.join(" • ") : item.when
    const title = actions[0] ?? item.when ?? "Milestone"
    return {
      title,
      date: item.when ?? "",
      status: "pending" as const,
      description: description ?? "",
    }
  })
}

const toUiChecklist = (checklist?: BackendChecklistItem[]): PlanResponse["checklist"] => {
  if (!checklist || checklist.length === 0) return []
  const grouped = new Map<string, { category: string; items: { title: string; priority: "high" | "medium" | "low"; completed: boolean }[] }>()
  checklist.forEach((item) => {
    const priority = (item.priority?.toLowerCase() as "high" | "medium" | "low") || "medium"
    const categoryName = `${priority.charAt(0).toUpperCase()}${priority.slice(1)} Priority`
    if (!grouped.has(categoryName)) {
      grouped.set(categoryName, { category: categoryName, items: [] })
    }
    grouped.get(categoryName)?.items.push({
      title: item.title,
      priority,
      completed: false,
    })
  })
  return Array.from(grouped.values())
}

const toUiDocuments = (documents?: BackendDocumentCategory[]): PlanResponse["documents"] => {
  if (!documents) return []
  return documents.map((category) => ({
    category: category.category,
    documents: (category.items ?? []).map((doc) => ({
      name: doc.name,
      description: doc.why,
      requirements: doc.common_mistakes ?? [],
    })),
  }))
}

const toUiRisks = (risks?: BackendRiskItem[]): PlanResponse["risks"] => {
  if (!risks) return []
  return risks.map((risk) => ({
    title: risk.risk,
    severity: (risk.severity?.toLowerCase() as "high" | "medium" | "low") || "medium",
    description: risk.why_it_matters,
    mitigation: risk.mitigation ?? [],
  }))
}

export const toUiPlan = (plan: BackendPlanOut, profile?: ProfileData): PlanResponse => {
  const documents = toUiDocuments(plan.documents)
  const checklist = toUiChecklist(plan.checklist)
  const timeline = toUiTimeline(plan.timeline)
  const totalDocuments = summarizeDocuments(plan.documents)
  const totalTasks = checklist.reduce((total, category) => total + category.items.length, 0)

  return {
    summary: {
      confidence: plan.summary?.confidence ?? 0.6,
      estimatedWeeks: estimateWeeks(plan, profile),
      totalDocuments,
      totalTasks,
    },
    timeline,
    checklist,
    documents,
    risks: toUiRisks(plan.risks),
  }
}
