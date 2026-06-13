# Capital Lab — Client Demo Script

**Version:** v0.1.0-staging | **Duration:** ~45 minutes

---

## Before You Start

- Log in as `owner@capitallab.demo` / `Demo@123456` in one browser tab
- Open a second tab as `patient@capitallab.demo` / `Demo@123456`
- Have a third tab ready for the doctor portal
- Ensure staging URL is open: `https://app.capitallab.demo`

---

## Part 1 — Public Website (5 min)

**Route:** `https://app.capitallab.demo`

### Step 1.1 — Homepage
- **Click:** Scroll through homepage sections
- **Say:** "This is what patients see before logging in — a professional landing page with branch locations, test packages, and real-time availability."
- **Highlight:** The hero section, the service cards, the branch locator

### Step 1.2 — Test Search
- **Click:** "Tests" in navigation or the search bar
- **Say:** "Patients can search for any test by name, code, or category. Prices are shown upfront — no surprises."
- **Highlight:** Search autocomplete, price transparency, Arabic/English toggle

### Step 1.3 — Packages
- **Click:** "Packages"
- **Say:** "We offer bundled health packages — annual checkup, women's health, diabetes panel — all pre-configured by the lab."
- **Highlight:** Package inclusions, pricing

---

## Part 2 — Patient Portal (10 min)

**Login:** `patient@capitallab.demo`

### Step 2.1 — Patient Dashboard
- **Click:** Login → redirects to `/patient/dashboard`
- **Say:** "After logging in, the patient sees their personalized dashboard — upcoming appointments, recent results, and health trend summary."
- **Highlight:** Next appointment card, recent results count, notification badge

### Step 2.2 — Book an Appointment
- **Click:** "Book New Test" or `/patient/book`
- **Say:** "The booking wizard guides patients in 6 steps — select tests, choose branch, pick date/time, add family members if needed, confirm. It takes under 2 minutes."
- **Walk through:** Step 1 (test search) → Step 2 (select branch from map) → Step 3 (pick date/time) → confirm
- **Highlight:** Real-time slot availability, branch map, Arabic name input

### Step 2.3 — Results & Health Tracker
- **Click:** `/patient/results`
- **Say:** "All previous results are here, with PDF download for any report. The QR code on the PDF lets anyone verify its authenticity without logging in."
- **Highlight:** One result with abnormal markers highlighted in red, PDF download button

- **Click:** `/patient/health-tracker`
- **Say:** "The health tracker shows trends over time — glucose, hemoglobin, cholesterol — as a chart. Patients understand their health journey, not just individual numbers."
- **Highlight:** Trend line, date range selector

---

## Part 3 — Lab Operations (10 min)

**Login:** `technician@capitallab.demo` → `/lab`

### Step 3.1 — Lab Overview
- **Say:** "The lab dashboard shows today's stats — pending samples, completed tests, critical alerts. Everything the morning shift needs at a glance."
- **Highlight:** Today's count cards, critical result badge

### Step 3.2 — Appointments Queue
- **Click:** `/lab/appointments`
- **Say:** "As patients check in, appointments are confirmed here. The receptionist sees today's queue, can check in walk-ins, and assign collection slots."
- **Highlight:** Status pipeline (Scheduled → Confirmed → Arrived → Completed)

### Step 3.3 — Sample Workflow
- **Click:** `/lab/barcode`
- **Say:** "Each sample gets a unique barcode. The lab technician scans it to instantly pull up the patient, tests ordered, and storage location. Zero paper."
- **Highlight:** Barcode search, sample details panel

- **Click:** `/lab/samples`
- **Say:** "Sample tracking shows the full chain of custody — collected, received, processing, completed. Timestamps on every step."
- **Highlight:** Sample status column, received/processing/completed breakdown

### Step 3.4 — Result Entry & QC
- **Click:** `/lab/qc`
- **Say:** "Quality control results are logged here, compared against Westgard rules automatically. Any QC failure is flagged before patient results are released."

- **Click:** `/lab/results-entry`
- **Say:** "Results are entered directly, or imported from analyzer machines in CSV, HL7, or ASTM format. Reference ranges are validated automatically — abnormal values are flagged."
- **Highlight:** Abnormal value displayed in red, normal ranges shown inline

---

## Part 4 — Doctor Portal (5 min)

**Login:** `doctor@capitallab.demo` → `/doctor`

### Step 4.1 — Patient Timeline
- **Click:** `/doctor/patients` → search a patient name
- **Say:** "Doctors see every test in a patient's history, chronologically. Click any report to see the full results, add clinical notes, and track follow-ups."
- **Highlight:** Timeline view, clinical notes panel, follow-up scheduler

### Step 4.2 — Critical Results
- **Click:** `/doctor/critical-results`
- **Say:** "Any result outside critical thresholds triggers an immediate alert here. The doctor can acknowledge, add a note, and mark it as communicated to the patient — full audit trail."
- **Highlight:** Critical value badge (red), acknowledge button, audit log entry

### Step 4.3 — Report Review & Release
- **Click:** `/doctor/reviews`
- **Say:** "Reports need doctor approval before release. The doctor reviews all flagged results, adds commentary, then approves. The patient is instantly notified."
- **Highlight:** Approve button, notification triggered, PDF generation

---

## Part 5 — Admin Operations (5 min)

**Login:** `branchadmin@capitallab.demo` → `/admin`

### Step 5.1 — Inventory
- **Click:** `/admin/inventory`
- **Say:** "Reagent and supply inventory with expiry tracking. Low stock and near-expiry items are highlighted — no more running out of tubes mid-day."
- **Highlight:** Low stock badge, expiry date warnings

### Step 5.2 — Billing & Insurance
- **Click:** `/admin/billing`
- **Say:** "All orders generate invoices automatically. Multiple payment methods, partial payments, insurance claims — all tracked here."
- **Highlight:** Invoice statuses (Issued, Paid, Partially Paid), insurance claims column

- **Click:** `/admin/insurance`
- **Say:** "Insurance claims are submitted digitally and tracked by status — Submitted, Under Review, Approved, Rejected. Rejection reasons are logged for appeal."
- **Highlight:** Claim status pipeline

---

## Part 6 — Owner Analytics (5 min)

**Login:** `owner@capitallab.demo` → `/owner`

### Step 6.1 — Revenue Overview
- **Click:** `/owner/revenue`
- **Say:** "The owner sees consolidated revenue across all branches, with daily/weekly/monthly breakdowns, payment method split, and insurance vs. self-pay ratio."
- **Highlight:** Revenue trend chart, branch comparison table

### Step 6.2 — Branch Performance
- **Click:** `/owner/branches`
- **Say:** "Each branch has its own performance card — samples per day, revenue, utilization rate. Underperforming branches are visible at a glance."
- **Highlight:** Branch ranking, utilization percentage

### Step 6.3 — Executive Center
- **Click:** `/owner/executive`
- **Say:** "The executive center consolidates the KPIs that matter for a board meeting — total revenue, growth percentage, active patients, branch rankings — updated in real time."
- **Highlight:** Revenue growth percentage (green/red), branch ranking table, revenue trend bars

---

## Part 7 — Key Differentiators (Close)

Summarize for the client:

1. **End-to-end** — booking to PDF report, all in one system
2. **Bilingual** — Arabic and English throughout, including patient-facing reports
3. **Analyzer integration** — HL7, ASTM, CSV import from any analyzer brand
4. **Mobile-ready** — patient portal works perfectly on mobile
5. **Compliance** — full audit trail on every action, doctor approval required
6. **PDF reports** — professional branded reports with QR verification
7. **Open architecture** — clean API, can integrate with any insurance portal, HIS, or government system

---

## Fallback Demo (if staging is down)

Use screenshots in `docs/demo-screenshots/` for offline presentation. Key screens:
- Homepage
- Patient dashboard
- Sample barcode scan
- Critical result alert
- Owner revenue chart

---

## Common Client Questions

| Question | Answer |
|---|---|
| "Can we customize the PDF report layout?" | Yes — logo, colors, header, footer, QR placement are all configurable |
| "Does it support insurance pre-authorization?" | Insurance claim submission is built-in; pre-auth workflow can be added |
| "Can it connect to our existing HIS?" | Yes — REST API + HL7 support; custom integration available |
| "Is data stored in Jordan?" | Deployment is on your infrastructure; we recommend Zain/Orange cloud or on-premise |
| "What about patient data privacy?" | Full HIPAA-aligned controls, encrypted at rest and in transit, audit trail on every access |
