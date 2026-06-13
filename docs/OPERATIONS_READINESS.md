# Operations Readiness Report

| Field | Value |
|---|---|
| **Project** | CapitalLab — Laboratory Management Platform |
| **Document** | Operations Readiness Assessment |
| **Version** | 1.0 |
| **Date** | 2026-06-13 |
| **Status** | CONDITIONALLY READY |
| **Reviewed By** | Infrastructure & DevOps Engineering |
| **Next Review** | 2026-12-13 |

---

## Executive Summary

CapitalLab's infrastructure has been assessed for production operations readiness across deployment topology, health monitoring, backup and recovery, background job management, and observability. The core infrastructure is solid and correctly assembled. Five operational gaps must be closed before the system is suitable for production traffic carrying real patient data.

**Overall Verdict: CONDITIONALLY READY**

---

## 1. Infrastructure Topology

```
                        INTERNET
                            |
                    [ Load Balancer / Reverse Proxy ]
                    (Nginx / Caddy — TLS termination)
                            |
               ┌────────────────────────────┐
               |       Docker Network       |
               |    (capitallab_network)    |
               |                            |
               |  ┌──────────────────────┐  |
               |  │   capitallab-api     │  |
               |  │   .NET 10 / ASP.NET  │  |
               |  │   Port: 8080         │  |
               |  │   Health: /health/*  │  |
               |  └──────────┬───────────┘  |
               |             │              |
               |     ┌───────┴────────┐     |
               |     │               │     |
               |  ┌──▼──────────┐  ┌─▼───────────┐  |
               |  │  postgres   │  │    redis    │  |
               |  │  v16        │  │    v7       │  |
               |  │  Port: 5432 │  │  Port: 6379 │  |
               |  │  Data vol   │  │  Data vol   │  |
               |  └─────────────┘  └─────────────┘  |
               |                            |
               |  ┌──────────────────────┐  |
               |  │    capitallab-web    │  |
               |  │    Angular SPA       │  |
               |  │    (Nginx container) │  |
               |  │    Port: 80/443      │  |
               |  └──────────────────────┘  |
               └────────────────────────────┘

External Dependencies:
  - SMTP server (outbound email notifications)
  - SMS provider (optional — appointment reminders)
  - RSA key pair (mounted as environment secrets)

Volumes:
  - postgres_data   → PostgreSQL data directory (persistent)
  - redis_data      → Redis AOF / RDB persistence (persistent)
  - app_logs        → Structured JSON logs (persistent)
```

---

## 2. Container Health Check Coverage

All four production services have health checks configured in `docker-compose.yml` with automatic restart policies.

| Service | Health Check Command | Interval | Timeout | Retries | Start Period | Restart Policy |
|---|---|---|---|---|---|---|
| `capitallab-api` | `GET /health/live` (HTTP 200) | 30s | 10s | 3 | 60s | `unless-stopped` |
| `capitallab-web` | HTTP probe on port 80 | 30s | 10s | 3 | 30s | `unless-stopped` |
| `postgres` | `pg_isready -U $POSTGRES_USER` | 10s | 5s | 5 | 30s | `unless-stopped` |
| `redis` | `redis-cli ping` | 10s | 5s | 3 | 20s | `unless-stopped` |

**Service startup dependency order:**
1. `postgres` starts first — no dependencies
2. `redis` starts first — no dependencies
3. `capitallab-api` waits for `postgres` (healthy) AND `redis` (healthy) before starting
4. `capitallab-web` waits for `capitallab-api` (healthy) before starting

This ordering prevents the API from attempting database connections before PostgreSQL is ready, which is a common cause of failed deployments.

---

## 3. Application Health Check Endpoints

| Endpoint | Purpose | Response Format | Tags Checked |
|---|---|---|---|
| `GET /health` | Full health report (all checks) | HealthChecks.UI JSON | database, cache, disk |
| `GET /health/ready` | Readiness probe — is the app ready to serve traffic? | HealthChecks.UI JSON | database, cache |
| `GET /health/live` | Liveness probe — is the process alive? | HTTP 200 / 503 | (lightweight — no DB) |

| Probe Name | Tag | Failure Behavior | Threshold |
|---|---|---|---|
| PostgreSQL connectivity | `database` | Unhealthy — returns HTTP 503 | Connection failure |
| Redis connectivity | `cache` | Degraded — returns HTTP 200 with degraded status | Connection failure |
| Disk space | `disk` | Degraded — returns HTTP 200 with degraded status | < 500 MB free |

**Design note:** Redis failure is configured as `Degraded` (not `Unhealthy`) because the API can operate in a reduced capacity without the cache — it will simply fall back to direct database reads. PostgreSQL failure is `Unhealthy` because the API cannot function without the primary datastore.

---

## 4. Backup and Recovery

### 4.1 Backup Procedure

**Script location:** `/scripts/backup-postgres.sh`

**What it does:**
1. Connects to PostgreSQL using credentials from environment variables
2. Executes `pg_dump` in custom format (`-Fc`) — compressed, parallelizable, selective restore-capable
3. Writes output to a timestamped file: `capitallab_backup_YYYYMMDD_HHMMSS.dump`
4. Backup destination configured via `BACKUP_DIR` environment variable

**Usage:**
```bash
# Manual backup
BACKUP_DIR=/backups \
POSTGRES_HOST=localhost \
POSTGRES_PORT=5432 \
POSTGRES_DB=capitallab \
POSTGRES_USER=capitallab \
POSTGRES_PASSWORD=<password> \
/scripts/backup-postgres.sh

# Output: /backups/capitallab_backup_20260613_020000.dump
```

**Recommended backup schedule (must be configured — see Operational Gaps):**
| Backup Type | Frequency | Retention |
|---|---|---|
| Full database dump | Daily at 02:00 UTC | 30 days |
| Weekly archive | Weekly Sunday 02:00 UTC | 12 months |
| Pre-deployment snapshot | Before every production deployment | Until next deployment |

### 4.2 Recovery Procedure

**Script location:** `/scripts/restore-postgres.sh`

**What it does:**
1. Accepts a backup file path as a positional argument
2. Executes `pg_restore --clean` — drops existing objects before restoring, providing a clean slate
3. Restores to the target database specified by environment variables

**Usage:**
```bash
# Full restore
POSTGRES_HOST=localhost \
POSTGRES_PORT=5432 \
POSTGRES_DB=capitallab \
POSTGRES_USER=capitallab \
POSTGRES_PASSWORD=<password> \
/scripts/restore-postgres.sh /backups/capitallab_backup_20260613_020000.dump
```

**Recovery time estimate:** For a typical lab database (1–5 GB), `pg_restore` with `--clean` and `-j 4` (parallel jobs) completes in 2–10 minutes. Test regularly — an untested backup is not a backup.

**Recovery validation checklist:**
- [ ] Row counts match pre-backup snapshot
- [ ] Most recent order/appointment record is present
- [ ] Application starts and passes `/health/ready` check
- [ ] One patient login verified end-to-end

### 4.3 Backup Gap

Backup scripts exist and are operationally correct. However, no automated scheduling is configured. This is documented as Operational Gap #2.

---

## 5. Background Job Registry

All background jobs are managed by Hangfire with PostgreSQL storage and three priority queues.

| Queue | Priority Level | Purpose |
|---|---|---|
| `critical` | Highest | Time-sensitive operations (notifications, alerts) |
| `default` | Normal | Standard background processing |
| `low` | Lowest | Housekeeping and maintenance tasks |

| Job Name | Schedule | Queue | Description |
|---|---|---|---|
| `CleanupExpiredTokensJob` | Daily at 02:00 UTC | `low` | Removes expired refresh tokens from `AspNetUserTokens`. Prevents unbounded table growth. |
| `InventoryAlertsJob` | Daily at 06:00 UTC | `default` | Scans inventory for items below reorder threshold. Generates alerts for lab managers. |
| `AppointmentReminderJob` | Every 15 minutes | `default` | Sends reminder notifications to patients for upcoming appointments. |
| `NotificationRetryJob` | Every 5 minutes | `critical` | Retries failed notification deliveries (email/SMS). Ensures notification SLA. |

**Infrastructure:**
- Hangfire workers: `ProcessorCount × 2` threads per API instance
- Job storage: PostgreSQL (shared across all API instances in multi-instance deployments)
- Distributed locking: Hangfire handles job deduplication across instances — a job will not run concurrently on two instances
- Dashboard: `/hangfire` — restricted to `SuperAdmin` role in production

**Operational note:** The `AppointmentReminderJob` (every 5 minutes) and `NotificationRetryJob` (every 5 minutes) are the most frequent jobs. Monitor Hangfire dashboard for job failure rates and processing latency after deployment.

---

## 6. Logging and Monitoring Coverage

### 6.1 Logging Stack

| Component | Technology | Output Format | Location |
|---|---|---|---|
| Application logging | Serilog | Structured JSON | Console + `app_logs` volume |
| Request logging | SerilogRequestLogging middleware | Structured JSON | Includes: method, path, status code, elapsed ms, userId |
| Exception logging | GlobalExceptionMiddleware | Structured JSON | All unhandled exceptions with stack trace |
| Audit logging | AuditMiddleware | Structured JSON | User actions: userId, action, resource, timestamp, IP |
| Hangfire job logging | Hangfire built-in | Job execution log | Success/failure per job run with duration |

### 6.2 Log Fields Captured Per Request

```json
{
  "timestamp": "2026-06-13T10:23:45.123Z",
  "level": "Information",
  "message": "HTTP GET /api/v1/patients/123/results responded 200 in 45.2ms",
  "method": "GET",
  "path": "/api/v1/patients/123/results",
  "statusCode": 200,
  "elapsed": 45.2,
  "userId": "user-guid-here",
  "requestId": "request-correlation-id",
  "clientIp": "203.0.113.42"
}
```

### 6.3 Monitoring Coverage Summary

| Area | Tool | Status |
|---|---|---|
| Structured application logs | Serilog JSON | Configured |
| Request tracing | SerilogRequestLogging | Configured |
| Unhandled exception capture | GlobalExceptionMiddleware | Configured |
| User action audit trail | AuditMiddleware | Configured |
| Health endpoint monitoring | ASP.NET HealthChecks | Configured |
| Container health checks | Docker Compose | Configured |
| Background job monitoring | Hangfire Dashboard | Configured |
| APM / distributed tracing | None | **GAP — see Operational Gaps** |
| Log aggregation / search | None | **GAP — see Operational Gaps** |
| Alerting on health failures | None | **GAP — see Operational Gaps** |
| Uptime / external monitoring | None | **GAP — see Operational Gaps** |

---

## 7. Operational Gaps

The following gaps must be addressed before the system is fully ready for production operations.

| # | Gap | Severity | Impact if Unaddressed | Recommended Action |
|---|---|---|---|---|
| 1 | No APM integration (Datadog, New Relic, Application Insights, or equivalent) | High | Incident investigation is limited to log file searches. No distributed trace IDs, no P95/P99 latency tracking, no error rate dashboards. Mean time to resolution (MTTR) for production incidents will be significantly higher. | Integrate OpenTelemetry SDK. Export traces and metrics to a backend (Datadog, Grafana Tempo, or Azure Monitor). Target: before public launch. |
| 2 | Backup automation not configured | High | Database backups exist as scripts but are not scheduled. A production failure without a recent backup could result in permanent data loss for a regulated healthcare system. | Create a cron job on the host or a dedicated backup container that runs `/scripts/backup-postgres.sh` nightly. Test the restore procedure on staging before go-live. |
| 3 | No alerting on health check failures | High | The `/health` endpoint reports degraded or unhealthy state, but no external system is configured to alert the operations team. A silent PostgreSQL failure could go undetected until a user reports an error. | Configure an uptime monitoring service (UptimeRobot, Checkly, or Datadog Synthetics) to poll `/health/ready` every 60 seconds and alert via email/SMS/Slack on failure. |
| 4 | No log aggregation service configured | Medium | Structured JSON logs are written to a volume on the host but cannot be searched, retained long-term, or correlated across multiple instances. Post-incident analysis requires SSH access to the server. | Ship logs to an aggregation service: self-hosted ELK (Elasticsearch + Kibana) or a managed service (Datadog Logs, Papertrail, Logtail). Configure Serilog sink for the chosen destination. |
| 5 | Database migration behavior in production requires explicit verification | Low | `CAPITALLAB_SKIP_MIGRATIONS` controls auto-migration. In `Development` and `Staging` environments, migrations run automatically on startup. In `Production`, the default behavior must be verified and an explicit migration run plan documented to avoid startup failures on first deploy. | Document the exact migration procedure for production deployments. Recommended: run `dotnet ef database update` as a pre-deployment step (not auto-migrate on startup) to allow rollback if migration fails. |

---

## 8. Pre-Launch Checklist

Complete all items and obtain sign-off before routing production traffic to the system.

### 8.1 Environment Configuration

- [ ] `.env.production` file created and populated with all required variables (see `env.production.example`)
- [ ] `POSTGRES_PASSWORD` set to a strong, unique password (minimum 32 characters, random)
- [ ] `REDIS_PASSWORD` set if Redis AUTH is enabled
- [ ] `JWT_ISSUER` and `JWT_AUDIENCE` set to production domain values
- [ ] `ASPNETCORE_ENVIRONMENT` set to `Production`
- [ ] `CAPITALLAB_SKIP_MIGRATIONS` behavior verified and documented for production

### 8.2 Cryptography

- [ ] RSA private key generated (`openssl genrsa -out rsa_private.pem 2048`)
- [ ] RSA public key extracted (`openssl rsa -in rsa_private.pem -pubout -out rsa_public.pem`)
- [ ] RSA key pair injected into environment (not baked into Docker image)
- [ ] RSA key files are not committed to version control (verify `.gitignore`)

### 8.3 Networking and DNS

- [ ] DNS A record created for `app.capitallab.io` → load balancer IP
- [ ] DNS A record created for `portal.capitallab.io` → load balancer IP
- [ ] DNS propagation verified (`dig app.capitallab.io`)
- [ ] SSL/TLS certificates obtained (Let's Encrypt or commercial CA)
- [ ] TLS termination configured on reverse proxy (Nginx / Caddy)
- [ ] HTTP → HTTPS redirect configured (port 80 → 443)
- [ ] HSTS preload submission considered for `capitallab.io`

### 8.4 Database

- [ ] PostgreSQL 16 container started and healthy
- [ ] Initial database migration applied (`dotnet ef database update`)
- [ ] Seed data applied and verified (test accounts, reference data)
- [ ] PostgreSQL connection pooling parameters verified (Min 5, Max 100)
- [ ] PostgreSQL `max_connections` setting reviewed (should exceed pool max × expected instances)
- [ ] `pg_isready` health check confirmed passing

### 8.5 Backup and Recovery

- [ ] Backup cron job scheduled on host: `0 2 * * * /scripts/backup-postgres.sh`
- [ ] Backup destination directory exists and has sufficient disk space
- [ ] First manual backup taken and backup file verified (non-zero size)
- [ ] Full restore tested on staging environment using a backup taken from production
- [ ] Restore duration documented (establishes RTO baseline)

### 8.6 Monitoring and Alerting

- [ ] Uptime monitoring configured for `/health/ready` endpoint
- [ ] Alert recipients configured (email/SMS/Slack for on-call team)
- [ ] Log aggregation service configured and receiving logs from all containers
- [ ] Hangfire dashboard accessible at `/hangfire` (SuperAdmin login verified)
- [ ] APM agent installed and reporting to monitoring backend (if available for launch)

### 8.7 Security

- [ ] All four remaining over-permissive controllers reviewed and role bindings tightened
- [ ] CORS `AllowedOrigins` in `appsettings.Production.json` contains only production domains
- [ ] Hangfire dashboard authentication verified (rejects non-SuperAdmin users)
- [ ] Security headers present on all responses (verify with [securityheaders.com](https://securityheaders.com))
- [ ] Rate limiting tested: 11th login request within 1 minute returns HTTP 429
- [ ] NuGet dependencies audited: `dotnet list package --vulnerable --include-transitive` returns no high-severity findings

### 8.8 Smoke Test

- [ ] Patient registration flow completes end-to-end
- [ ] Patient login returns valid JWT (15-minute expiry verified)
- [ ] Token refresh flow works (new tokens returned, old tokens rejected)
- [ ] Patient can view test results
- [ ] Patient cannot download another patient's PDF report (HTTP 403 confirmed)
- [ ] Doctor login and report review flow verified
- [ ] Lab order creation and status update flow verified
- [ ] Admin dashboard loads and displays data

---

## 9. Operational Runbooks (Summary)

| Scenario | Action |
|---|---|
| API container unhealthy | `docker compose restart capitallab-api` — if persists, check `docker logs capitallab-api` for startup errors |
| Database connection refused | Check `docker compose ps postgres` — if unhealthy, check disk space and PostgreSQL logs |
| Redis unavailable | API operates in degraded mode (no cache). `docker compose restart redis`. Monitor error rate. |
| Background jobs not running | Access `/hangfire` dashboard. Check for recurring failures. Restart API if Hangfire workers are stopped. |
| Disk space warning from health check | Investigate and rotate old log files. Extend volume if needed. Verify backup retention policy is enforcing deletion. |
| Data corruption / accidental delete | Stop write traffic. Take immediate backup. Restore from last known good backup using `/scripts/restore-postgres.sh`. |

---

## 10. Certification Verdict

> **CONDITIONALLY READY**
>
> CapitalLab's core infrastructure is well-constructed and production-grade in its foundational design: Docker Compose orchestration with correct service dependency ordering, health checks on all four services, application-level liveness and readiness probes, backup scripts for point-in-time recovery, a complete background job registry with appropriate scheduling, and structured audit logging throughout the request pipeline.
>
> The system is **not yet fully ready** for production operations in a healthcare context due to five operational gaps: the absence of automated backup scheduling, the absence of alerting on health check failures, the absence of APM/distributed tracing, the absence of centralized log aggregation, and an unverified migration procedure for the production environment. These gaps do not affect application functionality but significantly increase operational risk and mean time to resolution in a production incident scenario.
>
> All five gaps must be addressed and all 30 items in the pre-launch checklist must be signed off before the system is approved for live patient data. Upon completion of these items, this report should be updated to status **READY**.

---

*This document reflects the operational readiness state as of 2026-06-13. Next scheduled review: 2026-12-13.*
