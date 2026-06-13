# CapitalLab — Role-Based Access Control (RBAC) Certification

| Field       | Value                              |
|-------------|------------------------------------|
| Date        | 2026-06-13                         |
| Version     | 1.0                                |
| Status      | **CONDITIONALLY CERTIFIED**        |
| Prepared by | CapitalLab Engineering             |
| Scope       | Authentication, authorization, and role enforcement across API and frontend |

---

## Table of Contents

1. [Authentication Architecture](#1-authentication-architecture)
2. [Role Hierarchy](#2-role-hierarchy)
3. [API Permission Matrix](#3-api-permission-matrix)
4. [Frontend Guard Coverage](#4-frontend-guard-coverage)
5. [Privilege Escalation Test Results](#5-privilege-escalation-test-results)
6. [RBAC Gaps and Remediation](#6-rbac-gaps-and-remediation)
7. [Certification Verdict](#7-certification-verdict)

---

## 1. Authentication Architecture

### 1.1 Token Infrastructure

| Property           | Value                                         |
|--------------------|-----------------------------------------------|
| Algorithm          | RS256 (asymmetric — private key signs, public key verifies) |
| Access token TTL   | 15 minutes                                    |
| Refresh token TTL  | 7 days                                        |
| Token storage      | Frontend: memory + secure cookie (refresh)   |
| Claims             | `sub` (userId), `role`, `email`, `branchId`  |

### 1.2 Server-Side Enforcement

- `BaseController` carries `[Authorize]` — all controllers that inherit it require a valid JWT by default.
- Individual actions may override with `[AllowAnonymous]` (public endpoints) or narrow with `[Authorize(Roles = "...")]`.
- Auth middleware validates token signature, expiry, and issuer before any controller logic runs.
- Role claims are embedded in the JWT; no additional database lookup is required per request.

### 1.3 Known Naming Inconsistency

The `BranchAdmin` role is seeded in the database as the string `"BranchAdmin"` but the corresponding C# enum value is named `BranchManager`. Wherever role-name comparisons are performed in code, the string `"BranchAdmin"` must be used to match the seeded value. This inconsistency should be resolved in v1.1 by either renaming the enum member or updating the seed data to `"BranchManager"`.

---

## 2. Role Hierarchy

Roles are ordered from highest privilege to lowest. Higher roles do **not** automatically inherit lower-role permissions — permissions are explicitly declared per endpoint.

| Level | Role            | Scope                       | Primary Responsibilities                                  |
|-------|-----------------|-----------------------------|-----------------------------------------------------------|
| 1     | SuperAdmin      | Platform-wide               | Full access to all tenants, branches, and system settings |
| 2     | Owner           | Organization-wide           | Full access within their organization                     |
| 3     | BranchAdmin     | Branch-wide                 | Manage all staff and operations within a branch           |
| 4     | LabManager      | Lab operations              | Oversee sample processing, results, QC workflows          |
| 5     | Receptionist    | Front desk                  | Appointments, invoicing, patient registration             |
| 6     | LabTechnician   | Bench operations            | Enter results, process samples, submit for review         |
| 7     | Phlebotomist    | Sample collection           | Collect and register samples                              |
| 8     | Doctor          | Clinical review             | Review results, approve reports, issue doctor notes       |
| 9     | HomeCollector   | Field collection            | Home visit sample collection only                        |
| 10    | Patient         | Self-service                | View own appointments, results, reports, invoices         |

### Role Trust Boundary

```
  ┌─────────────────────────────────────────────────┐
  │  ADMINISTRATIVE TIER  (SuperAdmin, Owner)        │
  ├─────────────────────────────────────────────────┤
  │  BRANCH MANAGEMENT TIER  (BranchAdmin, LabManager) │
  ├─────────────────────────────────────────────────┤
  │  OPERATIONAL TIER  (Receptionist, LabTechnician, │
  │                     Phlebotomist, HomeCollector)  │
  ├─────────────────────────────────────────────────┤
  │  CLINICAL TIER  (Doctor)                         │
  ├─────────────────────────────────────────────────┤
  │  PATIENT TIER  (Patient)                         │
  └─────────────────────────────────────────────────┘
```

---

## 3. API Permission Matrix

The following matrix covers the 10 primary controllers. Cells marked **✓** indicate the role has access. Cells marked **GAP** indicate access is currently permitted but should not be. Cells marked **—** indicate no access (correct). Cells marked **✓\*** indicate read-only access.

Legend:
- **SA** = SuperAdmin, **OW** = Owner, **BA** = BranchAdmin, **LM** = LabManager
- **RC** = Receptionist, **LT** = LabTechnician, **PH** = Phlebotomist, **DR** = Doctor, **PT** = Patient

### 3.1 AppointmentsController

| Endpoint                        | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|---------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| GET /appointments (all)         | ✓  | ✓  | ✓  | ✓  | ✓  |GAP |GAP |GAP |GAP | Any-auth — **GAP**   |
| GET /appointments/my            | —  | —  | —  | —  | —  | —  | —  | —  | ✓  | Patient only — OK     |
| POST /appointments              | ✓  | ✓  | ✓  | —  | ✓  | —  | —  | —  | ✓  | Any-auth — **GAP**   |
| PUT /appointments/{id}/confirm  | ✓  | ✓  | ✓  | —  | ✓  | —  | —  | —  | —  | Any-auth — **GAP**   |
| PUT /appointments/{id}/cancel   | ✓  | ✓  | ✓  | —  | ✓  | —  | —  | —  | ✓  | Any-auth — **GAP**   |

### 3.2 PatientsController

| Endpoint                        | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|---------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| GET /patients (all)             | ✓  | ✓  | ✓  | ✓  | ✓  | —  | —  | ✓  | —  | Any-auth — over-perm  |
| GET /patients/profile           | —  | —  | —  | —  | —  | —  | —  | —  | ✓  | Patient only — OK     |
| GET /patients/{id}              | ✓  | ✓  | ✓  | ✓  | ✓  | —  | —  | ✓  | —  | Any-auth — over-perm  |
| POST /patients                  | ✓  | ✓  | ✓  | —  | ✓  | —  | —  | —  | ✓  | Any-auth — over-perm  |

### 3.3 SamplesController

| Endpoint                        | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|---------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| GET /samples (all)              | ✓  | ✓  | ✓  | ✓  | —  | ✓  | ✓  | —  | —  | Any-auth — **GAP**   |
| POST /samples/{id}/collect      | ✓  | ✓  | —  | —  | —  | ✓  | ✓  | —  | —  | Any-auth — **GAP**   |
| PUT /samples/{id}/receive       | ✓  | ✓  | —  | ✓  | —  | ✓  | —  | —  | —  | Any-auth — **GAP**   |
| PUT /samples/{id}/reject        | ✓  | ✓  | —  | ✓  | —  | ✓  | —  | —  | —  | Any-auth — **GAP**   |

### 3.4 TestOrdersController

| Endpoint                        | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|---------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| GET /test-orders (all)          | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | —  | ✓  | —  | Any-auth — over-perm  |
| GET /test-orders/my             | —  | —  | —  | —  | —  | —  | —  | —  | ✓  | Patient only — OK     |
| POST /test-orders               | ✓  | ✓  | ✓  | —  | ✓  | —  | —  | —  | —  | Any-auth — over-perm  |
| PUT /test-orders/{id}/cancel    | ✓  | ✓  | ✓  | —  | ✓  | —  | —  | —  | —  | Any-auth — over-perm  |

### 3.5 TestResultsController

| Endpoint                            | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|-------------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| POST /test-results                  | ✓  | ✓  | —  | ✓  | —  | ✓  | —  | —  | —  | Any-auth — over-perm  |
| PUT /test-results/{id}              | ✓  | ✓  | —  | ✓  | —  | ✓  | —  | —  | —  | Any-auth — over-perm  |
| PUT /test-results/{id}/submit       | ✓  | ✓  | —  | ✓  | —  | ✓  | —  | —  | —  | Any-auth — over-perm  |
| PUT /test-results/{id}/approve      | ✓  | ✓  | —  | —  | —  | —  | —  | ✓  | —  | Any-auth — over-perm  |
| PUT /test-results/{id}/release      | ✓  | ✓  | —  | —  | —  | —  | —  | ✓  | —  | Any-auth — **GAP**   |

### 3.6 ReportsController

| Endpoint                        | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|---------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| GET /reports/my                 | —  | —  | —  | —  | —  | —  | —  | —  | ✓  | Patient only — OK     |
| GET /reports/{id}/pdf           | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | —  | ✓  | ✓* | Patched (IDOR fix) — OK |
| PUT /reports/{id}/release       | ✓  | ✓  | —  | —  | —  | —  | —  | ✓  | —  | Any-auth — **GAP**   |

### 3.7 DoctorsController

| Endpoint                        | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|---------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| GET /doctors (all)              | ✓  | ✓  | ✓  | ✓  | ✓  | —  | —  | —  | —  | Any-auth — over-perm  |
| POST /doctors                   | ✓  | ✓  | ✓  | —  | —  | —  | —  | —  | —  | Any-auth — **GAP**   |
| PUT /doctors/{id}               | ✓  | ✓  | ✓  | —  | —  | —  | —  | —  | —  | Any-auth — **GAP**   |
| DELETE /doctors/{id}            | ✓  | ✓  | ✓  | —  | —  | —  | —  | —  | —  | Any-auth — **GAP**   |

### 3.8 InvoicesController

| Endpoint                        | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|---------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| All invoice endpoints           | ✓  | ✓  | ✓  | —  | ✓  | —  | —  | —  | —  | Restricted — OK       |

### 3.9 PaymentsController

| Endpoint                        | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|---------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| All payment endpoints           | ✓  | ✓  | ✓  | —  | ✓  | —  | —  | —  | —  | Restricted — OK       |

### 3.10 AuthController

| Endpoint                        | SA | OW | BA | LM | RC | LT | PH | DR | PT | Current State         |
|---------------------------------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|-----------------------|
| POST /auth/login                | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | [AllowAnonymous] — OK |
| POST /auth/refresh              | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | [AllowAnonymous] — OK |
| POST /auth/register             | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | [AllowAnonymous] — OK |
| POST /auth/forgot-password      | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | ✓  | [AllowAnonymous] — OK |

---

## 4. Frontend Guard Coverage

### 4.1 Implemented Guards

| Guard         | Type         | Mechanism                                   | Covers                                     |
|---------------|--------------|---------------------------------------------|--------------------------------------------|
| `authGuard`   | Route guard  | Checks `isLoggedIn` signal from auth store  | All protected routes; redirects to /login  |
| `roleGuard`   | Route guard  | Reads `role` claim from decoded JWT         | Role-specific layout routes                |

### 4.2 Route Guard Matrix

| Route Prefix             | authGuard | roleGuard        | Allowed Roles                              |
|--------------------------|:---------:|:----------------:|--------------------------------------------|
| /patient/**              | ✓         | ✓                | Patient                                    |
| /doctor/**               | ✓         | ✓                | Doctor                                     |
| /lab/**                  | ✓         | ✓                | LabTechnician, LabManager, Phlebotomist    |
| /admin/**                | ✓         | ✓                | SuperAdmin, Owner, BranchAdmin             |
| /public/**               | —         | —                | Anonymous                                  |
| /login                   | —         | —                | Anonymous (redirects if already logged in) |

### 4.3 Frontend Guard Gaps

| Gap                                     | Risk                                                                                   |
|-----------------------------------------|----------------------------------------------------------------------------------------|
| Role guard relies on client-side JWT    | A manipulated JWT would fool the frontend guard; server-side validation is the true control |
| No component-level action guards        | Individual buttons/actions (e.g., "Release Report") are not gated by role — a Doctor seeing a Lab interface could attempt actions |
| Receptionist route not explicitly listed| Receptionists access admin layout; if role guard misconfigures, a Receptionist could see admin-only views |

**Note:** Frontend guards are a UX convenience layer only. They do not constitute a security boundary. All security enforcement must occur server-side.

---

## 5. Privilege Escalation Test Results

The following tests were conducted using authenticated JWTs for a Patient role account.

### 5.1 Test Cases

| # | Test Description                                               | Endpoint                              | Expected Result          | Actual Result            | Finding |
|---|----------------------------------------------------------------|---------------------------------------|--------------------------|--------------------------|---------|
| 1 | Patient calls GET /api/v1/appointments (all appointments)     | GET /appointments                     | 403 Forbidden            | 200 OK — all data returned | **FAIL** |
| 2 | Patient calls GET /api/v1/appointments/my                     | GET /appointments/my                  | 200 own appointments only | 200 own appointments only | PASS    |
| 3 | Patient downloads another patient's PDF                       | GET /reports/{other-id}/pdf           | 403 Forbidden            | 403 Forbidden (patched)  | PASS    |
| 4 | Patient calls PUT /api/v1/appointments/{id}/confirm           | PUT /appointments/{id}/confirm        | 403 Forbidden            | 200 OK — appointment confirmed | **FAIL** |
| 5 | Patient calls PUT /api/v1/samples/{id}/reject                 | PUT /samples/{id}/reject              | 403 Forbidden            | 200 OK — sample rejected  | **FAIL** |
| 6 | Patient calls PUT /api/v1/reports/{id}/release                | PUT /reports/{id}/release             | 403 Forbidden            | 200 OK — report released  | **FAIL** |
| 7 | Patient calls POST /api/v1/doctors                            | POST /doctors                         | 403 Forbidden            | 200 OK — doctor created   | **FAIL** |
| 8 | Patient calls GET /api/v1/invoices                            | GET /invoices                         | 403 Forbidden            | 403 Forbidden             | PASS    |
| 9 | Patient calls GET /api/v1/payments                            | GET /payments                         | 403 Forbidden            | 403 Forbidden             | PASS    |
| 10 | Doctor calls DELETE /api/v1/doctors/{id}                     | DELETE /doctors/{id}                  | 403 Forbidden            | 200 OK — doctor deleted   | **FAIL** |

### 5.2 Summary

| Result | Count |
|--------|-------|
| PASS   | 4     |
| FAIL   | 6     |

Six of ten tested scenarios allowed unauthorized role access. All failures stem from endpoints using the inherited `[Authorize]` without a role restriction — any valid JWT (regardless of role) is sufficient to invoke them.

---

## 6. RBAC Gaps and Remediation

### Gap 1 — AppointmentsController: No Role Restrictions on Staff Endpoints

**Severity: HIGH**

**Description:** The endpoints `GET /appointments` (list all), `PUT .../confirm`, and `PUT .../cancel` carry no `[Authorize(Roles = "...")]` attribute. A Patient with a valid JWT can list every appointment in the system and confirm or cancel appointments that do not belong to them.

**Evidence:** Test cases 1 and 4 above confirmed successful responses with a Patient JWT.

**Remediation:**
```csharp
// AppointmentsController.cs
[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin,Receptionist,LabManager")]
[HttpGet]
public async Task<IActionResult> GetAll() { ... }

[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin,Receptionist")]
[HttpPut("{id}/confirm")]
public async Task<IActionResult> Confirm(Guid id) { ... }
```
Additionally, add ownership validation so a Patient cancelling their own appointment is the only Patient-allowed path, and that path must verify `appointment.PatientId == currentUserId`.

---

### Gap 2 — SamplesController: Any Authenticated User Can Perform Lab Actions

**Severity: HIGH**

**Description:** All sample lifecycle endpoints (collect, receive, start-processing, complete-processing, QC, reject) are accessible to any authenticated user including Patient accounts. A Patient could theoretically reject a sample, invalidating legitimate lab work.

**Evidence:** Test case 5 above confirmed successful sample rejection with a Patient JWT.

**Remediation:**
```csharp
// SamplesController.cs — apply to all mutating endpoints
[Authorize(Roles = "SuperAdmin,Owner,LabManager,LabTechnician,Phlebotomist")]
[HttpPut("{id}/reject")]
public async Task<IActionResult> Reject(Guid id) { ... }
```
Read endpoints (GET /samples) should be restricted to `SuperAdmin,Owner,BranchAdmin,LabManager,LabTechnician,Phlebotomist`.

---

### Gap 3 — DoctorsController: Create/Update/Delete Unrestricted

**Severity: HIGH**

**Description:** The `POST /doctors`, `PUT /doctors/{id}`, and `DELETE /doctors/{id}` endpoints have no role restriction. Any authenticated user — including a Patient or HomeCollector — can create, modify, or delete doctor records.

**Evidence:** Test cases 7 and 10 confirmed doctor creation and deletion with Patient and Doctor JWTs respectively.

**Remediation:**
```csharp
// DoctorsController.cs
[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin")]
[HttpPost]
public async Task<IActionResult> Create([FromBody] CreateDoctorRequest request) { ... }

[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin")]
[HttpPut("{id}")]
public async Task<IActionResult> Update(Guid id, ...) { ... }

[Authorize(Roles = "SuperAdmin,Owner")]
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(Guid id) { ... }
```

---

### Gap 4 — ReportsController: Release Endpoint Unrestricted

**Severity: MEDIUM**

**Description:** The `PUT /reports/{id}/release` endpoint has no role restriction. Any authenticated user can release a report, bypassing the intended Doctor-only clinical authorization gate. Releasing a report makes it visible to patients — releasing an incomplete or unapproved report would be a clinical data integrity issue.

**Evidence:** Test case 6 confirmed successful report release with a Patient JWT.

**Remediation:**
```csharp
// ReportsController.cs
[Authorize(Roles = "SuperAdmin,Owner,Doctor")]
[HttpPut("{id}/release")]
public async Task<IActionResult> Release(Guid id) { ... }
```

Additionally, consider adding a domain-level check that a report cannot be released unless all associated `TestResult` entities are in `Released` state.

---

### Additional Observation — IDOR on Non-Patient Endpoints (Medium)

While Patient-specific endpoints (`/my`) correctly scope to the authenticated user's data, most staff endpoints that accept a resource `{id}` in the URL do not verify that the resource belongs to the caller's branch or organization. A LabTechnician at Branch A could theoretically access sample data from Branch B if they know the GUID. This is a broader multi-tenancy isolation concern. The `branchId` claim in the JWT should be validated against the resource's `BranchId` property in all staff-facing read and write endpoints.

---

## 7. Certification Verdict

### Summary Scorecard

| Area                            | Status               | Notes                                     |
|---------------------------------|----------------------|-------------------------------------------|
| JWT infrastructure (RS256)      | PASS                 | Industry-standard, correctly configured   |
| Token TTL (15min / 7d)          | PASS                 | Appropriate for production                |
| BaseController [Authorize]      | PASS                 | Default-deny correctly established        |
| Patient self-service isolation  | PASS                 | /my endpoints correctly scoped            |
| PDF cross-patient protection    | PASS                 | IDOR patched                              |
| Invoices / Payments restriction | PASS                 | Correctly restricted to finance roles     |
| AppointmentsController gaps     | FAIL                 | Gap 1 — HIGH severity                    |
| SamplesController gaps          | FAIL                 | Gap 2 — HIGH severity                    |
| DoctorsController gaps          | FAIL                 | Gap 3 — HIGH severity                    |
| ReportsController release gap   | FAIL                 | Gap 4 — MEDIUM severity                  |
| Frontend route guards           | PASS (with caveats)  | Security boundary is server-side          |
| Role naming consistency         | WARNING              | BranchAdmin vs BranchManager discrepancy  |

### Verdict

> **CONDITIONALLY CERTIFIED** — The CapitalLab RBAC architecture has the correct foundational design: RS256 JWTs, default-deny via `BaseController`, and role-restricted financial endpoints. Patient self-service data isolation is implemented correctly on all `/my` endpoints, and the PDF IDOR vulnerability has been patched.
>
> However, four gaps — all resulting from missing `[Authorize(Roles = "...")]` decorators on mutating endpoints — allow any authenticated user to perform privileged operations. Three of these gaps are HIGH severity. They do not compromise the cryptographic integrity of the system, but they do allow role boundary violations that could lead to data integrity issues or unauthorized data access.
>
> **These gaps must be resolved before the system handles real patient data in production.** They are straightforward to fix (adding role attributes to controller actions) and are recommended as the first v1.1 hardening sprint.

| Gap | Severity | Estimated Fix Effort |
|-----|----------|---------------------|
| Gap 1 — Appointments role restriction | HIGH | 1–2 hours |
| Gap 2 — Samples role restriction | HIGH | 1–2 hours |
| Gap 3 — Doctors CRUD restriction | HIGH | 1 hour |
| Gap 4 — Report release restriction | MEDIUM | 30 minutes |
| Role naming inconsistency | LOW | 1 hour |
| Branch-level IDOR (multi-tenancy) | MEDIUM | 2–4 hours |

**Total estimated remediation effort: 1–2 days for a single developer.**

---

*Document prepared by CapitalLab Engineering. Last updated: 2026-06-13.*
