# Capital Lab — Complete Feature Catalog
## v1.0 · 2026

---

## PATIENT PORTAL

| Feature | Description | Business Value |
|---|---|---|
| Online Test Booking | 6-step wizard: search test → select branch → pick time slot → patient info → summary → confirm | Eliminates phone queues; available 24/7 |
| Branch Map & Selection | Interactive branch selector showing distance, availability, and hours | Patients self-direct to the right location |
| Appointment Scheduling | Date/time slot picker with real-time availability | Prevents overbooking; optimizes lab capacity |
| Home Collection Booking | Request a phlebotomist at the patient's address | New revenue stream; premium patient service |
| Package Booking | Book bundled health packages (Annual Checkup, Diabetes Panel, etc.) | Higher average order value |
| Family Member Management | Book tests for family members under one account | Captures household volume |
| Digital Result Viewer | View all test results with abnormal values highlighted in red/yellow | Reduces result pickup traffic |
| PDF Report Download | Download branded, doctor-signed PDF report from any device | Eliminates paper report printing |
| QR Report Verification | QR code on every PDF links to public verification endpoint — no login needed | Eliminates report forgery; trust signal |
| Health Tracker | Trend charts for key biomarkers (glucose, HbA1c, TSH, Hb, cholesterol) over time | Patient retention; health management tool |
| Notification Inbox | In-app notification center for results, appointments, and reminders | Single place for all patient communications |
| WhatsApp/SMS Notifications | Automated messages when results are ready, appointment confirmed, fasting reminder | Highest-open-rate channel for patients |
| Push Notifications | Firebase push to Android/iOS (via browser or future native app) | Real-time result alerts |
| Email Notifications | Automated email for reports, confirmations, and reminders | Formal communication channel |
| Patient Profile | Manage personal info, medical history, allergies, insurance | Reduces intake time at branch |
| Insurance Details | Store insurance card details for automatic billing | Smoother insurance billing flow |
| Payment History | View invoices, payment status, outstanding balance | Reduces billing inquiries |
| Bilingual Interface | Full Arabic and English support; preference saved per patient | Serves all Jordanian/Arab patient demographics |
| Responsive Mobile Design | Fully functional on any smartphone browser | Majority of patients access from mobile |

---

## DOCTOR PORTAL

| Feature | Description | Business Value |
|---|---|---|
| Doctor Dashboard | Overview of pending reviews, critical alerts, recent approvals | Doctors see exactly what needs attention |
| Patient Search | Search patients by name, ID, phone, or patient number | Quick access to any patient |
| Patient Timeline | Complete chronological test history for any patient | Clinical decision support; longitudinal view |
| Critical Result Alerts | Automatic alert when test value exceeds critical threshold | Patient safety; reduces liability |
| Critical Result Acknowledgment | Doctor acknowledges alert, logs communication with patient | Compliance; malpractice risk reduction |
| Report Review Queue | All results pending doctor review in one list | Systematic review; nothing missed |
| Report Approval | Single-click approval that triggers patient notification | Fast turnaround; accountability |
| Clinical Notes | Add structured notes linked to any test result or patient | Clinical record alongside lab data |
| Follow-Up Scheduler | Set follow-up tests with patient notification | Recurring revenue; patient health management |
| Result Commentary | Add interpretation text to specific test results in the report | Premium reporting; clinical value-add |
| Doctor Analytics | My review volume, approval times, patient count | Performance visibility |
| Multi-Branch Access | Doctors can review results from any branch they're assigned to | Flexible coverage; remote review |

---

## LAB DASHBOARD

| Feature | Description | Business Value |
|---|---|---|
| Lab Overview | Today's appointments, pending samples, completed tests, critical alerts count | Morning briefing at a glance |
| Appointment Queue | All scheduled appointments with status: Confirmed / Arrived / Completed | Reception and lab coordination |
| Walk-In Registration | Register unscheduled patients directly | Captures walk-in revenue without friction |
| Sample Registration | Register sample with patient, branch, tests ordered, collection time | Starts chain of custody |
| Barcode Generation | Auto-generate unique barcode for every sample | Eliminates labeling errors |
| Barcode Scanning | Scan barcode to instantly retrieve all sample details | 3-second sample lookup |
| Sample Tracking Board | Visual board: Collected → Received → Processing → Completed | Real-time status visibility |
| Chain of Custody | Full timestamp log: who handled sample, when, what action | Compliance; liability protection |
| QC Management | Enter QC lot data; Westgard rule violations flagged | Accreditation requirement; result validity |
| Result Entry | Enter test results against reference ranges; abnormals auto-flagged | Fast, validated entry |
| Reference Range Validation | System checks every result against age/gender-adjusted reference ranges | Quality assurance |
| Critical Threshold Check | Auto-alert doctor when value exceeds critical range | Patient safety protocol |
| Analyzer Import (CSV) | Upload CSV-formatted results from any analyzer | Bulk result import |
| Analyzer Import (HL7) | Parse HL7 v2.x messages from integrated analyzers | Industry-standard integration |
| Analyzer Import (ASTM) | Parse ASTM E1381 protocol from legacy analyzers | Works with existing equipment |
| Analyzer Import (XML) | Parse XML results from modern analyzers | Roche, bioMérieux, others |
| Analyzer Management | Register analyzers with model, manufacturer, serial number | Asset tracking |
| Doctor Review Notification | Notify assigned doctor when results are ready for review | Streamlined handoff |
| Sample Rejection | Log rejected samples with reason; trigger re-collection | Quality process |
| Home Collection Workflow | Assign collector, track visit, log sample collection remotely | Home service fulfillment |

---

## ADMIN DASHBOARD

| Feature | Description | Business Value |
|---|---|---|
| Inventory Management | Track reagents, supplies, consumables per branch | Prevent stockouts; reduce waste |
| Low Stock Alerts | Configurable minimum stock levels per item | Never run out |
| Expiry Date Tracking | 30/60/90-day warnings for near-expiry items | Reduce waste; compliance |
| Purchase Order Workflow | Create PO → Approve → Receive → Update stock | Controlled purchasing process |
| Supplier Management | Maintain supplier catalog with contacts and pricing | Procurement efficiency |
| Invoice Generation | Auto-generate invoices on order creation | Revenue capture; billing accuracy |
| Multi-Payment Support | Cash, Card, Bank Transfer, Insurance, Partial payment | Accept any payment method |
| Payment Recording | Record payments with method, reference, amount | Complete financial record |
| Aging Report | Track overdue invoices by days outstanding | Collections management |
| Insurance Claim Submission | Submit claims to insurance providers digitally | Faster reimbursement |
| Insurance Claim Tracking | Track claim status: Submitted → Reviewed → Approved / Rejected | Revenue assurance |
| Rejection Management | Log rejection reasons; prepare appeal documentation | Recover denied claims |
| Notification Center | Send test notifications to any user via any channel | Operations communication |
| Notification Templates | Pre-defined templates for common notification types | Consistent messaging |
| Audit Center | Full log of every system action: who, what, when, from where | Compliance; forensic trail |
| Audit Filtering | Filter audit log by user, entity type, action, date range | Fast investigation |
| System Settings | Configure platform-wide settings (SMTP, branding, thresholds) | No code changes needed |
| Staff Management | Manage staff profiles, roles, branch assignments | HR integration |
| Branch Management | Configure branch details, hours, services | Multi-branch operations |

---

## OWNER DASHBOARD

| Feature | Description | Business Value |
|---|---|---|
| Revenue Overview | Total revenue, growth %, by branch, by period | P&L visibility |
| Branch Performance | Revenue, samples, utilization per branch | Identify underperformers |
| Branch Ranking | Leaderboard of all branches by revenue | Competitive benchmarking |
| Top Tests | Most ordered and most profitable tests | Test catalog optimization |
| Patient Analytics | New patients, returning patients, demographics | Marketing intelligence |
| Revenue Forecast | Daily revenue bar chart for selected period | Planning and forecasting |
| Executive Center | KPI cards: total revenue, growth, active branches, patients | Board-level reporting |
| Period Selector | 7-day, 30-day, 90-day reporting windows | Flexible analysis |
| Insurance Analytics | Claims by provider, approval rate, outstanding | Insurance portfolio management |
| Inventory Dashboard | Cross-branch stock levels, low stock summary | Procurement planning |

---

## NOTIFICATIONS

| Feature | Description | Business Value |
|---|---|---|
| InApp Notifications | In-system notification inbox | Zero additional cost channel |
| Email Notifications | SMTP-based email via any provider | Universal reach |
| SMS Notifications | Via any SMS gateway (Unifonic, Twilio) | High engagement in MENA |
| WhatsApp Notifications | Business API integration | Highest open rates in Jordan/Arab world |
| Push Notifications | Firebase Cloud Messaging (iOS/Android) | Native app readiness |
| Notification Logs | Full delivery log per notification | Delivery verification; troubleshooting |
| Delivery Status Tracking | Sent / Delivered / Failed per channel | Operations visibility |
| Bulk Notification | Send to filtered patient groups | Marketing campaigns |

---

## PDF REPORTS

| Feature | Description | Business Value |
|---|---|---|
| Branded PDF Reports | Lab logo, colors, header, footer, physician signature | Professional presentation |
| Patient Information Section | Complete patient demographics on every report | Identification; clinical context |
| Test Results Table | All results with reference ranges, units, abnormal flags | Clear, clinical format |
| QR Verification Code | Unique QR per report links to public verification endpoint | Tamper-proof; trust signal |
| Doctor Signature | Digital approval signature on released reports | Official sign-off |
| Arabic/English Support | Reports generated in patient's preferred language | Cultural appropriateness |
| PDF Storage | Reports stored and accessible for download any time | No re-printing needed |
| Bulk Generation | Generate all reports for a batch at once | Efficiency at scale |

---

## ANALYZER INTEGRATION

| Feature | Description | Business Value |
|---|---|---|
| CSV Import | Parse comma-separated results files | Works with any analyzer |
| HL7 v2.x Import | Industry-standard medical messaging | Beckman, Siemens, others |
| ASTM E1381 Import | LIS interface protocol | Mindray, Sysmex, Abbott |
| XML Import | Structured results format | Roche, bioMérieux |
| Import Validation | Validate all parsed results before saving | Data integrity |
| Partial Import Handling | Log failed rows with reason; save successful | Resilient processing |
| Import Audit Log | Full record of every import | Traceability |
| Analyzer Registry | Register analyzers with asset details | IT asset management |

---

## AUDIT CENTER

| Feature | Description | Business Value |
|---|---|---|
| Complete Action Log | Every create, update, delete, login, logout — logged | Forensic capability |
| Old/New Value Capture | Before and after values stored as JSON | Know exactly what changed |
| User Attribution | Every action linked to a user, IP address, timestamp | Accountability |
| Filterable Log | Filter by entity type, user, action, date range | Fast audits |
| Exportable | Audit data available via API for external compliance tools | HIPAA/PDPA reporting |
| Immutable | Audit log cannot be edited or deleted | Legal admissibility |

---

## ANALYTICS

| Feature | Description | Business Value |
|---|---|---|
| Real-Time Dashboards | Live data; no batch processing delays | Current picture always |
| Multi-Branch Aggregation | Sum revenue and volume across all branches | Group-level reporting |
| Custom Period Selection | Any date range for any report | Flexible analysis |
| Revenue Growth % | Period-over-period growth calculated automatically | Trend visibility |
| KPI Cards | Large-number summary cards for key metrics | Executive at a glance |
| Trend Charts | Line and bar charts for revenue, samples, patients | Visual pattern recognition |
| Branch Leaderboard | Ranked list of branches by any metric | Performance culture |
| Insurance Analytics | Claims, approvals, rejections, outstanding by provider | Revenue assurance |
