import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

interface NavItem { label: string; icon: string; route: string; exact?: boolean; }

const NAV_OVERVIEW: NavItem[] = [
  { label: 'Overview', icon: 'dashboard', route: '/owner', exact: true },
];
const NAV_ANALYTICS: NavItem[] = [
  { label: 'Revenue', icon: 'payments', route: '/owner/revenue' },
  { label: 'Branches', icon: 'account_tree', route: '/owner/branches' },
  { label: 'Tests & Packages', icon: 'science', route: '/owner/tests' },
  { label: 'Patients', icon: 'people_alt', route: '/owner/patients' },
];
const NAV_MANAGEMENT: NavItem[] = [
  { label: 'Inventory', icon: 'inventory_2', route: '/owner/inventory' },
  { label: 'Insurance', icon: 'health_and_safety', route: '/owner/insurance' },
  { label: 'Executive Report', icon: 'bar_chart', route: '/owner/executive' },
];

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule,
            MatMenuModule, MatTooltipModule, MatDividerModule, CommonModule],
  template: `
    <div class="app-shell">
      <div class="app-container">

        <!-- ── Sidebar ──────────────────────────────────────────────── -->
        <aside class="app-sidebar" [class.collapsed]="collapsed()">

          <div class="sidebar-brand">
            <div class="brand-icon"><mat-icon>biotech</mat-icon></div>
            @if (!collapsed()) {
              <div class="brand-text">
                <span class="brand-name">Capital Lab</span>
                <span class="brand-tag">Enterprise</span>
              </div>
            }
            <button class="collapse-btn" (click)="collapsed.set(!collapsed())"
                    [matTooltip]="collapsed() ? 'Expand' : 'Collapse'" matTooltipPosition="right">
              <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
            </button>
          </div>

          @if (!collapsed()) {
            <div class="sidebar-profile">
              <div class="s-avatar">{{ initial() }}</div>
              <div class="s-info">
                <span class="s-name">{{ name() }}</span>
                <span class="s-role">Owner · Admin</span>
              </div>
              <button mat-icon-button class="s-more" [matMenuTriggerFor]="pm">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #pm>
                <a mat-menu-item routerLink="/"><mat-icon>home</mat-icon>Main Site</a>
                <a mat-menu-item routerLink="/admin"><mat-icon>settings</mat-icon>Operations</a>
                <button mat-menu-item (click)="authService.logout()"><mat-icon>logout</mat-icon>Sign Out</button>
              </mat-menu>
            </div>
          }

          <nav class="sidebar-nav">
            @if (!collapsed()) { <span class="nav-section">OVERVIEW</span> }
            @for (item of navOverview; track item.route) {
              <a class="nav-item" [routerLink]="item.route" routerLinkActive="active"
                 [routerLinkActiveOptions]="{exact: !!item.exact}"
                 [matTooltip]="collapsed() ? item.label : ''" matTooltipPosition="right">
                <mat-icon class="ni">{{ item.icon }}</mat-icon>
                @if (!collapsed()) { <span>{{ item.label }}</span> }
              </a>
            }

            @if (!collapsed()) { <span class="nav-section">ANALYTICS</span> }
            @for (item of navAnalytics; track item.route) {
              <a class="nav-item" [routerLink]="item.route" routerLinkActive="active"
                 [matTooltip]="collapsed() ? item.label : ''" matTooltipPosition="right">
                <mat-icon class="ni">{{ item.icon }}</mat-icon>
                @if (!collapsed()) { <span>{{ item.label }}</span> }
              </a>
            }

            @if (!collapsed()) { <span class="nav-section">MANAGEMENT</span> }
            @for (item of navManagement; track item.route) {
              <a class="nav-item" [routerLink]="item.route" routerLinkActive="active"
                 [matTooltip]="collapsed() ? item.label : ''" matTooltipPosition="right">
                <mat-icon class="ni">{{ item.icon }}</mat-icon>
                @if (!collapsed()) { <span>{{ item.label }}</span> }
              </a>
            }
          </nav>

          <div class="sidebar-footer">
            <a class="nav-item" routerLink="/admin"
               [matTooltip]="collapsed() ? 'Operations' : ''" matTooltipPosition="right">
              <mat-icon class="ni">manage_accounts</mat-icon>
              @if (!collapsed()) { <span>Operations</span> }
            </a>
            <button class="nav-item logout-btn" (click)="authService.logout()"
                    [matTooltip]="collapsed() ? 'Sign Out' : ''" matTooltipPosition="right">
              <mat-icon class="ni">logout</mat-icon>
              @if (!collapsed()) { <span>Sign Out</span> }
            </button>
          </div>
        </aside>

        <!-- ── Main ────────────────────────────────────────────────── -->
        <div class="app-main">

          <header class="app-header">
            <button mat-icon-button class="mobile-menu" (click)="mobileSidebar.set(!mobileSidebar())">
              <mat-icon>menu</mat-icon>
            </button>

            <div class="search-bar">
              <mat-icon>search</mat-icon>
              <input placeholder="Search patients, tests, reports…" type="search" />
              <kbd>⌘K</kbd>
            </div>

            <div class="hdr-right">
              <button mat-icon-button class="hdr-btn" matTooltip="Notifications">
                <mat-icon>notifications_none</mat-icon>
                <span class="nb">3</span>
              </button>
              <button mat-icon-button class="hdr-btn" matTooltip="Messages">
                <mat-icon>mail_outline</mat-icon>
              </button>
              <button mat-icon-button class="hdr-btn" [matMenuTriggerFor]="qaMenu">
                <mat-icon>add_circle_outline</mat-icon>
              </button>
              <mat-menu #qaMenu>
                <button mat-menu-item><mat-icon>person_add</mat-icon>New Patient</button>
                <button mat-menu-item><mat-icon>event</mat-icon>New Appointment</button>
                <button mat-menu-item><mat-icon>receipt_long</mat-icon>New Invoice</button>
              </mat-menu>

              <div class="hdivider"></div>

              <button class="hdr-avatar-btn" [matMenuTriggerFor]="avaMenu">
                <div class="hdr-avatar">{{ initial() }}</div>
                @if (loadingService.isLoading()) { <span class="ava-spin"></span> }
              </button>
              <mat-menu #avaMenu>
                <div class="ava-info" mat-menu-item disabled>
                  <strong>{{ name() }}</strong>
                  <small>{{ email() }}</small>
                </div>
                <mat-divider/>
                <a mat-menu-item routerLink="/"><mat-icon>home</mat-icon>Main Site</a>
                <a mat-menu-item routerLink="/admin"><mat-icon>settings</mat-icon>Operations Panel</a>
                <mat-divider/>
                <button mat-menu-item (click)="authService.logout()"><mat-icon>logout</mat-icon>Sign Out</button>
              </mat-menu>
            </div>
          </header>

          <main class="app-content"><router-outlet /></main>
        </div>
      </div>

      <nav class="mob-nav">
        @for (item of mobileNav; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active" class="mob-item">
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;

    .app-shell {
      min-height: 100vh; background: var(--card); padding: 16px;
      display: flex; flex-direction: column;
      @media (max-width: $breakpoint-lg) { padding: 0; }
    }

    .app-container {
      flex: 1; display: flex; width: 100%; max-width: 1540px; margin: 0 auto;
      height: calc(100vh - 32px);
      background: var(--background); border-radius: 24px;
      overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.10);
      @media (max-width: $breakpoint-lg) { border-radius: 0; height: 100vh; padding-bottom: 64px; }
    }

    /* ── Sidebar ──────────────────────────────────────────────────── */
    .app-sidebar {
      width: 268px; flex-shrink: 0; height: 100%;
      background: var(--background); border-right: 1px solid var(--border);
      display: flex; flex-direction: column; padding: $spacing-lg;
      overflow-y: auto; overflow-x: hidden; transition: width $transition-normal;
      scrollbar-width: none; &::-webkit-scrollbar { display: none; }
      &.collapsed { width: 76px; padding: $spacing-md; }
      @media (max-width: $breakpoint-lg) { display: none; }
    }

    .sidebar-brand {
      display: flex; align-items: center; gap: $spacing-sm;
      margin-bottom: $spacing-xl; min-height: 48px;
    }
    .brand-icon {
      width: 40px; height: 40px; flex-shrink: 0;
      background: var(--primary); border-radius: $border-radius;
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: var(--primary-foreground); font-size: 22px; }
    }
    .brand-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .brand-name { font-size: $font-size-md; font-weight: $font-weight-bold; color: var(--foreground); line-height: 1.2; }
    .brand-tag { font-size: 0.65rem; font-weight: $font-weight-semibold; color: var(--primary); letter-spacing: 0.08em; text-transform: uppercase; }
    .collapse-btn {
      background: none; border: none; cursor: pointer; padding: 4px;
      color: var(--muted-foreground); border-radius: $border-radius-sm;
      display: flex; align-items: center; justify-content: center;
      transition: background $transition-fast, color $transition-fast;
      mat-icon { font-size: 20px; }
      &:hover { background: var(--accent); color: var(--foreground); }
    }

    .sidebar-profile {
      display: flex; align-items: center; gap: $spacing-sm;
      background: var(--card); border: 1px solid var(--border);
      border-radius: $border-radius-lg; padding: 10px 12px; margin-bottom: $spacing-lg;
    }
    .s-avatar {
      width: 34px; height: 34px; flex-shrink: 0; border-radius: $border-radius-full;
      background: var(--primary); color: var(--primary-foreground);
      display: flex; align-items: center; justify-content: center;
      font-size: $font-size-sm; font-weight: $font-weight-bold;
    }
    .s-info { flex: 1; min-width: 0; }
    .s-name { display: block; font-size: $font-size-sm; font-weight: $font-weight-semibold; color: var(--foreground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .s-role { display: block; font-size: $font-size-xs; color: var(--muted-foreground); }
    .s-more { color: var(--muted-foreground) !important; width: 28px !important; height: 28px !important; }

    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 1px; }

    .nav-section {
      font-size: 0.62rem; font-weight: $font-weight-bold; color: var(--muted-foreground);
      letter-spacing: 0.1em; text-transform: uppercase;
      padding: 12px $spacing-sm 4px; display: block;
    }

    .nav-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border-radius: $border-radius; color: var(--muted-foreground);
      font-size: $font-size-sm; font-weight: $font-weight-medium;
      text-decoration: none; cursor: pointer; background: none; border: none;
      width: 100%; text-align: left;
      transition: background $transition-fast, color $transition-fast;
      &:hover { background: var(--card); color: var(--foreground); text-decoration: none; }
      &.active {
        background: color-mix(in srgb, var(--primary) 10%, var(--background));
        color: var(--primary); font-weight: $font-weight-semibold;
        .ni { color: var(--primary); }
      }
    }
    .ni { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; transition: color $transition-fast; }

    .sidebar-footer {
      padding-top: $spacing-md; border-top: 1px solid var(--border);
      margin-top: $spacing-md; display: flex; flex-direction: column; gap: 1px;
    }
    .logout-btn:hover { background: color-mix(in srgb, var(--chart-5) 8%, var(--background)) !important; color: var(--chart-5) !important; }

    /* ── Main ─────────────────────────────────────────────────────── */
    .app-main {
      flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--card);
    }

    .app-header {
      display: flex; align-items: center; gap: $spacing-md;
      margin: $spacing-md $spacing-md 0;
      background: var(--background); border: 1px solid var(--border);
      border-radius: $border-radius-xl; padding: 10px 20px; box-shadow: $shadow-sm; flex-shrink: 0;
      @media (max-width: $breakpoint-md) { margin: $spacing-sm; padding: 8px 12px; gap: $spacing-sm; }
    }

    .mobile-menu { display: none !important; @media (max-width: $breakpoint-lg) { display: inline-flex !important; } }

    .search-bar {
      flex: 1; max-width: 420px; display: flex; align-items: center; gap: $spacing-sm;
      background: var(--card); border: 1px solid var(--border); border-radius: $border-radius-full;
      padding: 7px 14px;
      mat-icon { font-size: 18px; color: var(--muted-foreground); flex-shrink: 0; }
      input {
        flex: 1; border: none; background: transparent; outline: none;
        font-size: $font-size-sm; color: var(--foreground); font-family: $font-family;
        &::placeholder { color: var(--muted-foreground); }
      }
      kbd {
        font-size: 0.65rem; color: var(--muted-foreground); background: var(--border);
        border-radius: 4px; padding: 2px 6px; flex-shrink: 0; font-family: $font-family;
        @media (max-width: $breakpoint-md) { display: none; }
      }
    }

    .hdr-right { display: flex; align-items: center; gap: 2px; margin-left: auto; }
    .hdr-btn {
      position: relative; color: var(--muted-foreground) !important;
      &:hover { color: var(--foreground) !important; background: var(--card) !important; }
    }
    .nb {
      position: absolute; top: 4px; right: 4px; width: 16px; height: 16px;
      border-radius: $border-radius-full; background: var(--chart-5); color: white;
      font-size: 0.58rem; font-weight: $font-weight-bold;
      display: flex; align-items: center; justify-content: center;
    }
    .hdivider { width: 1px; height: 22px; background: var(--border); margin: 0 6px; }

    .hdr-avatar-btn {
      background: none; border: none; cursor: pointer; padding: 2px; position: relative; line-height: 0;
    }
    .hdr-avatar {
      width: 36px; height: 36px; border-radius: $border-radius-full;
      background: var(--primary); color: var(--primary-foreground);
      font-size: $font-size-sm; font-weight: $font-weight-bold;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--background); box-shadow: 0 0 0 2px var(--primary);
    }
    .ava-spin {
      position: absolute; inset: 0; border-radius: 50%;
      border: 2px solid transparent; border-top-color: var(--primary);
      animation: spin 0.8s linear infinite;
    }
    .ava-info {
      display: flex; flex-direction: column; padding: 6px 16px; cursor: default;
      strong { font-size: $font-size-sm; color: var(--foreground); }
      small { font-size: $font-size-xs; color: var(--muted-foreground); }
    }

    .app-content {
      flex: 1; overflow-y: auto; padding: $spacing-lg $spacing-xl $spacing-2xl;
      scrollbar-width: thin; scrollbar-color: var(--border) transparent;
      @media (max-width: $breakpoint-md) { padding: $spacing-md $spacing-md $spacing-2xl; }
    }

    /* ── Mobile bottom nav ────────────────────────────────────────── */
    .mob-nav {
      display: none; position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--background); border-top: 1px solid var(--border);
      padding: 8px 0; z-index: 100;
      @media (max-width: $breakpoint-lg) { display: flex; }
    }
    .mob-item {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      gap: 2px; padding: 4px; text-decoration: none;
      color: var(--muted-foreground); font-size: 0.62rem; font-weight: $font-weight-medium;
      mat-icon { font-size: 22px; }
      &.active { color: var(--primary); }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class OwnerLayoutComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  collapsed = signal(false);
  mobileSidebar = signal(false);

  readonly navOverview = NAV_OVERVIEW;
  readonly navAnalytics = NAV_ANALYTICS;
  readonly navManagement = NAV_MANAGEMENT;

  readonly mobileNav: NavItem[] = [
    { label: 'Home', icon: 'dashboard', route: '/owner', exact: true },
    { label: 'Revenue', icon: 'payments', route: '/owner/revenue' },
    { label: 'Branches', icon: 'account_tree', route: '/owner/branches' },
    { label: 'More', icon: 'more_horiz', route: '/owner/executive' },
  ];

  private user = computed(() => this.authService.currentUser());
  name = computed(() => this.user()?.fullName ?? 'Owner');
  email = computed(() => this.user()?.email ?? '');
  initial = computed(() => (this.user()?.fullName?.charAt(0) ?? 'O').toUpperCase());
}
