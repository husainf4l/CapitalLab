# Capital Lab — CRM Transformation Report
**Date:** 2026-06-13  
**Transformation:** Laboratory Information System → Patient CRM & Engagement Platform  
**Audited:** Full frontend + backend + database + navigation

---

## Executive Summary

Capital Lab is being repositioned from a self-contained Laboratory Information System (LIS) into a **Patient CRM & Engagement Platform** that sits in front of an existing laboratory ERP/LIS/HIS. The external system remains the operational source of truth. Capital Lab becomes the customer-facing experience layer.

**Scale of change:**
- 15 frontend screens → KEEP (patient portal, public website, CMS)
- 18 frontend screens → HIDE (lab ops, billing, insurance, inventory)
- 8 frontend screens → MODIFY (admin, owner, auth)
- 34 backend controllers → 18 KEEP, 8 MODIFY, 8 HIDE
- 51 domain entities → 31 KEEP, 12 HIDE, 8 REMOVE
- Authentication → full replacement (email/password → phone OTP + Google)

---

## Classification Legend

| Status | Meaning |
|---|---|
| ✅ KEEP | Core to CRM product. Keep as-is. |
| 🔧 MODIFY | Valuable but requires changes for CRM positioning. |
| 🔒 HIDE | Functional but not part of standard CRM product. Available for enterprise/self-hosted deployments via feature flag. |
| ❌ REMOVE | Not relevant to CRM. Remove from codebase. |

---

## 1. Frontend Modules

### 1.1 Patient Portal

| Screen | Route | Status | Action |
|---|---|---|---|
| Dashboard | /patient/dashboard | ✅ KEEP | Core CRM screen |
| Book Appointment | /patient/book | ✅ KEEP | Core CRM flow |
| My Results | /patient/results | ✅ KEEP | Core CRM screen |
| Health Tracker | /patient/health-tracker | ✅ KEEP | Engagement feature |
| Appointments | /patient/appointments | ✅ KEEP | Core CRM screen |
| Home Collection | /patient/home-collection | ✅ KEEP | Core CRM feature |
| Family Members | /patient/family-members | ✅ KEEP | Family management CRM |
| Notifications | /patient/notifications | ✅ KEEP | Core engagement |
| Profile | /patient/profile | ✅ KEEP | Core CRM |
| Payments | /patient/payments | 🔧 MODIFY | Read-only from external system — remove create/pay actions |

**Patient portal navigation changes:**
- Add Loyalty/Rewards item (when loyalty module is built)
- Add Campaigns/Promotions item
- Change auth entry point from email/password to phone OTP

---

### 1.2 Public Website

| Screen | Route | Status | Action |
|---|---|---|---|
| Home | / | ✅ KEEP | CRM marketing |
| Tests Catalog | /tests | ✅ KEEP | CRM product catalog |
| Packages | /packages | ✅ KEEP | CRM product catalog |
| Branches | /branches | ✅ KEEP | Patient-facing |
| About | /about | ✅ KEEP | |
| FAQ | /faq | ✅ KEEP | |
| News / Blog | /news, /blog | ✅ KEEP | Content engagement |
| Events | /events | ✅ KEEP | Content engagement |
| Article detail | /article/:slug | ✅ KEEP | |
| Event detail | /events/:slug | ✅ KEEP | |
| Author pages | /author/:slug | ✅ KEEP | |
| Category pages | /category/:slug | ✅ KEEP | |

---

### 1.3 Authentication

| Screen | Route | Status | Action |
|---|---|---|---|
| Login (email/password) | /login | ❌ REMOVE | Replace with phone OTP + Google |
| Register (email) | /register | ❌ REMOVE | Replace with phone OTP flow |
| Forgot Password | /forgot-password | ❌ REMOVE | Not needed with OTP |
| Reset Password | /reset-password | ❌ REMOVE | Not needed with OTP |
| Phone OTP Login | /login | ✅ NEW | New screen — phone number → OTP |
| Phone OTP Register | /register | ✅ NEW | New screen — phone + OTP → profile |
| Google Sign-In | (inline) | ✅ NEW | OAuth 2.0 redirect flow |

---

### 1.4 Admin Portal

| Screen | Route | Status | Action |
|---|---|---|---|
| Overview (Command Center) | /admin/overview | 🔧 MODIFY | Replace lab KPIs with CRM KPIs: total patients, active bookings, messages sent, content views |
| Notifications | /admin/notifications | ✅ KEEP | Core CRM — campaigns + alerts |
| Content — Posts | /admin/content/posts | ✅ KEEP | CRM content |
| Content — Categories | /admin/content/categories | ✅ KEEP | |
| Content — Authors | /admin/content/authors | ✅ KEEP | |
| Content — Tags | /admin/content/tags | ✅ KEEP | |
| Content — Events | /admin/content/events | ✅ KEEP | |
| Content — FAQ | /admin/content/faq | ✅ KEEP | |
| Content — Newsletter | /admin/content/newsletter | ✅ KEEP | CRM mailing list |
| Content — Analytics | /admin/content/analytics | ✅ KEEP | |
| Settings | /admin/settings | ✅ KEEP | |
| Audit Center | /admin/audit | ✅ KEEP | |
| System Health | /admin/system-health | ✅ KEEP | |
| Inventory | /admin/inventory | 🔒 HIDE | Enterprise-only flag |
| Purchase Orders | /admin/purchase-orders | 🔒 HIDE | Enterprise-only flag |
| Billing | /admin/billing | 🔒 HIDE | Enterprise-only flag |
| Payments | /admin/payments | 🔒 HIDE | Enterprise-only flag |
| Insurance | /admin/insurance | 🔒 HIDE | Enterprise-only flag |
| Analyzers | /admin/analyzers | 🔒 HIDE | Enterprise-only flag |

**Admin navigation to add:**
- CRM Analytics (patient segments, engagement scores)
- Campaign Manager
- Patient Management (search, view, export)
- Family Invitations queue

---

### 1.5 Owner Portal

| Screen | Route | Status | Action |
|---|---|---|---|
| Overview | /owner/overview | 🔧 MODIFY | Replace lab ops KPIs with CRM KPIs: total active patients, bookings, engagement, satisfaction |
| Patients Analytics | /owner/patients | ✅ KEEP | Core CRM analytics |
| Branches | /owner/branches | ✅ KEEP | Multi-branch CRM |
| Tests Analytics | /owner/tests | ✅ KEEP | Service catalog analytics |
| Executive Report | /owner/executive | 🔧 MODIFY | CRM executive metrics, remove lab ops |
| Revenue | /owner/revenue | 🔒 HIDE | Read from external system |
| Inventory | /owner/inventory | 🔒 HIDE | Enterprise-only flag |
| Insurance | /owner/insurance | 🔒 HIDE | Enterprise-only flag |

---

### 1.6 Lab Staff Portal

| Screen | Route | Status | Action |
|---|---|---|---|
| Overview | /lab/overview | 🔒 HIDE | Enterprise-only flag |
| Appointments | /lab/appointments | 🔒 HIDE | Enterprise-only flag |
| Test Orders | /lab/orders | 🔒 HIDE | Enterprise-only flag |
| Samples | /lab/samples | 🔒 HIDE | Enterprise-only flag |
| Barcode Scanning | /lab/barcode | 🔒 HIDE | Enterprise-only flag |
| Quality Control | /lab/qc | 🔒 HIDE | Enterprise-only flag |
| Results Entry | /lab/results-entry | 🔒 HIDE | Enterprise-only flag |

---

### 1.7 Doctor Portal

| Screen | Route | Status | Action |
|---|---|---|---|
| Dashboard | /doctor/dashboard | 🔧 MODIFY | Shift from internal review workflow to patient consultation view |
| Patient Search | /doctor/patient-search | ✅ KEEP | CRM — doctor to patient access |
| Patient Timeline | /doctor/patient-timeline | ✅ KEEP | CRM — longitudinal patient view |
| Follow-ups | /doctor/follow-ups | ✅ KEEP | CRM engagement |
| Notes | /doctor/notes | ✅ KEEP | CRM communication record |
| Reports (view) | /doctor/reports | ✅ KEEP | CRM — read-only from LIS |
| Analytics | /doctor/analytics | 🔧 MODIFY | CRM-focused: patient load, follow-up rate |
| Critical Results | /doctor/critical-results | 🔒 HIDE | Enterprise-only (LIS workflow) |
| Reviews | /doctor/reviews | 🔒 HIDE | Enterprise-only (LIS workflow) |

---

### 1.8 Branch Portal

| Screen | Route | Status | Action |
|---|---|---|---|
| Overview | /branch/overview | 🔧 MODIFY | Replace lab ops with CRM KPIs: today's bookings, patient arrivals, engagement |
| Appointments | /branch/appointments | ✅ KEEP | CRM — branch appointment management |
| Reports | /branch/reports | ✅ KEEP | CRM — result release view |
| Samples | /branch/samples | 🔒 HIDE | Enterprise-only flag |
| Inventory | /branch/inventory | 🔒 HIDE | Enterprise-only flag |
| Billing | /branch/billing | 🔒 HIDE | Enterprise-only flag |
| Insurance | /branch/insurance | 🔒 HIDE | Enterprise-only flag |

---

## 2. Backend Controllers

| Controller | Route | Status | Action |
|---|---|---|---|
| AuthController | /auth | 🔧 MODIFY | Add phone OTP + Google OAuth. Keep refresh token. Remove email/password register + forgot password. Keep email login only for admin/staff (not patients). |
| PatientsController | /patients | ✅ KEEP | Core CRM |
| AppointmentsController | /appointments | ✅ KEEP | Core CRM |
| HomeCollectionsController | /home-collections | ✅ KEEP | Core CRM |
| TestOrdersController | /test-orders | 🔧 MODIFY | Keep /my endpoint for patients. Hide internal lab ops endpoints. |
| ResultsController | /results | ✅ KEEP | Read from cache/sync |
| ReportsController | /reports | ✅ KEEP | PDF download, patient access |
| DoctorsController | /doctors | ✅ KEEP | Catalog, patient-facing |
| BranchesController | /branches | ✅ KEEP | Patient-facing |
| NotificationsController | /notifications | ✅ KEEP | Core CRM |
| ContentController | /content | ✅ KEEP | Patient-facing public content |
| ContentAdminController | /content/admin | ✅ KEEP | CMS management |
| LabTestsController | /lab-tests | ✅ KEEP | Service catalog |
| TestCategoriesController | /test-categories | ✅ KEEP | Service catalog |
| PackagesController | /packages | ✅ KEEP | Service catalog |
| MobileController | /mobile | ✅ KEEP | Push notification device tokens |
| MeController | /me | ✅ KEEP | Current user profile |
| PublicController | /public | ✅ KEEP | Report verification |
| HealthController | /health | ✅ KEEP | Infrastructure |
| AuditController | /audit | ✅ KEEP | Operational audit |
| SettingsController | /settings | ✅ KEEP | System configuration |
| SystemController | /system | ✅ KEEP | Health monitoring |
| StaffController | /staff | 🔧 MODIFY | Keep for CRM staff roles. Remove lab-tech role management. |
| ExecutiveController | /executive | 🔧 MODIFY | Replace lab KPIs with CRM executive metrics |
| BranchOperationsController | /branch-operations | 🔧 MODIFY | CRM-focused branch KPIs |
| OwnerAnalyticsController | /analytics/owner | 🔧 MODIFY | Keep patients/branches/tests analytics. Hide inventory/insurance. |
| SamplesController | /samples | 🔒 HIDE | Enterprise-only flag |
| ReviewsController | /reviews | 🔒 HIDE | Enterprise-only flag |
| CriticalResultsController | /critical-results | 🔒 HIDE | Enterprise-only flag |
| InventoryController | /inventory, /purchase-orders | 🔒 HIDE | Enterprise-only flag |
| InsuranceController | /insurance | 🔒 HIDE | Enterprise-only flag |
| InvoicesController | /invoices, /payments | 🔒 HIDE | Enterprise-only. Exception: GET /patients/{id}/payments remains accessible to Patient role (read-only from external). |
| AnalyzersController | /analyzers | 🔒 HIDE | Enterprise-only flag |

---

## 3. Application Feature Layer (CQRS / MediatR)

| Feature Module | Status | Action |
|---|---|---|
| Auth | 🔧 MODIFY | Add PhoneOtpLoginCommand, GoogleLoginCommand. Remove ForgotPasswordCommand, ResetPasswordCommand. Keep RefreshTokenCommand. |
| Patients | ✅ KEEP | Add LinkExternalPatientIdCommand |
| Appointments | ✅ KEEP | |
| HomeCollections | ✅ KEEP | |
| Results | ✅ KEEP | |
| Reports | ✅ KEEP | |
| Notifications | ✅ KEEP | |
| Mobile | ✅ KEEP | |
| Content | ✅ KEEP | |
| Branches | ✅ KEEP | |
| Doctors | ✅ KEEP | |
| LabTests | ✅ KEEP | |
| TestCategories | ✅ KEEP | |
| Packages | ✅ KEEP | |
| TestOrders | 🔧 MODIFY | Keep patient-facing queries. Mark internal ops as enterprise. |
| Dashboard | 🔧 MODIFY | Patient, Doctor, Branch dashboards KEEP. Lab, Admin Command Center MODIFY for CRM KPIs. |
| PatientHistory | ✅ KEEP | |
| Analytics | 🔧 MODIFY | Keep patients/engagement analytics. Hide billing/inventory analytics. |
| Audit | ✅ KEEP | |
| Settings | ✅ KEEP | |
| Staff | 🔧 MODIFY | Scope to CRM roles |
| Samples | 🔒 HIDE | Enterprise-only |
| DoctorReviews | 🔒 HIDE | Enterprise-only |
| CriticalResults | 🔒 HIDE | Enterprise-only |
| Billing | 🔒 HIDE | Enterprise-only |
| Insurance | 🔒 HIDE | Enterprise-only |
| Inventory | 🔒 HIDE | Enterprise-only |
| Analyzers | 🔒 HIDE | Enterprise-only |

---

## 4. Database / Domain Entities

### 4.1 Entities to KEEP (CRM core)

| Entity | Reason |
|---|---|
| Patient | Core CRM entity |
| PatientFamilyMember | Family management |
| Branch | Multi-branch CRM |
| Doctor | Patient-facing catalog |
| StaffProfile | CRM staff roles |
| Appointment | Core booking |
| AppointmentItem | Booking line items |
| AppointmentStatusHistory | Status audit |
| HomeCollectionRequest | Patient service |
| TestOrder | Patient-facing order |
| TestOrderItem | Order items |
| TestResult | Patient result access |
| TestResultHistory | Trend tracking |
| Report | PDF report access |
| ReportItem | Report line items |
| TestCategory | Service catalog |
| LabTest | Service catalog |
| HealthPackage | CRM upsell/bundles |
| PackageTest | Package composition |
| Notification | Core CRM comms |
| NotificationTemplate | Campaign templates |
| NotificationLog | Comms audit |
| DeviceToken | Push notifications |
| AuditLog | Operations audit |
| SystemSetting | Configuration |
| ContentPost | CMS content |
| ContentCategory | CMS structure |
| ContentAuthor | CMS authors |
| ContentTag | CMS tagging |
| ContentPostTag | Many-to-many |
| ContentEvent | Events engagement |
| ContentFaqItem | FAQ |
| ContentNewsletterSubscriber | CRM mailing |

### 4.2 Entities to HIDE (enterprise-only; kept in DB but feature-flagged)

| Entity | Reason |
|---|---|
| Sample | Internal LIS ops |
| SampleItem | Internal LIS ops |
| QualityControlRecord | Internal LIS ops |
| DoctorReview | Internal LIS workflow |
| CriticalResultAlert | Internal LIS workflow |
| CriticalResultRule | Internal LIS workflow |
| Invoice | Financial ops — external system |
| InvoiceItem | Financial ops — external system |
| Payment | Financial ops — external system |
| InsuranceProvider | Financial ops |
| InsuranceClaim | Financial ops |
| Analyzer | Lab equipment |
| AnalyzerImport | Lab equipment |
| AnalyzerResult | Lab equipment |

### 4.3 Entities to add for CRM

| New Entity | Purpose |
|---|---|
| ExternalPatientLink | Maps Capital Lab Patient → external LIS patient ID |
| PhoneOtpRequest | OTP verification codes + expiry |
| OAuthAccount | Google / Apple linked account (provider, providerUserId) |
| LoyaltyProfile | Points, tier, total visits (future) |
| PatientEngagementScore | Visit frequency, communication opens, referrals |
| Campaign | Broadcast notifications + segmentation rules |
| CampaignRecipient | Per-patient campaign delivery tracking |
| DataSyncLog | External system sync audit (what was synced, when, result) |

---

## 5. Authentication Changes

### Remove
| Item | Reason |
|---|---|
| Email/password login for patients | Replaced by phone OTP |
| Patient registration with email | Replaced by phone OTP flow |
| Forgot password endpoint | Not applicable to OTP |
| Reset password endpoint | Not applicable to OTP |
| Email verification | Not applicable to OTP |

### Keep
| Item | Reason |
|---|---|
| Email/password login for staff/admin | Internal staff need password-based login |
| Refresh token mechanism | Works for all auth methods |
| JWT token issuance | No change |
| Role-based claims | No change |

### Add
| Item | Notes |
|---|---|
| POST /auth/otp/request | Accepts phone number, sends OTP via SMS/WhatsApp |
| POST /auth/otp/verify | Verifies OTP code, returns JWT + refresh token |
| POST /auth/google | Accepts Google ID token, returns JWT |
| POST /auth/apple | Accepts Apple identity token (future) |
| Patient identity on AppUser | Add PhoneNumber as required field, make Email optional |
| ExternalPatientId on Patient | Enables sync from external LIS |

### Infrastructure needed
| Item | Provider options |
|---|---|
| SMS OTP delivery | Twilio / AWS SNS / local SMS gateway |
| WhatsApp OTP | Twilio WhatsApp / Meta Business API |
| Google OAuth 2.0 | Google Identity Services |
| OTP expiry | 5-minute expiry, max 3 attempts, 10-minute cooldown |

---

## 6. Navigation Changes

### Patient Portal Navigation
| Before | After |
|---|---|
| Dashboard, Book, Results, Health Tracker, Appointments, Home Collection, Family, Payments, Notifications, Profile | Same + Loyalty (when ready) |
| Login/Register with email | Phone OTP + Google |
| Payments (CUD operations) | Payments (read-only, from external system) |

### Admin Portal Navigation
| Before | After |
|---|---|
| Overview (lab ops) | Overview (CRM analytics: patients, bookings, campaigns, content) |
| Inventory | ❌ Hidden |
| Purchase Orders | ❌ Hidden |
| Billing | ❌ Hidden |
| Payments | ❌ Hidden |
| Insurance | ❌ Hidden |
| Analyzers | ❌ Hidden |
| Notifications | ✅ Keep |
| Audit, Settings, Health | ✅ Keep |
| Content CMS (all) | ✅ Keep |
| — | ✅ Add: Patients (CRM management) |
| — | ✅ Add: Campaigns |
| — | ✅ Add: CRM Analytics |

### Owner Portal Navigation
| Before | After |
|---|---|
| Overview (lab KPIs) | Overview (CRM KPIs: active patients, bookings, engagement) |
| Revenue | 🔒 Hidden (or read-only from external) |
| Inventory | ❌ Hidden |
| Insurance | ❌ Hidden |
| Patients, Branches, Tests, Executive | ✅ Keep (CRM-focused) |

### Lab Portal Navigation
| Before | After |
|---|---|
| All items | 🔒 Hidden behind enterprise feature flag |

### Doctor Portal Navigation
| Before | After |
|---|---|
| Dashboard, Patient Search, Timeline, Follow-ups, Notes, Reports | ✅ Keep |
| Critical Results, Reviews | 🔒 Hidden (enterprise LIS workflow) |

---

## 7. Integration Architecture

Capital Lab CRM switches from **data owner** to **data consumer** for operational data.

```
External LIS / HIS / ERP
        ↓
  Integration API (new)
        ↓
  Data Sync Service
    ├── Patients
    ├── Appointments
    ├── Results & Reports
    ├── Doctors
    └── Branches
        ↓
  Capital Lab CRM Database (cache layer)
        ↓
  Patient Portal / APIs
```

### Sync Strategy

| Data Type | Direction | Frequency | Strategy |
|---|---|---|---|
| Patient records | External → CRM | Real-time webhook + daily full sync | Match on phone number or external ID |
| Appointments | External → CRM | Real-time webhook | Webhook from LIS on status change |
| Test results | External → CRM | Webhook on result ready | Cache only; no mutation from CRM |
| Reports (PDF) | External → CRM | On demand / signed URL | Proxy via CRM or direct signed URL |
| Doctors catalog | External → CRM | Daily sync | Reference data |
| Branches catalog | External → CRM | On change | Reference data |
| Test catalog | External → CRM | On change | LabTests, TestCategories |

### New API endpoints needed

| Endpoint | Purpose |
|---|---|
| POST /integrations/patients/sync | Bulk patient sync from external system |
| POST /integrations/appointments/webhook | Receive appointment status updates |
| POST /integrations/results/webhook | Receive result-ready events |
| POST /integrations/reports/webhook | Receive report-ready events |
| GET /integrations/sync-status | Check last sync timestamps |
| POST /patients/{id}/link-external | Link patient to external LIS ID |

---

## 8. Dashboard Changes

### Patient Dashboard
| Current | New |
|---|---|
| 4 KPIs: Total Tests, Pending Results, Upcoming Appts, Active Family Members | Same — CRM-appropriate |
| Health tracker (real data) | ✅ Keep |
| Recent results | ✅ Keep — sourced from sync |
| Upcoming appointments | ✅ Keep — sourced from sync |

### Admin Dashboard (Command Center)
| Current | New |
|---|---|
| 9 sections including lab ops, branch monitor, inventory alerts | Redesign: CRM sections only |
| Lab queue alerts | Remove |
| Inventory status | Remove |
| QC queue | Remove |
| Branch performance (revenue) | Modify: booking volume, patient satisfaction |
| New sections to add | Campaign performance, notification delivery rates, content engagement |

### Owner Dashboard
| Current | New |
|---|---|
| Revenue chart | Sourced from external system or hidden |
| Branch performance table | Keep — CRM bookings per branch |
| Lab KPIs | Replace with CRM KPIs: new patients, repeat visits, engagement score |

---

## 9. Role & Permission Changes

### Current roles
`SuperAdmin, Owner, BranchAdmin, Receptionist, LabTechnician, Doctor, Patient`

### New role structure for CRM

| Role | Status | Notes |
|---|---|---|
| Patient | ✅ Keep | Self-service portal access |
| Doctor | ✅ Keep | Consultation and timeline view |
| BranchAdmin | ✅ Keep | Branch-level CRM management |
| Owner | ✅ Keep | Multi-branch CRM analytics |
| SuperAdmin | ✅ Keep | Platform administration |
| Receptionist | 🔧 Modify | Rename to CRMAgent — patient-facing support role |
| LabTechnician | 🔒 Hide | Enterprise-only LIS role |

---

## 10. Deployment Impact

### Feature Flag Strategy

Introduce a deployment-time feature flag: `CAPITALLAB_MODE` = `crm` or `enterprise`.

| Flag Value | Behavior |
|---|---|
| `crm` (default) | All lab ops, inventory, billing, insurance, analyzers hidden. Phone OTP + Google auth only for patients. |
| `enterprise` | Full platform enabled including LIS ops, billing, insurance, inventory. All auth methods available. |

This avoids a hard code fork — the same codebase serves both deployment types.

### Environment variables to add
```bash
CAPITALLAB_MODE=crm                # crm | enterprise
CAPITALLAB_OTP_PROVIDER=twilio     # twilio | aws-sns | local
CAPITALLAB_OTP_TTL_SECONDS=300
CAPITALLAB_GOOGLE_CLIENT_ID=...
CAPITALLAB_EXTERNAL_LIS_URL=...    # External system base URL
CAPITALLAB_EXTERNAL_LIS_API_KEY=...
CAPITALLAB_WEBHOOK_SECRET=...      # Incoming webhook HMAC secret
```

### Migration path (no breaking changes)
1. No existing tables are dropped — they remain in the DB schema
2. Lab ops tables simply stop receiving new writes in CRM mode
3. Routes remain registered but protected by feature flag middleware
4. Auth changes are additive — phone/Google login added, email remains for staff

### Infrastructure additions needed
| Component | Purpose |
|---|---|
| SMS/WhatsApp gateway | OTP delivery |
| Google OAuth app registration | Patient Google Sign-In |
| Webhook receiver endpoint | Inbound data from external LIS |
| Sync scheduler | Hangfire jobs for periodic data sync |
| Redis (optional) | OTP code caching with TTL |

---

## 11. Phased Implementation Plan

### Phase 1 — Hide & Flag (1–2 weeks)
- Add `CAPITALLAB_MODE` feature flag
- Add feature flag middleware to hide lab ops controllers and routes
- Hide nav items for Inventory, Billing, Insurance, Purchase Orders, Analyzers
- No code deletion — only routing and navigation guards

### Phase 2 — Authentication Replacement (2–3 weeks)
- Add `PhoneOtpRequest` entity + migration
- Implement POST /auth/otp/request + /auth/otp/verify
- Integrate Google OAuth (POST /auth/google)
- Add `OAuthAccount` entity for linked accounts
- Update patient registration flow to phone-first
- Keep email/password for staff/admin login
- Update frontend: replace login/register screens with OTP + Google UI

### Phase 3 — External Integration Layer (3–4 weeks)
- Add `ExternalPatientLink` entity + migration
- Build webhook receiver (appointments, results, reports)
- Build sync API (patients, doctors, branches, test catalog)
- Add `DataSyncLog` entity
- Add Hangfire sync jobs
- Update result/report views to consume synced data

### Phase 4 — CRM Dashboard Redesign (1–2 weeks)
- Redesign Admin overview: CRM KPIs
- Redesign Owner overview: engagement KPIs
- Redesign Branch overview: booking/arrival KPIs

### Phase 5 — Loyalty & Campaigns (4+ weeks, future)
- Add `LoyaltyProfile`, `PatientEngagementScore` entities
- Build Campaign Manager in admin
- Add patient segmentation
- Build loyalty points UI in patient portal

---

## 12. Summary Scorecard

| Dimension | Keep | Modify | Hide | Remove/New |
|---|---|---|---|---|
| Frontend screens | 15 | 8 | 18 | 4 (auth) |
| Backend controllers | 18 | 8 | 8 | — |
| Application features | 15 | 6 | 7 | 8 (new) |
| Domain entities | 33 | — | 14 | 8 (new) |
| Auth methods | 2 (staff) | — | — | 3 (new OTP + Google) |

---

## Final Verdict

Capital Lab can be transformed into a Patient CRM Platform **without a rebuild**. The existing codebase has all the patient-facing infrastructure needed. The transformation is primarily:

1. **Feature flagging** lab ops modules (not deletion)
2. **Replacing** patient authentication with phone OTP + Google
3. **Adding** an external LIS integration layer
4. **Repositioning** admin/owner dashboards from lab metrics to CRM metrics

The patient portal, booking wizard, results viewer, family management, notifications, and full CMS platform are already production-ready CRM features. The transformation is an **overlay and extension**, not a rewrite.

**Estimated timeline to CRM-ready v1:** 8–10 weeks with a focused team.
