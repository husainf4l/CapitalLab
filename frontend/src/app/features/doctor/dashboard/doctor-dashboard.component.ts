import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { DoctorDashboardStore } from '../stores/doctor-dashboard.store';
import { AuthService } from '../../../core/services/auth.service';
import { Patient } from '../../../core/models/patient.models';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Good {{ greeting() }}, {{ firstName() }}</h2>
          <p class="sub">{{ today | date:'EEEE, d MMMM yyyy' }}</p>
        </div>
        <button mat-icon-button (click)="store.load()"><mat-icon>refresh</mat-icon></button>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        @for (card of kpiCardList(); track card.label) {
          <div class="kpi-card" [style.border-top-color]="card.color">
            <div class="kpi-icon" [style.background]="card.color + '18'">
              <mat-icon [style.color]="card.color">{{ card.icon }}</mat-icon>
            </div>
            <div class="kpi-body">
              <p class="kpi-label">{{ card.label }}</p>
              @if (store.isLoading()) {
                <div class="kpi-skel"></div>
              } @else {
                <div class="kpi-value" [class.alert]="card.alert">{{ card.value }}</div>
              }
            </div>
            @if (card.route) {
              <a [routerLink]="card.route" class="kpi-link"><mat-icon>arrow_forward</mat-icon></a>
            }
          </div>
        }
      </div>

      <!-- Patient Search -->
      <div class="search-section">
        <h4>Patient Search</h4>
        <div class="search-input-wrap">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search by name, national ID, phone or report number</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            @if (store.isSearching()) {
              <mat-icon matSuffix class="spin">refresh</mat-icon>
            }
            <input matInput [(ngModel)]="searchInput" (ngModelChange)="store.search($event)" placeholder="Type to search..." />
          </mat-form-field>
          @if (store.showResults()) {
            <div class="search-dropdown">
              @if (store.searchResults().length === 0) {
                <div class="search-empty">No patients found</div>
              } @else {
                @for (patient of store.searchResults(); track patient.id) {
                  <div class="search-result" (click)="goToTimeline(patient)">
                    <div class="sr-avatar">{{ initials(patient) }}</div>
                    <div class="sr-info">
                      <div class="sr-name">{{ patient.fullName }}</div>
                      <div class="sr-meta">{{ patient.phone }}{{ patient.nationalId ? ' · ' + patient.nationalId : '' }}</div>
                    </div>
                    <mat-icon>chevron_right</mat-icon>
                  </div>
                }
              }
            </div>
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-section">
        <h4>Quick Actions</h4>
        <div class="actions-grid">
          @for (action of quickActions; track action.route) {
            <a [routerLink]="action.route" class="action-card">
              <div class="action-icon" [style.background]="action.color + '18'" [style.color]="action.color">
                <mat-icon>{{ action.icon }}</mat-icon>
              </div>
              <div class="action-body">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-desc">{{ action.desc }}</div>
              </div>
              <mat-icon class="action-arrow">chevron_right</mat-icon>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    $accent: #4f46e5;

    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h2 { margin: 0 0 4px; font-size: 1.35rem; }
      .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; }
    }

    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px;
      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }
    .kpi-card { background: white; border: 1px solid $border-color; border-top: 3px solid; border-radius: $border-radius; padding: 18px; box-shadow: $shadow-sm; display: flex; align-items: flex-start; gap: 12px; }
    .kpi-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 20px; } }
    .kpi-body { flex: 1; }
    .kpi-label { margin: 0 0 4px; font-size: 0.78rem; color: $text-secondary; }
    .kpi-value { font-size: 1.7rem; font-weight: 700; color: $text-primary; line-height: 1; &.alert { color: $danger; } }
    .kpi-skel { height: 28px; width: 56px; border-radius: 6px; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .kpi-link { margin-left: auto; align-self: center; color: $text-secondary; display: flex; &:hover { color: $accent; } }

    .search-section { margin-bottom: 28px;
      h4 { margin: 0 0 12px; font-size: 0.82rem; font-weight: 700; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .search-input-wrap { position: relative; }
    .search-field { width: 100%; max-width: 600px; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .search-dropdown { position: absolute; top: 100%; left: 0; width: 100%; max-width: 600px; background: white; border: 1px solid $border-color; border-radius: $border-radius; box-shadow: $shadow-lg; z-index: 200; max-height: 320px; overflow-y: auto; }
    .search-empty { padding: 16px; text-align: center; color: $text-secondary; font-size: 0.875rem; }
    .search-result { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.1s; &:hover { background: $gray-50; } mat-icon { color: $text-secondary; margin-left: auto; } }
    .sr-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e0e7ff; color: $accent; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .sr-name { font-weight: 600; font-size: 0.875rem; }
    .sr-meta { font-size: 0.75rem; color: $text-secondary; }

    .quick-section {
      h4 { margin: 0 0 12px; font-size: 0.82rem; font-weight: 700; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .action-card { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: white; border: 1px solid $border-color; border-radius: $border-radius; text-decoration: none; color: $text-primary; box-shadow: $shadow-sm; transition: all 0.15s;
      &:hover { box-shadow: $shadow-md; transform: translateY(-1px); }
    }
    .action-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 22px; } }
    .action-title { font-weight: 600; font-size: 0.875rem; }
    .action-desc { font-size: 0.78rem; color: $text-secondary; margin-top: 2px; }
    .action-arrow { margin-left: auto; color: $text-secondary; }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  store = inject(DoctorDashboardStore);
  private auth = inject(AuthService);
  private router = inject(Router);

  today = new Date();
  searchInput = '';

  kpiCardList() {
    const s = this.store.stats();
    return [
      { label: 'Pending Reviews',   icon: 'pending_actions', color: '#4f46e5', value: s.pendingReviews,       route: '/doctor/reviews',          alert: false },
      { label: 'Critical Results',  icon: 'priority_high',   color: '#ef4444', value: s.criticalResults,      route: '/doctor/critical-results', alert: s.criticalResults > 0 },
      { label: 'Reports Today',     icon: 'description',     color: '#22c55e', value: s.reportsToday,         route: '/doctor/reports',          alert: false },
      { label: 'Follow Ups Today',  icon: 'schedule_send',   color: '#f59e0b', value: s.followUpsToday,       route: '/doctor/follow-ups',       alert: false },
      { label: 'Patients Reviewed', icon: 'how_to_reg',      color: '#0d9488', value: s.patientsReviewed,     route: null,                       alert: false },
      { label: 'Avg Review (min)',  icon: 'timer',           color: '#8b5cf6', value: s.avgReviewTimeMinutes, route: null,                       alert: false },
    ];
  }

  readonly quickActions = [
    { title: 'Review Results',  desc: 'Review pending reports and sign off', icon: 'pending_actions',  route: '/doctor/reviews',          color: '#4f46e5' },
    { title: 'Critical Results', desc: 'View unacknowledged critical values', icon: 'priority_high',   route: '/doctor/critical-results',  color: '#ef4444' },
    { title: 'Search Patient',  desc: 'Find patient timeline and history',   icon: 'person_search',   route: '/doctor/patients',          color: '#0d9488' },
    { title: 'View Reports',    desc: 'Browse and approve lab reports',      icon: 'description',     route: '/doctor/reports',           color: '#f59e0b' },
  ];

  greeting(): string {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }

  firstName(): string {
    return this.auth.currentUser()?.fullName?.split(' ')[0] ?? 'Doctor';
  }

  initials(p: Patient): string {
    return ((p.firstName?.charAt(0) ?? '') + (p.lastName?.charAt(0) ?? '')).toUpperCase();
  }

  ngOnInit(): void { this.store.load(); }

  goToTimeline(patient: Patient): void {
    this.store.clearSearch();
    this.searchInput = '';
    this.router.navigate(['/doctor/patients', patient.id]);
  }
}
