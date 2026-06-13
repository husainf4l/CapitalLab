# Capital Lab — CRM Scope

## Platform Mission

Capital Lab is a **Patient CRM & Engagement Platform** for clinical laboratories.
Its purpose is to acquire patients, deliver exceptional service, and retain loyalty —
not to manage internal lab operations.

---

## Kept Modules

### Public Website
- Home page with service offerings, branch finder, doctors, FAQ, blog/articles
- SEO-optimised static pages: About, Services, Contact
- Newsletter signup and marketing content (CMS-managed)

### Patient Portal
- Self-registration and profile management
- Appointment booking (branch visit & home collection)
- Test results viewer with PDF download
- Health tracker (historical results over time)
- Family members management
- Notifications centre (push, email, SMS)

### Admin CRM Dashboard
- Patient management (search, profiles, records)
- Appointment management across all branches
- Home collection request management
- CMS: articles, pages, FAQ, services, hero banners, testimonials
- Notification centre (broadcast and individual)
- Audit log viewer
- System health monitor
- Platform settings

### Owner Analytics
- CRM KPIs: active patients, appointment volume, test order trends
- Branch performance (patient volume, appointment counts)
- Executive report (patient growth, branch footprint)
- Tests & packages catalogue management

### Branch Portal
- Branch overview dashboard (appointments, patients, reports)
- Appointment scheduling

### Doctor Portal
- Patient timeline view
- Report review and release
- Follow-up notes
- Doctor analytics

### Doctors Directory (public)
- Doctor profiles, specializations, branch affiliations

### Branches Management
- Branch CRUD, operating hours, geo-coordinates
- Public branch finder

### Tests & Packages Catalogue
- Lab test and health package definitions (prices, descriptions)
- CMS-managed content for public display

### Reports & Notifications Infrastructure
- PDF report generation with QR verification
- Email / SMS / WhatsApp / push notification delivery
- Notification retry and scheduling

---

## Removed Modules

| Module | Reason |
|---|---|
| Inventory Management | Internal operations — not patient-facing |
| Purchase Orders | Internal procurement — not patient-facing |
| Insurance & Claims | Financial/billing workflow — out of CRM scope |
| Invoicing & Payments | Financial workflow — out of CRM scope |
| Sample Workflow (register, barcode, track) | Internal lab operations |
| Results Entry (technician entry screen) | Internal lab operations |
| QC (Quality Control) | Internal lab operations |
| Barcode printing/scanning portal | Internal lab operations |
| Analyzer Management & Import | Internal instrument integration |
| Doctor Review Workflow (batch queue) | Internal peer-review queue |
| Critical Results Rules & Alerts | Internal clinical escalation |
| Lab Portal (entire /lab route group) | Internal operations portal |
| Owner Revenue & Financial Analytics | Financial BI — replaced with CRM KPIs |
| Owner Insurance Analytics | Financial BI |
| Owner Inventory Analytics | Internal ops BI |

---

## Boundaries

**IN scope** — anything that touches the patient relationship:
acquiring, onboarding, communicating, delivering results, and retaining patients.

**OUT of scope** — anything that is purely internal lab workflow:
sample processing, reagent inventory, billing/payments, insurance claims,
analyzer management, or clinical peer review queues.

---

## Data Model (kept entities)

`Patient`, `FamilyMember`, `Appointment`, `AppointmentItem`,
`TestOrder`, `TestOrderItem`, `TestResult`, `TestResultHistory`,
`Report`, `ReportItem`, `HomeCollectionRequest`,
`Branch`, `Doctor`, `StaffProfile`,
`LabTest`, `HealthPackage`, `Notification`,
`AuditLog`, `SystemSetting`, `MobileAppSetting`,
`Article`, `ArticleCategory`, `Faq`, `Page`, `Service`,
`Testimonial`, `HeroBanner`, `NewsletterSubscriber`, `SeoMeta`
