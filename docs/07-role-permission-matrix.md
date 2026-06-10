# Capital Lab — Role Permission Matrix

## Roles

| ID | Role | Scope | Description |
|----|------|-------|-------------|
| 1 | SuperAdmin | Global | Full system access, manages labs |
| 2 | Owner | Lab | Manages all branches of a lab |
| 3 | BranchManager | Branch | Manages a single branch |
| 4 | Doctor | Branch/Lab | Reviews and approves results |
| 5 | LabTechnician | Branch | Sample processing and result entry |
| 6 | Receptionist | Branch | Patient registration, appointments, billing |
| 7 | Phlebotomist | Branch | Home collection and sample collection |
| 8 | Patient | Self | Access own data via portal |

---

## Permission Matrix

Legend: ✅ Full Access | 🔶 Own/Branch Scoped | ❌ No Access | 📖 Read Only

### System Administration

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| Manage Labs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Branches | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Branches | ✅ | ✅ | 🔶 Own | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | 🔶 Branch | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | 🔶 Branch | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | 🔶 Branch | ❌ | ❌ | ❌ | ❌ | ❌ |
| System Settings | ✅ | 🔶 Lab | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Patient Management

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| Register Patient | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Patient List | ✅ | ✅ | ✅ | 🔶 Assigned | 📖 Basic | ✅ | 📖 Basic | ❌ |
| View Patient Detail | ✅ | ✅ | ✅ | ✅ | 📖 | ✅ | 📖 | 🔶 Own |
| Update Patient | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | 🔶 Own limited |
| Delete Patient | ✅ | ✅ | 🔶 | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Medical History | ✅ | ✅ | ✅ | ✅ | 📖 | ✅ | ❌ | 🔶 Own |
| Add Medical History | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Allergies | ✅ | ✅ | ✅ | ✅ | 📖 | ✅ | 📖 | 🔶 Own |
| Manage Insurance | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

### Appointment Management

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| View Appointments | ✅ | ✅ | ✅ | 📖 | 📖 | ✅ | 📖 HC only | 🔶 Own |
| Book Appointment | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Confirm Appointment | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Cancel Appointment | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | 🔶 Own |
| Reschedule | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | 🔶 Own |
| Check-In Patient | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Manage Home Collection | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | 🔶 Own |
| Assign Phlebotomist | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

### Sample Management

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| View Sample Worklist | ✅ | ✅ | ✅ | 📖 | ✅ | 📖 | 📖 Own | ❌ |
| Register Sample | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Collect Sample | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Receive Sample | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Reject Sample | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Update Sample Status | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | 🔶 Own | ❌ |
| View Tracking History | ✅ | ✅ | ✅ | 📖 | ✅ | ❌ | 📖 | ❌ |

### Result Management

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| View Result Worklist | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Enter Results | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Edit Draft Results | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Submit for Review | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Tech Review | ✅ | ✅ | ✅ | ❌ | ✅ Senior | ❌ | ❌ | ❌ |
| Doctor Review | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve Result | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Release Result | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add Doctor Notes | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Request Retest | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Import Analyzer Data | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Amend Released Result | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Results | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🔶 Released only |

### Report Management

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| Generate Report | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Report | ✅ | ✅ | ✅ | ✅ | 📖 | 📖 | ❌ | 🔶 Own released |
| Sign Report | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Release Report | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Download PDF | ✅ | ✅ | ✅ | ✅ | 📖 | 📖 | ❌ | 🔶 Own released |
| Share Report | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | 🔶 Own |
| Verify Report (public) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Test Catalog Management

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| View Test Catalog | ✅ | ✅ | ✅ | 📖 | 📖 | 📖 | 📖 | 📖 |
| Create/Edit Tests | ✅ | ✅ | 🔶 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Categories | ✅ | ✅ | 🔶 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Packages | ✅ | ✅ | 🔶 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Set Pricing | ✅ | ✅ | 🔶 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Reference Ranges | ✅ | ✅ | 🔶 | 📖 | 📖 | ❌ | ❌ | ❌ |

### Inventory Management

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| View Stock | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Receive Stock | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Issue Stock | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Adjust Stock | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Purchase Orders | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve Purchase Orders | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Expiry Alerts | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |

### Billing & Payments

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| Create Invoice | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Invoices | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | 🔶 Own |
| Void Invoice | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Record Payment | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Request Refund | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve Refund | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Revenue | ✅ | ✅ | 🔶 Branch | ❌ | ❌ | ❌ | ❌ | ❌ |

### Analytics & Reporting

| Permission | SuperAdmin | Owner | BranchManager | Doctor | LabTech | Receptionist | Phlebotomist | Patient |
|-----------|-----------|-------|--------------|--------|---------|-------------|-------------|---------|
| View Owner Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Branch Dashboard | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Doctor Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Revenue Analytics | ✅ | ✅ | 🔶 Branch | ❌ | ❌ | ❌ | ❌ | ❌ |
| Patient Analytics | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Staff Performance | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Inventory Analytics | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Doctor Portal Permissions

| Permission | Doctor |
|-----------|--------|
| View pending review queue | ✅ |
| View critical findings | ✅ |
| Add medical notes | ✅ |
| Approve/release results | ✅ |
| Sign reports digitally | ✅ |
| Request retesting | ✅ |
| View patient timeline | ✅ |
| Schedule follow-ups | ✅ |
| View own branch patients only | ✅ |

### Patient Portal Permissions

| Permission | Patient |
|-----------|---------|
| View own appointments | ✅ |
| Book appointment | ✅ |
| Cancel own appointment | ✅ |
| View own released results | ✅ |
| Download own report PDF | ✅ |
| Share own reports | ✅ |
| View own invoices | ✅ |
| Manage own profile | ✅ |
| Manage family members | ✅ |
| View family results (if authorized) | ✅ |
| View unreleased results | ❌ |
| View other patients | ❌ |

---

## Permission Codes Reference

```
# Authentication
auth.login
auth.refresh
auth.change_password

# Users
users.read
users.write
users.delete
users.manage_roles

# Branches
branches.read
branches.write
branches.delete
branches.manage_staff

# Patients
patients.read
patients.write
patients.delete
patients.read_pii           — view national ID / passport

# Clinical
doctors.read
doctors.write
doctors.manage

# Catalog
catalog.read
catalog.write
catalog.manage_pricing

# Appointments
appointments.read
appointments.write
appointments.cancel
appointments.manage_home_collection

# Samples
samples.read
samples.register
samples.collect
samples.receive
samples.reject
samples.update_status

# Results
results.read
results.enter
results.review_tech
results.review_senior
results.review_doctor
results.approve
results.release
results.amend
results.import

# Reports
reports.read
reports.generate
reports.sign
reports.release
reports.download
reports.share

# Inventory
inventory.read
inventory.receive
inventory.issue
inventory.adjust
inventory.purchase_orders

# Billing
billing.read
billing.create_invoice
billing.void_invoice
billing.record_payment
billing.manage_refunds

# Analytics
analytics.view_own
analytics.view_branch
analytics.view_global

# Notifications
notifications.read
notifications.manage_templates

# Audit
audit.read
```
