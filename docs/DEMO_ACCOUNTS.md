# Capital Lab — Demo Accounts

> All demo accounts use the password: **`Demo@123456`**
>
> These accounts are seeded by the demo data seeder and exist in development and staging environments only.

---

## Primary Demo Accounts

| Role | Email | What to Demo |
|---|---|---|
| **Owner** | `owner@capitallab.demo` | Revenue analytics, branch performance, executive overview |
| **BranchAdmin** | `branchadmin@capitallab.demo` | Branch operations, inventory, staff management |
| **Doctor** | `doctor@capitallab.demo` | Patient timeline, critical results, report review & approval |
| **LabTechnician** | `technician@capitallab.demo` | Sample processing, result entry, QC workflow |
| **Receptionist** | `receptionist@capitallab.demo` | Appointment booking, patient check-in, billing |
| **Patient** | `patient@capitallab.demo` | Book appointment, view results, health tracker, PDF download |

---

## Full Account List

| Role | Email | Demo Routes |
|---|---|---|
| SuperAdmin | `superadmin@capitallab.demo` | `/admin`, `/owner`, all routes |
| Owner | `owner@capitallab.demo` | `/owner/overview`, `/owner/revenue`, `/owner/executive` |
| BranchAdmin | `branchadmin@capitallab.demo` | `/admin/inventory`, `/admin/billing`, `/admin/settings` |
| LabManager | `labmanager@capitallab.demo` | `/lab/qc`, `/lab/results-entry` |
| Receptionist | `receptionist@capitallab.demo` | `/lab/appointments`, `/lab/orders` |
| LabTechnician | `technician@capitallab.demo` | `/lab/samples`, `/lab/barcode`, `/lab/results-entry` |
| Phlebotomist | `phlebotomist@capitallab.demo` | `/lab/samples` |
| Doctor | `doctor@capitallab.demo` | `/doctor/patients`, `/doctor/critical-results`, `/doctor/reviews` |
| Patient | `patient@capitallab.demo` | `/patient/dashboard`, `/patient/results`, `/patient/book` |
| HomeCollector | `collector@capitallab.demo` | `/lab/samples` (home collection queue) |

---

## Key Demo Data Points

After seeding, the following data exists for a strong demo impression:

### Branches
- **Capital Lab — Abdali** (main branch, Amman)
- **Capital Lab — Mecca Street** (Amman)
- **Capital Lab — Khalda** (Amman)
- **Capital Lab — Sweifieh** (Amman)
- **Capital Lab — Irbid Main** (Irbid)
- Plus additional numbered branches

### Critical Results (for Doctor demo)
- Glucose: 450 mg/dL (critical high — Diabetes)
- Hemoglobin: 6.2 g/dL (critical low — Anemia)
- Potassium: 6.8 mEq/L (critical high — Hyperkalemia)

### Insurance Claims
- Mix of Approved, Pending, Rejected statuses
- Multiple insurance providers represented

### Financial Data
- Mix of paid and unpaid invoices
- Cash and card payments
- Partial payments

---

## Notes for Demo

1. Start with the **Patient** account to show the booking flow end-to-end
2. Switch to **LabTechnician** to process the sample
3. Switch to **Doctor** to review and approve the report
4. Show the **Patient** receiving their result notification
5. End with **Owner** to show revenue analytics impact

Password for all: `Demo@123456` — share this separately, not in public documentation.
