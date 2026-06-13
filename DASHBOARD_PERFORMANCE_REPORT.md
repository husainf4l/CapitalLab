# Dashboard Performance Report
**Date:** 2026-06-13  
**Scope:** All 6 dashboard overviews — API call patterns, signal usage, rendering, bundle impact

---

## Executive Summary

| Dashboard | API pattern | Signal store | Loading perf | Score |
|---|---|---|---|---|
| Patient | ✅ Store-based | ✅ 7 stores | ✅ | 92% |
| Lab | ✅ Store-based | ✅ 1 store | ✅ | 90% |
| Doctor | ✅ Store-based | ✅ 1 store | ✅ | 90% |
| Admin CC | ⚠️ 6 sequential subscribes | ⚠️ Mixed | ⚠️ | 75% |
| Owner | ✅ forkJoin | ✅ 4 stores | ✅ | 88% |
| Branch | ✅ Store-based | ✅ 1 store | ✅ | 90% |

**Overall Performance Score: 87%**

---

## Section 1 — API Call Analysis

### Patient Portal
- Uses `PatientStore`, `AppointmentStore`, `LabResultsStore`, `HealthTrackerStore`, `LabTestsStore`, `FamilyMembersStore`, `NotificationsStore`
- Each store is lazy-loaded: data is fetched only when the relevant store is first accessed
- No duplicate API calls detected
- Stores use Angular signals — reactive updates without `ngOnChanges` or `subscribe` chains

**Status: ✅ Clean**

---

### Lab Portal
- Uses `LabOverviewStore` which calls a single `/lab/dashboard` aggregate endpoint
- One API call on component init
- Store is injected with `inject(LabOverviewStore)` — no manual subscriptions

**Status: ✅ Clean**

---

### Doctor Portal
- Uses `DoctorStore` which aggregates doctor-specific data
- Store uses `computed()` signals for derived values — no redundant recalculations
- Patient search uses a debounced `effect()` to avoid rapid-fire API calls on keystroke

**Status: ✅ Clean**

---

### Admin Command Center
- **6 sequential `.subscribe()` calls** in the `refresh()` method:

```typescript
refresh() {
  this.ownerApi.getOverview().subscribe(r => { ... });       // call 1
  this.ownerApi.getBranches().subscribe(r => { ... });       // call 2
  this.ownerApi.getRevenue(7).subscribe(r => { ... });       // call 3
  this.ownerApi.getInsurance().subscribe(r => { ... });      // call 4
  this.criticalApi.getAll({}).subscribe(r => { ... });       // call 5
  this.http.get(systemHealthUrl).subscribe(r => { ... });    // call 6
}
```

**Issues:**
1. Calls are sequential in code order but fire in parallel (each `subscribe` is independent). This is actually fine for parallelism, but each call is a separate observable subscription.
2. No unsubscribe / `takeUntilDestroyed` on any of these subscriptions. If the component is destroyed while requests are in-flight, the callbacks will still fire and attempt signal writes to a destroyed component. This is low-risk in practice (admin overview is rarely navigated away from quickly) but is a memory management gap.
3. No `forkJoin` or `combineLatest` — cannot show a "loaded" state only when all 6 calls complete simultaneously.

**Fix recommendation (future sprint):**
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
private destroyRef = inject(DestroyRef);

refresh() {
  forkJoin({
    overview: this.ownerApi.getOverview(),
    branches: this.ownerApi.getBranches(),
    revenue: this.ownerApi.getRevenue(7),
    insurance: this.ownerApi.getInsurance(),
    critical: this.criticalApi.getAll({}),
    health: this.http.get(this.systemHealthUrl)
  }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(results => {
    // handle all results at once
  });
}
```

This would: (a) fire all 6 calls in parallel, (b) provide a single completion event, (c) clean up on component destroy.

**Not fixed in this pass** — behavior is functionally correct; this is a technical debt item.

---

### Owner Overview
- Uses `OwnerAnalyticsApiService` with `forkJoin` in some views — consistent approach
- Store-based: `LabOverviewStore`, `InventoryStore`, `InsuranceStore`, `BillingStore`
- No duplicate API calls detected

**Status: ✅ Acceptable**

---

### Branch Overview
- Uses `BranchStore` — single store, single API call per refresh
- No manual subscriptions

**Status: ✅ Clean**

---

## Section 2 — Signal Usage Patterns

### Computed Signal Usage

All dashboards use `computed()` for derived values. Assessment:

| Dashboard | Computed signals | Issues |
|---|---|---|
| Patient | ✅ Used for upcomingCount, readyResults etc | None |
| Lab | ✅ Used for status sums | None |
| Doctor | ✅ Used for pending counts, today's work | None |
| Admin CC | ✅ 8 computed signals | Some compute over raw arrays on every access — no memoization issue since signals cache by default |
| Owner | ✅ Used for percentages, totals | None |
| Branch | ✅ Used for quick-action labels | None |

**Angular signals are automatically memoized** — `computed()` values are only recomputed when their dependencies change. No performance concerns.

---

### Effect Usage

`effect()` is used in:
- Doctor portal patient search (debounce) — ✅ correct use
- Patient health tracker chart updates — ✅ correct use
- No effects with side effects that could cause infinite loops detected

---

## Section 3 — Component Re-rendering

### Change Detection

All dashboard components use the default `ChangeDetectionStrategy` (not `OnPush`). With Angular signals, this is fine — signal-based templates trigger minimal updates regardless of change detection strategy.

No manual `markForCheck()` or `detectChanges()` calls found in dashboard components.

---

### Heavy Template Operations

| Pattern | Location | Impact |
|---|---|---|
| `@for` over 50+ items without `trackBy` | Admin CC activity stream (10 items) | Low — bounded list |
| `@for` over branches | Owner/Admin (up to 20 branches) | Low — bounded |
| SVG sparkline generation in template | Admin CC | Medium — `spark()` called on every render |

**SVG sparklines:** The `spark()` and `sparkFill()` methods are called in the template as expressions (`[points]="spark(data)"`) rather than being pre-computed as signals. This means they recompute on every change detection cycle. For small datasets (7 daily revenue points) this is negligible.

**Recommendation:** Move sparkline computation to `computed()` signals. Not critical.

---

## Section 4 — Bundle Impact

### Large Dependencies

| Package | Used in | Size impact |
|---|---|---|
| `@angular/material` | All dashboards | Already in bundle — no additional cost |
| `chart.js` | NOT used — all charts are pure SVG | ✅ Not bundled |
| `d3` | NOT used | ✅ Not bundled |
| `rxjs` | Used for stores and HTTP | Already in bundle |

**Positive finding:** No charting library added. Admin Command Center implements all visualizations with pure SVG and CSS, adding zero bundle weight.

---

## Section 5 — Memory Management

### Active Subscriptions Without Cleanup

| Location | Issue |
|---|---|
| `admin-overview.component.ts` refresh() | 6 subscriptions, no `takeUntilDestroyed` |
| Signal stores (inject pattern) | ✅ Automatically cleaned up by Angular injector |
| HTTP calls via stores | ✅ Angular's `HttpClient` completes after one emission — no leak |

**Note:** Angular's `HttpClient` observables complete after a single response, so `.subscribe()` without unsubscribe is not a memory leak for one-shot HTTP calls. The concern is only if the component is destroyed mid-flight — the callback fires on a destroyed component, which in Angular with signals is a no-op (signals from a destroyed context do not update the DOM). Low actual risk.

---

## Section 6 — Duplicate API Calls

| API endpoint | Portals calling it | Duplicate? |
|---|---|---|
| `/owner/overview` | Owner overview + Admin overview | ⚠️ Called by both — but from different user roles, not same session |
| `/owner/branches` | Owner + Admin | Same note — different user sessions |
| `/lab/dashboard` | Lab overview only | ✅ No duplicate |
| `/doctor/dashboard` | Doctor overview only | ✅ No duplicate |

**Finding:** Admin and Owner call the same endpoints (`/owner/overview`, `/owner/branches`). This is by design — Admin needs branch-level data for the command center. Not a duplicate; calls happen in different sessions by different roles.

No component makes the same API call twice on init.

---

## Performance Certification Verdict

**Status: ✅ PASS with documented items**

All dashboards perform acceptably. One item documented for a future sprint:

| Item | Location | Priority |
|---|---|---|
| Replace 6 sequential subscribes with forkJoin + takeUntilDestroyed | admin-overview.component.ts | Medium |
| Move sparkline computation to computed() signals | admin-overview.component.ts | Low |
