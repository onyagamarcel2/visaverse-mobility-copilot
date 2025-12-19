from textwrap import dedent

from .schemas import ProfileIn


def build_prompt(profile: ProfileIn, snippets: list[dict]) -> str:
    sources_text = "\n\n".join(
        [f"Source: {s.get('title')} ({s.get('ref')})\n{s.get('content', '')}" for s in snippets]
    )
    return dedent(
        f"""
        You are a visa mobility planner. Produce ONLY JSON that matches the PlanOut schema.
        Do not include any commentary. Respect these keys exactly: summary, timeline, checklist, documents, risks, sources, generated_at.
        Use concise bullet actions. Confidence is between 0 and 1.

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
