# Changelog

All notable changes to Capital Lab are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [0.1.0-staging] — 2026-06-11

### Added
- **Phase I — Staging & Demo Readiness**
  - `docker-compose.staging.yml` with nginx, postgres, redis, api, web services
  - Nginx reverse proxy configuration with SSL termination, rate limiting, security headers
  - `scripts/deploy-staging.sh` deployment script (`--seed-demo`, `--no-cache`, `--migrate-only`, `--restart-only`)
  - `scripts/setup-ssl-staging.sh` Let's Encrypt SSL setup with auto-renewal instructions
  - `.env.staging.example` with all required environment variables documented
  - `/api/version` endpoint returning version, build date, and environment
  - Admin system health page at `/admin/system-health`
  - Staging deployment checklist (`docs/STAGING_DEPLOYMENT_CHECKLIST.md`)
  - Client demo script (`docs/CLIENT_DEMO_SCRIPT.md`)
  - `CHANGELOG.md`
  - `docs/STAGING_CERTIFICATION_REPORT.md`

- **Phase F — Production Integrations**
  - Notification Center (Email, SMS, WhatsApp, Push, InApp channels)
  - PDF Report Engine using QuestPDF with branding, QR verification codes
  - Public report verification at `/api/public/report-verification/{reportNumber}`
  - Analyzer Integration (CSV, XML, HL7, ASTM import formats)
  - Mobile APIs (`/me`, `/me/notifications`, `/mobile/device`)
  - Firebase Push notification abstraction
  - Audit Center with full DB persistence (`audit.audit_logs`)
  - Branch Operations Dashboard and Owner Executive Center
  - System Settings module
  - OpenTelemetry, enhanced health checks
  - Angular admin components: Notifications, Audit Center, Analyzer Import, System Settings
  - Angular owner component: Executive Center with revenue analytics
  - Patient notification inbox wired to real API
  - EF migration: `PhaseF_NotificationsAnalyzersAuditMobileSettings`

- **Phase E (prior) — Doctor Portal**
  - Full doctor portal: Patient Timeline, Critical Results, Report Review, Follow-ups
  - Doctor-specific layouts and routing

- **Phase D (prior) — Admin & Owner Portals**
  - Admin operations: Inventory, Purchase Orders, Billing, Payments, Insurance
  - Owner analytics: Revenue, Branches, Patients, Tests, Inventory
  - Role-based access control throughout

- **Phase C (prior) — Lab Staff Dashboard**
  - Lab overview, Appointments queue, Sample workflow
  - Barcode scanning, QC management, Result entry
  - Doctor review integration

- **Phase B (prior) — Patient Portal**
  - 6-step appointment booking wizard
  - Results viewer with PDF download and QR verification
  - Health tracker with trend charts
  - Home collection requests, Family members, Payments

- **Phase A (prior) — Foundation**
  - .NET Clean Architecture (Domain → Application → Infrastructure → Contracts → API)
  - CQRS with MediatR, Result<T> pattern
  - PostgreSQL with EF Core, multi-schema design
  - JWT RSA authentication, ASP.NET Identity
  - Angular 20 standalone components, signals, feature stores
  - Complete public website with homepage, services, branches, FAQ

### Fixed
- CORS configuration for Angular dev server on port 3003
- QuestPDF TextSpan return type incompatibility
- Contracts layer dependency isolation (enum copies for zero-dependency Contracts project)

### Changed
- `AuditService` now persists to `audit.audit_logs` table (was fire-and-forget)
- Demo seeder branch names now use realistic Jordanian locations

---

## [Unreleased]

### Planned
- Phase II: Production deployment, custom domain, real payment gateway integration
- Phase III: Mobile app (React Native), offline support
- Phase IV: AI-powered result interpretation assistant
