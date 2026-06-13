#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.production.yml"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
API_URL="${API_URL:-http://localhost:5001}"
WEB_URL="${WEB_URL:-http://localhost:8080}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 2
fi

if grep -qE 'CHANGE_ME|REPLACE_WITH|example.com' "$ENV_FILE"; then
  echo "$ENV_FILE still contains placeholder values." >&2
  exit 2
fi

set -a
. "$ENV_FILE"
set +a

wait_for() {
  url="$1"
  label="$2"
  attempts="${3:-60}"
  i=1
  while [ "$i" -le "$attempts" ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$label ready: $url"
      return 0
    fi
    sleep 3
    i=$((i + 1))
  done
  echo "$label failed readiness check: $url" >&2
  return 1
}

cd "$ROOT_DIR"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres redis
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d api web

wait_for "$API_URL/health/live" "API live"
wait_for "$API_URL/health/ready" "API ready"
wait_for "$WEB_URL" "Frontend"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T redis redis-cli -a "$REDIS_PASSWORD" ping
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo "Production stack validation completed."
