# Capital Lab — API Endpoints

## Conventions

- Base URL: `/api/v1/`
- Authentication: Bearer JWT in `Authorization` header
- Pagination: `?page=1&pageSize=20` (default page size 20, max 100)
- Filtering: query params per endpoint
- Sort: `?sortBy=createdAt&sortDir=desc`
- Error: RFC 7807 Problem Details

---

## Auth Module `/api/v1/auth`

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/login` | Email/password login | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Revoke refresh token | Yes |
| POST | `/logout-all` | Revoke all user tokens | Yes |
| POST | `/forgot-password` | Send reset email | No |
| POST | `/reset-password` | Reset with token | No |
| POST | `/change-password` | Change own password | Yes |
| GET | `/me` | Current user profile | Yes |
| PUT | `/me` | Update own profile | Yes |
| POST | `/me/avatar` | Upload avatar | Yes |

---

## Users Module `/api/v1/users`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | List users (paginated) | SuperAdmin, Owner, BranchManager |
| POST | `/` | Create user | SuperAdmin, Owner |
| GET | `/{id}` | Get user by ID | SuperAdmin, Owner, BranchManager |
| PUT | `/{id}` | Update user | SuperAdmin, Owner |
| DELETE | `/{id}` | Soft delete user | SuperAdmin, Owner |
| POST | `/{id}/activate` | Activate user | SuperAdmin, Owner |
| POST | `/{id}/deactivate` | Deactivate user | SuperAdmin, Owner |
| GET | `/{id}/roles` | Get user roles | SuperAdmin, Owner |
| POST | `/{id}/roles` | Assign roles | SuperAdmin, Owner |
| DELETE | `/{id}/roles/{roleId}` | Remove role | SuperAdmin, Owner |
| GET | `/{id}/activity` | Audit log for user | SuperAdmin |

---

## Branches Module `/api/v1/branches`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | List branches | SuperAdmin, Owner, BranchManager |
| POST | `/` | Create branch | SuperAdmin, Owner |
| GET | `/{id}` | Get branch detail | All staff |
| PUT | `/{id}` | Update branch | SuperAdmin, Owner |
| DELETE | `/{id}` | Soft delete | SuperAdmin |
| GET | `/{id}/staff` | List branch staff | Owner, BranchManager |
| POST | `/{id}/staff` | Assign staff to branch | Owner, BranchManager |
| DELETE | `/{id}/staff/{userId}` | Remove staff | Owner, BranchManager |
| GET | `/{id}/stats` | Branch statistics | Owner, BranchManager |

---

## Patients Module `/api/v1/patients`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | Search/list patients | Staff (branch-scoped) |
| POST | `/` | Register patient | Receptionist, BranchManager |
| GET | `/{id}` | Patient detail | Staff |
| PUT | `/{id}` | Update patient | Receptionist, BranchManager |
| DELETE | `/{id}` | Soft delete | BranchManager, Owner |
| GET | `/{id}/family` | Family members | Staff, Patient |
| POST | `/{id}/family` | Add family member | Receptionist |
| GET | `/{id}/appointments` | Patient appointments | Staff, Patient |
| GET | `/{id}/results` | Patient results | Staff, Patient |
| GET | `/{id}/reports` | Patient reports | Staff, Patient |
| GET | `/{id}/invoices` | Patient invoices | Staff, Patient |
| GET | `/{id}/timeline` | Medical timeline | Doctor, BranchManager |
| POST | `/{id}/insurance` | Add insurance | Receptionist |
| PUT | `/{id}/insurance/{insId}` | Update insurance | Receptionist |
| POST | `/{id}/medical-history` | Add medical history | Doctor, Receptionist |
| POST | `/{id}/allergies` | Add allergy | Doctor, Receptionist |

---

## Doctors Module `/api/v1/doctors`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | List doctors | SuperAdmin, Owner, BranchManager |
| POST | `/` | Create doctor profile | SuperAdmin, Owner |
| GET | `/{id}` | Doctor detail | Staff |
| PUT | `/{id}` | Update doctor | SuperAdmin, Owner, Doctor(own) |
| GET | `/{id}/pending-reviews` | Pending result reviews | Doctor, BranchManager |
| GET | `/{id}/dashboard` | Doctor dashboard data | Doctor |
| PUT | `/{id}/signature` | Upload/update signature | Doctor |
| POST | `/{id}/branches/{branchId}` | Assign to branch | Owner, BranchManager |

---

## Test Catalog Module `/api/v1/tests`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | List all tests | All |
| POST | `/` | Create test | SuperAdmin, Owner, BranchManager |
| GET | `/{id}` | Test detail with ref ranges | All |
| PUT | `/{id}` | Update test | SuperAdmin, Owner, BranchManager |
| DELETE | `/{id}` | Deactivate test | SuperAdmin, Owner |
| GET | `/{id}/reference-ranges` | Get reference ranges | Staff |
| POST | `/{id}/reference-ranges` | Add reference range | SuperAdmin, Owner |
| PUT | `/{id}/reference-ranges/{rid}` | Update ref range | SuperAdmin, Owner |
| GET | `/categories` | List categories | All |
| POST | `/categories` | Create category | SuperAdmin, Owner |
| GET | `/sample-types` | List sample types | All |

---

## Packages Module `/api/v1/packages`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | List packages | All |
| POST | `/` | Create package | SuperAdmin, Owner |
| GET | `/{id}` | Package detail | All |
| PUT | `/{id}` | Update package | SuperAdmin, Owner |
| DELETE | `/{id}` | Deactivate | SuperAdmin, Owner |
| POST | `/{id}/tests` | Add test to package | SuperAdmin, Owner |
| DELETE | `/{id}/tests/{testId}` | Remove test | SuperAdmin, Owner |

---

## Appointments Module `/api/v1/appointments`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | List appointments (filtered) | Staff, Patient(own) |
| POST | `/` | Book appointment | Receptionist, Patient |
| GET | `/{id}` | Appointment detail | Staff, Patient |
| PUT | `/{id}` | Update appointment | Receptionist, BranchManager |
| POST | `/{id}/confirm` | Confirm appointment | Receptionist, BranchManager |
| POST | `/{id}/check-in` | Check in patient | Receptionist |
| POST | `/{id}/cancel` | Cancel appointment | Receptionist, Patient, BranchManager |
| POST | `/{id}/reschedule` | Reschedule | Receptionist, Patient |
| GET | `/{id}/home-collection` | Home collection detail | Staff |
| POST | `/{id}/home-collection/assign` | Assign phlebotomist | BranchManager, Receptionist |
| POST | `/{id}/home-collection/dispatch` | Mark dispatched | Phlebotomist, BranchManager |
| POST | `/{id}/home-collection/collected` | Mark collected | Phlebotomist |
| GET | `/calendar` | Calendar view (branch) | Staff |
| GET | `/today` | Today's appointments | Staff |

---

## Samples Module `/api/v1/samples`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | Sample worklist | LabTechnician, BranchManager |
| POST | `/` | Register sample | LabTechnician, Phlebotomist |
| GET | `/{id}` | Sample detail | LabTechnician, BranchManager |
| GET | `/barcode/{barcode}` | Lookup by barcode | LabTechnician |
| POST | `/{id}/collect` | Mark as collected | LabTechnician, Phlebotomist |
| POST | `/{id}/receive` | Receive at lab | LabTechnician |
| POST | `/{id}/reject` | Reject sample | LabTechnician |
| POST | `/{id}/status` | Update status | LabTechnician |
| GET | `/{id}/tracking` | Full tracking history | Staff |
| POST | `/bulk-receive` | Bulk receive by barcodes | LabTechnician |

---

## Results Module `/api/v1/results`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | Results worklist | LabTechnician, Doctor, BranchManager |
| POST | `/` | Enter result manually | LabTechnician |
| GET | `/{id}` | Result detail | Staff, Patient(own released) |
| PUT | `/{id}` | Update result (draft only) | LabTechnician |
| POST | `/{id}/review` | Submit for review | LabTechnician |
| POST | `/{id}/approve` | Approve result | Doctor, Senior Technician |
| POST | `/{id}/release` | Release to patient | Doctor, BranchManager |
| POST | `/{id}/amend` | Amend released result | Doctor |
| POST | `/{id}/notes` | Add note | Doctor, LabTechnician |
| POST | `/{id}/retest` | Request retest | Doctor |
| POST | `/import` | Import from analyzer (JSON/CSV) | LabTechnician |
| POST | `/{id}/upload-pdf` | Upload result PDF | LabTechnician |

---

## Reports Module `/api/v1/reports`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | List reports | Staff, Patient(own) |
| GET | `/{id}` | Report detail | Staff, Patient(own) |
| POST | `/{id}/generate` | Generate PDF report | Doctor, BranchManager |
| POST | `/{id}/sign` | Digitally sign | Doctor |
| POST | `/{id}/release` | Release to patient | Doctor, BranchManager |
| GET | `/{id}/pdf` | Download PDF | Staff, Patient(own) |
| POST | `/{id}/share` | Generate share link | Staff, Patient |
| GET | `/verify/{qrCode}` | Verify report QR code | Public |
| GET | `/share/{token}` | Access shared report | Public (token) |

---

## Inventory Module `/api/v1/inventory`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/items` | Catalog of inventory items | Staff |
| POST | `/items` | Create inventory item | BranchManager, Owner |
| GET | `/items/{id}` | Item detail | Staff |
| GET | `/stock` | Branch stock list | BranchManager, LabTechnician |
| POST | `/stock/receive` | Receive stock | BranchManager, LabTechnician |
| POST | `/stock/issue` | Issue stock | LabTechnician |
| POST | `/stock/adjust` | Manual adjustment | BranchManager |
| GET | `/stock/low` | Low stock alerts | BranchManager |
| GET | `/stock/expiring` | Expiring soon items | BranchManager |
| GET | `/purchase-orders` | List POs | BranchManager |
| POST | `/purchase-orders` | Create PO | BranchManager |
| PUT | `/purchase-orders/{id}` | Update PO | BranchManager |
| POST | `/purchase-orders/{id}/receive` | Receive PO delivery | BranchManager |

---

## Billing Module `/api/v1/billing`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/invoices` | List invoices | Receptionist, BranchManager |
| POST | `/invoices` | Create invoice | Receptionist |
| GET | `/invoices/{id}` | Invoice detail | Receptionist, BranchManager, Patient |
| PUT | `/invoices/{id}` | Update invoice | Receptionist |
| POST | `/invoices/{id}/void` | Void invoice | BranchManager |
| GET | `/invoices/{id}/pdf` | Download invoice PDF | All with access |
| POST | `/payments` | Record payment | Receptionist |
| GET | `/payments/{id}` | Payment detail | Receptionist, BranchManager |
| POST | `/refunds` | Create refund request | Receptionist |
| PUT | `/refunds/{id}/approve` | Approve refund | BranchManager |

---

## Notifications Module `/api/v1/notifications`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/` | My notifications | All |
| POST | `/{id}/read` | Mark as read | All |
| POST | `/read-all` | Mark all as read | All |
| GET | `/templates` | List templates | SuperAdmin, Owner |
| POST | `/templates` | Create template | SuperAdmin |
| PUT | `/templates/{id}` | Update template | SuperAdmin |
| POST | `/send` | Manual send (admin) | SuperAdmin, Owner |

---

## Analytics Module `/api/v1/analytics`

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/dashboard/owner` | Owner KPI dashboard | SuperAdmin, Owner |
| GET | `/dashboard/branch` | Branch manager dashboard | BranchManager |
| GET | `/dashboard/doctor` | Doctor dashboard | Doctor |
| GET | `/revenue` | Revenue analytics | Owner, BranchManager |
| GET | `/patients` | Patient analytics | Owner, BranchManager |
| GET | `/tests` | Test volume analytics | BranchManager, Owner |
| GET | `/turnaround` | TAT analytics | BranchManager, Owner |
| GET | `/staff` | Staff performance | BranchManager, Owner |
| GET | `/inventory` | Inventory analytics | BranchManager |

---

## Patient Portal `/api/v1/portal` (Patient-only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Patient dashboard overview |
| GET | `/appointments` | My appointments |
| POST | `/appointments` | Book appointment |
| GET | `/results` | My results |
| GET | `/reports` | My reports |
| GET | `/reports/{id}/download` | Download report PDF |
| GET | `/family` | Family members |
| POST | `/family` | Add family member |
| GET | `/payments` | Payment history |
| GET | `/profile` | My profile |
| PUT | `/profile` | Update profile |

---

## SignalR Hubs

```
/hubs/notifications
  - Connect with JWT bearer
  - Groups: user:{userId}, branch:{branchId}, patient:{patientId}
  - Events:
    - notification:new          — general notification
    - appointment:statusChanged  — appointment update
    - sample:statusChanged       — sample tracking update
    - result:released            — result ready
    - result:critical            — critical value alert
    - inventory:lowStock         — stock alert

/hubs/lab
  - Connect with JWT bearer (staff only)
  - Groups: branch:{branchId}
  - Events:
    - sample:received            — new sample at reception
    - result:entered             — technician entered result
    - result:pendingReview       — ready for doctor
    - homeCollection:dispatched  — phlebotomist en route
```
