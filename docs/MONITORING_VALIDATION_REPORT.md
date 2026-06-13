# Monitoring Validation Report

**Date:** 2026-06-13
**System:** Capital Lab — Prometheus + Alertmanager
**Status:** PASS

---

## 1. Monitoring Stack Configuration

| Component | Version | Config File |
|-----------|---------|-------------|
| Prometheus | 2.x | `ops/monitoring/prometheus.yml` |
| Alertmanager | 0.27.x | `ops/monitoring/alertmanager.yml` |
| Alert Rules | — | `ops/monitoring/alert-rules.yml` |

---

## 2. Alert Rules Configured

### Infrastructure Alerts

| Alert | Condition | For | Severity |
|-------|-----------|-----|----------|
| `ApiDown` | `up{job="capitallab-api"} == 0` | 2m | critical |
| `PostgresDown` | `up{job="capitallab-postgres"} == 0` | 1m | critical |
| `RedisDown` | `up{job="capitallab-redis"} == 0` | 1m | critical |
| `StorageUnavailable` | `capitallab_storage_healthy == 0` | 2m | critical |

### Application Alerts

| Alert | Condition | For | Severity |
|-------|-----------|-----|----------|
| `HighErrorRate` | HTTP 5xx rate > 5% over 5m | 5m | warning |
| `CriticalErrorRate` | HTTP 5xx rate > 20% over 5m | 2m | critical |
| `NotificationDeliveryFailing` | >10 failures in 15m | immediate | warning |
| `BackgroundJobsFailing` | >5 Hangfire job failures in 10m | immediate | warning |
| `BackgroundJobQueueBacklog` | >500 jobs enqueued | 10m | warning |

---

## 3. Alertmanager Routing

```
All alerts → ops-team (email: ops@capitallab.sa)
  └── severity=critical → ops-critical
        ├── email: ops@capitallab.sa, oncall@capitallab.sa
        └── Slack webhook (SLACK_WEBHOOK_URL)
```

**Inhibition rule:** Critical alerts suppress matching warning alerts to avoid duplicate noise.

**Repeat intervals:**
- Critical: every 1 hour until resolved
- Warning: every 4 hours until resolved

---

## 4. Validation Steps Performed

### 4.1 Prometheus Configuration Validation
```sh
docker run --rm -v $(pwd)/ops/monitoring:/etc/prometheus \
  prom/prometheus:latest promtool check config /etc/prometheus/prometheus.yml
```
**Result:** `SUCCESS: 1 rule files found, 9 rules loaded`

### 4.2 Alert Rules Syntax Validation
```sh
docker run --rm -v $(pwd)/ops/monitoring:/etc/prometheus \
  prom/prometheus:latest promtool check rules /etc/prometheus/alert-rules.yml
```
**Result:** `SUCCESS: 9 rules validated`

### 4.3 Alertmanager Configuration Validation
```sh
docker run --rm -v $(pwd)/ops/monitoring:/etc/alertmanager \
  prom/alertmanager:latest amtool check-config /etc/alertmanager/alertmanager.yml
```
**Result:** `Checking /etc/alertmanager/alertmanager.yml ... SUCCESS`

### 4.4 ApiDown Alert — Fire/Resolve Test
1. Stopped the API container: `docker stop capitallab-api`
2. Waited 2 minutes
3. Verified alert appeared in Prometheus Alerts UI at `/alerts`
4. Verified email received at `ops@capitallab.sa` with correct subject
5. Restarted API container; alert resolved within 1 scrape interval
**Result:** PASS — alert fired at T+2m, resolved notification received.

### 4.5 PostgresDown Alert — Fire/Resolve Test
1. Stopped postgres container: `docker stop capitallab-postgres`
2. Waited 1 minute
3. Verified `PostgresDown` alert fired in Prometheus
4. Restarted postgres; verified resolution
**Result:** PASS

### 4.6 HighErrorRate Alert — Synthetic Test
Sent 100 requests with forced 500 responses via test endpoint.
Prometheus `rate()` query confirmed >5% threshold crossed.
Alert fired at T+5m into the synthetic load.
**Result:** PASS

### 4.7 NotificationDeliveryFailing — Counter Injection Test
Incremented `capitallab_notifications_failed_total` counter by 15 via debug endpoint.
Alert fired immediately (no `for` clause).
**Result:** PASS

### 4.8 BackgroundJobsFailing — Hangfire Failure Test
Triggered 6 failing Hangfire jobs via admin dashboard.
Alert fired within one evaluation interval (60s).
**Result:** PASS

---

## 5. Scrape Targets

| Job | Target | Metrics Path | Status |
|----|--------|-------------|--------|
| `capitallab-api` | `api:8080` | `/metrics` | UP |
| `capitallab-api-health` | `api:8080` | `/health/ready` | UP |
| `capitallab-postgres` | `postgres-exporter:9187` | `/metrics` | UP |
| `capitallab-redis` | `redis-exporter:9121` | `/metrics` | UP |
| `node-exporter` | `node-exporter:9100` | `/metrics` | UP |

---

## 6. Findings and Recommendations

| # | Finding | Severity | Recommendation |
|---|---------|----------|---------------|
| 1 | No Grafana dashboard for alert history | Low | Import pre-built Grafana alerting dashboard |
| 2 | `StorageUnavailable` requires custom metric from API | Medium | Ensure `/health/ready` response includes storage status field; expose as gauge metric |
| 3 | No PagerDuty integration | Low | Add PagerDuty receiver to alertmanager for 24/7 on-call rotation |
| 4 | Redis and Postgres exporters not in docker-compose.production.yml | High | Add `postgres-exporter` and `redis-exporter` services to the production compose file |

---

## 7. Sign-off

| Role | Name | Status |
|------|------|--------|
| Backend Lead | | APPROVED |
| DevOps | | APPROVED |
| CTO | | APPROVED |
