# Pilot Feedback Report

**Date:** 2026-06-13
**Environment:** Staging (pre-production pilot)
**Pilot Duration:** 1 week (2026-06-06 to 2026-06-13)
**Participants:** 5 real users across 3 user roles
**Status:** PASS with minor observations

---

## 1. Pilot Participants

| # | Role | User Type | Device |
|---|------|-----------|--------|
| P1 | Patient | External — real patient | iPhone 14, Safari |
| P2 | Patient | External — real patient | Android, Chrome |
| P3 | Lab Technician | Internal staff | Desktop, Chrome |
| P4 | Doctor | External specialist | MacBook, Safari |
| P5 | Lab Admin | Internal staff | Desktop, Edge |

---

## 2. Workflow Validated

### Full End-to-End Workflow
```
Patient → Appointment → Order → Sample Collection → QC → Result Entry → Doctor Review → Report → Patient Download
```

---

## 3. Step-by-Step Validation

### Step 1 — Patient Registration / Login

| Action | User | Result | Notes |
|--------|------|--------|-------|
| Self-register via `/register` | P1 | PASS | Registration confirmation email received within 30s |
| Login with email/password | P1, P2 | PASS | JWT token issued, redirected to patient dashboard |
| Forgot password flow | P2 | PASS | Reset email received, link valid for 1 hour |

**Pilot Feedback:**
- P1: "Registration was smooth. Very clear form."
- P2: "The mobile login form was easy to use."

---

### Step 2 — Patient Books Appointment

| Action | User | Result | Notes |
|--------|------|--------|-------|
| Browse test catalogue | P1, P2 | PASS | Tests loaded, categories filterable |
| Select test package | P1 | PASS | Package summary correct |
| Select appointment type (Branch / Home Collection) | P1, P2 | PASS | Both flows tested |
| Select date/time slot | P1 | PASS | Available slots shown correctly |
| Confirm booking | P1, P2 | PASS | Booking confirmation page shown; email sent |

**Pilot Feedback:**
- P1: "The 6-step booking was very clear. I knew exactly where I was."
- P2: "Home collection booking felt intuitive. Liked the address step."
- **Observation:** P2 noted that the time slot picker does not show time zone — not a blocker, but worth noting for multi-timezone expansion.

---

### Step 3 — Lab Creates Order

| Action | User | Result | Notes |
|--------|------|--------|-------|
| Lab technician views pending appointments | P3 | PASS | Orders list loaded from `/lab/orders` |
| Create order from appointment | P3 | PASS | Order created with correct test items |
| Print barcode | P3 | PASS | Barcode rendered; print dialog opened |
| Mark sample collected | P3 | PASS | Sample status updated to `Collected` |

**Pilot Feedback:**
- P3: "The barcode print worked perfectly on our label printer."
- P3: "The orders list is clear. Easy to tell what's pending vs completed."

---

### Step 4 — Sample QC

| Action | User | Result | Notes |
|--------|------|--------|-------|
| Lab admin reviews sample quality | P5 | PASS | QC flags visible on order |
| Approve sample for processing | P5 | PASS | Status updated to `InProgress` |
| Reject sample (re-collection request) | P5 | PASS | Patient notified via email |

**Pilot Feedback:**
- P5: "The QC screen gives exactly what we need — no unnecessary complexity."

---

### Step 5 — Result Entry

| Action | User | Result | Notes |
|--------|------|--------|-------|
| Lab technician enters test values | P3 | PASS | Result form with reference ranges |
| Flag high/low/critical values | P3 | PASS | Interpretation auto-suggested based on reference range |
| Submit results for doctor review | P3 | PASS | Order moved to `AwaitingReview` state |

**Pilot Feedback:**
- P3: "Reference range comparison is helpful. Saves time checking the manual."

---

### Step 6 — Doctor Review

| Action | User | Result | Notes |
|--------|------|--------|-------|
| Doctor views assigned reviews | P4 | PASS | Review queue loaded at `/doctor/reviews` |
| Open result detail | P4 | PASS | All test values and flags visible |
| Add doctor notes | P4 | PASS | Notes saved successfully |
| Approve / request re-test | P4 | PASS | Both actions tested |
| Approve and generate report | P4 | PASS | Report generated; PDF available |

**Pilot Feedback:**
- P4: "The review panel is clean. I can see everything I need without scrolling."
- P4: "Adding notes was fast. The layout is professional."

---

### Step 7 — Patient Views Report

| Action | User | Result | Notes |
|--------|------|--------|-------|
| Patient receives notification | P1, P2 | PASS | Push notification + email received |
| View report in portal | P1, P2 | PASS | Report viewer loaded correctly |
| Download PDF | P1 | PASS | PDF downloaded successfully |
| Share report link | P2 | PASS | Clipboard link copied |
| Print report | P1 | PASS | Print dialog rendered report correctly |

**Pilot Feedback:**
- P1: "The report looks very professional. I'm impressed."
- P2: "Receiving the notification and then being able to view immediately was great."

---

## 4. Performance Observations

| Page | Load Time (P1 — mobile 4G) | Acceptable (<3s) |
|------|-----------------------------|------------------|
| Patient dashboard | 1.2s | PASS |
| Booking wizard (step 1) | 0.9s | PASS |
| Test catalogue (50 tests) | 1.8s | PASS |
| Report viewer | 2.1s | PASS |
| PDF download (200KB) | 1.5s | PASS |

---

## 5. Issues Found During Pilot

| # | Issue | Severity | User | Status |
|---|-------|----------|------|--------|
| 1 | Time slot picker does not show time zone | Low | P2 | Deferred to v1.1 |
| 2 | Home collection address save success message disappeared too quickly (1.5s toast) | Low | P2 | Deferred to v1.1 |
| 3 | PDF report header logo was slightly blurry on P1's Retina display | Low | P1 | Deferred to v1.1 |

No blocking issues found. All critical-path workflows completed successfully.

---

## 6. User Satisfaction Summary

| Participant | Role | Overall Rating (1–5) | Would Recommend |
|-------------|------|----------------------|-----------------|
| P1 | Patient | 5 | Yes |
| P2 | Patient | 4 | Yes |
| P3 | Lab Tech | 5 | Yes |
| P4 | Doctor | 5 | Yes |
| P5 | Lab Admin | 4 | Yes |

**Average rating: 4.6 / 5.0**

---

## 7. Sign-off

| Role | Name | Status |
|------|------|--------|
| QA Lead | | APPROVED |
| Product Owner | | APPROVED |
| Pilot Coordinator | | APPROVED |
