import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AppStatCardComponent } from '../../../shared/ui/app-stat-card/app-stat-card.component';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';
import { AppStatusBadgeComponent } from '../../../shared/ui/app-status-badge/app-status-badge.component';
import { AuthService } from '../../../core/services/auth.service';
import { PatientDashboardStore } from '../stores/patient-dashboard.store';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    RouterLink, MatButtonModule, MatIconModule, CommonModule,
    AppStatCardComponent, AppPageHeaderComponent, AppStatusBadgeComponent,
  ],
  template: `
    <div class="dashboard">
      <app-page-header
        [title]="'Welcome, ' + firstName()"
        subtitle="Here's your health summary"
      />

      <!-- Stat Cards -->
      <div class="stats-grid">
        <app-stat-card icon="science" label="Total Results" [value]="store.stats().totalResults" color="#1a73e8" />
        <app-stat-card icon="assignment_turned_in" label="Results Ready" [value]="store.stats().resultsReady" color="#43a047" />
        <app-stat-card icon="calendar_today" label="Upcoming Appts" [value]="store.stats().upcomingAppointments" color="#fb8c00" />
        <app-stat-card icon="group" label="Family Members" [value]="store.stats().familyMembers" color="#8e24aa" />
      </div>

      <div class="dashboard-body">
        <!-- Upcoming Appointment -->
        <div class="dash-card">
          <div class="card-header">
            <h4>Upcoming Appointment</h4>
            <a mat-stroked-button routerLink="/patient/appointments" color="primary">View All</a>
          </div>
          @if (store.isLoading()) {
            <div class="loading-row"><div class="skel skel-full"></div></div>
          } @else if (store.upcomingAppointment()) {
            <div class="appointment-row">
              <div class="appt-icon">📅</div>
              <div class="appt-info">
                <p class="appt-date">{{ store.upcomingAppointment()?.appointmentDate | date:'mediumDate' }} at {{ store.upcomingAppointment()?.appointmentTime }}</p>
                <p class="appt-branch">{{ store.upcomingAppointment()?.branchName || 'Home Collection' }}</p>
              </div>
              <app-status-badge [status]="store.upcomingAppointment()?.status || 'pending'" />
            </div>
          } @else {
            <div class="empty-card-state">
              <mat-icon>event</mat-icon>
              <p>No upcoming appointments</p>
              <a mat-flat-button color="primary" routerLink="/patient/book">Book Now</a>
            </div>
          }
        </div>

        <!-- Latest Result -->
        <div class="dash-card">
          <div class="card-header">
            <h4>Latest Results</h4>
            <a mat-stroked-button routerLink="/patient/results" color="primary">View All</a>
          </div>
          @if (store.isLoading()) {
            <div class="loading-row"><div class="skel skel-full"></div></div>
          } @else if (store.recentReports().length > 0) {
            @for (report of store.recentReports(); track report.id) {
              <div class="result-row">
                <div class="result-icon">📋</div>
                <div class="result-info">
                  <p class="result-num">{{ report.reportNumber }}</p>
                  <p class="result-date">{{ report.generatedAt | date:'mediumDate' }}</p>
                </div>
                <div class="result-actions">
                  <app-status-badge [status]="report.status || 'pending'" />
                  <a mat-stroked-button [routerLink]="['/patient/results', report.id]" class="view-btn">View</a>
                </div>
              </div>
            }
          } @else {
            <div class="empty-card-state">
              <mat-icon>science</mat-icon>
              <p>No results yet</p>
            </div>
          }
        </div>

        <!-- Quick Actions -->
        <div class="dash-card quick-actions-card">
          <h4>Quick Actions</h4>
          <div class="quick-actions">
            @for (action of quickActions; track action.label) {
              <a [routerLink]="action.route" class="quick-action">
                <div class="qa-icon" [style.background]="action.bg">{{ action.icon }}</div>
                <span>{{ action.label }}</span>
              </a>
            }
          </div>
        </div>

        <!-- Health Tracker Preview -->
        <div class="dash-card">
          <div class="card-header">
            <h4>Health Tracker</h4>
            <a mat-stroked-button routerLink="/patient/health-tracker" color="primary">Details</a>
          </div>
          <div class="tracker-items">
            @for (item of trackerItems; track item.name) {
              <div class="tracker-item">
                <div class="tracker-label">
                  <span class="tracker-dot" [style.background]="item.color"></span>
                  {{ item.name }}
                </div>
                <div class="tracker-bar-wrap">
                  <div class="tracker-bar" [style.width.%]="item.pct" [style.background]="item.color"></div>
                </div>
                <span class="tracker-val">{{ item.value }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
      @media (max-width: 992px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 576px) { grid-template-columns: 1fr; }
    }
    .dashboard-body { display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .dash-card { background: white; border-radius: $border-radius; padding: 20px; box-shadow: $shadow-sm; border: 1px solid $border-color; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
      h4 { margin: 0; }
    }
    .appointment-row, .result-row { display: flex; align-items: center; gap: 12px; padding: 12px; background: $gray-50; border-radius: $border-radius; margin-bottom: 8px;
      &:last-child { margin-bottom: 0; }
    }
    .appt-icon, .result-icon { font-size: 2rem; }
    .appt-info, .result-info { flex: 1; }
    .appt-date, .result-num { font-weight: 600; margin: 0 0 2px; font-size: 0.9rem; }
    .appt-branch, .result-date { color: $text-secondary; font-size: 0.8rem; margin: 0; }
    .result-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
    .view-btn { font-size: 0.75rem !important; }
    .empty-card-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px; color: $text-secondary; mat-icon { font-size: 36px; color: $gray-300; } p { margin: 0; font-size: 0.875rem; } }
    .loading-row { padding: 12px 0; }
    .skel { height: 60px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skel-full { width: 100%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .quick-actions-card h4 { margin-bottom: 16px; }
    .quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .quick-action { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; border-radius: $border-radius; border: 1px solid $border-color; text-decoration: none; color: $text-primary; font-size: 0.8rem; text-align: center; transition: all 0.2s;
      &:hover { border-color: $primary; background: $primary-light; }
    }
    .qa-icon { font-size: 1.5rem; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .tracker-items { display: flex; flex-direction: column; gap: 12px; }
    .tracker-item { display: flex; align-items: center; gap: 12px; }
    .tracker-label { display: flex; align-items: center; gap: 6px; width: 120px; font-size: 0.8rem; color: $text-secondary; flex-shrink: 0; }
    .tracker-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .tracker-bar-wrap { flex: 1; height: 8px; background: $gray-100; border-radius: 4px; overflow: hidden; }
    .tracker-bar { height: 100%; border-radius: 4px; transition: width 0.5s; }
    .tracker-val { font-size: 0.8rem; font-weight: 600; color: $text-primary; min-width: 50px; text-align: right; }
  `]
})
export class PatientDashboardComponent implements OnInit {
  authService = inject(AuthService);
  store = inject(PatientDashboardStore);

  firstName(): string {
    const full = this.authService.currentUser()?.fullName ?? '';
    return full.split(' ')[0] || 'Patient';
  }

  quickActions = [
    { icon: '🧪', label: 'Book a Test', route: '/patient/book', bg: '#fee2e2' },
    { icon: '🏠', label: 'Home Collection', route: '/patient/home-collection', bg: '#e0f2fe' },
    { icon: '📋', label: 'My Results', route: '/patient/results', bg: '#dcfce7' },
    { icon: '👨‍👩‍👧', label: 'Family', route: '/patient/family-members', bg: '#f3e8ff' },
  ];

  trackerItems = [
    { name: 'Vitamin D', value: '— ng/mL', pct: 0, color: '#f59e0b' },
    { name: 'HbA1c', value: '— %', pct: 0, color: '#10b981' },
    { name: 'Cholesterol', value: '— mg/dL', pct: 0, color: '#3b82f6' },
    { name: 'TSH', value: '— µIU/mL', pct: 0, color: '#8b5cf6' },
  ];

  ngOnInit(): void {
    this.store.load();
  }
}
