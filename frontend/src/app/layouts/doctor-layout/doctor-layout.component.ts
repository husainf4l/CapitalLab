import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

interface DoctorNavItem {
  label: string;
  icon: string;
  route: string;
  dividerBefore?: boolean;
  badge?: number;
}

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, CommonModule],
  template: `
    <div class="doctor-layout">
      <!-- Sidebar -->
      <aside class="doctor-sidebar" [class.collapsed]="collapsed()">
        <div class="sidebar-header">
          <a routerLink="/doctor" class="doc-logo">
            <div class="logo-icon">👨‍⚕️</div>
            @if (!collapsed()) { <span class="logo-text">Doctor Portal</span> }
          </a>
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())">
            <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        @if (!collapsed()) {
          <div class="doctor-info">
            <div class="doc-avatar">{{ doctorInitial() }}</div>
            <div class="doc-meta">
              <div class="doc-name">{{ authService.currentUser()?.fullName || 'Doctor' }}</div>
              <div class="doc-role">{{ roleLabel() }}</div>
            </div>
          </div>
        }

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            @if (item.dividerBefore) { <div class="nav-divider"></div> }
            <a [routerLink]="item.route" routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: item.route === '/doctor'}"
               class="nav-item" [title]="collapsed() ? item.label : ''">
              <mat-icon>{{ item.icon }}</mat-icon>
              @if (!collapsed()) { <span>{{ item.label }}</span> }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          @if (!collapsed()) {
            <a routerLink="/" class="footer-link">
              <mat-icon>home</mat-icon> <span>Main Site</span>
            </a>
          }
          <button class="logout-btn" (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            @if (!collapsed()) { <span>Logout</span> }
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="doctor-main" [class.collapsed]="collapsed()">
        <header class="doctor-topbar">
          <button mat-icon-button class="mobile-menu-btn">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="topbar-center">
            @if (loadingService.isLoading()) {
              <div class="top-loader"></div>
            }
          </div>
          <div class="topbar-right">
            <div class="role-chip">
              <mat-icon>medical_services</mat-icon>
              @if (!collapsed()) { <span>{{ roleLabel() }}</span> }
            </div>
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <div class="user-avatar">{{ doctorInitial() }}</div>
            </button>
            <mat-menu #userMenu>
              <div mat-menu-item disabled class="user-menu-info">
                <strong>{{ authService.currentUser()?.fullName }}</strong>
                <small>{{ roleLabel() }}</small>
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

        <main class="doctor-content">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile bottom nav -->
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

    $doc-sidebar-w: 252px;
    $doc-sidebar-collapsed: 68px;
    $topbar-h: 60px;
    $bottom-nav-h: 60px;
    $doc-accent: #4f46e5;
    $doc-accent-light: #e0e7ff;

    .doctor-layout { display: flex; min-height: 100vh; }

    // ── Sidebar ────────────────────────────────────────────────────────────────
    .doctor-sidebar {
      width: $doc-sidebar-w; background: white; border-right: 1px solid $border-color;
      display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 50;
      transition: width 0.25s ease; box-shadow: $shadow-sm;
      @media (max-width: 992px) { display: none; }
      &.collapsed { width: $doc-sidebar-collapsed; }
    }

    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 14px; height: $topbar-h; border-bottom: 1px solid $border-color;
    }
    .doc-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: $text-primary; overflow: hidden; }
    .logo-icon { font-size: 1.4rem; flex-shrink: 0; }
    .logo-text { font-weight: 700; font-size: 0.95rem; white-space: nowrap; }
    .collapse-btn { background: none; border: none; cursor: pointer; color: $text-secondary; border-radius: 6px; padding: 4px; display: flex; transition: 0.2s;
      &:hover { background: $gray-100; color: $doc-accent; }
    }

    .doctor-info { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid $border-color; }
    .doc-avatar { width: 36px; height: 36px; border-radius: 50%; background: $doc-accent-light; color: $doc-accent; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .doc-name { font-weight: 600; font-size: 0.85rem; }
    .doc-role { font-size: 0.72rem; color: $text-secondary; }

    .sidebar-nav { flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 1px; overflow-y: auto; }
    .nav-divider { height: 1px; background: $border-color; margin: 6px 0; }

    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 8px; color: $text-secondary;
      text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: all 0.15s; white-space: nowrap;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
      &:hover { background: $doc-accent-light; color: $doc-accent; }
      &.active { background: $doc-accent-light; color: $doc-accent; font-weight: 600; }
    }

    .sidebar-footer { padding: 10px 8px; border-top: 1px solid $border-color; display: flex; flex-direction: column; gap: 2px; }
    .footer-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; color: $text-secondary; font-size: 0.85rem; font-weight: 500;
      mat-icon { font-size: 18px; }
      &:hover { background: $gray-100; }
    }
    .logout-btn {
      display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px;
      border-radius: 8px; border: none; background: none; cursor: pointer; color: $text-secondary;
      font-size: 0.85rem; font-weight: 500; transition: all 0.15s;
      mat-icon { font-size: 18px; }
      &:hover { color: $danger; background: #fee2e2; }
    }

    // ── Main ───────────────────────────────────────────────────────────────────
    .doctor-main {
      flex: 1; margin-left: $doc-sidebar-w; display: flex; flex-direction: column; transition: margin-left 0.25s ease;
      @media (max-width: 992px) { margin-left: 0; margin-bottom: $bottom-nav-h; }
      &.collapsed { margin-left: $doc-sidebar-collapsed; }
    }

    .doctor-topbar {
      height: $topbar-h; background: white; border-bottom: 1px solid $border-color;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; position: sticky; top: 0; z-index: 40; gap: 16px;
    }
    .topbar-center { flex: 1; }
    .top-loader { width: 20px; height: 20px; border: 2px solid $gray-200; border-top-color: $doc-accent; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .topbar-right { display: flex; align-items: center; gap: 8px; }
    .role-chip { display: flex; align-items: center; gap: 4px; padding: 4px 12px; background: $doc-accent-light; color: $doc-accent; border-radius: 999px; font-size: 0.78rem; font-weight: 600;
      mat-icon { font-size: 16px; }
    }
    .user-avatar { width: 34px; height: 34px; border-radius: 50%; background: $doc-accent; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
    .user-menu-info { display: flex; flex-direction: column; padding: 8px 16px; line-height: 1.4; pointer-events: none; opacity: 0.8;
      small { font-size: 0.75rem; color: $text-secondary; }
    }
    .mobile-menu-btn { display: none !important; @media (max-width: 992px) { display: flex !important; } }

    .doctor-content { flex: 1; padding: 24px; background: $bg-body; overflow-y: auto; }

    // ── Mobile bottom nav ──────────────────────────────────────────────────────
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
      &.active { color: $doc-accent; }
    }
  `]
})
export class DoctorLayoutComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  collapsed = signal(false);

  navItems: DoctorNavItem[] = [
    { label: 'Dashboard',       icon: 'dashboard',          route: '/doctor' },
    { label: 'Patient Timeline', icon: 'timeline',           route: '/doctor/patients', dividerBefore: true },
    { label: 'Critical Results', icon: 'priority_high',      route: '/doctor/critical-results' },
    { label: 'Pending Reviews',  icon: 'pending_actions',    route: '/doctor/reviews' },
    { label: 'Reports',          icon: 'description',        route: '/doctor/reports', dividerBefore: true },
    { label: 'Follow Ups',       icon: 'schedule_send',      route: '/doctor/follow-ups' },
    { label: 'Notes',            icon: 'sticky_note_2',      route: '/doctor/notes' },
    { label: 'Analytics',        icon: 'bar_chart',          route: '/doctor/analytics', dividerBefore: true },
  ];

  mobileNavItems = [
    { label: 'Dashboard',  icon: 'dashboard',      route: '/doctor' },
    { label: 'Timeline',   icon: 'timeline',       route: '/doctor/patients' },
    { label: 'Critical',   icon: 'priority_high',  route: '/doctor/critical-results' },
    { label: 'Reviews',    icon: 'pending_actions', route: '/doctor/reviews' },
    { label: 'Reports',    icon: 'description',    route: '/doctor/reports' },
  ];

  doctorInitial(): string {
    return this.authService.currentUser()?.fullName?.charAt(0)?.toUpperCase() ?? 'D';
  }

  roleLabel(): string {
    const roles = this.authService.currentUser()?.roles ?? [];
    if (roles.includes('Doctor')) return 'Doctor';
    if (roles.includes('BranchAdmin')) return 'Branch Admin';
    if (roles.includes('Owner')) return 'Owner';
    return 'Medical Staff';
  }
}
