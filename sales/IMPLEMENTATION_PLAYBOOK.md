# Capital Lab — Implementation Playbook
## 5-Week Deployment to Go-Live · v1.0

---

## Overview

Capital Lab deploys in 5 structured weeks. Each week has a clear focus, defined deliverables, and clear ownership. This playbook is the operational guide for both the Capital Lab implementation team and the client.

**Total Duration:** 5 weeks from contract signing to go-live
**Post-Launch Hypercare:** 30 days
**Full Stabilization:** 90 days

---

## Roles and Responsibilities

| Role | Capital Lab | Client |
|---|---|---|
| Project Lead | ✅ Implementation Manager | ✅ Lab Director / IT Manager |
| Technical Setup | ✅ DevOps Engineer | Provides access and decisions |
| Data Migration | ✅ Assists and validates | ✅ Provides data in required format |
| Training Delivery | ✅ Trainer | ✅ Staff availability during training |
| Onboarding Content | ✅ Guides | ✅ Delivers (test catalog, staff list, etc.) |
| Go-Live Decision | ✅ Certifies readiness | ✅ Final approval |

---

## Week 1 — Infrastructure and Environment

**Focus:** Get a working environment deployed, accessible, and validated.

### Capital Lab Responsibilities
- [ ] Provision server (Capital Lab cloud or client's)
- [ ] Configure DNS with client's chosen domain
- [ ] Obtain SSL certificates (Let's Encrypt or provided certificate)
- [ ] Deploy application stack (API + frontend + database + nginx)
- [ ] Run database migrations
- [ ] Deploy with empty demo seed (verify all core tables)
- [ ] Confirm all health endpoints responding: `/health`, `/health/live`, `/api/version`
- [ ] Send client: staging URL, temporary admin credentials

### Client Responsibilities
- [ ] Confirm hosting choice and provide server access (if own server)
- [ ] Purchase domain name (if required)
- [ ] Point DNS A records to server IP
- [ ] Provide logo files (PNG, SVG)

### Deliverables
- [ ] Accessible staging URL (HTTPS)
- [ ] Admin login working
- [ ] Health checks green
- [ ] Client has verified access from their network

### Risks
| Risk | Mitigation |
|---|---|
| DNS propagation delay | Start DNS change Day 1 of Week 1 |
| Client server access delay | Use Capital Lab cloud as backup |
| SSL certificate failure | Verify DNS first; have manual cert as fallback |

---

## Week 2 — Master Data and Configuration

**Focus:** Configure the system to reflect the client's actual operations.

### Capital Lab Responsibilities
- [ ] Review and import test catalog (provided by client in Excel template)
- [ ] Configure reference ranges per test
- [ ] Create health packages from client package list
- [ ] Create branch records with all details
- [ ] Create staff accounts with roles
- [ ] Create doctor accounts and configure reviewer/approver assignments
- [ ] Configure insurance providers
- [ ] Configure SMTP (test email send)
- [ ] Configure SMS/WhatsApp (test message send)
- [ ] Upload logo and verify PDF report appearance

### Client Responsibilities
- [ ] Provide test catalog (Excel template provided by Capital Lab)
- [ ] Provide staff list with roles
- [ ] Provide doctor list with license numbers
- [ ] Provide insurance provider list
- [ ] Review and approve test catalog import
- [ ] Review and approve PDF report sample
- [ ] Provide SMTP credentials (if using own email server)

### Data Templates Required from Client
1. **Test Catalog Template** — Code, Arabic Name, English Name, Category, Price (JD), Sample Type, TAT (hours), Reference Range Low, Reference Range High, Unit
2. **Staff Template** — Full Name (Arabic + English), Email, Mobile, Role, Branch
3. **Doctor Template** — Full Name, Specialization, License Number, Email, Mobile, Branch(es), Is Approver (Y/N)
4. **Insurance Providers** — Provider Name (Arabic + English), Contract Number, Coverage %

### Deliverables
- [ ] All tests in system with correct reference ranges
- [ ] All staff can log in and reach their portal
- [ ] All doctors can log in and see the patient list
- [ ] Test PDF report approved by client
- [ ] Email and SMS sending tested and working

### Risks
| Risk | Mitigation |
|---|---|
| Incomplete test catalog | Provide template + example on Day 1; hard deadline Day 5 |
| Reference ranges not available | Use international defaults; client validates before go-live |
| SMTP configuration blocked | Use Capital Lab shared SMTP as temporary fallback |

---

## Week 3 — Staff Training

**Focus:** Every person who will touch the system is trained, comfortable, and confident.

### Training Schedule (Suggested)

| Day | Audience | Duration | Location |
|---|---|---|---|
| Monday | Reception / Front Desk | 3 hours | Client site |
| Tuesday | Lab Technicians + Phlebotomists | 4 hours | Client site |
| Wednesday | Doctors | 2 hours | Client site or remote |
| Thursday | Branch Admin + Lab Manager | 3 hours | Client site |
| Friday | Owner / Executive | 1.5 hours | Client site or remote |

### Training Agenda — Reception
1. System overview and login
2. Patient registration (new patient)
3. Walk-in patient flow (register → order → barcode)
4. Appointment management (check-in, arrivals)
5. Invoice creation and payment recording (cash, card, insurance)
6. Finding and printing a patient's report

### Training Agenda — Lab Technicians
1. System overview and daily workflow
2. Sample reception and barcode scanning
3. Sample tracking status updates
4. Result entry — manual
5. Result entry — analyzer file upload (CSV demo)
6. QC data entry
7. Flagging and handling critical results
8. Escalation to doctor

### Training Agenda — Doctors
1. Login and patient search
2. Patient timeline walkthrough
3. Reviewing and approving a test result
4. Critical result acknowledgment
5. Adding clinical notes
6. Scheduling a follow-up
7. Approving a PDF report (live demo)

### Training Agenda — Admin / Manager
1. Inventory management (daily stock check)
2. Low stock and expiry alerts
3. Purchase order creation
4. Billing dashboard (invoice pipeline)
5. Insurance claims (submit, track, handle rejection)
6. Notification center
7. Audit log review

### Training Agenda — Owner
1. Revenue dashboard walkthrough
2. Branch performance comparison
3. Executive center (period selector)
4. Understanding KPIs

### Deliverables
- [ ] All staff have completed their training session
- [ ] Training sign-off sheet collected from each group
- [ ] Questions and issues from training documented and resolved
- [ ] User manuals distributed (PDF per role)
- [ ] Support WhatsApp group created with all key staff

### Risks
| Risk | Mitigation |
|---|---|
| Low staff attendance | Schedule well in advance; get manager commitment |
| Staff resistance to change | Start with the most enthusiastic early adopters |
| Training too fast / complex | Provide printed quick-reference cards per role |

---

## Week 4 — Pilot (Parallel Run)

**Focus:** Run Capital Lab alongside the existing system with real patients. Identify and fix gaps before full cutover.

### Pilot Process
1. Both systems running simultaneously (Capital Lab + existing paper/system)
2. Every patient registered and processed in Capital Lab
3. Paper backup maintained as safety net
4. Capital Lab team available for real-time support during each shift
5. Daily debrief call with client lab manager

### What to Test in Pilot
- [ ] Full workflow for at least 50 real patients
- [ ] At least 1 complete insurance case
- [ ] At least 1 critical result alert (trigger manually if needed)
- [ ] At least 1 doctor approval of a result
- [ ] At least 1 patient downloading their PDF report
- [ ] At least 1 patient receiving WhatsApp notification
- [ ] Inventory deduction from actual samples processed
- [ ] Payment recording for cash, card, and insurance

### Issues to Track
Maintain a shared issues log (WhatsApp or Google Sheet):
- Issue description
- Severity: Critical / Minor
- Status: Open / In Progress / Resolved
- Resolution and date

**Go/No-Go Criteria:**
- Zero Critical issues open
- All minor issues have planned resolution before go-live
- Client lab manager signs off

### Deliverables
- [ ] 50+ real patients processed through Capital Lab
- [ ] Issues log with all items resolved or planned
- [ ] Go/No-Go sign-off from client and Capital Lab

---

## Week 5 — Go-Live

**Focus:** Complete cutover to Capital Lab as the sole operating system.

### Go-Live Day Checklist
- [ ] Confirm all staff are present or on standby
- [ ] Capital Lab team on-site or available from 7AM
- [ ] Paper backup templates printed as emergency fallback (first 2 days only)
- [ ] All open issues from pilot resolved
- [ ] WhatsApp support channel active
- [ ] First patient of the day processed in Capital Lab — success confirmed

### Cutover Activities
- [ ] All historical data that will be migrated is imported (if applicable)
- [ ] Old system officially decommissioned (or in read-only mode)
- [ ] New system designated as sole source of truth
- [ ] All printers configured (barcodes, invoices, if needed)
- [ ] Branch screens/displays showing live queue (if configured)

### Hypercare Period (30 Days)
- Daily check-in call: Week 5
- Every-other-day call: Weeks 6–7
- Weekly call: Weeks 8–9
- Monthly review: Month 3

### Deliverables
- [ ] Go-live confirmed in writing by client director
- [ ] All staff processing real patients on Capital Lab
- [ ] First week report generated and reviewed

---

## 90-Day Stabilization

### Month 2 Activities
- [ ] Review first month of operational data
- [ ] Identify any workflow adjustments needed
- [ ] Confirm all staff trained (catch any new hires)
- [ ] Review notification delivery rates
- [ ] Review insurance claim approval rates
- [ ] Adjust inventory minimum stock levels based on real consumption

### Month 3 Activities
- [ ] Full performance review meeting
- [ ] ROI measurement vs. proposal estimate
- [ ] Feature requests collected for next release
- [ ] Renewal discussion (if on 12-month contract)
- [ ] Client testimonial / case study opportunity

---

## Implementation Team Contacts

| Role | Name | Contact |
|---|---|---|
| Capital Lab Implementation Manager | [NAME] | [EMAIL / WHATSAPP] |
| Capital Lab Technical Lead | [NAME] | [EMAIL] |
| Capital Lab Trainer | [NAME] | [EMAIL] |
| Client Project Lead | [NAME] | [EMAIL / WHATSAPP] |
| Client IT Contact | [NAME] | [EMAIL / PHONE] |
