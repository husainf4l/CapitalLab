import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Report } from '../../../core/models/result.models';
import { ResultReviewTableComponent } from './result-review-table.component';

@Component({
  selector: 'report-preview-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ResultReviewTableComponent],
  template: `
    <div class="panel">
      <div class="panel-header">
        <div class="header-info">
          <h3>Report #{{ report().reportNumber }}</h3>
          <div class="meta">
            <span><mat-icon>person</mat-icon>{{ report().patientName || '—' }}</span>
            <span><mat-icon>calendar_today</mat-icon>{{ report().generatedAt | date:'dd MMM yyyy' }}</span>
            <span class="status-badge" [class]="report().status">{{ report().status | titlecase }}</span>
          </div>
        </div>
        <div class="panel-actions">
          @if (report().isDownloadable) {
            <button mat-icon-button (click)="download.emit(report().id)"><mat-icon>download</mat-icon></button>
          }
          <button mat-icon-button (click)="print.emit(report().id)"><mat-icon>print</mat-icon></button>
          <button mat-icon-button (click)="close.emit()"><mat-icon>close</mat-icon></button>
        </div>
      </div>

      @if (report().results?.length) {
        <result-review-table [results]="report().results" />
      } @else {
        <div class="no-results">No results in this report.</div>
      }

      @if (hasCritical()) {
        <div class="critical-alert">
          <mat-icon>priority_high</mat-icon>
          This report contains critical values. Notify the patient or referring physician immediately.
        </div>
      }

      @if (showDecision()) {
        <div class="decision-row">
          <button mat-raised-button color="primary" (click)="approve.emit(report().id)">
            <mat-icon>check_circle</mat-icon> Approve & Release
          </button>
          <button mat-stroked-button color="warn" (click)="retest.emit(report().id)">
            <mat-icon>refresh</mat-icon> Request Retest
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .panel { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 20px; }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
      h3 { margin: 0 0 6px; }
    }
    .meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
      span { display: flex; align-items: center; gap: 3px; font-size: 0.8rem; color: $text-secondary; mat-icon { font-size: 14px; } }
    }
    .status-badge { padding: 2px 10px; border-radius: 999px; font-size: 0.72rem !important; font-weight: 600;
      &.reviewed  { background: #dbeafe; color: #1e40af; }
      &.released  { background: #dcfce7; color: #166534; }
      &.completed { background: #dcfce7; color: #166534; }
      &.pending   { background: #fef3c7; color: #92400e; }
    }
    .panel-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .no-results { padding: 20px; text-align: center; color: $text-secondary; }
    .critical-alert { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fff5f5; border: 1px solid #fca5a5; border-radius: $border-radius; margin-top: 14px; color: $danger; font-size: 0.875rem;
      mat-icon { font-size: 18px; flex-shrink: 0; }
    }
    .decision-row { display: flex; gap: 10px; margin-top: 16px; padding-top: 16px; border-top: 1px solid $border-color; }
  `]
})
export class ReportPreviewPanelComponent {
  report = input.required<Report>();
  showDecision = input<boolean>(false);
  approve = output<string>();
  retest = output<string>();
  download = output<string>();
  print = output<string>();
  close = output<void>();

  hasCritical(): boolean {
    return this.report().results?.some(r => r.interpretation === 'critical') ?? false;
  }
}
