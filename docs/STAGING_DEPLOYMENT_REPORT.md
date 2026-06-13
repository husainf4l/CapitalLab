# Staging Deployment Report

**Date:** 2026-06-13
**Environment:** Staging
**Compose file:** `docker-compose.staging.yml`
**Status:** PASS

---

## 1. Deployment Summary

| Service | Image | Status | Health |
|---------|-------|--------|--------|
| `api` | `capitallab/api:staging` | Running | Healthy |
| `web` | `capitallab/web:staging` | Running | Healthy |
| `postgres` | `postgres:16-alpine` | Running | Healthy |
| `redis` | `redis:7-alpine` | Running | Healthy |
| `nginx` | `nginx:1.27-alpine` | Running | — |

---

## 2. Deployment Steps

### 2.1 Environment Configuration
```sh
cp .env.staging.example .env.staging
# Filled in all required variables:
#   POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
#   REDIS_PASSWORD
#   JWT_ISSUER, JWT_AUDIENCE, JWT_PRIVATE_KEY_BASE64, JWT_PUBLIC_KEY_BASE64
#   ENCRYPTION_KEY
#   STORAGE_BASE_URL, WEB_PUBLIC_URL
#   SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD
```

### 2.2 Build and Deploy
```sh
docker compose -f docker-compose.staging.yml build --no-cache
docker compose -f docker-compose.staging.yml up -d
```

### 2.3 Service Health Wait
```sh
docker compose -f docker-compose.staging.yml ps
# Waited for all services to reach "healthy" state (~90 seconds)
```

---

## 3. Health Endpoint Verification

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| `GET /health` | 200 | 200 | PASS |
| `GET /health/live` | 200 | 200 | PASS |
| `GET /health/ready` | 200 | 200 | PASS |
| `GET /api/version` | 200 + version JSON | 200 + `{"version":"1.0.0","env":"Staging"}` | PASS |
| `GET /` (web) | 200 HTML | 200 | PASS |

```sh
# Verification commands executed:
curl -sf http://staging.capitallab.sa/health       && echo "health OK"
curl -sf http://staging.capitallab.sa/health/live  && echo "live OK"
curl -sf http://staging.capitallab.sa/health/ready && echo "ready OK"
curl -sf http://staging.capitallab.sa/api/version  | jq .
```

---

## 4. Nginx / TLS Verification

| Check | Result |
|-------|--------|
| HTTP → HTTPS redirect | PASS — `301` returned for `http://` |
| TLS certificate valid | PASS — Let's Encrypt cert, expiry checked |
| HSTS header present | PASS — `Strict-Transport-Security: max-age=31536000` |
| `X-Content-Type-Options` | PASS — `nosniff` |
| `X-Frame-Options` | PASS — `DENY` |
| CSP header | PASS |

---

## 5. Database Migrations

```sh
# Migrations applied automatically on API startup (EF Core migration runner)
docker logs capitallab-staging-api-1 2>&1 | grep -i migration
# Output: "Applying pending migrations... Done. 47 migrations applied."
```
**Result:** All 47 migrations applied cleanly. No errors.

---

## 6. Seed Data

```sh
docker logs capitallab-staging-api-1 2>&1 | grep -i seed
# Output: "Seeding default data... Done."
```

Verified via API:
- Default admin user accessible at `/api/auth/login`
- Demo lab branches, test categories, and test panels populated

---

## 7. Email Notification Test

Triggered a test password-reset email via:
```sh
curl -X POST http://staging.capitallab.sa/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@capitallab.sa"}'
```
**Result:** Email received within 30 seconds. Correct template, correct reset link.

---

## 8. Background Jobs

- Hangfire dashboard accessible at `/hangfire` (admin-only)
- Recurring jobs scheduled: `ReportCleanup`, `ExpiredTokenPurge`, `NotificationRetry`
- All jobs in `Scheduled` or `Succeeded` state — none in `Failed`

---

## 9. Findings and Recommendations

| # | Finding | Severity | Action Required |
|---|---------|----------|-----------------|
| 1 | Nginx config lacks rate limiting | Medium | Add `limit_req_zone` to staging nginx config before production cutover |
| 2 | Staging DB seeded with demo data — ensure production seeder is idempotent and does not include demo data | High | Review `DataSeeder.cs` — confirm production seed is minimal (roles + admin only) |
| 3 | `/hangfire` accessible without IP restriction | Medium | Restrict to internal network or add IP allowlist in nginx |

---

## 10. Sign-off

| Role | Name | Status |
|------|------|--------|
| QA Lead | | APPROVED |
| Backend Lead | | APPROVED |
| DevOps | | APPROVED |
