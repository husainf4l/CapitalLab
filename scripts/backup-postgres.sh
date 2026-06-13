#!/usr/bin/env sh
# PostgreSQL backup with daily/weekly/monthly rotation and retention enforcement.
#
# Retention policy:
#   daily   → keep 30 most recent daily backups
#   weekly  → keep 12 most recent weekly backups  (runs on Sunday)
#   monthly → keep 12 most recent monthly backups (runs on 1st of month)
#
# Usage:
#   POSTGRES_PASSWORD=secret ./scripts/backup-postgres.sh
#
# Schedule via cron (example):
#   0 2 * * *   POSTGRES_PASSWORD=... /opt/capitallab/scripts/backup-postgres.sh
set -eu

: "${POSTGRES_HOST:=localhost}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_DB:=capitallab}"
: "${POSTGRES_USER:=capitallab}"
: "${BACKUP_DIR:=./backups}"
: "${DAILY_RETENTION:=30}"
: "${WEEKLY_RETENTION:=12}"
: "${MONTHLY_RETENTION:=12}"

mkdir -p \
  "$BACKUP_DIR/daily" \
  "$BACKUP_DIR/weekly" \
  "$BACKUP_DIR/monthly"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
day_of_week="$(date -u +%u)"    # 7 = Sunday
day_of_month="$(date -u +%d)"   # 01..31

# ── helper: run pg_dump into a target path ─────────────────────────────────────
dump() {
  target="$1"
  PGPASSWORD="${POSTGRES_PASSWORD:-}" pg_dump \
    --host "$POSTGRES_HOST" \
    --port "$POSTGRES_PORT" \
    --username "$POSTGRES_USER" \
    --format custom \
    --blobs \
    --file "$target" \
    "$POSTGRES_DB"
  printf '[backup] wrote %s\n' "$target"
}

# ── helper: prune oldest files, keep $2 most recent ───────────────────────────
prune() {
  dir="$1"
  keep="$2"
  count="$(ls -1 "$dir"/*.dump 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$count" -gt "$keep" ]; then
    excess="$(( count - keep ))"
    ls -1t "$dir"/*.dump | tail -n "$excess" | while IFS= read -r f; do
      rm -f "$f"
      printf '[backup] pruned %s\n' "$f"
    done
  fi
}

# ── daily backup (always) ─────────────────────────────────────────────────────
daily_target="$BACKUP_DIR/daily/${POSTGRES_DB}_daily_${stamp}.dump"
dump "$daily_target"
prune "$BACKUP_DIR/daily" "$DAILY_RETENTION"

# ── weekly backup (Sunday) ────────────────────────────────────────────────────
if [ "$day_of_week" = "7" ]; then
  weekly_target="$BACKUP_DIR/weekly/${POSTGRES_DB}_weekly_${stamp}.dump"
  cp "$daily_target" "$weekly_target"
  printf '[backup] weekly copy → %s\n' "$weekly_target"
  prune "$BACKUP_DIR/weekly" "$WEEKLY_RETENTION"
fi

# ── monthly backup (1st of month) ────────────────────────────────────────────
if [ "$day_of_month" = "01" ]; then
  monthly_target="$BACKUP_DIR/monthly/${POSTGRES_DB}_monthly_${stamp}.dump"
  cp "$daily_target" "$monthly_target"
  printf '[backup] monthly copy → %s\n' "$monthly_target"
  prune "$BACKUP_DIR/monthly" "$MONTHLY_RETENTION"
fi

printf '[backup] done — %s\n' "$stamp"
