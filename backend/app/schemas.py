from datetime import date
from enum import Enum
from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


class PurposeEnum(str, Enum):
    STUDY = "STUDY"
    WORK = "WORK"
    TOURISM = "TOURISM"


class LanguageEnum(str, Enum):
    EN = "EN"
    FR = "FR"


class PriorityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class SeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class Summary(BaseModel):
    title: str
    key_advice: List[str]
    assumptions: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)


class TimelineItem(BaseModel):
    when: str
    actions: List[str]
    priority: PriorityEnum


class ChecklistItem(BaseModel):
    id: str
    title: str
    steps: List[str]
    priority: PriorityEnum
    estimated_time: str
    dependencies: List[str] = Field(default_factory=list)


class DocumentItem(BaseModel):
    name: str
    why: str
    priority: PriorityEnum
    common_mistakes: List[str] = Field(default_factory=list)


class DocumentCategory(BaseModel):
    category: str
    items: List[DocumentItem]


class RiskItem(BaseModel):
    id: str
    risk: str
    why_it_matters: str
    mitigation: List[str]
    severity: SeverityEnum


class SourceRef(BaseModel):
    title: str
    ref: str


class ProfileIn(BaseModel):
    origin_country: str
    destination_country: str
    purpose: PurposeEnum
    planned_departure_date: date
    duration_months: int
    passport_expiry_date: date
    has_sponsor: bool
    proof_of_funds_level: PriorityEnum
    language: LanguageEnum
    notes: Optional[str] = None

    @field_validator("duration_months")
    @classmethod
    def validate_duration(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("duration_months must be positive")
        return value


class PlanOut(BaseModel):
    summary: Summary
    timeline: List[TimelineItem]
    checklist: List[ChecklistItem]
    documents: List[DocumentCategory]
    risks: List[RiskItem]
    sources: List[SourceRef]
    generated_at: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"] = "user"
    content: str


class ChatIn(BaseModel):
    message: str
    profile: Optional[ProfileIn] = None
    history: List[ChatMessage] = Field(default_factory=list)


class ChatOut(BaseModel):
    answer: str
    sources: List[SourceRef] = Field(default_factory=list)
    suggested_questions: List[str] = Field(default_factory=list)


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class ErrorEnvelope(BaseModel):
    error: ErrorDetail


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Optional[str] = None


class UserCreate(BaseModel):
    email: str
    password: str
    organization_id: Optional[int] = None


class UserOut(BaseModel):
    id: int
    email: str
    organization_id: Optional[int]
    roles: list[str] = Field(default_factory=list)


class KbVersionOut(BaseModel):
    id: int
    version: int
    status: str
    content: str


class KbDocumentOut(BaseModel):
    id: int
    title: str
    status: str
    versions: list[KbVersionOut] = Field(default_factory=list)
