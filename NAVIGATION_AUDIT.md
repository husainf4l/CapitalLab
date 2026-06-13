# Navigation Audit
**Date:** 2026-06-13  
**Scope:** Desktop sidebar, mobile bottom nav, and active state behavior across all portals

---

## Portal Navigation Summary

### Patient Portal
**Desktop (sidebar):** 10 items  
**Mobile (bottom bar):** 5 items  
**Coverage:** 50% of routes on mobile

| Item | Route | Icon | Mobile |
|---|---|---|---|
| Dashboard | /patient/dashboard | dashboard | ✅ |
| Book Appointment | /patient/book | add_circle | ✅ |
| My Results | /patient/results | science | ✅ |
| Health Tracker | /patient/health-tracker | monitor_heart | ❌ |
| Appointments | /patient/appointments | calendar_today | ✅ |
| Home Collection | /patient/home-collection | home | ❌ |
| Family Members | /patient/family-members | group | ❌ |
| Payments | /patient/payments | payment | ❌ |
| Notifications | /patient/notifications | notifications | ❌ |
| Profile | /patient/profile | person | ✅ |

**Mobile prioritization logic:** The 5 highest-frequency actions (Dashboard, Book, Results, Appointments, Profile) are correctly prioritized. Acceptable.

---

### Lab Portal
**Desktop (sidebar):** 8 items (role-filtered)  
**Mobile (bottom bar):** 5 items (NOT role-filtered — ⚠️)

| Item | Route | Icon | Requires role | Mobile |
|---|---|---|---|---|
| Overview | /lab | dashboard | all | ✅ |
| Appointments | /lab/appointments | event | all | ✅ |
| Test Orders | /lab/orders | assignment | all | ❌ |
| Patients | /lab/barcode | people | Receptionist | ❌ |
| Samples | /lab/samples | science | LabTech+ | ✅ |
| Barcode | /lab/barcode | qr_code_2 | LabTech+ | ❌ |
| QC | /lab/qc | verified_user | LabTech+ | ✅ |
| Results Entry | /lab/results-entry | edit_note | LabTech+ | ✅ |

**⚠️ Issue found:** Mobile nav items are hardcoded and do not apply role filtering. A Receptionist sees `Results Entry` in mobile nav even though the desktop hides it via `visibleNavItems()`. This is a UX inconsistency (Receptionist can navigate to a page they have no relevant data for). Not a security issue (route guards protect access), but confusing.

**Recommendation (future sprint):** Compute mobile nav items from `visibleNavItems()` filtered to the 5 highest-priority roles. Not changed in this pass.

---

### Doctor Portal
**Desktop (sidebar):** 8 items  
**Mobile (bottom bar):** 5 items  
**Coverage:** 62.5% of routes on mobile

| Item | Route | Icon | Mobile |
|---|---|---|---|
| Dashboard | /doctor | dashboard | ✅ |
| Patient Timeline | /doctor/patients | timeline | ✅ |
| Critical Results | /doctor/critical-results | priority_high | ✅ |
| Pending Reviews | /doctor/reviews | pending_actions | ✅ |
| Reports | /doctor/reports | description | ✅ |
| Follow Ups | /doctor/follow-ups | schedule_send | ❌ |
| Notes | /doctor/notes | sticky_note_2 | ❌ |
| Analytics | /doctor/analytics | bar_chart | ❌ |

**Assessment:** Mobile prioritization is correct — the 5 most time-critical clinical items are on mobile. Follow Ups, Notes, and Analytics are lower frequency. Acceptable.

---

### Admin Portal
**Desktop (sidebar):** 19 items (includes CMS section)  
**Mobile (bottom bar):** 5 items  
**Coverage:** 26% of routes on mobile

| Mobile Item | Route | Icon |
|---|---|---|
| Overview | /admin/overview | dashboard |
| Inventory | /admin/inventory | inventory_2 |
| Billing | /admin/billing | receipt_long |
| Audit | /admin/audit | history |
| Settings | /admin/settings | settings |

**Assessment:** Admin portal is desktop-first by design. The mobile selection covers the most common operational checks. Acceptable for an admin role that operates primarily on desktop.

---

### Owner Portal
**Desktop (sidebar):** 8 items (3 sections)  
**Mobile (bottom bar):** 4 items  
**Coverage:** 50% of routes on mobile

| Mobile Item | Route | Icon |
|---|---|---|
| Home | /owner | dashboard |
| Revenue | /owner/revenue | payments |
| Branches | /owner/branches | account_tree |
| More | /owner/executive | bar_chart |

**⚠️ Issue found:** The "More" item links directly to `/owner/executive` — it is not a menu trigger. Users have no mobile path to Tests, Patients, Inventory, or Insurance. The label "More" implies a menu expansion but instead navigates to a single route. This is misleading.

**Recommendation:** Either rename "More" to "Executive" (honest label) or implement a true overflow menu. Not changed in this pass (would require new component).

---

### Branch Portal
**Desktop (sidebar):** 7 items  
**Mobile (bottom bar):** 5 items  
**Coverage:** 71% of routes on mobile

| Item | Route | Icon | Mobile |
|---|---|---|---|
| Overview | /branch | dashboard | ✅ |
| Appointments | /branch/appointments | event | ✅ |
| Samples | /branch/samples | science | ✅ |
| Inventory | /branch/inventory | inventory_2 | ✅ |
| Billing | /branch/billing | receipt_long | ✅ |
| Insurance | /branch/insurance | health_and_safety | ❌ |
| Reports | /branch/reports | bar_chart | ❌ |

**Assessment:** 71% coverage is the best of all portals. The 5 highest-frequency daily items are correctly on mobile.

---

## Naming Consistency Audit

| Route concept | Patient | Lab | Doctor | Admin | Owner | Branch |
|---|---|---|---|---|---|---|
| Dashboard/overview | "Dashboard" | "Overview" | "Dashboard" | "Overview" | "Overview" | "Overview" |
| Patient search | — | — | "Patient Timeline" | — | "Patients" | — |
| Samples | — | "Samples" | — | — | — | "Samples" |
| Insurance | — | — | — | "Insurance" | "Insurance" | "Insurance" |
| Billing | — | — | — | "Billing" | "Revenue" | "Billing" |

**Finding:** "Overview" vs "Dashboard" naming — Patient and Doctor use "Dashboard"; all others use "Overview". Minor inconsistency. The routes correctly distinguish `/patient/dashboard` from `/admin/overview`.

**Owner uses "Revenue"** where other portals use "Billing". This is intentional — Owner has a revenue analytics view, not a billing management view.

---

## Icon Consistency Audit

Shared concepts use consistent icons across all portals:

| Concept | Icon | Consistent? |
|---|---|---|
| Dashboard/home | `dashboard` | ✅ All portals |
| Appointments | `event` or `calendar_today` | ⚠️ Mixed |
| Samples | `science` | ✅ All portals |
| Billing/payments | `receipt_long` or `payments` | ⚠️ Mixed |
| Insurance | `health_and_safety` | ✅ All portals |
| Audit | `history` | ✅ Admin only |
| Settings | `settings` | ✅ Admin only |

**Finding:** `event` vs `calendar_today` for appointments — Lab and Branch use `event`, Patient uses `calendar_today`. Both are valid Material icons for the concept. No fix required.

---

## Active State Consistency

All portals use `routerLinkActive="active"` on nav items with matching CSS `.active { background: rgba($primary, 0.22); color: white; }` variant. Admin, Lab, Doctor, Owner, Branch all follow the same active state pattern. Patient uses a slightly different active state (highlighted with primary color background). Consistent enough.

---

## Route Coverage vs Navigation

All routes defined in `app.routes.ts` are reachable via at least one navigation path. No orphaned routes detected. Parameterized routes (`/:id`, `/:slug`) are correctly linked from list pages.

---

## Issues Summary

| Issue | Severity | Portal | Status |
|---|---|---|---|
| Mobile nav not role-filtered | Medium | Lab | Documented — future sprint |
| "More" label misleads (links to one route) | Low | Owner | Documented — future sprint |
| `event` vs `calendar_today` for appointments | Very Low | Patient vs Lab/Branch | Acceptable |
| Mobile coverage below 50% | Low | Admin | Acceptable (desktop-first role) |
