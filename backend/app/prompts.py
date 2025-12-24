from textwrap import dedent

from .schemas import ProfileIn


def build_prompt(profile: ProfileIn, snippets: list[dict]) -> str:
    sources_text = "\n\n".join(
        [f"Source: {s.get('title')} ({s.get('ref')})\n{s.get('content', '')}" for s in snippets]
    )
    schema_example = """
{
  "summary": {
    "title": "Short sentence",
    "key_advice": ["tip 1", "tip 2"],
    "assumptions": ["assumption 1"],
    "confidence": 0.82
  },
  "timeline": [
    {"when": "2025-01-05", "actions": ["Action A", "Action B"], "priority": "HIGH"}
  ],
  "checklist": [
    {
      "id": "book_appointment",
      "title": "Book visa appointment",
      "steps": ["Create account", "Upload docs"],
      "priority": "MEDIUM",
      "estimated_time": "3 days",
      "dependencies": []
    }
  ],
  "documents": [
    {
      "category": "Identity",
      "items": [
        {"name": "Passport", "why": "Proof of identity", "priority": "HIGH", "common_mistakes": ["Expired"] }
      ]
    }
  ],
  "risks": [
    {
      "id": "insufficient_funds",
      "risk": "Funds may be insufficient",
      "why_it_matters": "Consulate requires minimum balance",
      "mitigation": ["Add sponsor letter"],
      "severity": "HIGH"
    }
  ],
  "sources": [
    {"title": "Cm To Fr Student", "ref": "country_pairs/cm_to_fr_student.md"}
  ],
  "generated_at": "2025-02-01T10:00:00Z"
}
""".strip()
    return dedent(
        f"""
        You are a visa mobility planner. Produce ONLY JSON that matches the PlanOut schema.
        Respond in the language specified by the profile language (FR = French, EN = English).
        Do not include any commentary. The JSON MUST include these keys exactly: summary, timeline, checklist, documents, risks, sources, generated_at.
        Each timeline item must be an object with fields when, actions[], priority.
        Each checklist item must include id, title, steps[], priority, estimated_time, dependencies[].
        Each document category must include category and items[] where each item has name, why, priority, common_mistakes[].
        Risks must include id, risk, why_it_matters, mitigation[], severity.
        Follow this example shape strictly:
        {schema_example}

        Profile:
        origin_country: {profile.origin_country}
        destination_country: {profile.destination_country}
        purpose: {profile.purpose}
        departure: {profile.planned_departure_date}
        duration_months: {profile.duration_months}
        passport_expiry_date: {profile.passport_expiry_date}
        has_sponsor: {profile.has_sponsor}
        proof_of_funds_level: {profile.proof_of_funds_level}
        language: {profile.language}

        Knowledge base snippets (optional to use):
        {sources_text}
        """
    ).strip()
