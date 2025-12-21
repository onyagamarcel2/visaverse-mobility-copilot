#!/usr/bin/env bash
set -uo pipefail

API_BASE=${API_BASE:-http://localhost:8000}
FRONTEND_BASE=${FRONTEND_BASE:-http://localhost:3000}
ADMIN_BASE=${ADMIN_BASE:-http://localhost:9000}

overall_status=0

pass_msg() {
  echo "PASS: $1"
}

fail_msg() {
  overall_status=1
  echo "FAIL: $1"
}

check_endpoint() {
  local name="$1"
  shift
  if curl -fsS "$@" >/tmp/smoke-response.json; then
    pass_msg "$name"
  else
    fail_msg "$name"
  fi
}

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

echo "Running backend smoke checks against ${API_BASE}"
check_endpoint "Backend health" "$API_BASE/api/health"
check_endpoint "Backend plan" -X POST "$API_BASE/api/plan" -H "Content-Type: application/json" -d "$(sample_backend_payload)"
check_endpoint "Backend chat" -X POST "$API_BASE/api/chat" -H "Content-Type: application/json" \
  -d '{"message":"How long?","profile":'"$(sample_backend_payload)"'}'

frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_BASE")
if [[ "$frontend_status" != "000" ]]; then
  echo "Running frontend BFF smoke checks against ${FRONTEND_BASE}"
  check_endpoint "Frontend BFF plan" -X POST "$FRONTEND_BASE/api/plan" -H "Content-Type: application/json" -d "$(sample_frontend_payload)"
  check_endpoint "Frontend BFF chat" -X POST "$FRONTEND_BASE/api/chat" -H "Content-Type: application/json" \
    -d '{"message":"Any tips?","context":'"$(sample_frontend_payload)"'}'
else
  echo "SKIP: Frontend BFF not reachable at ${FRONTEND_BASE}"
fi

admin_status=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_BASE")
if [[ "$admin_status" != "000" ]]; then
  check_endpoint "Admin health" "$ADMIN_BASE/api/health" || true
  check_endpoint "Admin metrics" "$ADMIN_BASE/metrics" || true
fi

if [[ $overall_status -eq 0 ]]; then
  echo "Smoke checks completed: PASS"
else
  echo "Smoke checks completed: FAIL"
fi

exit $overall_status
