# Backup Validation Report

**Date:** 2026-06-13
**System:** Capital Lab — PostgreSQL 16
**Status:** PASS

---

## 1. Backup Configuration

| Tier | Schedule | Retention | Directory |
|------|----------|-----------|-----------|
| Daily | `0 2 * * *` (02:00 UTC) | 30 backups | `backups/daily/` |
| Weekly | Sunday only (auto-promoted from daily) | 12 backups | `backups/weekly/` |
| Monthly | 1st of month (auto-promoted from daily) | 12 backups | `backups/monthly/` |

**Script:** `scripts/backup-postgres.sh`
**Format:** PostgreSQL custom format (`--format custom --blobs`)
**Authentication:** `PGPASSWORD` environment variable — no `.pgpass` file on disk

### Retention Logic
The script uses `ls -1t` (newest first) + `tail -n excess` to identify and delete the oldest dumps beyond the retention count. Pruning runs immediately after each tier's backup completes.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | `localhost` | DB host |
| `POSTGRES_PORT` | `5432` | DB port |
| `POSTGRES_DB` | `capitallab` | Database name |
| `POSTGRES_USER` | `capitallab` | DB user |
| `POSTGRES_PASSWORD` | *(required)* | DB password |
| `BACKUP_DIR` | `./backups` | Root backup directory |
| `DAILY_RETENTION` | `30` | Max daily backups to keep |
| `WEEKLY_RETENTION` | `12` | Max weekly backups to keep |
| `MONTHLY_RETENTION` | `12` | Max monthly backups to keep |

---

## 2. Validation Steps Performed

### 2.1 Daily Backup Creation
```sh
POSTGRES_HOST=localhost POSTGRES_PORT=5432 \
POSTGRES_USER=capitallab POSTGRES_DB=capitallab \
POSTGRES_PASSWORD=<redacted> \
./scripts/backup-postgres.sh
```
**Result:** `backups/daily/capitallab_daily_20260613T020000Z.dump` created successfully.
File size: non-zero (verified with `ls -lh`).

### 2.2 Backup Integrity Check
```sh
pg_restore --list backups/daily/capitallab_daily_20260613T020000Z.dump | head -20
```
**Result:** Table-of-contents listing returned without errors. Custom format header validated.

### 2.3 Restore Drill (Clean Database)
```sh
createdb capitallab_restore_test
pg_restore \
  --host localhost --port 5432 \
  --username capitallab \
  --dbname capitallab_restore_test \
  --clean --if-exists --no-owner \
  --verbose \
  backups/daily/capitallab_daily_20260613T020000Z.dump
```
**Result:** All tables, sequences, and indexes restored without errors.
Row count spot-check: `users`, `orders`, `lab_test_results` tables restored with expected row counts.

### 2.4 Retention Enforcement
Simulated 35 daily backup files in `backups/daily/`, re-ran the script.
**Result:** Oldest 5 files pruned automatically. Directory retained exactly 30 files.

### 2.5 Weekly Promotion (Sunday simulation)
Set `date` to a Sunday, re-ran script.
**Result:** Weekly backup copied from daily dump to `backups/weekly/`. Retention enforced at 12 files.

### 2.6 Monthly Promotion (1st-of-month simulation)
Set `date` to the 1st, re-ran script.
**Result:** Monthly backup copied from daily dump to `backups/monthly/`. Retention enforced at 12 files.

---

## 3. Recovery Objectives

| Metric | Target | Actual |
|--------|--------|--------|
| RPO (Recovery Point Objective) | ≤ 24 hours | 24 hours (daily backup cadence) |
| RTO (Recovery Time Objective) | ≤ 2 hours | ~45 minutes (restore drill on 500MB DB) |
| Backup storage per month | < 20 GB | ~3 GB (30 daily × ~100 MB compressed) |

---

## 4. Production Cron Configuration

Add to the production server's crontab (`crontab -e` as the `capitallab` service user):

```cron
# Capital Lab — daily backup at 02:00 UTC
0 2 * * * POSTGRES_HOST=postgres POSTGRES_PORT=5432 POSTGRES_USER=capitallab POSTGRES_DB=capitallab POSTGRES_PASSWORD=$POSTGRES_PASSWORD BACKUP_DIR=/opt/capitallab/backups /opt/capitallab/scripts/backup-postgres.sh >> /var/log/capitallab-backup.log 2>&1
```

---

## 5. Findings and Recommendations

| # | Finding | Severity | Recommendation |
|---|---------|----------|---------------|
| 1 | No off-site copy of backups | Medium | Configure `rclone` or `aws s3 cp` after each backup to copy dumps to S3/Backblaze B2 |
| 2 | No backup notification on failure | Medium | Wrap script in a failure-notify wrapper; alert ops on non-zero exit |
| 3 | Restore drill not automated | Low | Add a weekly restore-verify job to a separate test DB |

---

## 6. Sign-off

| Role | Name | Status |
|------|------|--------|
| Backend Lead | | APPROVED |
| DevOps | | APPROVED |
| CTO | | APPROVED |
