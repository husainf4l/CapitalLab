# Capital Lab — Client Handover Package
## Technical and Operational Handover Document · v1.0

**Client:** [CLIENT NAME]
**Handover Date:** [DATE]
**Prepared by:** Capital Lab Implementation Team
**System Version:** v0.1.0-staging

---

## 1. System Overview

Capital Lab is a full-stack laboratory management platform built on:

- **Backend:** .NET 10, Clean Architecture (Domain → Application → Infrastructure → API)
- **Frontend:** Angular 20, standalone components, signal-based state
- **Database:** PostgreSQL 16 (multi-schema design)
- **Cache:** Redis 7
- **Container Orchestration:** Docker Compose
- **Reverse Proxy:** Nginx with SSL

The system is delivered as a set of Docker containers that can run on any Linux server or cloud platform.

---

## 2. Architecture

```
[Internet]
    ↓ HTTPS
[Nginx] ← SSL Termination, Rate Limiting
    ├── app.[domain] → [Angular Frontend Container :80]
    └── api.[domain] → [.NET API Container :8080]
                            ↓
                      [PostgreSQL :5432]
                      [Redis :6379]
                      [File Storage Volume]
```

**Data Flow:**
1. Patient books appointment via Angular frontend
2. Angular calls .NET API (REST, JWT-authenticated)
3. API processes through CQRS handlers (MediatR)
4. Results persisted to PostgreSQL
5. Background jobs via Hangfire (notifications, PDF generation)
6. Files stored in local volume (uploadable to S3 in future)

---

## 3. Environments

| Environment | URL | Purpose |
|---|---|---|
| Staging | https://app.[domain] / https://api.[domain] | Active system |
| Local Development | http://localhost:3003 / http://localhost:5000 | Development only |

**Single environment is used for production** after go-live. Staging and production can be separated if required.

---

## 4. Credentials and Access

### Application Credentials (change immediately after handover)

| Role | Email | Initial Password |
|---|---|---|
| Super Admin | `superadmin@[domain]` | Provided separately |
| Owner | `owner@[domain]` | Provided separately |
| Branch Admin | `branchadmin@[domain]` | Provided separately |

**Action required:** Change all passwords on first login. Do not use demo passwords in production.

### Server Access
- **Server IP:** [SERVER_IP]
- **SSH User:** [USERNAME]
- **SSH Key:** Provided separately (never share via email)
- **Server Provider:** [DigitalOcean / AWS / Zain Cloud / Other]

### Database Access (internal only — not exposed externally)
- **Host:** localhost (on server) or postgres (inside Docker)
- **Database:** capitallab (or as configured in .env)
- **Credentials:** See `.env` file on server at `/srv/capitallab/.env.staging`

---

## 5. Deployment

### Location on Server
All files are at: `/srv/capitallab/`

### Starting and Stopping
```bash
# Start all services
docker compose -f docker-compose.staging.yml up -d

# Stop all services
docker compose -f docker-compose.staging.yml down

# Restart API only
docker compose -f docker-compose.staging.yml restart api

# View logs
docker compose -f docker-compose.staging.yml logs -f api
docker compose -f docker-compose.staging.yml logs -f postgres
```

### Deploying an Update
```bash
cd /srv/capitallab
git pull
./scripts/deploy-staging.sh
```

With demo data re-seed:
```bash
./scripts/deploy-staging.sh --seed-demo
```

### Running Migrations
```bash
./scripts/deploy-staging.sh --migrate-only
```

---

## 6. Environment Configuration

The `.env.staging` file at `/srv/capitallab/.env.staging` contains all secrets.

**Never commit this file to version control.**

Key variables:
```
POSTGRES_PASSWORD — database password
JWT_PRIVATE_KEY_BASE64 — RSA private key for JWT signing
JWT_PUBLIC_KEY_BASE64 — RSA public key for JWT verification
ENCRYPTION_KEY — 32-byte key for field-level encryption
SMTP_PASSWORD — email sending credentials
```

To regenerate JWT keys:
```bash
cd /srv/capitallab/backend && bash generate-rsa-keys.sh
```

---

## 7. Backups

### Database Backup
Automated daily backup script: `/srv/capitallab/scripts/backup-postgres.sh`

**Manual backup:**
```bash
bash /srv/capitallab/scripts/backup-postgres.sh
```

Backups are stored at `/var/backups/capitallab/` with date-stamped filenames.

**Restore from backup:**
```bash
bash /srv/capitallab/scripts/restore-postgres.sh /var/backups/capitallab/capitallab_YYYY-MM-DD.sql
```

### Recommended Backup Schedule
- Daily: Database dump (automated)
- Weekly: Full server snapshot (via cloud provider)
- Monthly: Offsite backup copy (S3 or external drive)

### File Storage Backup
Uploaded files (PDF reports, lab attachments) are stored in the Docker volume `api-uploads`.

To backup:
```bash
docker run --rm -v capitallab-staging_api-uploads:/data -v /var/backups:/backup alpine \
  tar czf /backup/uploads_$(date +%Y%m%d).tar.gz /data
```

---

## 8. Monitoring

### Health Endpoints
```
GET https://api.[domain]/health        → Full system health (PostgreSQL, Redis, disk)
GET https://api.[domain]/health/live   → API alive check (load balancer)
GET https://api.[domain]/health/ready  → Service ready check
GET https://api.[domain]/api/version   → Version and build date
```

### Container Status
```bash
docker compose -f /srv/capitallab/docker-compose.staging.yml ps
```

### Log Monitoring
```bash
# API logs
docker compose logs -f api --tail=100

# All services
docker compose logs -f --tail=50
```

### Disk Space
```bash
df -h   # Check disk usage
docker system df  # Check Docker disk usage
```

**Alert:** If disk usage exceeds 75%, investigate log files and old backup accumulation.

---

## 9. SSL Certificate Renewal

SSL certificates expire after 90 days. Renewal is automatic if the certbot timer is configured.

**Manual renewal:**
```bash
bash /srv/capitallab/scripts/setup-ssl-staging.sh --renew
```

**Check certificate expiry:**
```bash
certbot certificates
```

---

## 10. Database Schema

The database uses multiple schemas for separation of concerns:

| Schema | Content |
|---|---|
| `identity` | Users, roles, user-roles, device tokens |
| `organization` | Branches, staff profiles |
| `people` | Patients, doctors |
| `operations` | Appointments, orders, samples |
| `laboratory` | Lab tests, packages, QC, results, analyzers |
| `billing` | Invoices, payments |
| `insurance` | Claims, providers |
| `inventory` | Items, stock, purchase orders |
| `notifications` | Notifications, templates, logs |
| `audit` | Audit logs |
| `settings` | System settings |

---

## 11. Security Controls

- All API endpoints require JWT authentication (except public endpoints and health checks)
- JWT uses RS256 (asymmetric signing — private key signs, public key verifies)
- Sensitive fields (insurance numbers, national IDs) are encrypted at rest
- HTTPS only — Nginx rejects all HTTP
- Rate limiting: 60 requests/minute general; 10 requests/minute on auth endpoints
- Full audit trail: every create/update/delete logged to `audit.audit_logs`
- Role-based access: 10 roles with granular permissions

---

## 12. Support Contacts

| Contact Type | Name | Email | WhatsApp |
|---|---|---|---|
| Technical Support | Capital Lab Support | support@capitallab.io | +962 [number] |
| Account Manager | [NAME] | [EMAIL] | [NUMBER] |
| Emergency (P1 issues) | Capital Lab On-Call | oncall@capitallab.io | [NUMBER] |

**Support Hours:** Sunday–Thursday, 8AM–6PM Jordan time
**Emergency support:** Available for P1 (system down) issues 24/7

---

## 13. Incident Response

### P1 — System Down
1. Check: `curl -f https://api.[domain]/health/live`
2. Check container status: `docker compose ps`
3. Check logs: `docker compose logs api --tail=50`
4. Restart API: `docker compose restart api`
5. If persists: call emergency contact immediately

### P2 — Performance Degradation
1. Check disk space: `df -h`
2. Check memory: `free -h`
3. Check database connections: `docker compose exec postgres psql -U capitallab -c "SELECT count(*) FROM pg_stat_activity;"`
4. Restart API if memory is excessive: `docker compose restart api`

### P3 — Single Feature Not Working
1. Check API logs for errors
2. Log a support ticket with: screenshot, steps to reproduce, user account, time of issue
3. Capital Lab will respond within 4 hours (Business Support) or 24 hours (Standard)

---

*This document is confidential and intended for the named client only.*
*Capital Lab — Version 0.1.0 — 2026*
