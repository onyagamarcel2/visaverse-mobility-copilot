#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-http://localhost:8000}
FRONTEND_BASE=${FRONTEND_BASE:-http://localhost:3000}

sample_backend_payload() {
  cat <<JSON
{
  "origin_country": "cm",
  "destination_country": "fr",
  "purpose": "STUDY",
  "planned_departure_date": "2025-01-15",
  "duration_months": 6,
  "passport_expiry_date": "2026-02-01",
  "has_sponsor": true,
  "proof_of_funds_level": "HIGH",
  "language": "EN",
  "notes": "Smoke health"
}
JSON
}

sample_frontend_payload() {
  cat <<JSON
{
  "originCountry": "cm",
  "destinationCountry": "fr",
  "purpose": "study",
  "departureDate": "2025-01-15",
  "duration": "6",
  "passportExpiry": "2026-02-01",
  "hasSponsor": true,
  "fundsLevel": "medium",
  "language": "en",
  "notes": "Smoke health"
}
JSON
}

curl -fsS "$API_BASE/api/health" | jq .

curl -fsS -X POST "$API_BASE/api/plan" \
  -H "Content-Type: application/json" \
  -d "$(sample_backend_payload)" | jq '.summary.confidence'

curl -fsS -X POST "$API_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"How long?","profile":'"$(sample_backend_payload)"'}' | jq '.answer'

curl -fsS -X POST "$FRONTEND_BASE/api/plan" \
  -H "Content-Type: application/json" \
  -d "$(sample_frontend_payload)" | jq '.summary'

curl -fsS -X POST "$FRONTEND_BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"Any tips?","context":'"$(sample_frontend_payload)"'}' | jq '.response'

echo "Smoke checks completed"
