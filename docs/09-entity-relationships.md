# Capital Lab — Entity Relationship Overview

## Core Relationship Map

```
organization.labs (1)
  └── organization.branches (M)
        └── organization.staff_assignments (M) ──── identity.users (M)
        └── appointments.appointments (M) ─────────── patients.patients (M)
              └── appointments.appointment_tests (M) ─ catalog.tests / catalog.packages
              └── appointments.home_collections (1)
              └── samples.samples (M)
                    └── samples.sample_tracking (M)
                    └── results.test_results (1)
                          └── results.result_notes (M)
                          └── results.retest_requests (M)
                          └── reports.report_results (M) ── reports.lab_reports (M)
                                └── reports.report_shares (M)
              └── billing.invoices (1)
                    └── billing.invoice_items (M)
                    └── billing.payments (M)
                          └── billing.refunds (M)

catalog.tests (M)
  └── catalog.reference_ranges (M)
  └── catalog.branch_test_prices (M) ── organization.branches

catalog.packages (M)
  └── catalog.package_tests (M) ── catalog.tests

patients.patients (1)
  └── patients.family_members (M) ── patients.patients (self-referential)
  └── patients.emergency_contacts (M)
  └── patients.insurance_info (M)
  └── patients.medical_history (M)
  └── patients.allergies (M)

clinical.doctors (M) ── identity.users
  └── clinical.doctor_branches (M) ── organization.branches
  └── reports.lab_reports (via signed_by FK)
  └── results.test_results (via approved_by FK)

identity.users (M)
  └── identity.user_roles (M) ── identity.roles
  └── identity.refresh_tokens (M)
  └── identity.roles (M)
        └── identity.role_permissions (M) ── identity.permissions

inventory.items (M)
  └── inventory.stock (M) ── organization.branches
        └── inventory.stock_transactions (M)

notifications.templates (1)
  └── notifications.notification_log (M)

audit.audit_logs (append-only) ── any entity
```

---

## Aggregate Boundaries

| Aggregate Root | Owned Entities |
|---------------|----------------|
| `Patient` | EmergencyContact, InsuranceInfo, MedicalHistory, Allergy |
| `Appointment` | AppointmentTest, HomeCollection |
| `Sample` | SampleTrackingEvent |
| `TestResult` | ResultNote, RetestRequest |
| `LabReport` | ReportResult, ReportShare |
| `Invoice` | InvoiceItem |
| `Test` | ReferenceRange |
| `Package` | PackageTest |
| `PurchaseOrder` | PurchaseOrderItem |

---

## Key Cardinalities

| Relationship | Cardinality |
|-------------|-------------|
| Lab → Branches | 1:M |
| Branch → Appointments | 1:M |
| Patient → Appointments | 1:M |
| Appointment → AppointmentTests | 1:M |
| Appointment → Samples | 1:M (one per test) |
| Appointment → Invoice | 1:1 |
| Sample → TestResult | 1:1 |
| Appointment → LabReport | 1:1 |
| LabReport → Results | M:M (via report_results) |
| Test → ReferenceRanges | 1:M |
| Patient → FamilyMembers | M:M (self-referential) |
| User → Roles | M:M |
| Role → Permissions | M:M |
| Doctor → Branches | M:M |
| InventoryItem → BranchStock | 1:M |
