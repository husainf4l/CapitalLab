#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: scripts/restore-postgres.sh path/to/backup.dump" >&2
  exit 2
fi

: "${POSTGRES_HOST:=localhost}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_DB:=capitallab}"
: "${POSTGRES_USER:=capitallab}"

pg_restore \
  --host "$POSTGRES_HOST" \
  --port "$POSTGRES_PORT" \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --clean \
  --if-exists \
  --no-owner \
  "$1"
