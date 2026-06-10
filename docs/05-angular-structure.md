# Capital Lab — Angular 20 Frontend Structure

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Angular | 20+ | Framework |
| Angular Material | 20+ | UI Components |
| NgRx | 18+ | State Management |
| TailwindCSS | 3+ | Utility CSS |
| @angular/localize | 20+ | i18n (EN/AR) |
| Chart.js + ng2-charts | latest | Analytics charts |
| SignalR JS Client | latest | Real-time |
| @ngx-translate/core | latest | Runtime translations |
| ZXing Browser | latest | Barcode scanning |
| jsPDF | latest | Client-side PDF ops |
| date-fns | latest | Date formatting |

---

## Folder Structure

```
frontend/
├── .angular/
├── src/
│   ├── app/
│   │   ├── core/                          # Singleton services, guards, interceptors
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── token.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── role.guard.ts
│   │   │   │   └── auth.store.ts          # NgRx signal store
│   │   │   ├── http/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── loading.interceptor.ts
│   │   │   ├── realtime/
│   │   │   │   ├── signalr.service.ts
│   │   │   │   └── notification-hub.service.ts
│   │   │   ├── i18n/
│   │   │   │   └── language.service.ts
│   │   │   └── services/
│   │   │       ├── notification.service.ts
│   │   │       ├── storage.service.ts
│   │   │       └── print.service.ts
│   │   │
│   │   ├── shared/                        # Shared UI components, pipes, directives
│   │   │   ├── components/
│   │   │   │   ├── data-table/
│   │   │   │   ├── search-bar/
│   │   │   │   ├── status-badge/
│   │   │   │   ├── confirmation-dialog/
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── page-header/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── barcode-scanner/
│   │   │   │   ├── file-upload/
│   │   │   │   ├── date-range-picker/
│   │   │   │   ├── kpi-card/
│   │   │   │   └── trend-chart/
│   │   │   ├── pipes/
│   │   │   │   ├── status-label.pipe.ts
│   │   │   │   ├── gender-label.pipe.ts
│   │   │   │   ├── phone-format.pipe.ts
│   │   │   │   ├── age.pipe.ts
│   │   │   │   └── currency-sar.pipe.ts
│   │   │   ├── directives/
│   │   │   │   ├── has-permission.directive.ts
│   │   │   │   ├── has-role.directive.ts
│   │   │   │   └── auto-focus.directive.ts
│   │   │   └── models/                    # TypeScript interfaces matching DTOs
│   │   │       ├── auth.model.ts
│   │   │       ├── patient.model.ts
│   │   │       ├── doctor.model.ts
│   │   │       ├── test.model.ts
│   │   │       ├── appointment.model.ts
│   │   │       ├── sample.model.ts
│   │   │       ├── result.model.ts
│   │   │       ├── report.model.ts
│   │   │       ├── inventory.model.ts
│   │   │       ├── billing.model.ts
│   │   │       └── analytics.model.ts
│   │   │
│   │   ├── layout/                        # Shell, navigation, sidebars
│   │   │   ├── admin-layout/
│   │   │   │   ├── admin-layout.component.ts
│   │   │   │   ├── sidebar/
│   │   │   │   │   └── sidebar.component.ts
│   │   │   │   ├── topbar/
│   │   │   │   │   └── topbar.component.ts
│   │   │   │   └── notification-panel/
│   │   │   │       └── notification-panel.component.ts
│   │   │   └── portal-layout/
│   │   │       ├── portal-layout.component.ts
│   │   │       └── portal-nav/
│   │   │           └── portal-nav.component.ts
│   │   │
│   │   ├── features/                      # Feature modules (lazy-loaded)
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── login.component.ts
│   │   │   │   ├── forgot-password/
│   │   │   │   └── reset-password/
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── owner-dashboard/
│   │   │   │   │   ├── owner-dashboard.component.ts
│   │   │   │   │   ├── revenue-chart/
│   │   │   │   │   ├── branch-comparison/
│   │   │   │   │   └── kpi-grid/
│   │   │   │   ├── manager-dashboard/
│   │   │   │   │   ├── manager-dashboard.component.ts
│   │   │   │   │   ├── worklist-summary/
│   │   │   │   │   └── staff-activity/
│   │   │   │   ├── doctor-dashboard/
│   │   │   │   │   ├── doctor-dashboard.component.ts
│   │   │   │   │   ├── pending-reviews/
│   │   │   │   │   └── critical-findings/
│   │   │   │   └── reception-dashboard/
│   │   │   │       ├── reception-dashboard.component.ts
│   │   │   │       ├── todays-appointments/
│   │   │   │       └── quick-register/
│   │   │   │
│   │   │   ├── patients/
│   │   │   │   ├── patient-list/
│   │   │   │   │   └── patient-list.component.ts
│   │   │   │   ├── patient-register/
│   │   │   │   │   ├── patient-register.component.ts
│   │   │   │   │   └── registration-form/
│   │   │   │   ├── patient-detail/
│   │   │   │   │   ├── patient-detail.component.ts
│   │   │   │   │   ├── overview-tab/
│   │   │   │   │   ├── history-tab/
│   │   │   │   │   ├── appointments-tab/
│   │   │   │   │   ├── results-tab/
│   │   │   │   │   └── billing-tab/
│   │   │   │   └── patient-search/
│   │   │   │       └── patient-search.component.ts
│   │   │   │
│   │   │   ├── appointments/
│   │   │   │   ├── appointment-list/
│   │   │   │   ├── appointment-book/
│   │   │   │   │   ├── appointment-book.component.ts
│   │   │   │   │   ├── patient-select-step/
│   │   │   │   │   ├── test-select-step/
│   │   │   │   │   ├── schedule-step/
│   │   │   │   │   └── confirm-step/
│   │   │   │   ├── appointment-detail/
│   │   │   │   ├── appointment-calendar/
│   │   │   │   └── home-collection/
│   │   │   │       ├── home-collection-list/
│   │   │   │       └── collection-map/
│   │   │   │
│   │   │   ├── samples/
│   │   │   │   ├── sample-worklist/
│   │   │   │   │   └── sample-worklist.component.ts
│   │   │   │   ├── sample-receive/
│   │   │   │   │   ├── sample-receive.component.ts  (barcode scanner)
│   │   │   │   │   └── bulk-receive/
│   │   │   │   ├── sample-detail/
│   │   │   │   └── sample-tracking/
│   │   │   │       └── tracking-timeline.component.ts
│   │   │   │
│   │   │   ├── results/
│   │   │   │   ├── result-worklist/
│   │   │   │   ├── result-entry/
│   │   │   │   │   ├── result-entry.component.ts
│   │   │   │   │   └── result-form/
│   │   │   │   ├── result-review/
│   │   │   │   │   ├── result-review.component.ts
│   │   │   │   │   └── reference-range-display/
│   │   │   │   └── result-history/
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── report-list/
│   │   │   │   ├── report-view/
│   │   │   │   │   ├── report-view.component.ts
│   │   │   │   │   ├── report-header/
│   │   │   │   │   ├── result-table/
│   │   │   │   │   ├── doctor-notes/
│   │   │   │   │   └── signature-block/
│   │   │   │   └── report-share/
│   │   │   │
│   │   │   ├── catalog/
│   │   │   │   ├── test-catalog/
│   │   │   │   │   ├── test-list.component.ts
│   │   │   │   │   └── test-detail.component.ts
│   │   │   │   ├── test-form/
│   │   │   │   ├── categories/
│   │   │   │   ├── packages/
│   │   │   │   │   ├── package-list.component.ts
│   │   │   │   │   └── package-form.component.ts
│   │   │   │   └── reference-ranges/
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── stock-overview/
│   │   │   │   ├── stock-receive/
│   │   │   │   ├── stock-issue/
│   │   │   │   ├── expiry-alerts/
│   │   │   │   └── purchase-orders/
│   │   │   │
│   │   │   ├── billing/
│   │   │   │   ├── invoice-list/
│   │   │   │   ├── invoice-create/
│   │   │   │   ├── invoice-detail/
│   │   │   │   ├── payment-form/
│   │   │   │   └── refunds/
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── revenue-analytics/
│   │   │   │   ├── patient-analytics/
│   │   │   │   ├── test-analytics/
│   │   │   │   ├── branch-comparison/
│   │   │   │   └── inventory-analytics/
│   │   │   │
│   │   │   ├── doctors/
│   │   │   │   ├── doctor-list/
│   │   │   │   ├── doctor-detail/
│   │   │   │   └── doctor-form/
│   │   │   │
│   │   │   ├── branches/
│   │   │   │   ├── branch-list/
│   │   │   │   ├── branch-detail/
│   │   │   │   └── branch-form/
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── user-list/
│   │   │   │   ├── user-form/
│   │   │   │   └── role-assign/
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── notification-list/
│   │   │   │   └── templates/
│   │   │   │
│   │   │   └── portal/                    # Patient self-service portal
│   │   │       ├── portal-dashboard/
│   │   │       ├── portal-appointments/
│   │   │       ├── portal-results/
│   │   │       ├── portal-reports/
│   │   │       ├── portal-family/
│   │   │       └── portal-profile/
│   │   │
│   │   ├── app.routes.ts
│   │   ├── app.config.ts
│   │   └── app.component.ts
│   │
│   ├── assets/
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   └── ar.json
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   └── styles/
│       ├── _variables.scss
│       ├── _rtl.scss
│       └── styles.scss
│
├── angular.json
├── tailwind.config.js
└── package.json
```

---

## Routing Architecture

```typescript
// app.routes.ts
export const routes: Routes = [
  // Public routes
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
  { path: 'report/verify/:qr', component: ReportVerifyComponent },
  { path: 'report/share/:token', component: SharedReportComponent },

  // Staff portal
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => DashboardSelectorComponent },
      { path: 'patients', loadChildren: () => import('./features/patients/patients.routes') },
      { path: 'appointments', loadChildren: () => import('./features/appointments/appointments.routes') },
      { path: 'samples', loadChildren: () => import('./features/samples/samples.routes'), canActivate: [RoleGuard(['LabTechnician', 'BranchManager'])] },
      { path: 'results', loadChildren: () => import('./features/results/results.routes') },
      { path: 'reports', loadChildren: () => import('./features/reports/reports.routes') },
      { path: 'catalog', loadChildren: () => import('./features/catalog/catalog.routes'), canActivate: [RoleGuard(['BranchManager', 'Owner', 'SuperAdmin'])] },
      { path: 'inventory', loadChildren: () => import('./features/inventory/inventory.routes') },
      { path: 'billing', loadChildren: () => import('./features/billing/billing.routes') },
      { path: 'analytics', loadChildren: () => import('./features/analytics/analytics.routes') },
      { path: 'doctors', loadChildren: () => import('./features/doctors/doctors.routes') },
      { path: 'branches', loadChildren: () => import('./features/branches/branches.routes'), canActivate: [RoleGuard(['Owner', 'SuperAdmin'])] },
      { path: 'users', loadChildren: () => import('./features/users/users.routes'), canActivate: [RoleGuard(['Owner', 'SuperAdmin', 'BranchManager'])] },
    ]
  },

  // Patient portal
  {
    path: 'portal',
    component: PortalLayoutComponent,
    canActivate: [AuthGuard, RoleGuard(['Patient'])],
    loadChildren: () => import('./features/portal/portal.routes')
  },

  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];
```

---

## State Management (NgRx Signal Stores)

```typescript
// Per-feature signal stores
auth.store.ts          — user, tokens, permissions, loading
patients.store.ts      — patient list, selected patient, search
appointments.store.ts  — appointment list, calendar view, today's list
samples.store.ts       — worklist, selected sample
results.store.ts       — worklist, pending review queue
notifications.store.ts — unread count, notification list
branch.store.ts        — current branch, branch list
ui.store.ts            — sidebar open, language, RTL flag
```

---

## RTL / i18n Architecture

- `LanguageService` toggles between `en` (LTR) and `ar` (RTL)
- On language switch:
  - `document.dir` set to `rtl` or `ltr`
  - Angular Material RTL theme applied dynamically
  - `ngx-translate` loads the correct JSON bundle
  - User preference persisted in localStorage
- `_rtl.scss` overrides: `margin-left → margin-right`, `text-align: right`, icon flips
- Dates formatted with `date-fns/locale/ar-SA` for Arabic

---

## HTTP Interceptors

```typescript
// auth.interceptor.ts
// — Attaches Bearer token to every request
// — On 401: attempts token refresh, retries original request once
// — On second 401: clears session, redirects to /auth/login

// error.interceptor.ts
// — Maps HTTP errors to user-friendly messages via translation keys
// — Shows snackbar for 400/403/404/500
// — Logs errors via error tracking service

// loading.interceptor.ts
// — Tracks in-flight requests, exposes isLoading$ signal
// — Used by global loading bar component
```

---

## Key UI Patterns

### Data Table Component
Reusable `<cl-data-table>` with:
- Server-side pagination, sorting, filtering
- Column configuration via input
- Row actions (view, edit, delete) with permission check
- Export to CSV/Excel
- Responsive (cards on mobile)

### Barcode Scanner (Sample Receive)
- Uses ZXing for camera-based scanning
- Falls back to keyboard input field (for external scanners)
- Plays success/error beep
- Debounced lookup on barcode change

### Report Viewer
- Renders report as a styled HTML template (not iframe)
- Print via `window.print()` with print-specific CSS
- Download triggers `/reports/{id}/pdf` API call
- Share generates token and shows copyable link

### Dashboard Charts
- Chart.js line (revenue trend), bar (branch comparison), doughnut (test distribution)
- Data loaded from analytics endpoints with date range picker
- Export chart as PNG

---

## Permission Directive

```typescript
// *hasPermission="'results.release'"
// *hasRole="['Doctor', 'BranchManager']"
// Hides or shows elements based on NgRx auth store
```
