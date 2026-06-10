import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

interface OwnerNavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatMenuModule, CommonModule],
  template: `
    <div class="owner-layout" [class.collapsed]="collapsed()">
      <aside class="owner-sidebar">
        <div class="sidebar-header">
          <a routerLink="/owner" class="brand">
            <span class="brand-icon">👑</span>
            @if (!collapsed()) { <span class="brand-text">Executive</span> }
          </a>
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())">
            <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        @if (!collapsed()) { <div class="welcome">{{ greeting() }}<br/><strong>{{ name() }}</strong></div> }

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact: item.route === '/owner'}" class="nav-item" [title]="collapsed() ? item.label : ''">
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

      <div class="owner-main">
        <header class="owner-topbar">
          <div class="topbar-left">@if (loadingService.isLoading()) { <div class="loader"></div> }</div>
          <div class="topbar-right">
            <a routerLink="/admin" class="admin-link"><mat-icon>settings</mat-icon> Operations</a>
            <button mat-icon-button [matMenuTriggerFor]="menu"><div class="avatar">{{ initial() }}</div></button>
            <mat-menu #menu>
              <a mat-menu-item routerLink="/"><mat-icon>home</mat-icon> Main Site</a>
              <button mat-menu-item (click)="authService.logout()"><mat-icon>logout</mat-icon> Logout</button>
            </mat-menu>
          </div>
        </header>
        <main class="owner-content"><router-outlet /></main>
      </div>

      <nav class="mobile-bottom-nav">
        @for (item of mobileNav; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active" class="mobile-item"><mat-icon>{{ item.icon }}</mat-icon><span>{{ item.label }}</span></a>
        }
      </nav>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;
    $sidebar-w: 240px; $sidebar-collapsed: 64px; $topbar-h: 60px; $bottom-h: 58px;

    .owner-layout { display: flex; min-height: 100vh; }
    .owner-sidebar { width: $sidebar-w; background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%); color: white; display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transition: width 0.25s;
      @media (max-width: 992px) { display: none; }
    }
    .owner-layout.collapsed .owner-sidebar { width: $sidebar-collapsed; }
    .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 0 14px; height: $topbar-h; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .brand { display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; font-weight: 700; }
    .brand-icon { font-size: 1.3rem; }
    .collapse-btn { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; display: flex; border-radius: 6px; padding: 4px; &:hover { background: rgba(255,255,255,0.1); color: white; } }
    .welcome { padding: 16px; font-size: 0.78rem; color: rgba(255,255,255,0.6); border-bottom: 1px solid rgba(255,255,255,0.08); strong { color: white; font-size: 0.95rem; } }
    .sidebar-nav { flex: 1; padding: 10px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
    .nav-item { display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 8px; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.85rem; font-weight: 500; white-space: nowrap;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: rgba(255,255,255,0.1); color: white; }
      &.active { background: rgba(129,140,248,0.3); color: white; }
    }
    .sidebar-footer { padding: 10px 8px; border-top: 1px solid rgba(255,255,255,0.1); }
    .logout-btn { display: flex; align-items: center; gap: 11px; width: 100%; padding: 10px 12px; border: none; background: none; color: rgba(255,255,255,0.6); cursor: pointer; border-radius: 8px; font-size: 0.85rem;
      mat-icon { font-size: 18px; } &:hover { background: rgba(239,68,68,0.15); color: #fca5a5; }
    }
    .owner-main { flex: 1; margin-left: $sidebar-w; display: flex; flex-direction: column; transition: margin-left 0.25s;
      @media (max-width: 992px) { margin-left: 0; margin-bottom: $bottom-h; }
    }
    .owner-layout.collapsed .owner-main { margin-left: $sidebar-collapsed; }
    .owner-topbar { height: $topbar-h; background: white; border-bottom: 1px solid $border-color; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 40; }
    .topbar-left { flex: 1; }
    .loader { width: 18px; height: 18px; border: 2px solid $gray-200; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .topbar-right { display: flex; align-items: center; gap: 12px; }
    .admin-link { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: #6366f1; text-decoration: none; font-weight: 600; padding: 5px 10px; border-radius: 999px; background: #eef2ff; mat-icon { font-size: 16px; } }
    .avatar { width: 34px; height: 34px; border-radius: 50%; background: #4f46e5; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .owner-content { flex: 1; padding: 28px; background: $bg-body; }
    .mobile-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: $bottom-h; background: white; border-top: 1px solid $border-color; z-index: 50; align-items: center; justify-content: space-around;
      @media (max-width: 992px) { display: flex; }
    }
    .mobile-item { display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none; color: $text-secondary; font-size: 0.58rem; mat-icon { font-size: 19px; } &.active { color: #6366f1; } }
  `]
})
export class OwnerLayoutComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  collapsed = signal(false);

  navItems: OwnerNavItem[] = [
    { label: 'Overview', icon: 'dashboard', route: '/owner' },
    { label: 'Revenue', icon: 'payments', route: '/owner/revenue' },
    { label: 'Branches', icon: 'store', route: '/owner/branches' },
    { label: 'Tests', icon: 'science', route: '/owner/tests' },
    { label: 'Patients', icon: 'groups', route: '/owner/patients' },
    { label: 'Inventory', icon: 'inventory_2', route: '/owner/inventory' },
    { label: 'Insurance', icon: 'health_and_safety', route: '/owner/insurance' },
  ];

  mobileNav = [
    { label: 'Overview', icon: 'dashboard', route: '/owner' },
    { label: 'Revenue', icon: 'payments', route: '/owner/revenue' },
    { label: 'Branches', icon: 'store', route: '/owner/branches' },
    { label: 'Patients', icon: 'groups', route: '/owner/patients' },
    { label: 'Insurance', icon: 'health_and_safety', route: '/owner/insurance' },
  ];

  initial(): string { return this.authService.currentUser()?.fullName?.charAt(0)?.toUpperCase() ?? 'O'; }
  name(): string { return this.authService.currentUser()?.fullName ?? 'Owner'; }
  greeting(): string { const h = new Date().getHours(); return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,'; }
}
