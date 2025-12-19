export type Purpose = "STUDY" | "WORK" | "TOURISM";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Severity = "LOW" | "MEDIUM" | "HIGH";
export type Language = "EN" | "FR";

export interface ProfileInput {
  origin_country: string;
  destination_country: string;
  purpose: Purpose;
  planned_departure_date: string;
  duration_months: number;
  passport_expiry_date: string;
  has_sponsor: boolean;
  proof_of_funds_level: Priority;
  language: Language;
  notes?: string;
}

export interface PlanSummary {
  title: string;
  key_advice: string[];
  assumptions: string[];
  confidence: number;
}

export interface TimelineItem {
  when: string;
  actions: string[];
  priority: Priority;
}

export interface ChecklistItem {
  id: string;
  title: string;
  steps: string[];
  priority: Priority;
  estimated_time: string;
  dependencies: string[];
}

export interface DocumentItem {
  name: string;
  why: string;
  priority: Priority;
  common_mistakes: string[];
}

export interface DocumentCategory {
  category: string;
  items: DocumentItem[];
}

export interface RiskItem {
  id: string;
  risk: string;
  why_it_matters: string;
  mitigation: string[];
  severity: Severity;
}

export interface SourceRef {
  title: string;
  ref: string;
}

export interface PlanResponse {
  summary: PlanSummary;
  timeline: TimelineItem[];
  checklist: ChecklistItem[];
  documents: DocumentCategory[];
  risks: RiskItem[];
  sources: SourceRef[];
  generated_at: string;
}
