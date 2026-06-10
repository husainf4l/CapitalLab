import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { DoctorReviewStore } from '../stores/doctor-review.store';
import { ResultReviewTableComponent } from '../shared/result-review-table.component';

@Component({
  selector: 'app-review-center',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatInputModule, ResultReviewTableComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Pending Reviews</h2>
          <p class="sub">{{ store.filtered().length }} reports awaiting sign-off</p>
        </div>
        <button mat-icon-button (click)="store.load()"><mat-icon>refresh</mat-icon></button>
      </div>

      <div class="layout">
        <!-- Left: report queue -->
        <div class="queue-col">
          <!-- Filters -->
          <div class="filters">
            <mat-form-field appearance="outline" class="flex-field">
              <mat-label>Search</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [ngModel]="store.searchTerm()" (ngModelChange)="store.searchTerm.set($event)" placeholder="Patient or report #" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Show</mat-label>
              <mat-select [ngModel]="store.filterUrgency()" (ngModelChange)="store.filterUrgency.set($event)">
                <mat-option value="all">All Reports</mat-option>
                <mat-option value="critical">Critical Only</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (store.isLoading()) {
            @for (i of [1,2,3]; track i) { <div class="skel-row"></div> }
          } @else if (store.filtered().length === 0) {
            <div class="empty-state">
              <mat-icon>rate_review</mat-icon>
              <p>No pending reviews</p>
            </div>
          } @else {
            <div class="report-list">
              @for (report of store.filtered(); track report.id) {
                <div class="report-item" [class.selected]="store.selectedReport()?.id === report.id"
                     [class.has-critical]="report.results?.some(r => r.interpretation === 'critical')"
                     (click)="store.select(report)">
                  <div class="ri-top">
                    <span class="ri-num">#{{ report.reportNumber }}</span>
                    @if (report.results?.some(r => r.interpretation === 'critical')) {
                      <span class="crit-chip">CRITICAL</span>
                    }
                  </div>
                  <div class="ri-patient">{{ report.patientName || '—' }}</div>
                  <div class="ri-date">{{ report.generatedAt | date:'dd MMM yyyy' }}</div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Right: review detail -->
        <div class="review-col">
          @if (!store.selectedReport()) {
            <div class="no-selection">
              <mat-icon>pending_actions</mat-icon>
              <p>Select a report from the queue to review</p>
            </div>
          } @else {
            <div class="review-detail">
              <div class="detail-header">
                <div>
                  <h3>Report #{{ store.selectedReport()!.reportNumber }}</h3>
                  <div class="detail-sub">
                    {{ store.selectedReport()!.patientName }} · {{ store.selectedReport()!.generatedAt | date:'dd MMM yyyy' }}
                  </div>
                </div>
                <button mat-icon-button (click)="store.clearSelection()"><mat-icon>close</mat-icon></button>
              </div>

              @if (store.hasCriticalInSelected()) {
                <div class="critical-banner">
                  <mat-icon>priority_high</mat-icon>
                  <strong>Critical values present</strong> — Notify patient or physician before releasing.
                </div>
              }

              <result-review-table [results]="store.selectedReport()!.results ?? []" />

              <div class="notes-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Doctor Notes / Clinical Comments</mat-label>
                  <textarea matInput [ngModel]="store.doctorNotes()" (ngModelChange)="store.doctorNotes.set($event)" rows="3" placeholder="Add clinical interpretation, notes..."></textarea>
                </mat-form-field>
              </div>

              <div class="action-row">
                <button mat-raised-button color="primary"
                  [disabled]="!!store.isActing()"
                  (click)="approve(store.selectedReport()!.id)">
                  @if (store.isActing() === store.selectedReport()!.id) {
                    <ng-container><mat-icon class="spin">refresh</mat-icon> Processing...</ng-container>
                  } @else {
                    <ng-container><mat-icon>check_circle</mat-icon> Approve & Release</ng-container>
                  }
                </button>
                <button mat-stroked-button color="warn"
                  [disabled]="!!store.isActing()"
                  (click)="requestRetest(store.selectedReport()!.id)">
                  <mat-icon>refresh</mat-icon> Request Retest
                </button>
              </div>

              @if (approveSuccess()) {
                <div class="success-banner"><mat-icon>check_circle</mat-icon> Report approved and released to patient</div>
              }
              @if (retestSuccess()) {
                <div class="info-banner"><mat-icon>refresh</mat-icon> Retest requested</div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    $accent: #4f46e5;

    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h2 { margin: 0 0 4px; } .sub { margin: 0; font-size: 0.875rem; color: $text-secondary; }
    }
    .layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .filters { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;
      .flex-field { flex: 1; min-width: 160px; }
      mat-form-field { min-width: 130px; }
    }
    .skel-row { height: 72px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 8px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px 0; color: $text-secondary;
      mat-icon { font-size: 40px; color: #22c55e; margin-bottom: 8px; }
      p { margin: 0; }
    }

    .report-list { display: flex; flex-direction: column; gap: 6px; }
    .report-item {
      padding: 12px 14px; border-radius: $border-radius; border: 1px solid $border-color; cursor: pointer;
      background: white; transition: all 0.15s;
      &:hover { border-color: $accent; }
      &.selected { border-color: $accent; background: #eef2ff; }
      &.has-critical { border-left: 3px solid $danger; }
    }
    .ri-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .ri-num { font-family: monospace; font-size: 0.78rem; color: $text-secondary; }
    .crit-chip { background: #7f1d1d; color: white; font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; }
    .ri-patient { font-weight: 600; font-size: 0.875rem; margin-bottom: 2px; }
    .ri-date { font-size: 0.75rem; color: $text-secondary; }

    .review-col { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 24px; }
    .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: $text-secondary;
      mat-icon { font-size: 52px; color: $accent; opacity: 0.3; margin-bottom: 12px; }
    }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
      h3 { margin: 0 0 4px; } .detail-sub { font-size: 0.8rem; color: $text-secondary; }
    }
    .critical-banner { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #fff5f5; border: 1px solid #fca5a5; border-radius: $border-radius; margin-bottom: 16px; color: $danger; font-size: 0.875rem;
      mat-icon { font-size: 18px; flex-shrink: 0; } strong { font-weight: 700; }
    }
    .notes-section { margin: 16px 0; }
    .full-width { width: 100%; }
    .action-row { display: flex; gap: 10px; flex-wrap: wrap; padding-top: 4px; }
    .success-banner { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #dcfce7; color: #166534; border-radius: $border-radius; margin-top: 12px; font-size: 0.875rem; }
    .info-banner { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #dbeafe; color: #1e40af; border-radius: $border-radius; margin-top: 12px; font-size: 0.875rem; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ReviewCenterComponent implements OnInit {
  store = inject(DoctorReviewStore);
  approveSuccess = signal(false);
  retestSuccess = signal(false);

  ngOnInit(): void { this.store.load(); }

  async approve(id: string): Promise<void> {
    const ok = await this.store.approve(id);
    if (ok) { this.approveSuccess.set(true); setTimeout(() => this.approveSuccess.set(false), 4000); }
  }

  async requestRetest(id: string): Promise<void> {
    const ok = await this.store.requestRetest(id);
    if (ok) { this.retestSuccess.set(true); setTimeout(() => this.retestSuccess.set(false), 4000); }
  }
}
