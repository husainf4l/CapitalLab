import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppStatCardComponent } from '../../../shared/ui/app-stat-card/app-stat-card.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface BranchDashboard {
  todayAppointments: number;
  totalPatients: number;
  completedReports: number;
  pendingOrders: number;
}

@Component({
  selector: 'app-branch-overview',
  standalone: true,
  imports: [RouterLink, CommonModule, MatIconModule, MatButtonModule, AppStatCardComponent],
  template: `
    <div class="overview">
      <div class="page-header">
        <div>
          <h2>Branch Dashboard</h2>
          <p class="sub">Today's snapshot for your branch</p>
        </div>
        <button mat-stroked-button (click)="refresh()">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      <section class="section">
        <h3 class="section-title">Today's Activity</h3>
        <div class="kpi-grid">
          <a routerLink="/branch/appointments" class="kpi-link">
            <app-stat-card icon="event" label="Appointments Today" [value]="kpi().todayAppointments" color="#1a73e8" />
          </a>
          <a routerLink="/branch/appointments" class="kpi-link">
            <app-stat-card icon="people_alt" label="Total Patients" [value]="kpi().totalPatients" color="#0d9488" />
          </a>
          <a routerLink="/branch/appointments" class="kpi-link">
            <app-stat-card icon="check_circle" label="Reports Ready" [value]="kpi().completedReports" color="#16a34a" />
          </a>
          <a routerLink="/branch/appointments" class="kpi-link">
            <app-stat-card icon="assignment" label="Pending Orders" [value]="kpi().pendingOrders" color="#f59e0b" />
          </a>
        </div>
      </section>

      <section class="section">
        <h3 class="section-title">Quick Actions</h3>
        <div class="actions-grid">
          <a routerLink="/branch/appointments" class="action-card">
            <div class="action-icon" style="background:#dbeafe;color:#1d4ed8"><mat-icon>event</mat-icon></div>
            <div><p class="action-label">Appointments</p><p class="action-sub">Manage daily schedule</p></div>
          </a>
          <a routerLink="/patient/book" class="action-card">
            <div class="action-icon" style="background:#dcfce7;color:#166534"><mat-icon>add_circle</mat-icon></div>
            <div><p class="action-label">Book Appointment</p><p class="action-sub">Schedule a new visit</p></div>
          </a>
          <a routerLink="/patient/results" class="action-card">
            <div class="action-icon" style="background:#ede9fe;color:#6d28d9"><mat-icon>description</mat-icon></div>
            <div><p class="action-label">Patient Results</p><p class="action-sub">View lab reports</p></div>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .overview { max-width: 1200px; display: flex; flex-direction: column; gap: 28px; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;
      h2 { margin: 0 0 4px; font-size: 1.5rem; font-weight: 700; color: $text-primary; }
      .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; }
    }

    .section { display: flex; flex-direction: column; gap: 12px; }
    .section-title { margin: 0; font-size: 0.8rem; font-weight: 700; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.08em; }

    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px)  { grid-template-columns: 1fr; }
    }
    .kpi-link {
      text-decoration: none; display: block; border-radius: $border-radius;
      transition: transform 0.15s, box-shadow 0.15s;
      &:hover { transform: translateY(-2px); box-shadow: $shadow-md; }
    }

    .actions-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }
    .action-card {
      display: flex; align-items: center; gap: 14px;
      background: white; border: 1px solid $border-color; border-radius: $border-radius;
      padding: 16px; text-decoration: none; transition: all 0.15s;
      &:hover { border-color: #7c3aed; box-shadow: $shadow-sm; }
    }
    .action-icon {
      width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; }
    }
    .action-label { margin: 0 0 2px; font-size: 0.875rem; font-weight: 600; color: $text-primary; }
    .action-sub   { margin: 0; font-size: 0.75rem; color: $text-secondary; }
  `]
})
export class BranchOverviewComponent implements OnInit {
  private http = inject(HttpClient);

  kpi = signal<BranchDashboard>({ todayAppointments: 0, totalPatients: 0, completedReports: 0, pendingOrders: 0 });

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.http.get<{ data: BranchDashboard }>(`${environment.apiUrl}/api/v1/dashboard/branch`)
      .subscribe({ next: res => this.kpi.set(res.data ?? this.kpi()) });
  }
}
