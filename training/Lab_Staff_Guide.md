# Capital Lab — Lab Staff Guide
## Lab Technicians, Phlebotomists, and Lab Managers · v1.0

---

## Your Role

Lab staff in Capital Lab are responsible for:
- Receiving and processing samples
- Tracking sample status through the workflow
- Entering test results
- Managing QC
- Uploading analyzer data
- Escalating critical results to doctors

---

## 1. Login and Navigation

1. Go to the Capital Lab URL → **"Login"**
2. Enter your staff email and password
3. You are directed to the **Lab Dashboard**

**Lab Dashboard sections:**
- **Overview** — Today's stats: samples, pending, completed, critical alerts
- **Appointments** — Today's scheduled patients
- **Samples** — All samples and their status
- **Barcode** — Barcode scan/lookup
- **QC** — Quality control entry
- **Results Entry** — Enter test results
- **Doctor Review** — Results pending doctor approval

---

## 2. Daily Morning Routine

**Every morning:**
1. Check the **Overview** dashboard — note any pending critical alerts
2. Review today's appointment list
3. Confirm QC is logged for the day's runs (before any patient samples)
4. Check **Samples** board for any carry-over from previous day

---

## 3. Receiving a Sample

When a sample arrives at the lab bench:

1. Click **"Barcode"** in the navigation
2. Scan the barcode on the sample tube (or type the barcode number)
3. System shows: patient name, tests ordered, collection time, branch
4. Verify the label matches the physical sample
5. Click **"Mark Received"** — status changes from "Collected" to "Received"
6. Sort sample to correct analyzer or bench section

**If label is damaged or missing:** Do not process. Log a sample rejection (see Section 9).

---

## 4. Sample Status Tracking

Every sample moves through these statuses:

| Status | Meaning | Action |
|---|---|---|
| **Registered** | Order created, sample not yet collected | Reception registered the order |
| **Collected** | Sample collected from patient | Phlebotomist marked as collected |
| **Received** | Sample received at the lab bench | You mark as Received |
| **Processing** | Sample being analyzed | You mark as Processing |
| **Completed** | Results entered; awaiting doctor review | You mark as Completed |
| **Released** | Doctor approved; patient notified | Doctor action |

**To update status:**
1. Find the sample (via Barcode scan or Samples list)
2. Click the current status button → select the new status
3. Status change is logged automatically with your name and timestamp

---

## 5. Entering Test Results

### Manual Result Entry

1. Go to **Results Entry**
2. Find the order (search by patient name, order number, or barcode)
3. For each test in the order, enter the result value
4. System automatically checks against the reference range
5. **Red flag** = critical value (outside critical threshold)
6. **Yellow flag** = abnormal value (outside reference range but not critical)
7. After entering all results, click **"Complete Results"**
8. Doctor is automatically notified for review

**Important:**
- Enter results exactly as shown on the analyzer printout
- Do not round values unless the test protocol specifies rounding
- If you are unsure of a value, leave it blank and ask the lab manager

---

## 6. Analyzer File Upload

Instead of manual entry, you can upload results directly from your analyzer:

1. Go to **Analyzers** → **Import Data**
2. Select the analyzer from the dropdown (must be registered by the admin)
3. Select the file format:
   - **CSV** — from any analyzer with export
   - **HL7** — from Beckman, Siemens, and others
   - **ASTM** — from Mindray, Sysmex, Abbott
   - **XML** — from Roche, bioMérieux
4. Paste or upload the file content
5. Click **"Import"**
6. Review the import result: X processed, Y failed
7. Any failed rows show the reason (patient not found, test not matched, etc.)
8. Handle failed rows manually or escalate to the manager

---

## 7. Quality Control (QC)

QC must be logged before patient results are released.

### Entering QC Data

1. Go to **Lab QC**
2. Select the QC lot number
3. Enter the QC result value
4. System checks against Westgard rules automatically
5. If rules are violated → **QC FAIL** shown in red
   - Do not release patient results until QC issue is resolved
   - Log the corrective action taken
   - Re-run QC after corrective action
6. If QC passes → proceed with patient result release

**Westgard Rules checked automatically:**
- 1₂s — Warning: one control outside 2SD
- 1₃s — Reject: one control outside 3SD
- 2₂s — Reject: two consecutive controls outside 2SD (same side)
- R₄s — Reject: range of controls exceeds 4SD
- 4₁s — Reject: four consecutive controls on one side of mean

---

## 8. Critical Results

When a test result exceeds the critical threshold, the system automatically:
1. Flags the result in **red** with "CRITICAL" label
2. Sends an alert to the assigned doctor
3. Logs the critical event in the audit trail

### Your Responsibility
1. When you see a critical flag, **do not wait** — confirm the result first
   - If you can repeat the test immediately, do so to confirm
   - If the critical value is confirmed, it has already been sent to the doctor
2. Document what you did in the results notes field
3. If the doctor has not acknowledged within [X] minutes, notify your lab manager

---

## 9. Sample Rejection

If a sample must be rejected (clotted, hemolyzed, insufficient volume, wrong tube, unlabeled):

1. Find the sample in the **Samples** list
2. Click **"Reject Sample"**
3. Select the rejection reason:
   - Unlabeled / label damaged
   - Insufficient volume
   - Hemolyzed
   - Clotted
   - Wrong tube type
   - Temperature breach
4. System notifies reception to arrange re-collection
5. Patient is informed automatically

---

## 10. Home Collection Samples

For samples collected at the patient's home by a phlebotomist:
1. Phlebotomist marks sample as "Collected" in the app with GPS timestamp
2. Sample is transported and received at the lab
3. You receive it in the lab by scanning the barcode
4. Continue normal processing from Step 4 (marking as Received)

---

## 11. Best Practices

- **QC first, patient samples second** — every morning without exception
- **Never skip barcode scanning** — always confirm the sample identity digitally
- **Critical results = immediate action** — never leave a critical flag unacknowledged
- **Log every status change** — the system does this automatically when you click the button
- **If unsure about a result** — ask the lab manager before entering

---

## 12. Troubleshooting

| Problem | Solution |
|---|---|
| Barcode scan not working | Check barcode scanner USB connection; try manual entry |
| Test not found in result entry | Search by order number; check if test was ordered; contact reception |
| Analyzer file import fails | Check file format; verify analyzer is registered; try copy-paste method |
| QC shows fail when it should pass | Verify you selected the correct QC lot; recalculate; escalate to manager |
| Cannot mark sample status | Check you are on the correct branch; check your role permissions |

---

**Escalate to Lab Manager if:** QC fails twice, critical results are not acknowledged by doctor, unusual sample volumes, system is slow or unresponsive.
