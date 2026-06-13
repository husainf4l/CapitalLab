# Capital Lab — Doctor Guide
## Clinical Review Portal · v1.0

---

## Your Role

As a Doctor in Capital Lab, you are responsible for:
- Reviewing test results before they are released to patients
- Approving normal results and flagging abnormal ones
- Acknowledging and managing critical results
- Adding clinical notes and interpretation
- Scheduling follow-up tests

Your approval is the final step before a patient sees their results.

---

## 1. Login

1. Go to the Capital Lab URL
2. Click **"Login"** with your doctor email and password
3. You are directed to the **Doctor Dashboard**

---

## 2. Doctor Dashboard

**What you see immediately:**
- **Pending Reviews** — Results waiting for your approval
- **Critical Alerts** — Unacknowledged critical values (red banner)
- **Recent Approvals** — Your latest approved reports
- **Patient Count** — Patients you've reviewed this week

**Priority:** Always address Critical Alerts first.

---

## 3. Reviewing Results

### Accessing the Review Queue
1. Click **"Reviews"** in the navigation
2. You see all results flagged for your review
3. Filter by branch, date, or test category

### Reviewing a Result
1. Click on a patient's result to open the review panel
2. You see:
   - Patient name, age, gender
   - All test results with values and reference ranges
   - Abnormal values highlighted (yellow = outside range, red = critical)
   - Previous results for the same tests (comparison view)
3. Review all values carefully
4. Add a comment if you want to include interpretation in the report (optional)
5. Click **"Approve"** — patient is notified immediately
   OR
   Click **"Hold"** if you need to consult, request a repeat, or investigate further

### What Happens After Approval
- Patient receives a notification (WhatsApp/SMS/Email/In-app)
- Patient can download the PDF report
- Report is permanently stored and accessible
- The approval is logged with your name and timestamp

---

## 4. Critical Results

When a test value exceeds a critical threshold, the system triggers an automatic alert.

### Critical Result Protocol
1. **You receive an alert** — on your dashboard and via notification
2. Open the critical result immediately
3. Review the value and confirm it is a genuine critical reading
4. **Acknowledge the alert:**
   - Click **"Acknowledge"**
   - Enter: "Action taken" (e.g., "Called patient directly at +962XX", "Notified referring doctor", "Patient instructed to go to ER")
   - Click **"Confirm Acknowledgment"**
5. The acknowledgment is logged with your name, time, and action taken

### Common Critical Thresholds (examples)
| Test | Critical Low | Critical High |
|---|---|---|
| Glucose | < 40 mg/dL | > 500 mg/dL |
| Hemoglobin | < 7 g/dL | > 20 g/dL |
| Potassium | < 2.5 mEq/L | > 6.5 mEq/L |
| Sodium | < 120 mEq/L | > 160 mEq/L |
| Creatinine | — | > 10 mg/dL |

*Exact thresholds configured by your lab manager in system settings.*

**Never leave a critical result unacknowledged.**

---

## 5. Patient Timeline

The Patient Timeline gives you a complete longitudinal view of any patient's test history.

### Accessing the Timeline
1. Click **"Patients"** in the navigation
2. Search by patient name, national ID, or phone number
3. Click on the patient to open their timeline

### Timeline View
- All tests ordered, chronologically
- Results for each test with date, values, and reference ranges
- Previous results shown alongside current (trend comparison)
- Any critical events highlighted

### Clinical Notes
You can add clinical notes to any result or patient record:
1. Open the patient timeline
2. Click **"Add Note"** next to any result
3. Type your note (e.g., "Consistent with hypothyroidism; recommended follow-up in 3 months")
4. Click **"Save Note"**
5. Note appears on the patient's timeline and optionally on the printed report

---

## 6. Follow-Up Scheduling

If a patient needs a follow-up test:

1. Open the patient's timeline
2. Click **"Schedule Follow-Up"**
3. Enter:
   - Test(s) to follow up
   - Recommended date range (e.g., "3 months", specific date)
   - Note for the patient (e.g., "Please fast 12 hours before your next HbA1c test")
4. Click **"Schedule"**
5. Patient receives a notification about their follow-up
6. The follow-up appears in the patient's appointment dashboard

---

## 7. Your Analytics

The **Doctor Analytics** section shows your performance:
- Number of results reviewed this week/month
- Average review time
- Critical results acknowledged
- Patients reviewed
- Reports approved

---

## 8. Best Practices

- **Review pending results daily** — ideally twice per day (morning and afternoon)
- **Critical alerts = immediate response** — acknowledge within 30 minutes of the alert
- **Add notes for complex cases** — notes help the patient and any other reviewing doctor
- **Use comparison view** — always check if the value is a change from previous results
- **If holding a result** — add a note explaining why, and resolve within 24 hours

---

## 9. Troubleshooting

| Problem | Solution |
|---|---|
| No results in my review queue | Check branch filter; confirm you are assigned as reviewer |
| Critical alert but value seems normal | Verify analyzer calibration with lab manager; check reference range settings |
| Patient not found in search | Try national ID; try partial name |
| Cannot approve result | Check if all required fields are complete; contact lab manager |

---

**Escalate to Lab Manager if:** QC was flagged for that day's run and results may be affected, analyzer malfunction suspected, or you are uncertain about a test methodology.
