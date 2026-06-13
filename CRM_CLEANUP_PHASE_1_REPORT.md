# CRM Cleanup Phase 1 — Report

**Date:** 2026-06-13
**Goal:** Strip Capital Lab down to a Patient CRM & Engagement Platform by removing all internal lab operations modules.

---

## Summary

| Area | Changes |
|---|---|
| Backend build | 0 errors (was: multiple compile errors after deletions) |
| Frontend build | 0 errors, clean bundle |
| EF Migration | `DropNonCrmModules` created — drops 20 tables |
| Test files removed | 6 test files for deleted entities |
| Route groups removed | `/lab`, `/patient/payments`, `/doctor/critical-results`, `/doctor/reviews`, `/admin/inventory`, `/admin/purchase-orders`, `/admin/billing`, `/admin/payments`, `/admin/insurance`, `/admin/analyzers`, `/branch/samples`, `/branch/inventory`, `/branch/billing`, `/branch/insurance`, `/branch/reports`, `/owner/revenue`, `/owner/inventory`, `/owner/insurance` |

---

## Backend Changes

### Domain Layer (`CapitalLab.Domain`)

**Removed entities:**
- `Analyzers/` — `Analyzer`, `AnalyzerImport`, `AnalyzerResult`
- `Billing/` — `Invoice`, `InvoiceItem`, `Payment`
- `Insurance/` — `InsuranceProvider`, `InsuranceClaim`
- `Inventory/` — `InventoryItem`, `InventoryTransaction`
- `Laboratory/` — `Sample`, `SampleItem`, `QualityControlRecord`, `CriticalResultRule`, `CriticalResultAlert`, `DoctorReview`
- `Operations/` — `PurchaseOrder`, `PurchaseOrderItem`

**Modified:**
- `TestResult.cs` — removed `Sample` navigation property (FK `SampleId` retained as scalar)

### Application Layer (`CapitalLab.Application`)

**Removed features:**
- `Analytics/Analyzers/`, `Billing/`, `Insurance/`, `Inventory/`, `QualityControl/`, `Results/CriticalAlerts/`, `Samples/`, `DoctorReviews/`

**Rewritten to stub/CRM-only:**
- `Analytics/Queries/OwnerAnalyticsQueries.cs` — removed Invoice/Sample/Insurance/Inventory references; returns zeros for financial fields; uses Patient + TestOrder for trend data
- `Dashboard/GetBranchDashboardQuery.cs` — removed Invoice/Sample/InventoryItem; returns 0 for revenue/stock fields
- `Dashboard/GetOwnerExecutiveQuery.cs` — removed Invoice/HealthPackage/LabTest/Report; uses Branch + Patient only
- `Dashboard/GetOwnerExecutiveSummaryQuery.cs` — removed Invoice/Sample; uses Branch + Patient only
- `Results/Commands/ResultCommands.cs` — removed Sample lookup, CriticalDetection, AcknowledgeCriticalAlertCommand; `CreateResultCommand` now accepts `PatientId` directly
- `Reports/Commands/ReportCommands.cs` — removed `IRepository<Sample>`; `GenerateReportCommand` now accepts `PatientId` + `TestOrderId` directly

### Infrastructure Layer (`CapitalLab.Infrastructure`)

**`ApplicationDbContext.cs`** — removed using directives and DbSets for:
`Sample`, `SampleItem`, `QualityControlRecord`, `CriticalResultRule`, `CriticalResultAlert`, `DoctorReview`,
`InventoryItem`, `InventoryTransaction`, `PurchaseOrder`, `PurchaseOrderItem`,
`Invoice`, `InvoiceItem`, `Payment`, `InsuranceProvider`, `InsuranceClaim`,
`Analyzer`, `AnalyzerImport`, `AnalyzerResult`

**`DependencyInjection.cs`** — removed registrations:
`ISampleNumberService`, `IPurchaseOrderNumberService`, `IInvoiceNumberService`, `IClaimNumberService`, `IBarcodeService`, `IAnalyzerImportService`
Re-added: `IQrCodeService` (used by report generation)

**`DemoDataSeeder.cs`** — removed Sample/Invoice/Payment seeding; `DemoTargets` simplified (no Samples/Invoices/Payments counters)

**Deleted files:**
- `BackgroundJobs/Jobs/InventoryAlertsJob.cs` (and its registration in `HangfireJobService.cs`)
- `Services/NumberGeneration/PurchaseOrderNumberService.cs`
- `Persistence/Configurations/Laboratory/SampleConfiguration.cs` and others for removed entities

**Modified:**
- `TestResultConfiguration.cs` — removed `HasOne(r => r.Sample)` EF relationship (column `sample_id` retained as FK scalar, no navigation)

### Contracts Layer (`CapitalLab.Contracts`)

**Modified:**
- `Laboratory/ResultContracts.cs` — added `PatientId` to `CreateResultRequest`
- `Laboratory/ReportContracts.cs` — added `PatientId` + `TestOrderId` to `GenerateReportRequest`

### API Layer (`CapitalLab.Api`)

**Removed controllers:**
`InventoryController`, `PurchaseOrdersController`, `BillingController`, `InsuranceController`, `SamplesController`, `BarcodeController`, `AnalyzersController`, `QualityControlController`, `CriticalResultsController`, `DoctorReviewsController`

**Modified:**
- `ResultsController.cs` — updated `CreateResultCommand` instantiation (added `PatientId`)
- `ReportsController.cs` — updated `GenerateReportCommand` instantiation (added `PatientId`, `TestOrderId`)

### Test Project

**Deleted test files for removed entities:**
- `Unit/Domain/Business/InsuranceClaimTests.cs`
- `Unit/Domain/Business/InventoryItemTests.cs`
- `Unit/Domain/Business/InvoiceTests.cs`
- `Unit/Domain/Business/PurchaseOrderTests.cs`
- `Unit/Domain/Laboratory/SampleWorkflowTests.cs`
- `Unit/Domain/Laboratory/CriticalResultRuleTests.cs`
- `Integration/LaboratoryWorkflowTests.cs`

---

## Frontend Changes

### Routes (`app.routes.ts`)
Removed lazy-loaded route groups: `/lab`, `/patient/payments`, `/doctor/critical-results`, `/doctor/reviews`, `/admin/inventory`, `/admin/purchase-orders`, `/admin/billing`, `/admin/payments`, `/admin/insurance`, `/admin/analyzers`, `/branch/samples`, `/branch/inventory`, `/branch/billing`, `/branch/insurance`, `/branch/reports`, `/owner/revenue`, `/owner/inventory`, `/owner/insurance`

Preserved: `/branch/appointments` (reuses `lab-appointments.component` — cross-module dependency kept)

### Layouts

**`admin-layout.component.ts`** — nav trimmed to: Overview, Notifications, Audit, Settings, System Health, CMS items

**`owner-layout.component.ts`** — nav trimmed to: Tests & Packages, Patients, Executive Report

**`doctor-layout.component.ts`** — removed Critical Results, Pending Reviews from nav

**`branch-layout.component.ts`** — nav trimmed to: Overview, Appointments; removed `/lab` link

### Feature Components

**`admin/overview/admin-overview.component.ts`** — complete rewrite:
- Removed LabOverviewStore, InventoryStore, InsuranceStore, BillingStore, CriticalResultsApiService
- New CRM-focused KPIs: appointments, patients, reports, branches
- Work queues: today's appointments + new patients
- Branch monitor: 4-column (no revenue)
- Quick actions: appointments, patients, content, audit

**`branch/overview/branch-overview.component.ts`** — complete rewrite:
- Removed LabOverviewStore, InventoryStore, BillingStore
- Simple HTTP-based dashboard (appointments, patients, reports, orders)
- CRM quick actions (appointments, book, patient results)

**`owner/stores/owner-stores.ts`** — removed `OwnerInventoryStore` and `OwnerInsuranceStore`

**`doctor/stores/doctor-review.store.ts`** — recreated as minimal store:
- Calls `releaseReport` API for approve
- `requestRetest` stubbed (no backend endpoint)

---

## Database Migration

**Migration:** `DropNonCrmModules`
**Tables dropped:**
`analyzers`, `analyzer_imports`, `analyzer_results`, `invoices`, `invoice_items`, `payments`,
`insurance_providers`, `insurance_claims`, `inventory_items`, `inventory_transactions`,
`purchase_orders`, `purchase_order_items`, `samples`, `sample_items`,
`quality_control_records`, `critical_result_rules`, `critical_result_alerts`, `doctor_reviews`

Run with: `dotnet ef database update --project src/CapitalLab.Infrastructure --startup-project src/CapitalLab.Api`

---

## What Was Preserved

- All patient-facing APIs and portals
- Report generation pipeline (including QrCodeService)
- TestResult entity and history (SampleId scalar FK retained)
- OwnerAnalyticsController endpoints (return zeros for financial fields)
- `/branch/appointments` route and its underlying `lab-appointments.component`
- Doctor report review portal (`/doctor/reports`)
- All CMS, notifications, and audit infrastructure

---

## Next Steps (Phase 2)

1. Phone OTP authentication for patient self-registration
2. External LIS integration (results from analyzer → patient portal)
3. Drop `SampleId` FK from `test_results` table (after confirming no historical data dependency)
4. Patient satisfaction surveys post-appointment
5. Automated appointment reminder workflows
