#!/usr/bin/env bash
# setup-ssl-staging.sh — Obtain and configure Let's Encrypt certificates for staging
# Usage: ./scripts/setup-ssl-staging.sh [--renew]
set -euo pipefail

DOMAIN_FRONTEND="app.capitallab.demo"
DOMAIN_API="api.capitallab.demo"
EMAIL="devops@capitallab.demo"
WEBROOT="/var/www/certbot"
COMPOSE_FILE="$(cd "$(dirname "$0")/.." && pwd)/docker-compose.staging.yml"

log() { printf '\033[1;36m[ssl]\033[0m %s\n' "$*"; }
err() { printf '\033[1;31m[ssl]\033[0m ERROR: %s\n' "$*" >&2; exit 1; }

# ── Prerequisite checks ───────────────────────────────────────────────────────
command -v certbot >/dev/null 2>&1 || err "certbot not found. Install: sudo apt install certbot"
command -v docker   >/dev/null 2>&1 || err "docker not found."

log "Creating webroot directory for ACME challenges..."
mkdir -p "$WEBROOT"

# ── Ensure nginx is up to serve ACME challenges ───────────────────────────────
log "Starting nginx (HTTP only) for ACME challenge..."
docker compose -f "$COMPOSE_FILE" up -d nginx 2>/dev/null || true
sleep 3

# ── Obtain certificates ───────────────────────────────────────────────────────
if [[ "${1:-}" == "--renew" ]]; then
    log "Renewing certificates..."
    certbot renew --webroot -w "$WEBROOT" --non-interactive --agree-tos --email "$EMAIL"
else
    log "Obtaining certificate for $DOMAIN_FRONTEND ..."
    certbot certonly \
        --webroot \
        -w "$WEBROOT" \
        -d "$DOMAIN_FRONTEND" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --rsa-key-size 4096

    log "Obtaining certificate for $DOMAIN_API ..."
    certbot certonly \
        --webroot \
        -w "$WEBROOT" \
        -d "$DOMAIN_API" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --rsa-key-size 4096
fi

log "Certificates obtained. Reloading nginx..."
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload 2>/dev/null || true

# ── Print renewal cron instructions ──────────────────────────────────────────
cat <<'EOF'

Certificate renewal (automatic):
  Add to /etc/cron.d/certbot-renew:

  0 3 * * * root certbot renew --quiet --webroot -w /var/www/certbot \
    --deploy-hook "docker compose -f /root/capitallab/docker-compose.staging.yml exec nginx nginx -s reload"

  Or use systemd timer: sudo systemctl enable certbot.timer

EOF

log "SSL setup complete."
log "  Frontend: https://$DOMAIN_FRONTEND"
log "  API:      https://$DOMAIN_API"
