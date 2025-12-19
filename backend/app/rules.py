from datetime import timedelta
from typing import List

from .schemas import PriorityEnum, ProfileIn, RiskItem, SeverityEnum


def check_time_to_departure(profile: ProfileIn, today=None) -> List[RiskItem]:
    today = today or profile.planned_departure_date.today()
    days_until_departure = (profile.planned_departure_date - today).days
    risks: List[RiskItem] = []
    if days_until_departure < 30:
        risks.append(
            RiskItem(
                id="tight_departure",
                risk="Departure is less than 30 days away",
                why_it_matters="Visa and logistics processing may exceed the available time window.",
                mitigation=[
                    "Expedite document collection and book earliest available appointment.",
                    "Consider rescheduling travel to allow buffer time.",
                ],
                severity=SeverityEnum.HIGH,
            )
        )
    return risks


def check_passport_validity(profile: ProfileIn, today=None) -> List[RiskItem]:
    today = today or profile.planned_departure_date.today()
    expiry_gap = profile.passport_expiry_date - profile.planned_departure_date
    risks: List[RiskItem] = []
    if expiry_gap < timedelta(days=180):
        risks.append(
            RiskItem(
                id="passport_expiry",
                risk="Passport validity is under 6 months after planned departure",
                why_it_matters="Many destinations require passports valid 6+ months beyond travel dates.",
                mitigation=[
                    "Renew passport before submitting visa application if feasible.",
                    "Check destination rules for minimum validity and plan renewal appointment.",
                ],
                severity=SeverityEnum.HIGH,
            )
        )
    return risks


def check_proof_of_funds(profile: ProfileIn) -> List[RiskItem]:
    risks: List[RiskItem] = []
    if profile.purpose == profile.purpose.STUDY and profile.proof_of_funds_level == PriorityEnum.LOW:
        risks.append(
            RiskItem(
                id="funds_low",
                risk="Proof of funds appears low for study plans",
                why_it_matters="Insufficient funds commonly lead to study visa refusals.",
                mitigation=[
                    "Gather bank statements or sponsorship letters covering tuition and living costs.",
                    "Clarify sponsor relationship and include notarized affidavits where applicable.",
                ],
                severity=SeverityEnum.HIGH,
            )
        )
    return risks


def evaluate_rules(profile: ProfileIn) -> List[RiskItem]:
    risks: List[RiskItem] = []
    risks.extend(check_time_to_departure(profile))
    risks.extend(check_passport_validity(profile))
    risks.extend(check_proof_of_funds(profile))
    return risks
