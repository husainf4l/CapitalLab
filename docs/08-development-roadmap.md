# Capital Lab — Development Roadmap

## Phase 0 — Foundation (Week 1-2)

### Backend

- [ ] Create solution structure: Domain, Application, Infrastructure, Api, Contracts, Tests
- [ ] Configure EF Core with PostgreSQL, Serilog, FluentValidation, Mapster, MediatR
- [ ] Implement base classes: `BaseEntity`, `AuditableEntity`, `ValueObject`
- [ ] Create all domain entities (no business logic yet)
- [ ] Create all EF Core entity configurations
- [ ] Initial database migration
- [ ] Seed data: roles, permissions, system admin, test categories, sample types
- [ ] Configure Swagger with JWT auth support
- [ ] Configure Redis connection
- [ ] Configure Hangfire with PostgreSQL
- [ ] Configure SignalR hub registration
- [ ] Global exception handler (Problem Details)
- [ ] API versioning

### Frontend

- [ ] Create Angular 20 project with standalone components
- [ ] Configure TailwindCSS + Angular Material
- [ ] Configure NgRx signal stores
- [ ] HTTP client with interceptors (auth + error)
- [ ] App shell: admin layout + portal layout
- [ ] i18n setup (ngx-translate, en/ar JSON files)
- [ ] RTL support scaffold
- [ ] Auth store and login page

---

## Phase 1 — Authentication & User Management (Week 3-4)

### Backend

- [ ] ASP.NET Identity setup with custom `AppUser`
- [ ] JWT service: access token generation (RS256)
- [ ] Refresh token: DB storage, rotation, revocation
- [ ] Login endpoint
- [ ] Refresh endpoint
- [ ] Logout / Logout-all endpoint
- [ ] Forgot/Reset password flow
- [ ] Change password
- [ ] RBAC: `PermissionRequirement`, `PermissionAuthorizationHandler`
- [ ] `ICurrentUserService` with JWT claim extraction
- [ ] User CRUD endpoints
- [ ] Role assignment endpoints
- [ ] Audit middleware (log all mutations)

### Frontend

- [ ] Login component
- [ ] Forgot/Reset password flow
- [ ] Auth store (NgRx): store access token in memory
- [ ] Token refresh interceptor
- [ ] Route guards: `AuthGuard`, `RoleGuard`
- [ ] `hasPermission` and `hasRole` directives
- [ ] User management pages (list, create, edit)
- [ ] Role assignment UI

---

## Phase 2 — Core Organization (Week 5)

### Backend

- [ ] Lab CRUD
- [ ] Branch CRUD
- [ ] Staff assignment to branches
- [ ] Branch-scoped query filters on `IBranchScoped`
- [ ] `TenantMiddleware` (resolve branch from JWT)
- [ ] Doctor profile CRUD
- [ ] Doctor-branch assignment

### Frontend

- [ ] Branch list and detail
- [ ] Branch form
- [ ] Doctor list and form

---

## Phase 3 — Test Catalog (Week 6)

### Backend

- [ ] Test categories CRUD
- [ ] Sample types CRUD
- [ ] Test CRUD with reference ranges
- [ ] Health packages CRUD
- [ ] Package test items
- [ ] Branch-level price overrides

### Frontend

- [ ] Test catalog list with search/filter
- [ ] Test detail with reference ranges
- [ ] Test form (create/edit)
- [ ] Package list and form
- [ ] Category management

---

## Phase 4 — Patient Management (Week 7-8)

### Backend

- [ ] Patient CRUD (encrypted national ID/passport)
- [ ] Auto-generate patient code (P-YYYYNNNNN)
- [ ] Family member linking
- [ ] Emergency contacts CRUD
- [ ] Insurance info CRUD
- [ ] Medical history CRUD
- [ ] Allergies CRUD
- [ ] Patient search (phone, name, code, national ID)

### Frontend

- [ ] Patient search bar (quick lookup at reception)
- [ ] Patient registration wizard (multi-step form)
- [ ] Patient detail page (tabbed: overview, history, appointments, results, billing)
- [ ] Family members management
- [ ] Insurance management
- [ ] Medical history and allergies forms

---

## Phase 5 — Appointment Management (Week 9-10)

### Backend

- [ ] Appointment booking (with test/package selection)
- [ ] Auto-generate appointment number
- [ ] Appointment status transitions
- [ ] Appointment calendar queries
- [ ] Today's appointment list
- [ ] Home collection request + assignment + status flow
- [ ] Appointment cancellation + rescheduling
- [ ] Domain events: `AppointmentBookedEvent` → send confirmation notification

### Frontend

- [ ] Appointment booking wizard (patient → tests → date/time → confirm)
- [ ] Reception daily view (today's appointments list)
- [ ] Appointment calendar (branch view)
- [ ] Home collection map + assignment panel
- [ ] Check-in flow at reception

---

## Phase 6 — Sample Tracking (Week 11)

### Backend

- [ ] Sample registration (auto barcode generation)
- [ ] QR code generation
- [ ] Barcode lookup endpoint
- [ ] Sample status workflow (Registered → Collected → Received → Processing → ...)
- [ ] Chain of custody tracking events
- [ ] Sample rejection flow
- [ ] Bulk receive endpoint
- [ ] SignalR: push `SampleStatusChanged` events

### Frontend

- [ ] Sample worklist (filterable by status)
- [ ] Barcode scanner (camera + external scanner)
- [ ] Sample receive page (scan → confirm → receive)
- [ ] Bulk receive UI
- [ ] Sample tracking timeline component

---

## Phase 7 — Result Management (Week 12-13)

### Backend

- [ ] Result entry (numeric + text + qualitative)
- [ ] Reference range auto-interpretation (Normal/Low/High/Critical)
- [ ] Critical value detection + alert
- [ ] Result review workflow (Tech → Senior → Doctor → Approved → Released)
- [ ] Result notes CRUD
- [ ] Retest request flow
- [ ] Analyzer data import (JSON/CSV parsing)
- [ ] PDF upload for external results
- [ ] Domain events: `ResultReleasedEvent` → trigger notification
- [ ] SignalR: push result status updates

### Frontend

- [ ] Result worklist (technician view)
- [ ] Result entry form with reference range display
- [ ] Abnormal value highlighting
- [ ] Critical value alert modal
- [ ] Doctor review page (pending queue)
- [ ] Approve/release action with confirmation
- [ ] Result history (compare across visits)

---

## Phase 8 — Reports (Week 14)

### Backend

- [ ] Lab report aggregation (collect results for appointment)
- [ ] Auto-generate report number
- [ ] PDF report generation (QuestPDF or FastReport)
  - Header: lab logo, branch info, report number, date
  - Patient info section
  - Test results table with reference ranges and flags
  - Doctor notes section
  - Digital signature block
  - QR code for verification
- [ ] Doctor digital signature flow
- [ ] Report release
- [ ] Public QR verification endpoint
- [ ] Report share token generation

### Frontend

- [ ] Report viewer (HTML-rendered preview)
- [ ] Print functionality
- [ ] PDF download
- [ ] Share link generation
- [ ] Report comparison view (historical results side-by-side)
- [ ] Patient portal: report download + share

---

## Phase 9 — Inventory Management (Week 15)

### Backend

- [ ] Inventory item catalog CRUD
- [ ] Branch stock management
- [ ] Stock transaction recording
- [ ] Expiry tracking
- [ ] Low stock alerts (Hangfire daily job + SignalR push)
- [ ] Purchase order workflow
- [ ] Domain event: `LowStockAlertEvent`

### Frontend

- [ ] Stock overview dashboard
- [ ] Receive stock form (with batch/lot/expiry)
- [ ] Issue stock form
- [ ] Expiry alerts list
- [ ] Purchase orders list + form

---

## Phase 10 — Billing & Payments (Week 16)

### Backend

- [ ] Invoice auto-generation from appointment
- [ ] Tax calculation
- [ ] Insurance coverage calculation
- [ ] Payment recording (multi-method)
- [ ] Invoice PDF generation
- [ ] Refund request + approval workflow
- [ ] Hangfire job: overdue invoice reminders

### Frontend

- [ ] Invoice creation / edit
- [ ] Payment recording form
- [ ] Invoice PDF download
- [ ] Refund request UI
- [ ] Patient portal: payment history

---

## Phase 11 — Notifications (Week 17)

### Backend

- [ ] Notification template engine (variable substitution)
- [ ] Email service (SMTP / SendGrid)
- [ ] SMS service (Twilio)
- [ ] WhatsApp service
- [ ] Event handlers → trigger notifications:
  - Appointment confirmed → patient email + SMS
  - Sample collected → patient SMS
  - Result ready → patient email + SMS + WhatsApp
  - Payment received → patient email
  - Low stock → branch manager email
- [ ] Notification log
- [ ] Hangfire queued sending (retry on failure)

### Frontend

- [ ] Notification bell with unread count
- [ ] Notification panel (slide-out)
- [ ] Notification preferences (patient portal)
- [ ] Notification template management (admin)

---

## Phase 12 — Analytics & Dashboards (Week 18-19)

### Backend

- [ ] Owner dashboard query (revenue, patients, tests by lab/branch)
- [ ] Branch manager dashboard (operational metrics)
- [ ] Doctor dashboard (pending reviews, critical count)
- [ ] Revenue analytics (daily/monthly/yearly, by branch, by test category)
- [ ] Patient analytics (new vs returning, demographics)
- [ ] Test analytics (volume, TAT by test)
- [ ] Staff performance metrics
- [ ] Hangfire job: refresh analytics materialized views

### Frontend

- [ ] Owner dashboard (revenue chart, branch KPI cards, top tests)
- [ ] Branch manager dashboard (today's ops, pending items)
- [ ] Doctor dashboard (review queue, critical alerts)
- [ ] Revenue analytics page (interactive date-range charts)
- [ ] Patient analytics page
- [ ] Branch comparison page

---

## Phase 13 — Patient Portal (Week 20)

### Frontend

- [ ] Patient portal layout (different from staff layout)
- [ ] Patient dashboard (upcoming appointments, latest result, pending bills)
- [ ] Appointment booking (self-service)
- [ ] Results view (only released results)
- [ ] Reports: download, print, share
- [ ] Historical result comparison charts
- [ ] Family profile management
- [ ] Payment history
- [ ] Profile management
- [ ] Arabic/English language toggle with full RTL support

---

## Phase 14 — Security Hardening (Week 21)

- [ ] Rate limiting (per-IP, per-user tiers)
- [ ] Field-level encryption verification (national ID, passport, policy numbers)
- [ ] CORS policy lock-down
- [ ] Security headers (HSTS, X-Frame-Options, CSP)
- [ ] Penetration testing preparation (OWASP Top 10 review)
- [ ] Secure file access (signed URLs for report PDFs)
- [ ] Audit log completeness review
- [ ] SQL injection prevention review (EF Core parameterization audit)

---

## Phase 15 — Testing & QA (Week 22-23)

### Backend Tests

- [ ] Unit tests: domain entity business rules
- [ ] Unit tests: CQRS handlers
- [ ] Unit tests: validators (FluentValidation)
- [ ] Integration tests: API endpoints (WebApplicationFactory)
- [ ] Integration tests: EF Core queries
- [ ] Architecture tests: enforce Clean Architecture layer rules (NetArchTest)

### Frontend Tests

- [ ] Unit tests: services, stores (Jest)
- [ ] Component tests (Angular Testing Library)
- [ ] E2E: critical paths — login, book appointment, enter result, release report (Playwright)

---

## Phase 16 — Deployment & DevOps (Week 24)

- [ ] Dockerfiles: backend (multi-stage), Angular SSR
- [ ] Docker Compose: api + postgres + redis + hangfire dashboard
- [ ] GitHub Actions CI/CD:
  - Build + test on PR
  - Staging deploy on merge to main
  - Production deploy on release tag
- [ ] Environment variable management (secrets)
- [ ] Database migration runner in startup
- [ ] Health check endpoints (`/health/live`, `/health/ready`)
- [ ] Nginx reverse proxy config
- [ ] Serilog → structured JSON logs → ELK or Seq
- [ ] Application monitoring (uptime + error tracking)

---

## Milestone Summary

| Phase | Milestone | Target Week |
|-------|-----------|-------------|
| 0 | Project scaffolding complete | 2 |
| 1 | Auth & users working end-to-end | 4 |
| 2 | Organization management | 5 |
| 3 | Test catalog live | 6 |
| 4 | Patient registration working | 8 |
| 5 | Appointments + home collection | 10 |
| 6 | Sample tracking with barcodes | 11 |
| 7 | Result entry + review workflow | 13 |
| 8 | PDF reports with QR verification | 14 |
| 9 | Inventory management | 15 |
| 10 | Billing & payments | 16 |
| 11 | All notifications live | 17 |
| 12 | Analytics dashboards | 19 |
| 13 | Patient portal complete | 20 |
| 14 | Security hardened | 21 |
| 15 | Test coverage ≥ 80% | 23 |
| 16 | Production deployment | 24 |

**Total estimated timeline: 24 weeks (6 months)**
