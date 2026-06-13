# Database Schema Certification Report

| Field        | Value                             |
|--------------|----------------------------------|
| **Date**     | 2026-06-13                       |
| **Version**  | 1.0                              |
| **Status**   | CERTIFIED WITH NOTES             |
| **Scope**    | EF Core migrations, index coverage, FK cascade behavior, soft delete, seed data |
| **Reviewer** | Automated Architecture Audit     |

---

## 1. Migration History

| # | Migration ID | Phase | Applied |
|---|---|---|---|
| 1 | `20260610081851_Phase1MasterData` | Master data: roles, branches, lab test categories, lab tests, health packages | Yes |
| 2 | `20260610083331_Phase2Operations` | Core operations: patients, appointments, test orders, samples | Yes |
| 3 | `20260610090405_Phase3Laboratory` | Laboratory workflow: test results, reports, report items, doctor reviews, QC | Yes |
| 4 | `20260610134754_Phase4BusinessOperations` | Business: invoices, payments, invoice items, insurance claims, home collection | Yes |
| 5 | `20260611085238_PhaseF_NotificationsAnalyzersAuditMobileSettings` | Platform services: notifications, analyzers, analyzer imports/results, audit logs, mobile settings | Yes |
| 6 | `20260613074912_AddNotificationRetryFields` | Notification retry: `RetryCount`, `NextRetryAt`, `LastError` fields on `notifications` table | Yes (latest) |

**Total migrations:** 6  
**Schema completeness:** All domain phases covered through the latest commit.

---

## 2. Index Coverage

| Table | Indexed Columns / Keys | Index Type | Notes |
|---|---|---|---|
| `invoices` | `PatientId`, `BranchId`, `Status`, `IssuedAt` | B-Tree | Supports patient history and status filtering queries |
| `payments` | `InvoiceId`, `CreatedAt` | B-Tree | Supports payment history per invoice |
| `invoice_items` | `InvoiceId` | B-Tree | Supports line item retrieval per invoice |
| `samples` | `SampleId`, `PatientId`, `TestOrderId` | B-Tree | Supports barcode lookup and order correlation |
| `test_results` | `(PatientId, LabTestId)` composite | B-Tree composite | Supports patient result history per test — confirmed composite |
| `test_orders` | `PatientId`, `BranchId`, `Status` | B-Tree | Supports order listing and status filtering |
| `appointments` | `PatientId`, `BranchId`, `ScheduledAt` | B-Tree | Supports calendar and patient appointment queries |
| `lab_tests` | `CategoryId`, `Code` | B-Tree | Supports catalog browsing and code lookup |
| `reports` | `SampleId`, `PatientId` | B-Tree | Supports report retrieval per sample and patient |
| `report_items` | `ReportId`, `LabTestId` | B-Tree | Supports report item retrieval |
| `doctor_reviews` | `ReportId`, `DoctorId` | B-Tree | Supports review assignment and lookup |
| `audit_logs` | `EntityType`, `UserId`, `OccurredAt` | B-Tree | Supports audit trail queries by entity and user |
| `critical_result_rules` | `LabTestId` | B-Tree | Supports rule lookup per test |
| `critical_result_alerts` | `PatientId`, `LabTestId`, `SampleId` | B-Tree | Supports alert retrieval per patient and test |
| `home_collection_requests` | `PatientId`, `AssignedStaffId`, `Status` | B-Tree | Supports dispatch and status queries |

**Tables with confirmed index gaps:** See Section 6.

---

## 3. Foreign Key Cascade Behavior

### CASCADE — child records deleted automatically with parent

| Parent Table | Child Table | Cascade Behavior |
|---|---|---|
| `analyzer_imports` | `analyzer_results` | CASCADE DELETE |
| `samples` | `sample_items` | CASCADE DELETE |
| `samples` | `critical_result_alerts` | CASCADE DELETE |
| `samples` | `reports` | CASCADE DELETE |
| `samples` | `qc_records` | CASCADE DELETE |
| `invoices` | `invoice_items` | CASCADE DELETE |
| `test_orders` | `test_order_items` | CASCADE DELETE |
| `appointments` | `appointment_items` | CASCADE DELETE |
| `appointments` | `appointment_history` | CASCADE DELETE |

> Rationale: Child records have no independent meaning without their parent; cascade deletion is semantically correct.

### RESTRICT — deletion blocked if referenced children exist

| Referenced Table | Referencing Table(s) | Behavior |
|---|---|---|
| `analyzers` | `analyzer_imports` | RESTRICT |
| `test_categories` | `lab_tests` | RESTRICT |
| `lab_tests` | `test_order_items`, `test_results`, `critical_result_rules` | RESTRICT |
| `patients` | `appointments`, `test_orders`, `invoices`, `samples`, `reports` | RESTRICT |
| `branches` | `appointments`, `test_orders`, `invoices`, `home_collection_requests` | RESTRICT |

> Rationale: These are master-data or identity entities; accidental deletion must be blocked to preserve referential integrity.

### SET NULL — FK nullified on parent deletion

| Parent Table | Child Table | Nullable FK | Behavior |
|---|---|---|---|
| `test_orders` | `appointments` | `TestOrderId` | SET NULL — appointment can exist without a linked test order |
| `staff` | `home_collection_requests` | `AssignedStaffId` | SET NULL — request can exist in unassigned state |

---

## 4. Soft Delete Coverage

### Mechanism

```
SoftDeleteInterceptor
  │
  ├── Intercepts: EntityState.Deleted on any AuditableEntity subclass
  ├── Action:     Sets DeletedAt = UtcNow, DeletedBy = current user
  ├── Override:   Changes EntityState from Deleted → Modified
  └── Effect:     Row is updated in-place; no physical DELETE issued
```

### Global Query Filters

All `DbSet<T>` definitions for `AuditableEntity` subclasses include an EF Core global query filter:

```csharp
.Where(e => e.DeletedAt == null)
```

This filter is applied automatically to all LINQ queries. Soft-deleted records are excluded from all standard reads without any per-query modification.

### Restore Capability

The `AuditableEntity` base class exposes a `Restore()` method that clears `DeletedAt` and `DeletedBy`, making the record visible to standard queries again.

### Coverage Table

| Entity Type | Soft Delete | Global Filter | Restore() |
|---|---|---|---|
| All `AuditableEntity` subclasses | Yes (interceptor) | Yes | Yes |
| Reference/master data entities | Yes | Yes | Yes |
| Audit logs | Not applicable — audit logs are append-only | N/A | N/A |

---

## 5. Seed Data

| Category | Count | Details |
|---|---|---|
| System roles | 9 | Covers all user personas: Admin, Lab Technician, Doctor, Patient, Receptionist, etc. |
| Admin user | 1 | Default system administrator account |
| HQ branch | 1 | Headquarters branch as default operational branch |
| Test categories | 15 | Covers major laboratory test groupings (Hematology, Biochemistry, Microbiology, etc.) |
| Lab tests | 13 | Representative tests across categories with reference ranges |
| Health packages | 9 | Bundled test packages for patient self-service booking |

**Total seed records:** 48 across 6 entity types.

Seed data is applied via `DataSeeder` on application startup in Development and initial Production deployment. Seed operations are idempotent — they check for existing records before inserting.

---

## 6. Gaps and Recommendations

| # | Gap Description | Affected Table | Severity | Recommended Action |
|---|---|---|---|---|
| 1 | **No composite unique index on `(SampleId, LabTestId)` in `analyzer_results`** — duplicate result records for the same sample+test combination can be inserted without constraint violation; uniqueness is not enforced at the database level | `analyzer_results` | Medium | Add migration: `CREATE UNIQUE INDEX uix_analyzer_results_sample_labtest ON analyzer_results (SampleId, LabTestId);` — coordinate with Gap 1 in ANALYZER_CERTIFICATION.md |
| 2 | **No index on `Status` column in `notifications` table** — the notification retry background job queries by `Status IN (Pending, Failed)` and `NextRetryAt <= NOW()`; without an index, this becomes a full table scan at scale | `notifications` | Low | Add migration: `CREATE INDEX ix_notifications_status_nextretry ON notifications (Status, NextRetryAt);` |
| 3 | **No composite index covering common `audit_logs` filter combinations** — the existing index covers `(EntityType, UserId, OccurredAt)` individually but not as a composite; queries filtering by multiple dimensions (e.g., all actions by user X on entity type Y after date Z) may not benefit from the current index structure | `audit_logs` | Low | Add migration: `CREATE INDEX ix_audit_logs_entitytype_userid_occurred ON audit_logs (EntityType, UserId, OccurredAt);` as a true composite index |
| 4 | **No database-level CHECK constraints on monetary amount columns** — `BalanceAmount`, `TotalAmount`, `PaidAmount` on the `invoices` table have no `CHECK (column >= 0)` constraint; negative values are prevented at the domain/application layer but are not enforced at the database level | `invoices`, `payments` | Low | Add migration adding CHECK constraints: `ALTER TABLE invoices ADD CONSTRAINT chk_invoices_amounts CHECK (TotalAmount >= 0 AND PaidAmount >= 0 AND BalanceAmount >= 0);` |

---

## 7. Certification Verdict

**CERTIFIED WITH NOTES**

The CapitalLab database schema is production-ready. Six EF Core migrations build the schema incrementally across all domain phases, from master data through laboratory operations, business operations, and platform services, to the latest notification retry enhancement. The index coverage is comprehensive across all high-traffic query patterns. Foreign key cascade behavior is correctly differentiated: CASCADE for dependent child data, RESTRICT for master data, and SET NULL for optional associations. The soft delete mechanism is consistently applied across all `AuditableEntity` subclasses via an EF Core interceptor with global query filters, ensuring soft-deleted records are transparent to application code. Seed data covers all required initial system configuration.

Four optimizations are identified in the gaps table above. Gap 1 (duplicate analyzer results) is rated Medium and should be addressed in v1.1 alongside the corresponding application-layer fix. Gaps 2–4 are Low severity performance and safety improvements with no impact on correctness in current operational volumes.

| Area | Result |
|---|---|
| Migration history (6 migrations) | PASS |
| Index coverage — all confirmed tables | PASS |
| FK cascade behavior — CASCADE | PASS |
| FK cascade behavior — RESTRICT | PASS |
| FK cascade behavior — SET NULL | PASS |
| Soft delete (interceptor + global filters) | PASS |
| Restore capability | PASS |
| Seed data completeness | PASS |
| Unique constraint on analyzer_results | GAP — Medium |
| Notifications status index | GAP — Low |
| Audit logs composite index | GAP — Low |
| DB-level amount check constraints | GAP — Low |
| **Overall** | **CERTIFIED WITH NOTES** |
