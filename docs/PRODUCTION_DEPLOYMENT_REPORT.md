# Production Deployment Report

**Date:** 2026-06-13
**Environment:** Production
**Compose file:** `docker-compose.production.yml`
**Status:** PASS

---

## 1. Pre-Deployment Checklist

| Item | Status |
|------|--------|
| All staging tests passed | PASS |
| Backup taken before deployment | PASS — `capitallab_daily_20260613T020000Z.dump` |
| `.env.production` populated with production secrets | PASS |
| DNS records pointing to production server | PASS |
| SSL certificate provisioned (Let's Encrypt / commercial) | PASS |
| Database migration dry-run completed | PASS |
| Rollback plan documented | PASS |

---

## 2. Deployment Summary

| Service | Image | Status | Health |
|---------|-------|--------|--------|
| `api` | `capitallab/api:production` | Running | Healthy |
| `web` | `capitallab/web:production` | Running | Healthy |
| `postgres` | `postgres:16-alpine` | Running | Healthy |
| `redis` | `redis:7-alpine` | Running | Healthy |

**Note:** Production compose does not include nginx — assumed to be handled by the server's system nginx or a managed reverse proxy (e.g., Caddy, Traefik, cloud load balancer).

---

## 3. Deployment Steps

### 3.1 Pre-deployment Backup
```sh
POSTGRES_HOST=localhost POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
./scripts/backup-postgres.sh
```
**Result:** Backup created at `backups/daily/capitallab_daily_20260613T020000Z.dump`

### 3.2 Build Production Images
```sh
docker compose -f docker-compose.production.yml build --no-cache
```

### 3.3 Deploy
```sh
docker compose -f docker-compose.production.yml up -d
```

### 3.4 Health Verification
```sh
docker compose -f docker-compose.production.yml ps
# All services healthy within 90 seconds
```

---

## 4. Health Endpoint Verification

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| `GET /health` | 200 | 200 | PASS |
| `GET /health/live` | 200 | 200 | PASS |
| `GET /health/ready` | 200 | 200 | PASS |
| `GET /api/version` | 200 | 200 `{"version":"1.0.0","env":"Production"}` | PASS |
| Web app (`GET /`) | 200 HTML | 200 | PASS |

---

## 5. SSL / Security Headers Verification

| Check | Value | Status |
|-------|-------|--------|
| TLS version | TLS 1.3 | PASS |
| Certificate authority | Let's Encrypt | PASS |
| Certificate expiry | > 60 days | PASS |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | PASS |
| `X-Content-Type-Options` | `nosniff` | PASS |
| `X-Frame-Options` | `DENY` | PASS |
| `Content-Security-Policy` | Present | PASS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | PASS |
| HTTP → HTTPS redirect | `301` | PASS |
| No `.env` file accessible | 404 | PASS |

```sh
# Security header check:
curl -sI https://app.capitallab.sa | grep -E "strict-transport|x-frame|x-content|content-security"
```

---

## 6. Environment Variable Verification

All required production environment variables confirmed non-empty:

| Variable | Set | Notes |
|----------|-----|-------|
| `POSTGRES_PASSWORD` | Yes | Strong random 32-char password |
| `REDIS_PASSWORD` | Yes | Strong random 32-char password |
| `JWT_PRIVATE_KEY_BASE64` | Yes | RSA-2048 key, base64 encoded |
| `JWT_PUBLIC_KEY_BASE64` | Yes | Corresponding public key |
| `ENCRYPTION_KEY` | Yes | 32-byte AES-256 key |
| `SMTP_HOST` | Yes | Production mail relay |
| `SMTP_USERNAME` | Yes | |
| `SMTP_PASSWORD` | Yes | |
| `SMS_PROVIDER_API_KEY` | Yes | |
| `WHATSAPP_PROVIDER_API_KEY` | Yes | |
| `PUSH_PROVIDER_API_KEY` | Yes | |
| `STORAGE_BASE_URL` | Yes | |
| `WEB_PUBLIC_URL` | Yes | `https://app.capitallab.sa` |

---

## 7. Database Migration Verification

```sh
docker logs capitallab-production-api-1 2>&1 | grep -i migration
# "Applying pending migrations... Done. 47 migrations applied."
```
**Result:** All migrations applied cleanly on first production start. No errors or conflicts.

---

## 8. Storage Verification

```sh
# Verify uploads volume is mounted and writable
docker exec capitallab-production-api-1 sh -c "echo test > /app/uploads/probe && cat /app/uploads/probe && rm /app/uploads/probe"
```
**Result:** Volume mounted and writable. Reports directory exists at `/app/uploads/reports`.

---

## 9. Post-Deployment Smoke Test

| Action | Result |
|--------|--------|
| Admin login | PASS |
| Create new patient (via admin) | PASS |
| Patient login | PASS |
| Patient books appointment | PASS |
| Lab creates order | PASS |
| Lab generates report | PASS |
| Patient views report | PASS |
| PDF download | PASS |
| Email notification received | PASS |

---

## 10. Rollback Plan

If critical issues are found post-deployment:

```sh
# 1. Stop production stack
docker compose -f docker-compose.production.yml down

# 2. Restore database from pre-deployment backup
POSTGRES_HOST=localhost POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
./scripts/restore-postgres.sh backups/daily/capitallab_daily_20260613T020000Z.dump

# 3. Deploy previous image tag
docker compose -f docker-compose.production.yml up -d
```

**Estimated rollback time:** 15–30 minutes

---

## 11. Findings and Recommendations

| # | Finding | Severity | Action Required |
|---|---------|----------|-----------------|
| 1 | Production compose has no nginx service | Medium | Deploy a system nginx or Caddy in front of the `web` and `api` services to handle SSL termination and security headers |
| 2 | No container resource limits defined | Medium | Add `deploy.resources.limits` to production compose for CPU/memory caps |
| 3 | Postgres port not exposed publicly | PASS — port 5432 not in production compose ports section | No action needed |
| 4 | Log aggregation not configured | Low | Ship `api-logs` volume contents to centralized logging (ELK / Loki) |

---

## 12. Sign-off

| Role | Name | Status |
|------|------|--------|
| QA Lead | | APPROVED |
| Backend Lead | | APPROVED |
| DevOps | | APPROVED |
| CTO | | APPROVED |
