# Capital Lab — Lab Onboarding Checklist
## Complete before Go-Live · v1.0

Client: _______________________
Branch(es): ___________________
Account Manager: ______________
Target Go-Live: _______________

---

## SECTION 1 — BUSINESS INFORMATION

### Branches
- [ ] Branch names confirmed (Arabic and English)
- [ ] Branch addresses entered
- [ ] Branch phone numbers entered
- [ ] Branch opening hours configured
- [ ] Main branch designated
- [ ] Branch GPS coordinates (for patient-facing map)
- [ ] Branch-specific email addresses

### Staff Accounts
- [ ] Staff list provided (name, email, mobile, role)
- [ ] Roles assigned: Receptionist / LabTechnician / LabManager / Phlebotomist / HomeCollector / BranchAdmin
- [ ] Branch assignments confirmed
- [ ] Login credentials sent to each staff member
- [ ] Staff can log in and access their portal
- [ ] Staff profiles complete (employee code, department, job title, hire date)

### Doctors
- [ ] Doctor list provided (name, specialization, license number, mobile, email)
- [ ] Branch assignments confirmed (which doctors cover which branches)
- [ ] Reviewer vs. Approver roles assigned
- [ ] Doctor portal access tested
- [ ] Doctors can view, review, and approve test results

### Owner / Management
- [ ] Owner email and phone configured
- [ ] Owner portal access tested (revenue, branches, executive center)
- [ ] Admin operations access tested

---

## SECTION 2 — OPERATIONAL SETUP

### Test Catalog
- [ ] Test list provided in Excel (Code, Arabic Name, English Name, Category, Price, Currency)
- [ ] Reference ranges provided (low/high, units, by age group and gender)
- [ ] Sample types specified per test (Blood, Urine, Stool, Swab, etc.)
- [ ] TAT (turnaround time) specified per test
- [ ] All tests imported and verified in system

### Health Packages
- [ ] Package list provided (name, tests included, price)
- [ ] Packages created in system
- [ ] Package pricing verified

### Inventory Items
- [ ] Reagent list provided (name, unit, current stock, reorder level)
- [ ] Consumables list provided (tubes, containers, swabs)
- [ ] Expiry dates entered for current stock
- [ ] Minimum stock alert levels configured per branch
- [ ] Supplier information entered (name, contact, lead time)

---

## SECTION 3 — TECHNICAL SETUP

### Domain and Hosting
- [ ] Hosting decision made: Capital Lab Cloud / Client Server
- [ ] Domain name decided (e.g., app.labname.jo or portal.labname.com)
- [ ] DNS A records configured
- [ ] DNS propagation verified
- [ ] SSL certificate obtained
- [ ] HTTPS working on both frontend and API

### Email Configuration
- [ ] SMTP provider selected (Mailgun / SendGrid / host email)
- [ ] SMTP credentials tested
- [ ] Test email sent successfully from system
- [ ] From name configured: "[Lab Name] Notifications"
- [ ] From email configured: notifications@labname.jo

### SMS Configuration
- [ ] SMS provider selected (Unifonic / Twilio / Clicksend)
- [ ] SMS API key entered in settings
- [ ] Test SMS sent to staff mobile
- [ ] Arabic SMS templates reviewed

### WhatsApp Configuration
- [ ] WhatsApp Business API access obtained
- [ ] WhatsApp API credentials entered
- [ ] Test WhatsApp message sent and received
- [ ] Message templates approved by Meta (for broadcast)

### Branding
- [ ] Lab logo uploaded (PNG, minimum 200x200px, transparent background)
- [ ] Logo appears correctly on PDF reports
- [ ] PDF report reviewed and approved by lab manager
- [ ] Page title shows lab name (or Capital Lab if white-label not requested)

---

## SECTION 4 — INSURANCE SETUP

- [ ] Insurance provider list provided (all accepted insurance companies)
- [ ] Insurance providers entered in system
- [ ] Insurance codes / provider IDs entered
- [ ] Sample insurance claim created and reviewed
- [ ] Staff know how to enter insurance patient details at reception

---

## SECTION 5 — TRAINING COMPLETED

### Reception / Front Desk
- [ ] Login and navigation
- [ ] Registering a walk-in patient
- [ ] Booking an appointment
- [ ] Checking in an arrival
- [ ] Creating an order
- [ ] Processing payment (cash, card, insurance)
- [ ] Printing barcode label
- [ ] Generating and printing invoice

### Lab Technicians
- [ ] Login and navigation
- [ ] Processing a sample (scanning barcode)
- [ ] Entering test results
- [ ] Flagging abnormal results
- [ ] QC data entry
- [ ] Uploading analyzer file (CSV/HL7/ASTM)
- [ ] Handling sample rejection

### Doctors
- [ ] Login and patient search
- [ ] Reviewing pending results
- [ ] Approving a report
- [ ] Adding clinical notes
- [ ] Acknowledging a critical result
- [ ] Scheduling a follow-up

### Branch Admin / Manager
- [ ] Staff management
- [ ] Inventory checks and low stock alerts
- [ ] Billing and payment reports
- [ ] Insurance claim submission
- [ ] Audit log review
- [ ] System settings

### Owner
- [ ] Revenue dashboard navigation
- [ ] Branch performance comparison
- [ ] Executive center (period selector, KPIs)
- [ ] Exporting reports

---

## SECTION 6 — GO-LIVE READINESS

### Pre-Launch Validation
- [ ] At least 5 test patients onboarded and full workflow tested end-to-end
- [ ] Booking → Sample → Result → Doctor Approval → PDF tested
- [ ] PDF report reviewed by lab director and approved
- [ ] Payment flow tested (cash and one insurance claim)
- [ ] WhatsApp notification received by test patient
- [ ] Critical result alert tested and acknowledged
- [ ] All staff have logged in at least once
- [ ] Demo reset complete (test patient data cleaned before go-live)

### Go-Live Day
- [ ] Go-live date communicated to all staff
- [ ] Capital Lab support channel active (WhatsApp group created)
- [ ] Account manager on standby for launch day
- [ ] IT contact for client on standby
- [ ] Fallback plan documented (paper backup if needed on day 1)

### First Week Post-Launch
- [ ] Daily check-in with Capital Lab account manager
- [ ] Issues log maintained and resolved within SLA
- [ ] Staff feedback collected
- [ ] Any missing test configurations addressed
- [ ] Week 1 review call completed

---

*Onboarding is considered complete when all checked items above are ✅ and the first full week of production data is in the system without critical issues.*
