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
            <span class="brand-icon">⚙️</span>
            @if (!collapsed()) { <span class="brand-text">Operations</span> }
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
            <a routerLink="/owner" class="owner-link"><mat-icon>insights</mat-icon> Owner Dashboard</a>
            <button mat-icon-button [matMenuTriggerFor]="menu">
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
    $sidebar-w: 230px; $sidebar-collapsed: 64px; $topbar-h: 58px; $bottom-h: 58px; $accent: #0f766e;

    .admin-layout { display: flex; min-height: 100vh; }
    .admin-sidebar { width: $sidebar-w; background: #134e4a; color: white; display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transition: width 0.25s;
      @media (max-width: 992px) { display: none; }
    }
    .admin-layout.collapsed .admin-sidebar { width: $sidebar-collapsed; }
    .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 0 14px; height: $topbar-h; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .brand { display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; font-weight: 700; }
    .brand-icon { font-size: 1.3rem; }
    .collapse-btn { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; display: flex; border-radius: 6px; padding: 4px; &:hover { background: rgba(255,255,255,0.1); color: white; } }
    .section-label { padding: 12px 16px 6px; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); }
    .sidebar-nav { flex: 1; padding: 6px 8px; display: flex; flex-direction: column; gap: 1px; overflow-y: auto; }
    .nav-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 6px 0; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; color: rgba(255,255,255,0.65); text-decoration: none; font-size: 0.85rem; font-weight: 500; white-space: nowrap;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: rgba(255,255,255,0.1); color: white; }
      &.active { background: rgba(45,212,191,0.25); color: white; }
    }
    .sidebar-footer { padding: 10px 8px; border-top: 1px solid rgba(255,255,255,0.1); }
    .logout-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border: none; background: none; color: rgba(255,255,255,0.6); cursor: pointer; border-radius: 8px; font-size: 0.85rem;
      mat-icon { font-size: 18px; } &:hover { background: rgba(239,68,68,0.15); color: #fca5a5; }
    }
    .admin-main { flex: 1; margin-left: $sidebar-w; display: flex; flex-direction: column; transition: margin-left 0.25s;
      @media (max-width: 992px) { margin-left: 0; margin-bottom: $bottom-h; }
    }
    .admin-layout.collapsed .admin-main { margin-left: $sidebar-collapsed; }
    .admin-topbar { height: $topbar-h; background: white; border-bottom: 1px solid $border-color; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 40; }
    .topbar-left { flex: 1; }
    .top-loader { width: 18px; height: 18px; border: 2px solid $gray-200; border-top-color: $accent; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .topbar-right { display: flex; align-items: center; gap: 12px; }
    .owner-link { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: $accent; text-decoration: none; font-weight: 600; padding: 5px 10px; border-radius: 999px; background: #f0fdfa; mat-icon { font-size: 16px; } }
    .avatar { width: 34px; height: 34px; border-radius: 50%; background: $accent; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .admin-content { flex: 1; padding: 24px; background: $bg-body; }
    .mobile-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: $bottom-h; background: white; border-top: 1px solid $border-color; z-index: 50; align-items: center; justify-content: space-around;
      @media (max-width: 992px) { display: flex; }
    }
    .mobile-item { display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none; color: $text-secondary; font-size: 0.6rem; mat-icon { font-size: 20px; } &.active { color: $accent; } }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  collapsed = signal(false);

  navItems: AdminNavItem[] = [
    { label: 'Inventory', icon: 'inventory_2', route: '/admin/inventory' },
    { label: 'Purchase Orders', icon: 'shopping_cart', route: '/admin/purchase-orders' },
    { label: 'Billing', icon: 'receipt_long', route: '/admin/billing', dividerBefore: true },
    { label: 'Payments', icon: 'payments', route: '/admin/payments' },
    { label: 'Insurance', icon: 'health_and_safety', route: '/admin/insurance', dividerBefore: true },
  ];

  mobileNav = [
    { label: 'Inventory', icon: 'inventory_2', route: '/admin/inventory' },
    { label: 'Orders', icon: 'shopping_cart', route: '/admin/purchase-orders' },
    { label: 'Billing', icon: 'receipt_long', route: '/admin/billing' },
    { label: 'Payments', icon: 'payments', route: '/admin/payments' },
    { label: 'Insurance', icon: 'health_and_safety', route: '/admin/insurance' },
  ];

  initial(): string { return this.authService.currentUser()?.fullName?.charAt(0)?.toUpperCase() ?? 'A'; }
}
