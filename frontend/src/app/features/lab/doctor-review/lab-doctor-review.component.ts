import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { LabDoctorReviewStore } from '../stores/lab-doctor-review.store';
import { LabStatusBadgeComponent } from '../shared/lab-status-badge.component';
import { Report } from '../../../core/models/result.models';

@Component({
  selector: 'app-lab-doctor-review',
  standalone: true,
  imports: [
    FormsModule, CommonModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, LabStatusBadgeComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Doctor Review</h2>
          <p class="sub">{{ store.pendingReports().length }} reports awaiting sign-off</p>
        </div>
        <button mat-icon-button (click)="store.loadPending()"><mat-icon>refresh</mat-icon></button>
      </div>

      <div class="layout">
        <!-- Pending Reports List -->
        <div class="reports-panel">
          <div class="panel-label">Pending Reports</div>
          @if (store.isLoading()) {
            <div class="loading-rows">
              @for (i of [1,2,3]; track i) { <div class="skel-row"></div> }
            </div>
          } @else if (store.pendingReports().length === 0) {
            <div class="empty-state">
              <mat-icon>rate_review</mat-icon>
              <p>No reports pending</p>
              <span>All reports have been reviewed</span>
            </div>
          } @else {
            <div class="report-list">
              @for (report of store.pendingReports(); track report.id) {
                <div class="report-item" [class.selected]="store.selectedReport()?.id === report.id" (click)="store.selectReport(report)">
                  <div class="ri-top">
                    <span class="ri-id">#{{ report.reportNumber || report.id.slice(0, 8) }}</span>
                    <lab-status-badge [status]="report.status" />
                  </div>
                  <div class="ri-patient">{{ report.patientName || '—' }}</div>
                  <div class="ri-date">{{ report.generatedAt | date:'dd MMM yyyy' }}</div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Report Detail + Decision -->
        <div class="review-panel">
          @if (!store.selectedReport()) {
            <div class="no-selection">
              <mat-icon>rate_review</mat-icon>
              <p>Select a report to review and sign off</p>
            </div>
          } @else {
            <div class="review-detail">
              <div class="detail-header">
                <div>
                  <h3>Report #{{ store.selectedReport()!.reportNumber || store.selectedReport()!.id.slice(0, 8) }}</h3>
                  <div class="detail-sub">{{ store.selectedReport()!.patientName }} · {{ store.selectedReport()!.generatedAt | date:'dd MMM yyyy' }}</div>
                </div>
                <lab-status-badge [status]="store.selectedReport()!.status" />
              </div>

              <!-- Results table -->
              @if (store.selectedReport()!.results?.length) {
                <div class="results-table-wrap">
                  <table class="results-table">
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Value</th>
                        <th>Unit</th>
                        <th>Reference</th>
                        <th>Interpretation</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (result of store.selectedReport()!.results; track result.id) {
                        <tr [class.critical-row]="result.interpretation === 'critical'" [class.abnormal-row]="result.interpretation === 'high' || result.interpretation === 'low'">
                          <td><strong>{{ result.testName }}</strong></td>
                          <td class="value-cell">{{ result.value }}</td>
                          <td>{{ result.unit }}</td>
                          <td>{{ result.referenceRange }}</td>
                          <td>
                            @if (result.interpretation) {
                              <lab-status-badge [status]="result.interpretation" />
                            } @else {
                              <span class="no-interp">—</span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="no-results">No result entries found in this report.</div>
              }

              <!-- Critical values alert -->
              @if (hasCritical()) {
                <div class="critical-alert">
                  <mat-icon>priority_high</mat-icon>
                  <div>
                    <strong>Critical values present</strong>
                    <p>Patient or referring physician should be notified immediately before releasing this report.</p>
                  </div>
                </div>
              }

              <!-- Doctor decision -->
              <div class="decision-section">
                <h4>Doctor Decision</h4>
                <mat-form-field appearance="outline" class="notes-field">
                  <mat-label>Clinical Notes / Comments</mat-label>
                  <textarea matInput [ngModel]="store.doctorNotes()" (ngModelChange)="store.doctorNotes.set($event)" rows="3" placeholder="Add interpretation notes, instructions for patient, etc."></textarea>
                </mat-form-field>

                <div class="decision-actions">
                  <button mat-raised-button color="primary"
                    [disabled]="store.isActing() === store.selectedReport()!.id"
                    (click)="approve(store.selectedReport()!.id)">
                    @if (store.isActing() === store.selectedReport()!.id) {
                      <ng-container><mat-icon class="spin">refresh</mat-icon> Processing...</ng-container>
                    } @else {
                      <ng-container><mat-icon>check_circle</mat-icon> Approve &amp; Release</ng-container>
                    }
                  </button>
                  <button mat-stroked-button color="warn"
                    [disabled]="store.isActing() === store.selectedReport()!.id"
                    (click)="requestRetest(store.selectedReport()!.id)">
                    <mat-icon>refresh</mat-icon> Request Retest
                  </button>
                  <button mat-stroked-button (click)="store.clearSelection()">
                    <mat-icon>close</mat-icon> Cancel
                  </button>
                </div>

                @if (approveSuccess()) {
                  <div class="success-banner"><mat-icon>check_circle</mat-icon> Report approved and released to patient</div>
                }
                @if (retestSuccess()) {
                  <div class="info-banner"><mat-icon>refresh</mat-icon> Retest requested — report removed from queue</div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h2 { margin: 0 0 4px; } .sub { margin: 0; font-size: 0.875rem; color: $text-secondary; }
    }

    .layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .panel-label { font-size: 0.85rem; font-weight: 600; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px; }

    .loading-rows { display: flex; flex-direction: column; gap: 8px; }
    .skel-row { height: 72px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; color: $text-secondary; text-align: center;
      mat-icon { font-size: 44px; color: #16a34a; margin-bottom: 8px; }
      p { margin: 0 0 4px; font-weight: 500; } span { font-size: 0.85rem; opacity: 0.7; }
    }

    .report-list { display: flex; flex-direction: column; gap: 6px; }
    .report-item {
      padding: 12px 14px; border-radius: $border-radius; border: 1px solid $border-color;
      background: white; cursor: pointer; transition: all 0.15s;
      &:hover { border-color: #16a34a; }
      &.selected { border-color: #16a34a; background: #f0fdf4; }
    }
    .ri-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .ri-id { font-family: monospace; font-size: 0.78rem; color: $text-secondary; }
    .ri-patient { font-weight: 600; font-size: 0.875rem; margin-bottom: 2px; }
    .ri-date { font-size: 0.78rem; color: $text-secondary; }

    .review-panel { background: white; border-radius: $border-radius; border: 1px solid $border-color; padding: 24px; }
    .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: $text-secondary;
      mat-icon { font-size: 52px; color: #16a34a; opacity: 0.4; margin-bottom: 12px; }
    }

    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
      h3 { margin: 0 0 4px; } .detail-sub { font-size: 0.8rem; color: $text-secondary; }
    }

    .results-table-wrap { overflow-x: auto; margin-bottom: 20px; }
    .results-table {
      width: 100%; border-collapse: collapse; font-size: 0.875rem;
      th { background: $gray-50; padding: 8px 12px; text-align: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: $text-secondary; border-bottom: 1px solid $border-color; }
      td { padding: 10px 12px; border-bottom: 1px solid $gray-100; vertical-align: middle; }
      tr:last-child td { border-bottom: none; }
      .critical-row td { background: #fff5f5; }
      .abnormal-row td { background: #fffbeb; }
    }
    .value-cell { font-weight: 700; font-size: 1rem; }
    .no-interp { color: $text-secondary; }
    .no-results { padding: 20px; text-align: center; color: $text-secondary; font-size: 0.875rem; }

    .critical-alert { display: flex; gap: 10px; padding: 14px 16px; background: #fff5f5; border: 1px solid #fca5a5; border-radius: $border-radius; margin-bottom: 20px;
      mat-icon { color: $danger; flex-shrink: 0; }
      strong { display: block; color: $danger; margin-bottom: 4px; }
      p { margin: 0; font-size: 0.875rem; color: #7f1d1d; }
    }

    .decision-section { border-top: 1px solid $border-color; padding-top: 20px;
      h4 { font-size: 0.875rem; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 14px; }
    }
    .notes-field { width: 100%; }
    .decision-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }

    .success-banner { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #dcfce7; color: #166534; border-radius: $border-radius; margin-top: 12px; font-size: 0.875rem; }
    .info-banner { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #dbeafe; color: #1e40af; border-radius: $border-radius; margin-top: 12px; font-size: 0.875rem; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LabDoctorReviewComponent implements OnInit {
  store = inject(LabDoctorReviewStore);
  approveSuccess = signal(false);
  retestSuccess = signal(false);

  ngOnInit(): void { this.store.loadPending(); }

  hasCritical(): boolean {
    const report = this.store.selectedReport();
    return !!report?.results?.some(r => r.interpretation === 'critical');
  }

  async approve(reportId: string): Promise<void> {
    const ok = await this.store.approve(reportId);
    if (ok) {
      this.approveSuccess.set(true);
      setTimeout(() => this.approveSuccess.set(false), 4000);
    }
  }

  async requestRetest(reportId: string): Promise<void> {
    const ok = await this.store.requestRetest(reportId);
    if (ok) {
      this.retestSuccess.set(true);
      setTimeout(() => this.retestSuccess.set(false), 4000);
    }
  }
}
