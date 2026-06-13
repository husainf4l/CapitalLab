import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { CurrentPatientContextService } from '../../core/services/current-patient-context.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-patient-portal-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatMenuModule, CommonModule
  ],
  template: `
    <div class="portal-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <a routerLink="/" class="sidebar-logo">
            @if (!sidebarCollapsed()) {
              <img src="/images/hero/logo.png" alt="Capital Lab" class="brand-logo">
            }
          </a>
          <button class="collapse-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <!-- Book Appointment CTA -->
        @if (!sidebarCollapsed()) {
          <div class="sidebar-cta">
            <a routerLink="/patient/book" class="book-cta-btn">
              <mat-icon>add_circle</mat-icon>
              Book Appointment
            </a>
          </div>
        }

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" class="nav-item">
              <mat-icon>{{ item.icon }}</mat-icon>
              @if (!sidebarCollapsed()) {
                <span>{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            @if (!sidebarCollapsed()) {
              <span>Logout</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main Area -->
      <div class="main-area">
        <!-- Top Bar -->
        <header class="portal-header">
          <button mat-icon-button class="mobile-sidebar-btn" aria-label="Toggle patient navigation" (click)="mobileSidebarOpen.set(!mobileSidebarOpen())">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="header-title"></div>
          <div class="header-right">
            @if (loadingService.isLoading()) {
              <div class="loading-indicator"></div>
            }
            <button mat-icon-button aria-label="Open user menu" [matMenuTriggerFor]="userMenu">
              <div class="user-avatar">
                {{ authService.currentUser()?.fullName?.charAt(0) || 'P' }}
              </div>
            </button>
            <mat-menu #userMenu>
              <a mat-menu-item routerLink="/patient/profile">
                <mat-icon>person</mat-icon> Profile
              </a>
              <a mat-menu-item routerLink="/patient/notifications">
                <mat-icon>notifications</mat-icon> Notifications
              </a>
              <button mat-menu-item (click)="authService.logout()">
                <mat-icon>logout</mat-icon> Logout
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Content -->
        <main class="portal-content">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile Bottom Navigation -->
      <nav class="bottom-nav">
        @for (item of mobileNavItems; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active" class="bottom-nav-item">
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;

    .portal-layout {
      --patient-primary: #1e9df1;
      --patient-primary-dark: #147fc4;
      --patient-primary-soft: #e8f5fe;
      --patient-surface: #ffffff;
      --patient-surface-soft: #f6f9fc;
      --patient-border: #dce7ef;
      --patient-text: #0f1720;
      --patient-subtext: #526173;
      --patient-shadow: 0 14px 36px rgba(15, 23, 32, 0.08);
      display: flex;
      min-height: 100vh;
      position: relative;
      font-family: $font-family;
      color: var(--patient-text);
      background:
        radial-gradient(circle at top left, rgba(30, 157, 241, 0.08), transparent 34rem),
        linear-gradient(135deg, #f8fbfd 0%, #eef4f8 100%);
    }

    // Sidebar
    .sidebar {
      width: $sidebar-width;
      background: rgba(255, 255, 255, 0.96);
      border-right: 1px solid var(--patient-border);
      box-shadow: 10px 0 30px rgba(15, 23, 32, 0.04);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 50;
      transition: width 0.25s ease;
      @media (max-width: 992px) { display: none; }
    }

    .portal-layout.sidebar-collapsed .sidebar { width: $sidebar-collapsed-width; }

    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px; height: $header-height; border-bottom: 1px solid var(--patient-border);
    }

    .sidebar-logo {
      display: flex; align-items: center; flex: 1; min-width: 0;
      text-decoration: none;
    }
    .brand-logo { height: 34px; width: auto; object-fit: contain; }

    .collapse-btn {
      background: var(--patient-surface-soft); border: 1px solid var(--patient-border);
      cursor: pointer; color: var(--patient-subtext);
      border-radius: 10px; padding: 4px; display: flex;
      &:hover { background: var(--patient-primary-soft); color: var(--patient-primary); }
    }

    .sidebar-nav {
      flex: 1; padding: 16px 8px; display: flex; flex-direction: column; gap: 2px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 12px; border-radius: 12px; color: var(--patient-subtext);
      text-decoration: none; font-size: 0.875rem; font-weight: 500;
      transition: all 0.2s; white-space: nowrap; border: 1px solid transparent;
      mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
      &:hover { color: var(--patient-primary); background: var(--patient-primary-soft); }
      &.active {
        color: var(--patient-primary-dark);
        background: linear-gradient(135deg, #e8f5fe, #ffffff);
        border-color: rgba(30, 157, 241, 0.28);
        box-shadow: 0 8px 18px rgba(30, 157, 241, 0.10);
        font-weight: 700;
      }
    }

    .sidebar-cta { padding: 12px 8px 0; }
    .book-cta-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 12px 16px; border-radius: 12px;
      background: linear-gradient(135deg, var(--patient-primary), var(--patient-primary-dark));
      color: white; text-decoration: none;
      font-size: 0.875rem; font-weight: 700; transition: all 0.2s;
      box-shadow: 0 12px 24px rgba(30, 157, 241, 0.22);
      mat-icon { font-size: 18px; }
      &:hover { transform: translateY(-1px); box-shadow: 0 16px 30px rgba(30, 157, 241, 0.28); }
    }

    .sidebar-footer { padding: 16px 8px; border-top: 1px solid var(--patient-border); }
    .logout-btn {
      display: flex; align-items: center; gap: 12px;
      width: 100%; padding: 10px 12px; border-radius: 10px;
      border: none; background: none; cursor: pointer; color: $danger;
      font-size: 0.875rem; font-weight: 500; transition: all 0.2s;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &:hover { background: #fee2e2; }
    }

    // Main Area
    .main-area {
      flex: 1; margin-left: $sidebar-width; display: flex; flex-direction: column;
      transition: margin-left 0.25s ease;
      @media (max-width: 992px) { margin-left: 0; margin-bottom: $bottom-nav-height; }
    }

    .portal-layout.sidebar-collapsed .main-area { margin-left: $sidebar-collapsed-width; }

    .portal-header {
      height: $header-height;
      background: rgba(255, 255, 255, 0.92);
      border-bottom: 1px solid var(--patient-border);
      box-shadow: 0 8px 24px rgba(15, 23, 32, 0.04);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; position: sticky; top: 0; z-index: 40;
    }

    .header-right { display: flex; align-items: center; gap: 8px; }

    .mobile-sidebar-btn { display: none !important; @media (max-width: 992px) { display: flex !important; } }

    .user-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, var(--patient-primary), var(--patient-primary-dark));
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1rem;
      box-shadow: 0 10px 20px rgba(30, 157, 241, 0.20);
    }

    .loading-indicator {
      width: 20px; height: 20px; border: 2px solid $gray-200;
      border-top-color: $primary; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .portal-content {
      flex: 1;
      padding: 28px;
      background: transparent;
      overflow-y: auto;
      min-width: 0;
      @media (max-width: 768px) { padding: 18px; }
    }

    .portal-content ::ng-deep .page-header {
      margin-bottom: 22px;
      h1, .page-title {
        color: var(--patient-text);
        letter-spacing: 0;
      }
      p, .page-subtitle {
        color: var(--patient-subtext);
      }
    }

    .portal-content ::ng-deep .stat-card,
    .portal-content ::ng-deep .dash-card,
    .portal-content ::ng-deep .status-timeline-card,
    .portal-content ::ng-deep .report-card,
    .portal-content ::ng-deep .appt-card,
    .portal-content ::ng-deep .member-card,
    .portal-content ::ng-deep .metric-detail-card,
    .portal-content ::ng-deep .metric-mini-card,
    .portal-content ::ng-deep .profile-avatar-card,
    .portal-content ::ng-deep .profile-form-card,
    .portal-content ::ng-deep .hc-form-card,
    .portal-content ::ng-deep .hc-list-card,
    .portal-content ::ng-deep .payment-card,
    .portal-content ::ng-deep .summary-card,
    .portal-content ::ng-deep .report-paper,
    .portal-content ::ng-deep .progress-header,
    .portal-content ::ng-deep .step-content,
    .portal-content ::ng-deep .success-card,
    .portal-content ::ng-deep .notification-item {
      background: var(--patient-surface);
      border-color: var(--patient-border);
      border-radius: 16px;
      box-shadow: var(--patient-shadow);
      color: var(--patient-text);
    }

    .portal-content ::ng-deep .quick-action,
    .portal-content ::ng-deep .type-card,
    .portal-content ::ng-deep .branch-card,
    .portal-content ::ng-deep .patient-card {
      background: var(--patient-surface);
      border-color: var(--patient-border);
      border-radius: 14px;
      color: var(--patient-text);
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }

    .portal-content ::ng-deep .quick-action:hover,
    .portal-content ::ng-deep .type-card:hover,
    .portal-content ::ng-deep .branch-card:hover,
    .portal-content ::ng-deep .patient-card:hover,
    .portal-content ::ng-deep .report-card:hover,
    .portal-content ::ng-deep .appt-card:hover,
    .portal-content ::ng-deep .member-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 16px 34px rgba(15, 23, 32, 0.10);
      border-color: rgba(30, 157, 241, 0.32);
    }

    .portal-content ::ng-deep .type-card.selected,
    .portal-content ::ng-deep .branch-card.selected,
    .portal-content ::ng-deep .patient-card.selected,
    .portal-content ::ng-deep .time-slot.selected {
      border-color: var(--patient-primary);
      background: linear-gradient(135deg, #eaf6fe, #ffffff);
      box-shadow: 0 14px 30px rgba(30, 157, 241, 0.16);
    }

    .portal-content ::ng-deep h1,
    .portal-content ::ng-deep h2,
    .portal-content ::ng-deep h3,
    .portal-content ::ng-deep h4 {
      color: var(--patient-text);
      letter-spacing: 0;
    }

    .portal-content ::ng-deep p,
    .portal-content ::ng-deep .text-muted,
    .portal-content ::ng-deep .subtitle,
    .portal-content ::ng-deep .meta {
      color: var(--patient-subtext);
    }

    .portal-content ::ng-deep input,
    .portal-content ::ng-deep textarea,
    .portal-content ::ng-deep select {
      color: var(--patient-text);
    }

    .portal-content ::ng-deep .modal-backdrop,
    .portal-content ::ng-deep .modal-overlay {
      background: rgba(15, 23, 32, 0.58);
      backdrop-filter: none;
    }

    .portal-content ::ng-deep .modal-card {
      background: var(--patient-surface);
      border: 1px solid var(--patient-border);
      border-radius: 18px;
      box-shadow: 0 28px 70px rgba(15, 23, 32, 0.26);
      color: var(--patient-text);
    }

    .portal-content ::ng-deep .empty-state {
      color: var(--patient-subtext);
      background: rgba(255, 255, 255, 0.72);
      border-radius: 16px;
    }

    // Bottom Nav (mobile)
    .bottom-nav {
      display: none; position: fixed; bottom: 0; left: 0; right: 0;
      height: $bottom-nav-height;
      background: rgba(255, 255, 255, 0.96);
      border-top: 1px solid var(--patient-border);
      box-shadow: 0 -10px 30px rgba(15, 23, 32, 0.08);
      z-index: 50; align-items: center; justify-content: space-around;
      @media (max-width: 992px) { display: flex; }
    }

    .bottom-nav-item {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      text-decoration: none; color: var(--patient-subtext); font-size: 0.65rem;
      padding: 6px 10px; border-radius: 12px; min-width: 56px;
      mat-icon { font-size: 22px; }
      &.active { color: var(--patient-primary-dark); background: var(--patient-primary-soft); font-weight: 700; }
    }
  `]
})
export class PatientPortalLayoutComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  private ctx = inject(CurrentPatientContextService);
  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);

  constructor() {
    this.ctx.load();
  }

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/patient/dashboard' },
    { label: 'Book Appointment', icon: 'add_circle', route: '/patient/book' },
    { label: 'My Results', icon: 'science', route: '/patient/results' },
    { label: 'Health Tracker', icon: 'monitor_heart', route: '/patient/health-tracker' },
    { label: 'Appointments', icon: 'calendar_today', route: '/patient/appointments' },
    { label: 'Home Collection', icon: 'home', route: '/patient/home-collection' },
    { label: 'Family Members', icon: 'group', route: '/patient/family-members' },
    { label: 'Notifications', icon: 'notifications', route: '/patient/notifications' },
    { label: 'Profile', icon: 'person', route: '/patient/profile' },
  ];

  mobileNavItems: NavItem[] = [
    { label: 'Home', icon: 'dashboard', route: '/patient/dashboard' },
    { label: 'Results', icon: 'science', route: '/patient/results' },
    { label: 'Book', icon: 'add_circle', route: '/patient/book' },
    { label: 'Appts', icon: 'calendar_today', route: '/patient/appointments' },
    { label: 'Profile', icon: 'person', route: '/patient/profile' },
  ];
}
