import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { LabOverviewStore } from '../stores/lab-overview.store';
import { LabKpiCardComponent } from '../shared/lab-kpi-card.component';

@Component({
  selector: 'app-lab-overview',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, CommonModule, LabKpiCardComponent],
  template: `
    <div class="overview-page">
      <div class="page-header">
        <div>
          <h2>Lab Overview</h2>
          <p class="sub">Real-time dashboard · {{ today | date:'fullDate' }}</p>
        </div>
        <button mat-stroked-button (click)="store.load()">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <lab-kpi-card label="Today's Appointments" icon="event"
          [value]="store.kpi().todayAppointments" color="#1a73e8" [loading]="store.isLoading()" />
        <lab-kpi-card label="Pending Orders" icon="assignment"
          [value]="store.kpi().pendingOrders" color="#f59e0b" [loading]="store.isLoading()" />
        <lab-kpi-card label="Samples Collected" icon="colorize"
          [value]="store.kpi().samplesCollected" color="#0d9488" [loading]="store.isLoading()" />
        <lab-kpi-card label="Samples Processing" icon="autorenew"
          [value]="store.kpi().samplesProcessing" color="#8b5cf6" [loading]="store.isLoading()" />
        <lab-kpi-card label="QC Pending" icon="verified_user"
          [value]="store.kpi().qcPending" color="#ef4444" [loading]="store.isLoading()" />
        <lab-kpi-card label="Results Pending Review" icon="pending_actions"
          [value]="store.kpi().resultsPendingReview" color="#f97316" [loading]="store.isLoading()" />
        <lab-kpi-card label="Completed Reports" icon="task_alt"
          [value]="store.kpi().completedReports" color="#22c55e" [loading]="store.isLoading()" />
      </div>

      <!-- Quick Links -->
      <div class="quick-links-section">
        <h4>Quick Access</h4>
        <div class="quick-links">
          @for (link of quickLinks; track link.route) {
            <a [routerLink]="link.route" class="quick-link">
              <div class="ql-icon" [style.background]="link.color + '20'" [style.color]="link.color">
                <mat-icon>{{ link.icon }}</mat-icon>
              </div>
              <span>{{ link.label }}</span>
            </a>
          }
        </div>
      </div>

      <!-- Workflow Guide -->
      <div class="workflow-card">
        <h4>Sample Processing Workflow</h4>
        <div class="workflow-steps">
          @for (step of workflowSteps; track step.label) {
            <div class="ws-step">
              <div class="ws-num" [style.background]="step.color">{{ step.num }}</div>
              <div class="ws-info">
                <strong>{{ step.label }}</strong>
                <span>{{ step.desc }}</span>
              </div>
              @if (!isLast(step)) {
                <mat-icon class="ws-arrow">chevron_right</mat-icon>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .overview-page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h2 { margin: 0 0 4px; font-size: 1.4rem; }
      .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; }
    }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px;
      @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }

    .quick-links-section { margin-bottom: 28px;
      h4 { margin: 0 0 16px; color: $text-secondary; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .quick-links { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    }
    .quick-link {
      display: flex; align-items: center; gap: 10px; padding: 14px 16px;
      background: white; border: 1px solid $border-color; border-radius: $border-radius;
      text-decoration: none; color: $text-primary; font-size: 0.875rem; font-weight: 500;
      box-shadow: $shadow-sm; transition: all 0.15s;
      &:hover { box-shadow: $shadow-md; transform: translateY(-1px); }
    }
    .ql-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 18px; } }

    .workflow-card { background: white; border-radius: $border-radius; padding: 24px; box-shadow: $shadow-sm; border: 1px solid $border-color;
      h4 { margin: 0 0 20px; }
    }
    .workflow-steps { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
    .ws-step { display: flex; align-items: center; gap: 10px; }
    .ws-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .ws-info { strong { display: block; font-size: 0.85rem; } span { font-size: 0.75rem; color: $text-secondary; } }
    .ws-arrow { color: $gray-400; font-size: 18px; }
  `]
})
export class LabOverviewComponent implements OnInit {
  store = inject(LabOverviewStore);
  today = new Date();

  quickLinks = [
    { label: 'Appointments', icon: 'event', route: '/lab/appointments', color: '#1a73e8' },
    { label: 'Samples', icon: 'science', route: '/lab/samples', color: '#0d9488' },
    { label: 'QC Queue', icon: 'verified_user', route: '/lab/qc', color: '#ef4444' },
    { label: 'Results Entry', icon: 'edit_note', route: '/lab/results-entry', color: '#f97316' },
    { label: 'Test Orders', icon: 'assignment', route: '/lab/orders', color: '#8b5cf6' },
    { label: 'Barcode', icon: 'qr_code_2', route: '/lab/barcode', color: '#0891b2' },
    { label: 'Doctor Review', icon: 'rate_review', route: '/lab/doctor-review', color: '#16a34a' },
  ];

  workflowSteps = [
    { num: 1, label: 'Appointment', desc: 'Confirm visit', color: '#1a73e8' },
    { num: 2, label: 'Order', desc: 'Review tests', color: '#8b5cf6' },
    { num: 3, label: 'Sample', desc: 'Collect sample', color: '#0d9488' },
    { num: 4, label: 'Process', desc: 'Analyse', color: '#f97316' },
    { num: 5, label: 'QC', desc: 'Quality check', color: '#ef4444' },
    { num: 6, label: 'Results', desc: 'Enter values', color: '#f59e0b' },
    { num: 7, label: 'Review', desc: 'Doctor sign-off', color: '#16a34a' },
    { num: 8, label: 'Release', desc: 'Send to patient', color: '#22c55e' },
  ];

  isLast(step: any): boolean {
    return step.num === this.workflowSteps.length;
  }

  ngOnInit(): void {
    this.store.load();
  }
}
