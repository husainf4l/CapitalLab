#!/usr/bin/env bash
# deploy-staging.sh — Deploy Capital Lab to staging environment
#
# Flags:
#   --seed-demo      Seed demo data after migrations
#   --no-cache       Build Docker images with --no-cache
#   --migrate-only   Run migrations only, skip build/deploy
#   --restart-only   Restart services only, skip build
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.staging.yml"
ENV_FILE="$ROOT_DIR/.env.staging"
API_URL="${API_URL:-https://api.capitallab.demo}"
WEB_URL="${WEB_URL:-https://app.capitallab.demo}"

SEED_DEMO=false
NO_CACHE=false
MIGRATE_ONLY=false
RESTART_ONLY=false

for arg in "$@"; do
    case "$arg" in
        --seed-demo)   SEED_DEMO=true ;;
        --no-cache)    NO_CACHE=true ;;
        --migrate-only) MIGRATE_ONLY=true ;;
        --restart-only) RESTART_ONLY=true ;;
        *) echo "Unknown flag: $arg" >&2; exit 1 ;;
    esac
done

log()  { printf '\033[1;32m[deploy]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[deploy]\033[0m WARN: %s\n' "$*"; }
err()  { printf '\033[1;31m[deploy]\033[0m ERROR: %s\n' "$*" >&2; exit 1; }

# ── Prerequisite checks ───────────────────────────────────────────────────────
[ -f "$ENV_FILE" ] || err "Missing env file: $ENV_FILE (copy .env.staging.example)"
command -v docker >/dev/null 2>&1 || err "docker not found"
command -v git    >/dev/null 2>&1 || err "git not found"

# ── Validate env — no placeholders ───────────────────────────────────────────
if grep -qE 'CHANGE_ME|REPLACE_WITH|your-' "$ENV_FILE"; then
    err "$ENV_FILE still contains placeholder values. Update all CHANGE_ME entries."
fi

# ── Load env ──────────────────────────────────────────────────────────────────
set -a; . "$ENV_FILE"; set +a

log "=== Capital Lab Staging Deployment ==="
log "Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
log "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
log "Date:   $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

cd "$ROOT_DIR"

# ── Restart only ──────────────────────────────────────────────────────────────
if $RESTART_ONLY; then
    log "Restarting services..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
    log "Services restarted."
    exit 0
fi

# ── Pull latest code ──────────────────────────────────────────────────────────
if git status >/dev/null 2>&1; then
    log "Pulling latest code..."
    git pull --ff-only || warn "git pull failed, continuing with current code"
fi

# ── Migrate only ──────────────────────────────────────────────────────────────
if $MIGRATE_ONLY; then
    log "Running database migrations only..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres
    sleep 5
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm api \
        dotnet CapitalLab.Api.dll --migrate-only
    log "Migrations complete."
    exit 0
fi

# ── Build images ──────────────────────────────────────────────────────────────
log "Building Docker images..."
BUILD_ARGS=""
$NO_CACHE && BUILD_ARGS="--no-cache"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build $BUILD_ARGS api
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build $BUILD_ARGS web

# ── Start infrastructure services first ───────────────────────────────────────
log "Starting infrastructure services (postgres, redis)..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres redis

log "Waiting for postgres to be ready..."
attempts=0
until docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
    pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    [ "$attempts" -ge 30 ] && err "Postgres did not become ready in time"
    sleep 3
done
log "Postgres ready."

# ── Run database migrations ───────────────────────────────────────────────────
log "Running database migrations..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm \
    -e RUN_MIGRATIONS=true \
    api dotnet CapitalLab.Api.dll --migrate-only || warn "Migration step returned non-zero (may be OK if migrations already applied)"

# ── Seed demo data ────────────────────────────────────────────────────────────
if $SEED_DEMO; then
    log "Seeding demo data..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm \
        -e ASPNETCORE_ENVIRONMENT=Staging \
        -e DEMO_BRANCH_COUNT="${DEMO_BRANCH_COUNT:-10}" \
        -e DEMO_DOCTOR_COUNT="${DEMO_DOCTOR_COUNT:-50}" \
        -e DEMO_STAFF_COUNT="${DEMO_STAFF_COUNT:-100}" \
        -e DEMO_PATIENT_COUNT="${DEMO_PATIENT_COUNT:-500}" \
        -e DEMO_APPOINTMENT_COUNT="${DEMO_APPOINTMENT_COUNT:-2000}" \
        -e DEMO_ORDER_COUNT="${DEMO_ORDER_COUNT:-2000}" \
        -e DEMO_SAMPLE_COUNT="${DEMO_SAMPLE_COUNT:-2000}" \
        -e DEMO_INVOICE_COUNT="${DEMO_INVOICE_COUNT:-3000}" \
        -e DEMO_PAYMENT_COUNT="${DEMO_PAYMENT_COUNT:-2500}" \
        api dotnet CapitalLab.Api.dll --seed-demo-data
    log "Demo data seeded."
fi

# ── Start all services ────────────────────────────────────────────────────────
log "Starting all services..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# ── Health checks ─────────────────────────────────────────────────────────────
wait_for() {
    url="$1"; label="$2"; attempts="${3:-40}"
    log "Waiting for $label at $url ..."
    for i in $(seq 1 "$attempts"); do
        if curl -fsS --max-time 5 "$url" >/dev/null 2>&1; then
            log "$label is up."
            return 0
        fi
        sleep 4
    done
    err "$label failed health check: $url"
}

wait_for "http://localhost/health/live" "API health (via nginx)"
wait_for "http://localhost"            "Frontend (via nginx)"

# ── Final status ──────────────────────────────────────────────────────────────
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo ""
log "=== Staging Deployment Complete ==="
log "  Frontend:    $WEB_URL"
log "  API:         $API_URL"
log "  API version: $(curl -fsS "$API_URL/api/version" 2>/dev/null | grep -o '"version":"[^"]*"' || echo 'check manually')"
log "  Health:      $API_URL/health"
log "  Demo user:   owner@capitallab.demo / Demo@123456"
