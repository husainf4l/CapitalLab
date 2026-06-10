import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

interface LabNavItem {
  label: string;
  icon: string;
  route: string;
  dividerBefore?: boolean;
}

@Component({
  selector: 'app-lab-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, CommonModule],
  template: `
    <div class="lab-layout" [class.collapsed]="collapsed()">
      <!-- Sidebar -->
      <aside class="lab-sidebar">
        <div class="sidebar-header">
          <a routerLink="/lab" class="lab-logo">
            <span class="logo-emoji">🔬</span>
            @if (!collapsed()) { <span class="logo-text">Capital Lab</span> }
          </a>
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())">
            <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        @if (!collapsed()) {
          <div class="sidebar-role-badge">Lab Dashboard</div>
        }

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            @if (item.dividerBefore) { <div class="nav-divider"></div> }
            <a [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact: item.route === '/lab'}" class="nav-item">
              <mat-icon>{{ item.icon }}</mat-icon>
              @if (!collapsed()) { <span>{{ item.label }}</span> }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            @if (!collapsed()) { <span>Logout</span> }
          </button>
        </div>
      </aside>

      <!-- Main area -->
      <div class="lab-main">
        <!-- Topbar -->
        <header class="lab-topbar">
          <button mat-icon-button class="mobile-menu-btn" (click)="mobileSidebarOpen.set(!mobileSidebarOpen())">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="topbar-title">
            @if (loadingService.isLoading()) { <span class="topbar-loading"></span> }
          </div>
          <div class="topbar-right">
            <div class="topbar-role">
              <mat-icon>badge</mat-icon>
              @if (!collapsed()) { <span>{{ roleLabel() }}</span> }
            </div>
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <div class="user-avatar">{{ authService.currentUser()?.fullName?.charAt(0) || 'L' }}</div>
            </button>
            <mat-menu #userMenu>
              <div class="user-menu-header" mat-menu-item disabled>
                <strong>{{ authService.currentUser()?.fullName }}</strong>
              </div>
              <a mat-menu-item routerLink="/">
                <mat-icon>home</mat-icon> Main Site
              </a>
              <button mat-menu-item (click)="authService.logout()">
                <mat-icon>logout</mat-icon> Logout
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Content -->
        <main class="lab-content">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile Bottom Nav -->
      <nav class="mobile-bottom-nav">
        @for (item of mobileNavItems; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active" class="mobile-nav-item">
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;

    $lab-sidebar: 240px;
    $lab-sidebar-collapsed: 68px;
    $topbar-h: 60px;
    $bottom-nav-h: 60px;
    $lab-green: #0d9488;

    .lab-layout { display: flex; min-height: 100vh; }

    // ── Sidebar ──────────────────────────────────────────────────────────────
    .lab-sidebar {
      width: $lab-sidebar; background: #0f172a; color: white;
      display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 50;
      transition: width 0.25s ease;
      @media (max-width: 992px) { display: none; }
    }
    .lab-layout.collapsed .lab-sidebar { width: $lab-sidebar-collapsed; }

    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 16px; height: $topbar-h; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .lab-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: white; font-weight: 700; font-size: 1rem; }
    .logo-emoji { font-size: 1.4rem; }
    .collapse-btn { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.5); border-radius: 6px; padding: 4px; display: flex; transition: 0.2s;
      &:hover { color: white; background: rgba(255,255,255,0.08); }
    }

    .sidebar-role-badge { margin: 12px 16px 8px; padding: 4px 10px; background: rgba($lab-green, 0.2); color: #5eead4; border-radius: 999px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; text-align: center; }

    .sidebar-nav { flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 1px; overflow-y: auto; }
    .nav-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 8px 0; }

    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 8px; color: rgba(255,255,255,0.6);
      text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: all 0.15s; white-space: nowrap;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
      &:hover { color: white; background: rgba(255,255,255,0.08); }
      &.active { color: white; background: rgba($lab-green, 0.25); }
    }

    .sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.08); }
    .logout-btn {
      display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px;
      border-radius: 8px; border: none; background: none; cursor: pointer; color: rgba(255,255,255,0.5);
      font-size: 0.85rem; font-weight: 500; transition: all 0.15s;
      mat-icon { font-size: 18px; }
      &:hover { color: #f87171; background: rgba(239,68,68,0.12); }
    }

    // ── Main ─────────────────────────────────────────────────────────────────
    .lab-main {
      flex: 1; margin-left: $lab-sidebar; display: flex; flex-direction: column; transition: margin-left 0.25s ease;
      @media (max-width: 992px) { margin-left: 0; margin-bottom: $bottom-nav-h; }
    }
    .lab-layout.collapsed .lab-main { margin-left: $lab-sidebar-collapsed; }

    .lab-topbar {
      height: $topbar-h; background: white; border-bottom: 1px solid $border-color;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; position: sticky; top: 0; z-index: 40;
    }
    .topbar-title { flex: 1; display: flex; align-items: center; }
    .topbar-loading { width: 18px; height: 18px; border: 2px solid $gray-200; border-top-color: $lab-green; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .topbar-right { display: flex; align-items: center; gap: 8px; }
    .topbar-role { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: $gray-50; border-radius: 999px; font-size: 0.8rem; color: $text-secondary;
      mat-icon { font-size: 16px; }
    }
    .user-avatar { width: 34px; height: 34px; border-radius: 50%; background: $lab-green; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
    .user-menu-header { font-size: 0.85rem; padding: 8px 16px; }

    .mobile-menu-btn { display: none !important; @media (max-width: 992px) { display: flex !important; } }

    .lab-content { flex: 1; padding: 24px; background: $bg-body; overflow-y: auto; }

    // ── Mobile bottom nav ────────────────────────────────────────────────────
    .mobile-bottom-nav {
      display: none; position: fixed; bottom: 0; left: 0; right: 0; height: $bottom-nav-h;
      background: white; border-top: 1px solid $border-color; z-index: 50;
      align-items: center; justify-content: space-around;
      @media (max-width: 992px) { display: flex; }
    }
    .mobile-nav-item {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      text-decoration: none; color: $text-secondary; font-size: 0.62rem;
      mat-icon { font-size: 20px; }
      &.active { color: $lab-green; }
    }
  `]
})
export class LabLayoutComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  collapsed = signal(false);
  mobileSidebarOpen = signal(false);

  navItems: LabNavItem[] = [
    { label: 'Overview',        icon: 'dashboard',      route: '/lab' },
    { label: 'Appointments',    icon: 'event',          route: '/lab/appointments',    dividerBefore: true },
    { label: 'Test Orders',     icon: 'assignment',     route: '/lab/orders' },
    { label: 'Samples',         icon: 'science',        route: '/lab/samples' },
    { label: 'Barcode',         icon: 'qr_code_2',      route: '/lab/barcode' },
    { label: 'Quality Control', icon: 'verified_user',  route: '/lab/qc',              dividerBefore: true },
    { label: 'Results Entry',   icon: 'edit_note',      route: '/lab/results-entry' },
    { label: 'Doctor Review',   icon: 'rate_review',    route: '/lab/doctor-review' },
  ];

  mobileNavItems = [
    { label: 'Overview',   icon: 'dashboard',     route: '/lab' },
    { label: 'Appts',      icon: 'event',         route: '/lab/appointments' },
    { label: 'Samples',    icon: 'science',       route: '/lab/samples' },
    { label: 'Results',    icon: 'edit_note',     route: '/lab/results-entry' },
    { label: 'Review',     icon: 'rate_review',   route: '/lab/doctor-review' },
  ];

  roleLabel(): string {
    const roles = this.authService.currentUser()?.roles ?? [];
    if (roles.includes('Doctor')) return 'Doctor';
    if (roles.includes('LabManager')) return 'Lab Manager';
    if (roles.includes('LabTechnician')) return 'Lab Tech';
    if (roles.includes('Receptionist')) return 'Reception';
    if (roles.includes('BranchAdmin')) return 'Branch Admin';
    return 'Staff';
  }
}
