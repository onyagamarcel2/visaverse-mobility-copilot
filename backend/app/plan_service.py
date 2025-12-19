from datetime import datetime

from .config import settings
from .kb import retrieve_snippets
from .llm_client import generate_plan
from .rules import evaluate_rules
from .schemas import PlanOut, ProfileIn, RiskItem, SourceRef


def build_plan(profile: ProfileIn) -> PlanOut:
    snippets = retrieve_snippets(profile, k=settings.MAX_SNIPPETS)
    plan_dict = generate_plan(profile, snippets)

    existing_risks = plan_dict.get("risks", []) or []
    rule_risks = [risk.model_dump() for risk in evaluate_rules(profile)]
    combined_risks = existing_risks + rule_risks

    sources = plan_dict.get("sources", []) or []
    snippet_sources = [
        SourceRef(title=s.get("title", ""), ref=s.get("ref", "")) for s in snippets
    ]
    plan_dict["sources"] = sources + [s.model_dump() for s in snippet_sources]
    plan_dict["risks"] = combined_risks
    plan_dict.setdefault("generated_at", datetime.utcnow().isoformat())

    return PlanOut.model_validate(plan_dict)
