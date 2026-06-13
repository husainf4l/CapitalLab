# Backup Strategy

Baseline:

- Nightly PostgreSQL custom-format dumps.
- Hourly WAL archiving or provider-managed point-in-time recovery.
- Daily upload/storage snapshot.
- Seven daily, four weekly, and twelve monthly retained backups.

Commands:

```sh
POSTGRES_PASSWORD=... scripts/backup-postgres.sh
POSTGRES_PASSWORD=... scripts/restore-postgres.sh backups/capitallab_YYYYMMDD.dump
```

Production readiness requires a restore drill into a clean database and a signed-off RPO/RTO.
