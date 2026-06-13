# Capital Lab — Demo Environment Guide
## Running a Successful Client Demo · v1.0

---

## Demo Accounts

| Role | Email | Password | What they see |
|---|---|---|---|
| **Patient** | demo.patient@capitallab.demo | Demo@2026 | Patient portal, booking, results, health tracker |
| **Reception** | demo.reception@capitallab.demo | Demo@2026 | Walk-in registration, appointment check-in, billing |
| **Lab Tech** | demo.labtech@capitallab.demo | Demo@2026 | Sample queue, result entry, analyzer import |
| **Doctor** | demo.doctor@capitallab.demo | Demo@2026 | Review queue, approve results, critical alerts |
| **Admin** | demo.admin@capitallab.demo | Demo@2026 | Inventory, billing, insurance, audit, settings |
| **Owner** | demo.owner@capitallab.demo | Demo@2026 | Revenue, branches, executive dashboard |

---

## Demo Environment URL

| Service | URL |
|---|---|
| Frontend | https://app.capitallab.demo |
| API | https://api.capitallab.demo |
| System Health | https://app.capitallab.demo/admin/system-health |

---

## Demo Data

The demo environment is pre-loaded with realistic Jordanian lab data:

- **10 branches:** Abdali, Mecca Street, Khalda, Sweifieh, Irbid Main, Bayader, Zarqa, Jubeiha, Gardens, Aqaba
- **50 patients** with Jordanian names, national ID numbers, and medical histories
- **8 doctors** across specializations: Clinical Pathology, Hematology, Biochemistry, Microbiology, Immunology, Genetics, Anatomical Pathology, Lab Medicine
- **6 insurance providers:** Jordan Insurance, Islamic Arab Insurance, Arab Orient, Middle East Insurance, Al-Nisr Al-Arabi, AXA Jordan
- **60 days of historical transactions:** appointments, results, invoices, payments
- **Sample results** across all lab test categories

---

## Demo Flows by Audience

### Flow 1: For a Lab Director (Owner/Management Focus)

**Duration:** 12 minutes

**Login as:** demo.owner@capitallab.demo

1. **Overview Dashboard** (`/owner`) — Show KPI cards: revenue, samples, patients
2. **Revenue Analytics** (`/owner/revenue`) — Select 30-day period, show branch breakdown
3. **Executive Center** (`/owner/executive`) — Show branch rankings table and bar chart
   - *Talking point: "This is what your Monday morning looks like — before you have your first coffee"*
4. **Branch Comparison** — Show which branches are performing, which need attention
5. **Insurance Portfolio** — Show claim volume and outstanding balance

---

### Flow 2: For a Lab Operations Manager (Admin Focus)

**Duration:** 15 minutes

**Login as:** demo.admin@capitallab.demo

1. **Inventory** (`/admin/inventory`) — Show stock levels, low stock alerts, expiry warnings
2. **Insurance Claims** (`/admin/insurance`) — Show pending/rejected claims, rejection reason drill-down
3. **Audit Center** (`/admin/audit`) — Filter by entity type, show old/new diff for a changed invoice
4. **Analyzer Import** (`/admin/analyzers`) — Show import form, select HL7 format
   - *Talking point: "Your tech doesn't type the results anymore — the analyzer sends them directly"*
5. **System Health** (`/admin/system-health`) — Show all services green

---

### Flow 3: For a Frontline Staff Member (Patient Flow Focus)

**Duration:** 10 minutes

**Start as:** demo.reception@capitallab.demo, then switch to demo.labtech, then demo.doctor

1. **Reception:** Check in a patient, collect payment, confirm order
2. **Lab Tech:** Receive sample in queue, enter results (or import from analyzer)
3. **Doctor:** Review result in review queue, approve — trigger WhatsApp notification
4. **Switch to patient view:** demo.patient@capitallab.demo — show WhatsApp alert arriving, open patient portal, download QR-verified PDF
   - *Talking point: "From sample to patient notification — that entire chain just happened in front of you"*

---

### Flow 4: For a Patient Experience Story (Patient-First Pitch)

**Duration:** 8 minutes

**Login as:** demo.patient@capitallab.demo

1. **Book appointment** (`/patient/book`) — Walk through the 6-step booking wizard
2. **Health Tracker** (`/patient/health`) — Show trend charts for CBC and metabolic tests
3. **Notifications** (`/patient/notifications`) — Show result ready alerts
4. **Download PDF** — Show branded QR-verified PDF report
   - *Talking point: "Your patients expect this. Their bank does it. Their pharmacy does it. Now their lab does it too"*

---

## Resetting Demo Data

To restore the demo environment to a clean state before a new client demo:

```bash
# SSH into the staging server
ssh deploy@[server-ip]
cd /srv/capitallab

# Reseed demo data (keeps accounts, resets transactions)
./scripts/deploy-staging.sh --seed-demo
```

**Time to reset:** approximately 2–3 minutes.

**What reset does:**
- Clears all appointments, orders, results, invoices
- Recreates patients, doctors, branches with fresh data
- Keeps demo user accounts and passwords unchanged

---

## Pre-Demo Checklist

Run through this before every client demo:

- [ ] Staging server is running: `curl -f https://api.capitallab.demo/health/live`
- [ ] All demo account passwords are correct (test login)
- [ ] Demo data has been reset (no previous demo's data visible)
- [ ] Browser is open in a clean session (incognito recommended)
- [ ] You know which demo flow matches this client's focus
- [ ] Mobile view is ready (if showing patient portal on phone)
- [ ] SSL certificate is valid (check for browser padlock)

---

## Common Demo Questions and Answers

**Q: Can it integrate with our existing accounting software?**
A: Capital Lab has a full billing API. Integration with QuickBooks, Sage, or custom ERP is straightforward via the API. For Jordan-specific systems, we've done custom integrations before.

**Q: Does it work in Arabic?**
A: The interface, the reports, the patient portal, and all notifications are fully bilingual (Arabic and English). Staff can set their language preference individually.

**Q: What happens when the internet goes down?**
A: Reception and basic lab operations continue on a local server. Results already in the system remain accessible. Full sync happens when connectivity is restored. (Note: cloud-only deployments require internet; on-premise deployments do not.)

**Q: Can we customize the PDF report to show our logo?**
A: Yes. The branding section in System Settings accepts your logo, colors, and report header/footer. Changes take effect immediately on all new PDFs.

**Q: How do you handle data security?**
A: Patient data is encrypted at rest and in transit. Access is logged in full. Your data lives on servers you control — we don't have a shared multi-tenant cloud; every client deployment is isolated.

**Q: What if we need a feature you don't have?**
A: We take feature requests seriously. Priority clients get input into the roadmap. Custom development is quoted separately.

**Q: How long does it take to go live?**
A: 5 weeks from signed contract to live with real patients. This has been our consistent delivery time.

**Q: What does it cost?**
A: See the [PRICING_STRATEGY.md](PRICING_STRATEGY.md) document. We price by branch, not by user, so a growing lab doesn't face escalating per-seat costs.

---

## Common Objections and Responses

**"We've tried software before and it failed."**
Response: That experience is very common in the region. Most lab software failures happen for one of three reasons: the software was not designed for Arabic workflow, the implementation was too long and staff lost patience, or there was no local support after go-live. Capital Lab addresses all three: Arabic-first design, 5-week implementation with live parallel running, and Jordan-based support.

**"Our staff won't adopt a new system."**
Response: Staff adoption is our most common concern before go-live and our least common complaint afterward. We include role-specific training for every staff member, and the system is designed to make their day easier — not harder. Reception staff typically say after the first week that they cannot imagine going back.

**"It's too expensive."**
Response: The most common response after seeing the ROI calculator is that the question is actually whether they can afford *not* to. A 2-branch lab that recovers 15% insurance rejection improvement and 15% volume growth typically recovers the annual subscription cost in the first 6 weeks.

**"We need more time to decide."**
Response: Absolutely — take the time you need. What I'd suggest is doing a 30-day parallel pilot: we set up a demo instance with your actual test catalog and one branch's data, and your team can use it alongside your current system. At the end of 30 days, you'll have real data to make the decision.

---

## After the Demo

1. Send the client the brochure and pricing document within 24 hours
2. If they want a custom proposal, use the [CLIENT_PROPOSAL_TEMPLATE.md](CLIENT_PROPOSAL_TEMPLATE.md)
3. Offer a 30-day pilot with their own data
4. Schedule a follow-up call 5 business days after the demo

---

*Capital Lab Demo Guide — Internal Use · sales@capitallab.io*
