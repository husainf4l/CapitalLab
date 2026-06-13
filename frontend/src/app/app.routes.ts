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
      // Content CMS public routes
      { path: 'news', loadComponent: () => import('./features/public/news/news.component').then(m => m.NewsComponent) },
      { path: 'blog', loadComponent: () => import('./features/public/blog/blog.component').then(m => m.BlogComponent) },
      { path: 'events', loadComponent: () => import('./features/public/events/events.component').then(m => m.EventsComponent) },
      { path: 'news/:slug', loadComponent: () => import('./features/public/article/article.component').then(m => m.ArticleComponent) },
      { path: 'article/:slug', loadComponent: () => import('./features/public/article/article.component').then(m => m.ArticleComponent) },
      { path: 'event/:slug', loadComponent: () => import('./features/public/event-detail/event-detail.component').then(m => m.EventDetailComponent) },
      // Phase 2: Author pages + Category landing pages
      { path: 'author/:slug', loadComponent: () => import('./features/public/author/author-page.component').then(m => m.AuthorPageComponent) },
      { path: 'blog/category/:slug', loadComponent: () => import('./features/public/category/category-page.component').then(m => m.CategoryPageComponent) },
      { path: 'news/category/:slug', loadComponent: () => import('./features/public/category/category-page.component').then(m => m.CategoryPageComponent) },
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
      { path: 'notifications', loadComponent: () => import('./features/patient/notifications/patient-notifications.component').then(m => m.PatientNotificationsComponent) },
      { path: 'profile', loadComponent: () => import('./features/patient/profile/patient-profile.component').then(m => m.PatientProfileComponent) },
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
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => import('./features/admin/overview/admin-overview.component').then(m => m.AdminOverviewComponent) },
      { path: 'packages', loadComponent: () => import('./features/admin/packages/admin-packages.component').then(m => m.AdminPackagesComponent) },
      { path: 'notifications', loadComponent: () => import('./features/admin/notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent) },
      { path: 'audit', loadComponent: () => import('./features/admin/audit/admin-audit.component').then(m => m.AdminAuditComponent) },
      { path: 'settings', loadComponent: () => import('./features/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
      { path: 'system-health', loadComponent: () => import('./features/admin/system-health/admin-system-health.component').then(m => m.AdminSystemHealthComponent) },
      // Content CMS admin routes
      { path: 'content/posts', loadComponent: () => import('./features/admin/content/posts/admin-content-posts.component').then(m => m.AdminContentPostsComponent) },
      { path: 'content/posts/new', loadComponent: () => import('./features/admin/content/post-editor/admin-content-post-editor.component').then(m => m.AdminContentPostEditorComponent) },
      { path: 'content/posts/:slug/edit', loadComponent: () => import('./features/admin/content/post-editor/admin-content-post-editor.component').then(m => m.AdminContentPostEditorComponent) },
      { path: 'content/categories', loadComponent: () => import('./features/admin/content/categories/admin-content-categories.component').then(m => m.AdminContentCategoriesComponent) },
      { path: 'content/authors', loadComponent: () => import('./features/admin/content/authors/admin-content-authors.component').then(m => m.AdminContentAuthorsComponent) },
      { path: 'content/tags', loadComponent: () => import('./features/admin/content/tags/admin-content-tags.component').then(m => m.AdminContentTagsComponent) },
      { path: 'content/events', loadComponent: () => import('./features/admin/content/events/admin-content-events.component').then(m => m.AdminContentEventsComponent) },
      // Phase 2: Analytics, Newsletter, FAQ management
      { path: 'content/analytics', loadComponent: () => import('./features/admin/content/analytics/admin-content-analytics.component').then(m => m.AdminContentAnalyticsComponent) },
      { path: 'content/newsletter', loadComponent: () => import('./features/admin/content/newsletter/admin-content-newsletter.component').then(m => m.AdminContentNewsletterComponent) },
      { path: 'content/faq', loadComponent: () => import('./features/admin/content/faq/admin-content-faq.component').then(m => m.AdminContentFaqComponent) },
    ],
  },

  // Branch portal
  {
    path: 'branch',
    loadComponent: () => import('./layouts/branch-layout/branch-layout.component').then(m => m.BranchLayoutComponent),
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin', 'Owner', 'BranchAdmin'] },
    children: [
      { path: '', loadComponent: () => import('./features/branch/overview/branch-overview.component').then(m => m.BranchOverviewComponent) },
      { path: 'appointments', loadComponent: () => import('./features/lab/appointments/lab-appointments.component').then(m => m.LabAppointmentsComponent) },
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
      { path: 'branches', loadComponent: () => import('./features/owner/branches/owner-branches.component').then(m => m.OwnerBranchesComponent) },
      { path: 'tests', loadComponent: () => import('./features/owner/tests/owner-tests.component').then(m => m.OwnerTestsComponent) },
      { path: 'patients', loadComponent: () => import('./features/owner/patients/owner-patients.component').then(m => m.OwnerPatientsComponent) },
      { path: 'executive', loadComponent: () => import('./features/owner/executive/owner-executive.component').then(m => m.OwnerExecutiveComponent) },
    ],
  },

  { path: '**', redirectTo: '' },
];
