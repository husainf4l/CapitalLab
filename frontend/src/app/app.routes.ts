import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public website
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent) },
      { path: 'tests', loadComponent: () => import('./features/public/tests/tests.component').then(m => m.TestsComponent) },
      { path: 'packages', loadComponent: () => import('./features/public/packages/packages.component').then(m => m.PackagesComponent) },
      { path: 'branches', loadComponent: () => import('./features/public/branches/branches.component').then(m => m.BranchesComponent) },
      { path: 'about', loadComponent: () => import('./features/public/about/about.component').then(m => m.AboutComponent) },
      { path: 'contact', loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'faq', loadComponent: () => import('./features/public/faq/faq.component').then(m => m.FaqComponent) },
      { path: 'health-programs', loadComponent: () => import('./features/public/health-programs/health-programs.component').then(m => m.HealthProgramsComponent) },
    ],
  },

  // Auth pages (guest only)
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    canActivate: [guestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/public/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/public/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/public/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/public/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    ],
  },

  // Patient portal
  {
    path: 'patient',
    loadComponent: () => import('./layouts/patient-portal-layout/patient-portal-layout.component').then(m => m.PatientPortalLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/patient/dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
      { path: 'results', loadComponent: () => import('./features/patient/results/patient-results.component').then(m => m.PatientResultsComponent) },
      { path: 'results/:reportId', loadComponent: () => import('./features/patient/results/report-viewer/report-viewer.component').then(m => m.ReportViewerComponent) },
      { path: 'book', loadComponent: () => import('./features/patient/book/book.component').then(m => m.BookComponent) },
      { path: 'health-tracker', loadComponent: () => import('./features/patient/health-tracker/health-tracker.component').then(m => m.HealthTrackerComponent) },
      { path: 'appointments', loadComponent: () => import('./features/patient/appointments/patient-appointments.component').then(m => m.PatientAppointmentsComponent) },
      { path: 'home-collection', loadComponent: () => import('./features/patient/home-collection/home-collection.component').then(m => m.HomeCollectionComponent) },
      { path: 'family-members', loadComponent: () => import('./features/patient/family-members/family-members.component').then(m => m.FamilyMembersComponent) },
      { path: 'payments', loadComponent: () => import('./features/patient/payments/patient-payments.component').then(m => m.PatientPaymentsComponent) },
      { path: 'notifications', loadComponent: () => import('./features/patient/notifications/patient-notifications.component').then(m => m.PatientNotificationsComponent) },
      { path: 'profile', loadComponent: () => import('./features/patient/profile/patient-profile.component').then(m => m.PatientProfileComponent) },
    ],
  },

  // Lab staff dashboard
  {
    path: 'lab',
    loadComponent: () => import('./layouts/lab-layout/lab-layout.component').then(m => m.LabLayoutComponent),
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin', 'Owner', 'BranchAdmin', 'LabTechnician', 'Receptionist', 'Doctor'] },
    children: [
      { path: '', loadComponent: () => import('./features/lab/overview/lab-overview.component').then(m => m.LabOverviewComponent) },
      { path: 'appointments', loadComponent: () => import('./features/lab/appointments/lab-appointments.component').then(m => m.LabAppointmentsComponent) },
      { path: 'orders', loadComponent: () => import('./features/lab/orders/lab-orders.component').then(m => m.LabOrdersComponent) },
      { path: 'samples', loadComponent: () => import('./features/lab/samples/lab-samples.component').then(m => m.LabSamplesComponent) },
      { path: 'barcode', loadComponent: () => import('./features/lab/barcode/lab-barcode.component').then(m => m.LabBarcodeComponent) },
      { path: 'qc', loadComponent: () => import('./features/lab/qc/lab-qc.component').then(m => m.LabQcComponent) },
      { path: 'results-entry', loadComponent: () => import('./features/lab/results-entry/lab-results-entry.component').then(m => m.LabResultsEntryComponent) },
      { path: 'doctor-review', loadComponent: () => import('./features/lab/doctor-review/lab-doctor-review.component').then(m => m.LabDoctorReviewComponent) },
    ],
  },

  // Doctor portal
  {
    path: 'doctor',
    loadComponent: () => import('./layouts/doctor-layout/doctor-layout.component').then(m => m.DoctorLayoutComponent),
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin', 'Owner', 'BranchAdmin', 'Doctor'] },
    children: [
      { path: '', loadComponent: () => import('./features/doctor/dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
      { path: 'patients', loadComponent: () => import('./features/doctor/patient-search/patient-search.component').then(m => m.PatientSearchComponent) },
      { path: 'patients/:patientId', loadComponent: () => import('./features/doctor/patient-timeline/patient-timeline.component').then(m => m.PatientTimelineComponent) },
      { path: 'critical-results', loadComponent: () => import('./features/doctor/critical-results/critical-results.component').then(m => m.CriticalResultsComponent) },
      { path: 'reviews', loadComponent: () => import('./features/doctor/reviews/review-center.component').then(m => m.ReviewCenterComponent) },
      { path: 'reports', loadComponent: () => import('./features/doctor/reports/report-review.component').then(m => m.ReportReviewComponent) },
      { path: 'follow-ups', loadComponent: () => import('./features/doctor/follow-ups/follow-ups.component').then(m => m.FollowUpsComponent) },
      { path: 'notes', loadComponent: () => import('./features/doctor/notes/doctor-notes.component').then(m => m.DoctorNotesComponent) },
      { path: 'analytics', loadComponent: () => import('./features/doctor/analytics/doctor-analytics.component').then(m => m.DoctorAnalyticsComponent) },
    ],
  },

  // Admin operations
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin', 'Owner', 'BranchAdmin'] },
    children: [
      { path: '', redirectTo: 'inventory', pathMatch: 'full' },
      { path: 'inventory', loadComponent: () => import('./features/admin/inventory/admin-inventory.component').then(m => m.AdminInventoryComponent) },
      { path: 'purchase-orders', loadComponent: () => import('./features/admin/purchase-orders/admin-purchase-orders.component').then(m => m.AdminPurchaseOrdersComponent) },
      { path: 'billing', loadComponent: () => import('./features/admin/billing/admin-billing.component').then(m => m.AdminBillingComponent) },
      { path: 'payments', loadComponent: () => import('./features/admin/payments/admin-payments.component').then(m => m.AdminPaymentsComponent) },
      { path: 'insurance', loadComponent: () => import('./features/admin/insurance/admin-insurance.component').then(m => m.AdminInsuranceComponent) },
      { path: 'notifications', loadComponent: () => import('./features/admin/notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent) },
      { path: 'audit', loadComponent: () => import('./features/admin/audit/admin-audit.component').then(m => m.AdminAuditComponent) },
      { path: 'analyzers', loadComponent: () => import('./features/admin/analyzers/admin-analyzers.component').then(m => m.AdminAnalyzersComponent) },
      { path: 'settings', loadComponent: () => import('./features/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
      { path: 'system-health', loadComponent: () => import('./features/admin/system-health/admin-system-health.component').then(m => m.AdminSystemHealthComponent) },
    ],
  },

  // Owner dashboard
  {
    path: 'owner',
    loadComponent: () => import('./layouts/owner-layout/owner-layout.component').then(m => m.OwnerLayoutComponent),
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin', 'Owner'] },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => import('./features/owner/overview/owner-overview.component').then(m => m.OwnerOverviewComponent) },
      { path: 'revenue', loadComponent: () => import('./features/owner/revenue/owner-revenue.component').then(m => m.OwnerRevenueComponent) },
      { path: 'branches', loadComponent: () => import('./features/owner/branches/owner-branches.component').then(m => m.OwnerBranchesComponent) },
      { path: 'tests', loadComponent: () => import('./features/owner/tests/owner-tests.component').then(m => m.OwnerTestsComponent) },
      { path: 'patients', loadComponent: () => import('./features/owner/patients/owner-patients.component').then(m => m.OwnerPatientsComponent) },
      { path: 'inventory', loadComponent: () => import('./features/owner/inventory/owner-inventory.component').then(m => m.OwnerInventoryComponent) },
      { path: 'insurance', loadComponent: () => import('./features/owner/insurance/owner-insurance.component').then(m => m.OwnerInsuranceComponent) },
      { path: 'executive', loadComponent: () => import('./features/owner/executive/owner-executive.component').then(m => m.OwnerExecutiveComponent) },
    ],
  },

  { path: '**', redirectTo: '' },
];
