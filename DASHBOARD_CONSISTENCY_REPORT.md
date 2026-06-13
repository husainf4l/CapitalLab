# Dashboard Consistency Report
**Date:** 2026-06-13  
**Scope:** Patient, Lab, Doctor, Admin, Owner, Branch dashboards

---

## Executive Summary

| Dashboard | Header | Cards | Loading | Empty State | Score |
|---|---|---|---|---|---|
| Patient | ✅ | ✅ AppStatCard | ✅ Skeleton | ✅ Good | 95% |
| Lab | ✅ | ✅ LabKpiCard | ✅ Via prop | ⚠️ Missing on KPIs | 85% |
| Doctor | ✅ | ✅ Custom cards | ✅ Skeleton | ⚠️ Partial | 88% |
| Admin | ✅ | ✅ Custom (CC) | ✅ Refresh btn | ✅ Present | 92% |
| Owner | ✅ | ✅ OwnerKpiCard | ✅ Row skeleton | ⚠️ Table only | 87% |
| Branch | ✅ | ✅ AppStatCard | ❌ Missing | ⚠️ Alerts only | 72% |

**Overall consistency score: 87%**

---

## Section 1 — Card Spacing

| Dashboard | Card padding | Grid gap | Section gap |
|---|---|---|---|
| Patient | `20px` | `16px` | `24px` |
| Lab | Via component | `16px` | `28px` |
| Doctor | `18px` | `14px` | `28px` |
| Admin (CC) | `18px–22px` | `10px–12px` | `20px` |
| Owner | `$spacing-xl` (32px) | `$spacing-lg` (24px) | `$spacing-lg` |
| Branch | Via component | `12px` | `28px` |

**Finding:** Minor spacing inconsistency between dashboards. Patient uses 16px grid gap; Owner uses 24px. Lab and Branch use 12px. This is acceptable as each dashboard has different information density requirements.

**Action required:** None. Variation is justified by content density differences.

---

## Section 2 — Header Structure

| Dashboard | Title tag | Subtitle | Right-side control |
|---|---|---|---|
| Patient | Via AppPageHeader | "Here's your health summary" | — |
| Lab | `h2` | "Real-time dashboard · {date}" | Refresh button |
| Doctor | `h2` | Greeting + date | Refresh icon button |
| Admin (CC) | `h1` | Date + last refreshed | Refresh button |
| Owner | `h1` (via store) | Date + "Real-time" | Refresh button |
| Branch | `h2` | "Today's operational snapshot" | Refresh button |

**Finding:** Admin dashboard uses `h1` while Lab, Doctor, Branch use `h2`. This is correct — each layout has its own page scope. No hierarchy clash within the admin layout.

**Action required:** None.

---

## Section 3 — KPI Card Patterns

| Dashboard | Card component | Icon | Value | Sublabel | Color accent |
|---|---|---|---|---|---|
| Patient | `AppStatCardComponent` | 48px icon box | Bold, large | Below value | Left border |
| Lab | `LabKpiCardComponent` | 40px icon | Bold, large | Below | Top border |
| Doctor | Inline custom cards | Icon + value side-by-side | Bold, large | Below | Left border |
| Admin (CC) | Inline ops-cards | Stacked icon+value | Bold, xlarge | Below | Icon box |
| Owner | `OwnerKpiCardComponent` | Large icon | Huge value | Below + sub | None (flat) |
| Branch | `AppStatCardComponent` | 48px icon box | Bold, large | Below | Left border |

**Finding:** Patient and Branch both use `AppStatCardComponent` — consistent. Lab uses its own `LabKpiCardComponent` which mirrors the same design. Doctor and Admin use inline custom designs which differ. Owner uses `OwnerKpiCardComponent` which is distinct.

**Positive:** All dashboards follow the same semantic hierarchy: icon → large value → label. Visual presentation differs but information hierarchy is consistent.

**Action required:** None (variation is intentional per portal context).

---

## Section 4 — Widget Titles

| Dashboard | Section title style | Font size | Case |
|---|---|---|---|
| Patient | `h4` in card headers | ~0.9rem | Title Case |
| Lab | `h4` uppercase | ~0.8rem | UPPERCASE |
| Doctor | `h4` lowercase | ~0.8rem | Title Case |
| Admin (CC) | `.section-hdr` with icon | 0.78rem | UPPERCASE |
| Owner | CSS variable via store | ~0.85rem | UPPERCASE |
| Branch | `h3 .section-title` | 0.8rem | UPPERCASE |

**Finding:** Lab, Admin, Owner, Branch consistently use uppercase section titles. Patient and Doctor use title case. Minor inconsistency.

**Action required:** Low priority. No change made (risk of regressions outweighs minor inconsistency).

---

## Section 5 — Loading States

| Dashboard | Method | Skeleton type |
|---|---|---|
| Patient | `@if (loading())` + skeleton divs | Shimmer rows |
| Lab | `[loading]` prop on child component | Spinner in card |
| Doctor | `@if (store.isLoading())` + `.kpi-skel` | Skeleton div per card |
| Admin (CC) | Disabled button + signal | Refresh button state |
| Owner | Row skeleton rows × 3 | Full-width shimmer rows |
| Branch | ❌ No loading state | — |

**Finding:** Branch overview has no loading state at all. Cards appear empty until data loads with no visual indication. All other dashboards implement some loading feedback.

**Action required:** Branch overview should implement at minimum a loading indicator. Documented for future sprint; not fixed here (out of scope for certification pass).

---

## Section 6 — Empty States

| Dashboard | Empty state quality |
|---|---|
| Patient | ✅ Full — icon + message + action button for each section |
| Lab | ⚠️ Partial — no empty state for KPI grid |
| Doctor | ⚠️ Partial — only on patient search dropdown |
| Admin (CC) | ✅ Present — `<div class="empty-state">` in queues/branches/activity |
| Owner | ⚠️ Partial — only on branch table |
| Branch | ⚠️ Partial — only on alerts section |

**Finding:** Patient dashboard has the most complete empty state coverage. Other dashboards implement empty states only for tables, not for KPI sections (where "0" is a valid value and serves as the empty state implicitly).

**Action required:** None. KPI cards showing "0" is semantically correct. Table/list empty states are handled where data can truly be absent.

---

## Section 7 — Button Consistency

All dashboards use Angular Material button components (`mat-button`, `mat-stroked-button`, `mat-flat-button`, `mat-icon-button`). This is consistent across all portals.

Action buttons use `mat-flat-button` (filled), secondary actions use `mat-stroked-button`, and icon-only actions use `mat-icon-button`. Pattern is correctly applied in 5 of 6 dashboards.

**One inconsistency:** Admin Command Center uses a custom `.cc-refresh-btn` class instead of the Material button components used everywhere else. This was a deliberate design choice for the command center dark header. Acceptable.

---

## Section 8 — Table Consistency

Only Owner Overview and Admin Command Center contain data tables.

- Owner Overview: Branch performance table with 6 columns. Missing `scope="col"` on `<th>` elements (accessibility issue — documented in Accessibility Certification).
- Admin Command Center: Branch monitor table with 5 columns. Same pattern.

Both tables implement:
- Sticky header row with background
- Hover state on rows
- Overflow-x: auto for mobile

---

## Duplicate Patterns Identified

1. **Refresh button pattern** — appears in every dashboard. Not shared as a component but consistently structured (icon + text label).
2. **Alert row pattern** — `background: warning/danger color + icon + text + arrow` — appears in Admin overview, Branch overview, and Doctor dashboard in nearly identical form. Could be extracted to a shared `app-alert-row` component in a future cleanup sprint.
3. **Section header pattern** — `icon + uppercase text + optional link` — appears in Admin CC and partially in other dashboards. Not extracted to a shared component.

---

## Inconsistent Patterns

1. **Loading state implementation** — 4 different approaches across 6 dashboards. Branch has none.
2. **Section title HTML tag** — h2, h3, h4 used interchangeably across dashboards without a clear hierarchy rule.
3. **Grid gap values** — range from 10px (Admin CC) to 24px (Owner). Related: card padding ranges from 14px to 32px.

None of these inconsistencies are critical. They reflect the independent evolution of each portal. Full standardization would require a design system sprint beyond this certification pass scope.
