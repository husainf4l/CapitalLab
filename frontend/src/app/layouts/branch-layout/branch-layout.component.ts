import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

interface NavItem { label: string; icon: string; route: string; exact?: boolean; }

@Component({
  selector: 'app-branch-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatMenuModule, CommonModule],
  template: `
    <div class="branch-layout" [class.collapsed]="collapsed()">
      <aside class="branch-sidebar">
        <div class="sidebar-header">
          <a routerLink="/branch" class="brand">
            @if (!collapsed()) { <img src="/images/hero/logo.png" alt="Capital Lab" class="brand-logo"> }
          </a>
          <button class="collapse-btn" (click)="collapsed.set(!collapsed())">
            <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        @if (!collapsed()) {
          <div class="role-badge">Branch Manager</div>
        }

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: !!item.exact}"
               class="nav-item" [title]="collapsed() ? item.label : ''">
              <mat-icon>{{ item.icon }}</mat-icon>
              @if (!collapsed()) { <span>{{ item.label }}</span> }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <a class="nav-item" routerLink="/admin" [title]="collapsed() ? 'Operations' : ''">
            <mat-icon>settings</mat-icon>
            @if (!collapsed()) { <span>Operations</span> }
          </a>
          <button class="nav-item logout-btn" (click)="authService.logout()" [title]="collapsed() ? 'Logout' : ''">
            <mat-icon>logout</mat-icon>
            @if (!collapsed()) { <span>Logout</span> }
          </button>
        </div>
      </aside>

      <div class="branch-main">
        <header class="branch-topbar">
          <div class="topbar-left">
            @if (loadingService.isLoading()) { <div class="top-loader"></div> }
          </div>
          <div class="topbar-right">
            <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="User menu">
              <div class="avatar">{{ initial() }}</div>
            </button>
            <mat-menu #menu>
              <div class="menu-name" mat-menu-item disabled>{{ authService.currentUser()?.fullName }}</div>
              <a mat-menu-item routerLink="/"><mat-icon>home</mat-icon>Main Site</a>
              <button mat-menu-item (click)="authService.logout()"><mat-icon>logout</mat-icon>Logout</button>
            </mat-menu>
          </div>
        </header>
        <main class="branch-content"><router-outlet /></main>
      </div>

      <nav class="mobile-bottom-nav">
        @for (item of mobileNav; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active" class="mob-item">
            <mat-icon>{{ item.icon }}</mat-icon><span>{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;
    $sb-w: 230px; $sb-col: 64px; $th: 58px; $bh: 58px;

    .branch-layout { display: flex; min-height: 100vh; font-family: $font-family; }
    .branch-sidebar {
      width: $sb-w; background: $secondary; color: white; display: flex; flex-direction: column;
      position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transition: width 0.25s;
      @media (max-width: 992px) { display: none; }
    }
    .branch-layout.collapsed .branch-sidebar { width: $sb-col; }
    .sidebar-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 14px; height: $th; border-bottom: 1px solid rgba(255,255,255,0.1); min-height: $th;
    }
    .brand { display: flex; align-items: center; flex: 1; min-width: 0; text-decoration: none; }
    .brand-logo { height: 34px; width: auto; object-fit: contain; }
    .collapse-btn { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; display: flex; border-radius: 6px; padding: 4px; flex-shrink: 0;
      &:hover { background: rgba(255,255,255,0.1); color: white; }
    }
    .role-badge { margin: 10px 14px 4px; padding: 3px 10px; background: rgba($primary, 0.2); color: #93d4f9; border-radius: 999px; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; text-align: center; }
    .sidebar-nav { flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 1px; overflow-y: auto; }
    .nav-item {
      display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px;
      color: rgba(255,255,255,0.65); text-decoration: none; font-size: 0.85rem; font-weight: 500;
      white-space: nowrap; border: none; background: none; cursor: pointer; width: 100%; text-align: left;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: rgba(255,255,255,0.1); color: white; text-decoration: none; }
      &.active { background: rgba($primary, 0.25); color: white; }
    }
    .sidebar-footer { padding: 10px 8px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 1px; }
    .logout-btn:hover { background: rgba(239,68,68,0.15) !important; color: #fca5a5 !important; }
    .branch-main {
      flex: 1; margin-left: $sb-w; display: flex; flex-direction: column; transition: margin-left 0.25s;
      @media (max-width: 992px) { margin-left: 0; margin-bottom: $bh; }
    }
    .branch-layout.collapsed .branch-main { margin-left: $sb-col; }
    .branch-topbar { height: $th; background: white; border-bottom: 1px solid $border-color; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 40; }
    .topbar-left { flex: 1; }
    .top-loader { width: 18px; height: 18px; border: 2px solid $gray-200; border-top-color: $primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .topbar-right { display: flex; align-items: center; gap: 8px; }
    .avatar { width: 34px; height: 34px; border-radius: 50%; background: $primary; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
    .menu-name { font-size: 0.8rem; padding: 4px 16px; }
    .branch-content { flex: 1; padding: 24px; background: $bg-body; }
    .mobile-bottom-nav {
      display: none; position: fixed; bottom: 0; left: 0; right: 0; height: $bh;
      background: white; border-top: 1px solid $border-color; z-index: 50;
      align-items: center; justify-content: space-around;
      @media (max-width: 992px) { display: flex; }
    }
    .mob-item { display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none; color: $text-secondary; font-size: 0.6rem; mat-icon { font-size: 20px; } &.active { color: $primary; } }
  `]
})
export class BranchLayoutComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  collapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Overview',     icon: 'dashboard', route: '/branch', exact: true },
    { label: 'Appointments', icon: 'event',     route: '/branch/appointments' },
  ];

  mobileNav: NavItem[] = [
    { label: 'Overview', icon: 'dashboard', route: '/branch', exact: true },
    { label: 'Appts',    icon: 'event',     route: '/branch/appointments' },
  ];

  initial(): string { return this.authService.currentUser()?.fullName?.charAt(0)?.toUpperCase() ?? 'B'; }
}
