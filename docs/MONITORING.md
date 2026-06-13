# Monitoring

Health endpoints:

- `/health/live`: container/process liveness.
- `/health/ready`: database, cache, and dependency readiness.

Recommended alerts:

- API readiness down for 2 minutes.
- PostgreSQL storage above 80%.
- Redis memory above 80%.
- Hangfire failed jobs above threshold.
- 5xx rate above 1% for 5 minutes.
- P95 API latency above launch SLO.

Prometheus and a minimal Grafana dashboard are under `ops/monitoring`.
