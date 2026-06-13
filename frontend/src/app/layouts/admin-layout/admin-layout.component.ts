import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

interface AdminNavItem { label: string; icon: string; route: string; dividerBefore?: boolean; }

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatMenuModule, CommonModule],
  template: `
    <div class="admin-layout" [class.collapsed]="collapsed()">
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <a routerLink="/admin" class="brand">
            @if (!collapsed()) { <img src="/images/hero/logo.png" alt="Capital Lab" class="brand-logo"> }
          </a>
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())">
            <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        @if (!collapsed()) { <div class="section-label">Business Ops</div> }

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            @if (item.dividerBefore) { <div class="nav-divider"></div> }
            <a [routerLink]="item.route" routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: item.route === '/admin'}" class="nav-item" [title]="collapsed() ? item.label : ''">
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

      <div class="admin-main">
        <header class="admin-topbar">
          <div class="topbar-left">
            @if (loadingService.isLoading()) { <div class="top-loader"></div> }
          </div>
          <div class="topbar-right">
            <a routerLink="/owner" class="owner-link"><mat-icon>insights</mat-icon><span class="owner-link-text"> Owner Dashboard</span></a>
            <button mat-icon-button aria-label="Open user menu" [matMenuTriggerFor]="menu">
              <div class="avatar">{{ initial() }}</div>
            </button>
            <mat-menu #menu>
              <a mat-menu-item routerLink="/"><mat-icon>home</mat-icon> Main Site</a>
              <button mat-menu-item (click)="authService.logout()"><mat-icon>logout</mat-icon> Logout</button>
            </mat-menu>
          </div>
        </header>
        <main class="admin-content"><router-outlet /></main>
      </div>

      <nav class="mobile-bottom-nav">
        @for (item of mobileNav; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active" class="mobile-item">
            <mat-icon>{{ item.icon }}</mat-icon><span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;
    $sidebar-w: 230px; $sidebar-collapsed: 64px; $topbar-h: 58px; $bottom-h: 58px;

    .admin-layout {
      --accent: #1e9df1;
      --bg-card: #ffffff;
      --bg-surface: #f6f8fb;
      --text-primary: #0f1419;
      --text-secondary: #4b5563;
      --text-muted: #72767a;
      --border: #dce6ed;
      display: flex;
      min-height: 100vh;
      font-family: $font-family;
      color: var(--text-primary);
      background: #f4f7fb;
    }
    .admin-sidebar { width: $sidebar-w; background: linear-gradient(180deg, #0f1419 0%, #152033 100%); color: white; display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transition: width 0.25s; box-shadow: 8px 0 28px rgba(15, 20, 25, .12);
      @media (max-width: 992px) { display: none; }
    }
    .admin-layout.collapsed .admin-sidebar { width: $sidebar-collapsed; }
    .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 0 14px; height: $topbar-h; border-bottom: 1px solid rgba(255,255,255,0.1); min-height: $topbar-h; }
    .brand { display: flex; align-items: center; flex: 1; min-width: 0; text-decoration: none; }
    .brand-logo { height: 34px; width: auto; object-fit: contain; }
    .collapse-btn { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; display: flex; border-radius: 6px; padding: 4px; flex-shrink: 0; &:hover { background: rgba(255,255,255,0.1); color: white; } }
    .section-label { padding: 12px 16px 6px; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); }
    .sidebar-nav { flex: 1; padding: 6px 8px; display: flex; flex-direction: column; gap: 1px; overflow-y: auto; }
    .nav-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 6px 0; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; color: rgba(255,255,255,0.65); text-decoration: none; font-size: 0.85rem; font-weight: 500; white-space: nowrap;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: rgba(255,255,255,0.1); color: white; }
      &.active { background: rgba($primary, 0.22); color: white; }
    }
    .sidebar-footer { padding: 10px 8px; border-top: 1px solid rgba(255,255,255,0.1); }
    .logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; background: none; color: rgba(255,255,255,0.6); cursor: pointer; border-radius: 8px; font-size: 0.85rem;
      mat-icon { font-size: 18px; } &:hover { background: rgba(239,68,68,0.15); color: #fca5a5; }
    }
    .admin-main { flex: 1; margin-left: $sidebar-w; display: flex; flex-direction: column; transition: margin-left 0.25s;
      @media (max-width: 992px) { margin-left: 0; margin-bottom: $bottom-h; }
    }
    .admin-layout.collapsed .admin-main { margin-left: $sidebar-collapsed; }
    .admin-topbar { height: $topbar-h; background: rgba(255,255,255,.96); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 40; box-shadow: 0 1px 0 rgba(15,20,25,.02); }
    .topbar-left { flex: 1; }
    .top-loader { width: 18px; height: 18px; border: 2px solid $gray-200; border-top-color: $primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .topbar-right { display: flex; align-items: center; gap: 12px; }
    .owner-link { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: $primary; text-decoration: none; font-weight: 600; padding: 5px 10px; border-radius: 999px; background: rgba($primary, 0.06); mat-icon { font-size: 16px; }
      @media (max-width: 480px) { .owner-link-text { display: none; } padding: 5px 8px; }
    }
    .owner-link-text { white-space: nowrap; }
    .avatar { width: 34px; height: 34px; border-radius: 50%; background: $primary; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .admin-content { flex: 1; padding: 24px; background: linear-gradient(180deg, #f6f8fb 0%, #eef3f8 100%); min-width: 0; }
    .admin-content ::ng-deep .page-wrapper { padding: 0; }
    .admin-content ::ng-deep .page-header {
      background: transparent;
      margin-bottom: 22px;
    }
    .admin-content ::ng-deep .page-header h1 {
      color: var(--text-primary);
      letter-spacing: 0;
    }
    .admin-content ::ng-deep .page-header p {
      color: var(--text-muted);
    }
    .admin-content ::ng-deep .table-card,
    .admin-content ::ng-deep .table-wrap,
    .admin-content ::ng-deep .panel,
    .admin-content ::ng-deep .stat-card,
    .admin-content ::ng-deep .author-card,
    .admin-content ::ng-deep .tag-card,
    .admin-content ::ng-deep .form-card,
    .admin-content ::ng-deep .stat-chip {
      background: var(--bg-card);
      border-color: var(--border);
      box-shadow: 0 10px 28px rgba(15, 20, 25, .05);
    }
    .admin-content ::ng-deep .btn-primary {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 8px 18px rgba(30, 157, 241, .20);
    }
    .admin-content ::ng-deep .btn-primary:hover:not(:disabled) {
      background: #1681c4;
    }
    .admin-content ::ng-deep input,
    .admin-content ::ng-deep textarea,
    .admin-content ::ng-deep select {
      background: #fff;
      color: var(--text-primary);
      border-color: #cfdbe3;
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
    }
    .admin-content ::ng-deep input:focus,
    .admin-content ::ng-deep textarea:focus,
    .admin-content ::ng-deep select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(30, 157, 241, .14);
    }
    .admin-content ::ng-deep .modal-backdrop {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: rgba(15, 20, 25, .58);
    }
    .admin-content ::ng-deep .modal {
      background: #fff;
      color: var(--text-primary);
      border-color: #d8e2e8;
      box-shadow: 0 20px 60px rgba(15, 20, 25, .28);
      filter: none;
      opacity: 1;
    }
    .mobile-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: $bottom-h; background: white; border-top: 1px solid $border-color; z-index: 50; align-items: center; justify-content: space-around;
      @media (max-width: 992px) { display: flex; }
    }
    .mobile-item { display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none; color: $text-secondary; font-size: 0.6rem; mat-icon { font-size: 20px; } &.active { color: $primary; } }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  collapsed = signal(false);

  navItems: AdminNavItem[] = [
    { label: 'Overview', icon: 'dashboard', route: '/admin/overview' },
    { label: 'Packages', icon: 'inventory_2', route: '/admin/packages', dividerBefore: true },
    { label: 'Notifications', icon: 'notifications', route: '/admin/notifications', dividerBefore: true },
    { label: 'Audit Center', icon: 'history', route: '/admin/audit' },
    { label: 'Settings', icon: 'settings', route: '/admin/settings' },
    { label: 'System Health', icon: 'monitor_heart', route: '/admin/system-health' },
    // Content CMS
    { label: 'Posts', icon: 'article', route: '/admin/content/posts', dividerBefore: true },
    { label: 'Categories', icon: 'folder_open', route: '/admin/content/categories' },
    { label: 'Authors', icon: 'person_outline', route: '/admin/content/authors' },
    { label: 'Tags', icon: 'label_outline', route: '/admin/content/tags' },
    { label: 'Events', icon: 'event', route: '/admin/content/events' },
    { label: 'FAQ', icon: 'quiz', route: '/admin/content/faq' },
    { label: 'Newsletter', icon: 'mail_outline', route: '/admin/content/newsletter' },
    { label: 'Analytics', icon: 'bar_chart', route: '/admin/content/analytics' },
  ];

  mobileNav = [
    { label: 'Overview', icon: 'dashboard', route: '/admin/overview' },
    { label: 'Packages', icon: 'inventory_2', route: '/admin/packages' },
    { label: 'Audit', icon: 'history', route: '/admin/audit' },
  ];

  initial(): string { return this.authService.currentUser()?.fullName?.charAt(0)?.toUpperCase() ?? 'A'; }
}
