// THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
// Run `python backend/scripts/generate_ts_contracts.py` to regenerate.

export type LanguageEnum = "EN" | "FR";
export type PriorityEnum = "LOW" | "MEDIUM" | "HIGH";
export type PurposeEnum = "STUDY" | "WORK" | "TOURISM";
export type SeverityEnum = "LOW" | "MEDIUM" | "HIGH";

export interface ProfileIn {
  origin_country: string;
  destination_country: string;
  purpose: PurposeEnum;
  planned_departure_date: string;
  duration_months: number;
  passport_expiry_date: string;
  has_sponsor: boolean;
  proof_of_funds_level: PriorityEnum;
  language: LanguageEnum;
  notes?: string | null;
}

export interface ChecklistItem {
  id: string;
  title: string;
  steps: string[];
  priority: PriorityEnum;
  estimated_time: string;
  dependencies?: string[];
}

export interface DocumentItem {
  name: string;
  why: string;
  priority: PriorityEnum;
  common_mistakes?: string[];
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
  severity: SeverityEnum;
}

export interface SourceRef {
  title: string;
  ref: string;
}

export interface Summary {
  title: string;
  key_advice: string[];
  assumptions?: string[];
  confidence: number;
}

export interface TimelineItem {
  when: string;
  actions: string[];
  priority: PriorityEnum;
}

export interface PlanOut {
  summary: Summary;
  timeline: TimelineItem[];
  checklist: ChecklistItem[];
  documents: DocumentCategory[];
  risks: RiskItem[];
  sources: SourceRef[];
  generated_at: string;
}

export interface ChatMessage {
  role?: "user" | "assistant" | "system";
  content: string;
}

export interface ChatIn {
  message: string;
  profile?: ProfileIn | null;
  history?: ChatMessage[];
}

export interface ChatOut {
  answer: string;
  sources?: SourceRef[];
  suggested_questions?: string[];
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: unknown | null;
}

export interface ErrorEnvelope {
  error: ErrorDetail;
}
