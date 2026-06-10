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
            <span class="logo-icon">🧪</span>
            @if (!sidebarCollapsed()) {
              <span class="logo-text">Capital Lab</span>
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
          <button mat-icon-button class="mobile-sidebar-btn" (click)="mobileSidebarOpen.set(!mobileSidebarOpen())">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="header-title"></div>
          <div class="header-right">
            @if (loadingService.isLoading()) {
              <div class="loading-indicator"></div>
            }
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
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
      display: flex; min-height: 100vh; position: relative;
    }

    // Sidebar
    .sidebar {
      width: $sidebar-width; background: white; border-right: 1px solid $border-color;
      display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0;
      z-index: 50; transition: width 0.25s ease;
      @media (max-width: 992px) { display: none; }
    }

    .portal-layout.sidebar-collapsed .sidebar { width: $sidebar-collapsed-width; }

    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px; height: $header-height; border-bottom: 1px solid $border-color;
    }

    .sidebar-logo {
      display: flex; align-items: center; gap: 8px;
      text-decoration: none; color: $primary; font-weight: 700;
    }
    .logo-icon { font-size: 1.5rem; }
    .logo-text { font-size: 1rem; white-space: nowrap; }

    .collapse-btn {
      background: none; border: none; cursor: pointer; color: $text-secondary;
      border-radius: 8px; padding: 4px; display: flex;
      &:hover { background: $gray-100; color: $primary; }
    }

    .sidebar-nav {
      flex: 1; padding: 16px 8px; display: flex; flex-direction: column; gap: 2px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 10px; color: $text-secondary;
      text-decoration: none; font-size: 0.875rem; font-weight: 500;
      transition: all 0.2s; white-space: nowrap;
      mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
      &:hover { color: $primary; background: $primary-light; }
      &.active { color: $primary; background: $primary-light; font-weight: 600; }
    }

    .sidebar-cta { padding: 12px 8px 0; }
    .book-cta-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 10px 16px; border-radius: 10px;
      background: $primary; color: white; text-decoration: none;
      font-size: 0.875rem; font-weight: 600; transition: all 0.2s;
      mat-icon { font-size: 18px; }
      &:hover { background: $primary-dark; }
    }

    .sidebar-footer { padding: 16px 8px; border-top: 1px solid $border-color; }
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
      height: $header-height; background: white; border-bottom: 1px solid $border-color;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; position: sticky; top: 0; z-index: 40;
    }

    .header-right { display: flex; align-items: center; gap: 8px; }

    .mobile-sidebar-btn { display: none !important; @media (max-width: 992px) { display: flex !important; } }

    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: $primary;
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem;
    }

    .loading-indicator {
      width: 20px; height: 20px; border: 2px solid $gray-200;
      border-top-color: $primary; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .portal-content { flex: 1; padding: 24px; background: $bg-body; overflow-y: auto; }

    // Bottom Nav (mobile)
    .bottom-nav {
      display: none; position: fixed; bottom: 0; left: 0; right: 0;
      height: $bottom-nav-height; background: white; border-top: 1px solid $border-color;
      z-index: 50; align-items: center; justify-content: space-around;
      @media (max-width: 992px) { display: flex; }
    }

    .bottom-nav-item {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      text-decoration: none; color: $text-secondary; font-size: 0.65rem;
      padding: 4px 8px; border-radius: 8px;
      mat-icon { font-size: 22px; }
      &.active { color: $primary; }
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
    { label: 'My Results', icon: 'science', route: '/patient/results' },
    { label: 'Health Tracker', icon: 'monitor_heart', route: '/patient/health-tracker' },
    { label: 'Appointments', icon: 'calendar_today', route: '/patient/appointments' },
    { label: 'Home Collection', icon: 'home', route: '/patient/home-collection' },
    { label: 'Family Members', icon: 'group', route: '/patient/family-members' },
    { label: 'Payments', icon: 'payment', route: '/patient/payments' },
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
