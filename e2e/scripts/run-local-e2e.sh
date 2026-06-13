#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
API_URL="${API_BASE_URL:-http://localhost:5001}"
WEB_URL="${WEB_BASE_URL:-http://localhost:4200}"
API_LOG="$ROOT_DIR/e2e/.api.log"
WEB_LOG="$ROOT_DIR/e2e/.web.log"

cleanup() {
  if [ -n "${API_PID:-}" ]; then kill "$API_PID" 2>/dev/null || true; fi
  if [ -n "${WEB_PID:-}" ]; then kill "$WEB_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT INT TERM

wait_for() {
  url="$1"
  label="$2"
  attempts="${3:-60}"
  i=1
  while [ "$i" -le "$attempts" ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$label is ready at $url"
      return 0
    fi
    sleep 2
    i=$((i + 1))
  done
  echo "$label did not become ready at $url" >&2
  return 1
}

echo "Seeding compact local demo data..."
(
  cd "$ROOT_DIR/backend"
  dotnet build src/CapitalLab.Api/CapitalLab.Api.csproj --no-restore -v:minimal /m:1 /nr:false /p:UseSharedCompilation=false
  DEMO_BRANCH_COUNT="${DEMO_BRANCH_COUNT:-2}" \
  DEMO_DOCTOR_COUNT="${DEMO_DOCTOR_COUNT:-2}" \
  DEMO_STAFF_COUNT="${DEMO_STAFF_COUNT:-4}" \
  DEMO_PATIENT_COUNT="${DEMO_PATIENT_COUNT:-25}" \
  DEMO_APPOINTMENT_COUNT="${DEMO_APPOINTMENT_COUNT:-25}" \
  DEMO_ORDER_COUNT="${DEMO_ORDER_COUNT:-25}" \
  DEMO_SAMPLE_COUNT="${DEMO_SAMPLE_COUNT:-25}" \
  DEMO_INVOICE_COUNT="${DEMO_INVOICE_COUNT:-25}" \
  DEMO_PAYMENT_COUNT="${DEMO_PAYMENT_COUNT:-25}" \
  ASPNETCORE_ENVIRONMENT=Development \
  dotnet src/CapitalLab.Api/bin/Debug/net10.0/CapitalLab.Api.dll --seed-demo-data
)

echo "Starting backend API..."
(
  cd "$ROOT_DIR/backend"
  ASPNETCORE_ENVIRONMENT=Development \
  CAPITALLAB_SKIP_MIGRATIONS=true \
  CAPITALLAB_DISABLE_HANGFIRE_SERVER=true \
  ASPNETCORE_URLS="$API_URL" \
  dotnet src/CapitalLab.Api/bin/Debug/net10.0/CapitalLab.Api.dll >"$API_LOG" 2>&1
) &
API_PID="$!"

wait_for "$API_URL/health/live" "API"

echo "Starting Angular frontend..."
(
  cd "$ROOT_DIR/frontend"
  npm run start -- --host 127.0.0.1 --port 4200 >"$WEB_LOG" 2>&1
) &
WEB_PID="$!"

wait_for "$WEB_URL" "Frontend"

cd "$ROOT_DIR/e2e"
if [ "${PLAYWRIGHT_HEADED:-false}" = "true" ]; then
  WEB_BASE_URL="$WEB_URL" API_BASE_URL="$API_URL" RUN_E2E_AGAINST_LIVE=true RUN_API_E2E=true npm run test:headed
else
  WEB_BASE_URL="$WEB_URL" API_BASE_URL="$API_URL" RUN_E2E_AGAINST_LIVE=true RUN_API_E2E=true npm test
fi
