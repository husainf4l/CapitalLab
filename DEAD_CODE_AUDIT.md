# Dead Code Audit
**Date:** 2026-06-13  
**Scope:** Unused components, unused services, unused pipes, orphaned files

---

## Methodology

- Searched all `*.component.ts` files for import/usage patterns
- Searched all layout files and app.routes.ts for component references
- Used `grep` to find zero-import services and components
- Checked exports in module files and barrel exports

---

## Section 1 — Unused Components

### `app-search-input`

**File:** `frontend/src/app/shared/components/search-input/`  
**Selector:** `app-search-input`  
**Import count:** 0

This component exists as a standalone shared search input with debounced output. It is not imported in any feature component. Feature components that have search functionality (Doctor dashboard, Admin content) implement their own inline `<input>` elements instead.

**Recommendation:** Remove. The component is superseded by inline implementations.

---

### `AppSkeletonComponent` / `app-skeleton`

**File:** `frontend/src/app/shared/components/skeleton/`  
**Selector:** `app-skeleton`  
**Import count:** 0

This component provides configurable skeleton loading shimmer. It is not imported in any feature component. Feature components that need loading states use either:
- Inline `<div class="skel">` divs with CSS animations
- `[loading]` prop on their own KPI card components
- Or have no loading state

**Recommendation:** Remove. No component uses it; the inline approach has won out across all feature components.

---

## Section 2 — Unused Services

### `ThemeService`

**File:** `frontend/src/app/core/services/theme.service.ts`  
**Injection count:** 0 (not injected in any component or other service)

`ThemeService` was intended to manage dark/light mode switching. It stores a theme preference in `localStorage` and applies a CSS class to `document.body`. No component injects it and no toggle UI exists.

**Recommendation:** Remove. The application has no theme toggle feature and the service exists only speculatively. If dark mode is ever added, this service would likely be rewritten from scratch anyway.

---

### `LoggingService` (if present)

Checked for speculative logging services — not found in this codebase. No `LoggingService` or `AnalyticsService` dead weight found.

---

## Section 3 — Unused Pipes

No unused pipes found. All custom pipes (`DateAgoPipe`, `FileSizePipe`, `HighlightPipe`) are imported in at least one component.

---

## Section 4 — Orphaned Files

### `hero.jpg`

**File:** `frontend/public/images/hero/hero.jpg`  
**Git status:** `D` (deleted in working tree)  
**Status:** Already deleted — git status shows this file was removed.

No reference to `hero.jpg` found in any component template or style. The deletion is complete and correct.

---

### `frontend/src/app/shared/components/theme-toggle/`

If a `theme-toggle` component directory exists alongside `ThemeService`, it is also unused. Not confirmed present in current directory scan, but would be dead code if found.

---

## Section 5 — Unused Route Declarations

All routes in `app.routes.ts` are reachable via navigation. No routes declared but not linked from any navigation item.

---

## Section 6 — Dead Imports Within Files

Spot-checked 10 component files for unused imports in the `imports: []` array:

| File | Potential dead import | Confirmed? |
|---|---|---|
| admin-overview.component.ts | `CommonModule` (if present) | Not present — uses standalone syntax |
| Various | `FormsModule` imported but using reactive forms | Not found |
| Various | `ReactiveFormsModule` imported without forms | Not found |

No systemic dead imports found in the spot check.

---

## Section 7 — Impact Assessment

### Safe to Remove Now

| Artifact | Risk | Notes |
|---|---|---|
| `AppSkeletonComponent` + files | Low | Zero imports — safe delete |
| `SearchInputComponent` + files | Low | Zero imports — safe delete |
| `ThemeService` | Low | Zero injections — safe delete |

### Do Not Remove

| Artifact | Reason |
|---|---|
| `AppStatCardComponent` | Used by Patient and Branch dashboards |
| `LabKpiCardComponent` | Used by Lab overview |
| `OwnerKpiCardComponent` | Used by Owner overview |
| `PopularArticlesWidgetComponent` | Used by home component (recently wired) |
| All audit trail interfaces | Used by Admin audit log page |

---

## Dead Code Removal Estimates

If the 3 confirmed dead items are removed:

| Item | Estimated files | Lines of code |
|---|---|---|
| `AppSkeletonComponent` | 3 files (ts, html, scss) | ~60 lines |
| `SearchInputComponent` | 3 files (ts, html, scss) | ~80 lines |
| `ThemeService` | 1 file (ts) | ~45 lines |
| **Total** | **7 files** | **~185 lines** |

Removing these would reduce dead code by ~185 lines with zero risk of breaking any existing functionality.

**These removals are not performed in this certification pass** — the constraint was to fix only inconsistencies, not restructure the codebase.

---

## Dead Code Audit Verdict

**3 confirmed dead artifacts found. 0 accidentally removed. All documented for cleanup sprint.**

| Artifact | Type | Status |
|---|---|---|
| `AppSkeletonComponent` | Component | Dead — documented |
| `SearchInputComponent` | Component | Dead — documented |
| `ThemeService` | Service | Dead — documented |
