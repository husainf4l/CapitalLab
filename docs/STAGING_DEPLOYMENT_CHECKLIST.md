# Capital Lab — Staging Deployment Checklist

Version: v0.1.0-staging | Updated: 2026-06-11

---

## 1. Server Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disk | 40 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Docker | 24+ | latest |
| Docker Compose | v2.20+ | latest |

---

## 2. Required Ports

| Port | Service | Notes |
|---|---|---|
| 22 | SSH | Restrict to your IP |
| 80 | Nginx HTTP | ACME challenge + redirect |
| 443 | Nginx HTTPS | Main traffic |

All other ports are internal (Docker network only). Do NOT expose 5432, 6379, or 8080.

---

## 3. Domain / Subdomain Setup

Create DNS A records pointing to your server IP:

```
app.capitallab.demo   A   <SERVER_IP>
api.capitallab.demo   A   <SERVER_IP>
```

Allow 5–30 minutes for DNS propagation. Verify with:
```bash
dig +short app.capitallab.demo
dig +short api.capitallab.demo
```

---

## 4. SSL Requirements

- Let's Encrypt certificates via Certbot
- Both domains must resolve to the server before requesting certificates
- Port 80 must be open for ACME challenge

```bash
# Install certbot (Ubuntu)
sudo apt update && sudo apt install certbot -y

# Run SSL setup
bash scripts/setup-ssl-staging.sh
```

---

## 5. Environment Variables

```bash
# Copy example and fill in all values
cp .env.staging.example .env.staging
nano .env.staging

# Verify no placeholders remain
grep -E 'CHANGE_ME|REPLACE_WITH' .env.staging && echo "FAIL — fix above" || echo "OK"
```

Required secret generation:
```bash
# Generate RSA keys for JWT
cd backend && bash generate-rsa-keys.sh

# Generate encryption key
openssl rand -base64 32
```

---

## 6. Database Migration Steps

Migrations run automatically on first deploy. To run manually:
```bash
./scripts/deploy-staging.sh --migrate-only
```

Validate migrations:
```bash
DB_NAME=capitallab_staging bash scripts/validate-migrations.sh
```

---

## 7. Demo Data Seed Steps

```bash
# Full deploy with demo data
./scripts/deploy-staging.sh --seed-demo

# Seed only (if already deployed)
docker compose -f docker-compose.staging.yml run --rm api \
  dotnet CapitalLab.Api.dll --seed-demo-data
```

Demo accounts (password: `Demo@123456`):
- `owner@capitallab.demo` — Owner dashboard
- `doctor@capitallab.demo` — Doctor portal
- `patient@capitallab.demo` — Patient portal

---

## 8. Verification Commands

After deployment, run all of these:

```bash
# API health
curl -sf https://api.capitallab.demo/health | jq .
curl -sf https://api.capitallab.demo/health/live
curl -sf https://api.capitallab.demo/health/ready | jq .
curl -sf https://api.capitallab.demo/api/version | jq .

# Frontend
curl -sf https://app.capitallab.demo | grep -o '<title>.*</title>'

# Container status
docker compose -f docker-compose.staging.yml ps

# Database
docker compose -f docker-compose.staging.yml exec postgres \
  psql -U capitallab -d capitallab_staging -c "SELECT COUNT(*) FROM organization.branches;"

# Redis
docker compose -f docker-compose.staging.yml exec redis \
  redis-cli -a "$REDIS_PASSWORD" ping
```

---

## 9. Full Deployment Flow

```bash
# 1. Clone repo on server
git clone https://github.com/your-org/capitallab.git /srv/capitallab
cd /srv/capitallab

# 2. Configure environment
cp .env.staging.example .env.staging
# Edit .env.staging with real values

# 3. Setup SSL
bash scripts/setup-ssl-staging.sh

# 4. Deploy with demo data
bash scripts/deploy-staging.sh --seed-demo

# 5. Verify
curl -sf https://api.capitallab.demo/health | jq .
```

---

## 10. Common Issues

| Issue | Fix |
|---|---|
| Port 80/443 blocked | Check firewall: `sudo ufw status` |
| SSL cert fails | Ensure DNS resolves to server IP |
| DB not ready | Wait 30s and retry; check `docker compose logs postgres` |
| API not starting | Check env vars: `docker compose logs api` |
| Migration fails | Run `--migrate-only` to see error details |
| CORS error | Verify `WEB_PUBLIC_URL` in `.env.staging` matches frontend URL |
