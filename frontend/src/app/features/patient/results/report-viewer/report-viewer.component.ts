import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AppLoadingComponent } from '../../../../shared/ui/app-loading/app-loading.component';
import { AppStatusBadgeComponent } from '../../../../shared/ui/app-status-badge/app-status-badge.component';
import { ResultsStore } from '../../stores/results.store';
import { ResultApiService } from '../../../../core/api/result-api.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, CommonModule, AppLoadingComponent, AppStatusBadgeComponent],
  template: `
    <div class="viewer-page">
      <!-- Back nav -->
      <div class="viewer-nav">
        <a mat-stroked-button routerLink="/patient/results">
          <mat-icon>arrow_back</mat-icon> Back to Results
        </a>
      </div>

      @if (store.isReportLoading()) {
        <app-loading />
      } @else if (store.currentReport()) {
        <div class="report-shell">
          <!-- Header -->
          <div class="report-header">
            <div class="rh-left">
              <div class="lab-logo">🔬</div>
              <div>
                <h2>Lab Report</h2>
                <p class="report-num">Report #{{ store.currentReport()!.reportNumber }}</p>
              </div>
            </div>
            <div class="rh-right">
              <app-status-badge [status]="store.currentReport()!.status" />
              <p class="report-date">{{ store.currentReport()!.generatedAt | date:'fullDate' }}</p>
            </div>
          </div>

          <!-- Tests table -->
          <div class="results-section">
            <h4>Test Results</h4>
            @if ((store.currentReport()!.results?.length ?? 0) > 0) {
              <div class="results-table">
                <div class="table-head">
                  <span>Test</span>
                  <span>Result</span>
                  <span>Reference Range</span>
                  <span>Status</span>
                </div>
                @for (result of store.currentReport()!.results; track result.id) {
                  <div class="table-row" [class]="'interp-' + (result.interpretation ?? 'normal')">
                    <span class="test-name">
                      <strong>{{ result.testName }}</strong>
                      <small>{{ result.testCode }}</small>
                    </span>
                    <span class="result-val">
                      {{ result.value ?? '—' }}
                      @if (result.unit) { <small>{{ result.unit }}</small> }
                    </span>
                    <span class="ref-range">{{ result.referenceRange ?? '—' }}</span>
                    <span class="interp-badge" [class]="'badge-' + (result.interpretation ?? 'normal')">
                      {{ result.interpretation ?? 'Normal' | titlecase }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <p class="no-results">No individual test results attached to this report.</p>
            }
          </div>

          <!-- Notes -->
          @if (store.currentReport()!.results?.some(r => r.notes)) {
            <div class="notes-section">
              <h4>Notes</h4>
              @for (result of store.currentReport()!.results; track result.id) {
                @if (result.notes) {
                  <div class="note-row">
                    <strong>{{ result.testName }}:</strong> {{ result.notes }}
                  </div>
                }
              }
            </div>
          }

          <!-- Actions -->
          <div class="report-actions">
            @if (store.currentReport()!.isDownloadable) {
              <button mat-flat-button color="primary" (click)="downloadPdf()">
                <mat-icon>download</mat-icon> Download PDF
              </button>
            }
            <button mat-stroked-button (click)="print()">
              <mat-icon>print</mat-icon> Print
            </button>
          </div>
        </div>
      } @else {
        <div class="not-found">
          <mat-icon>error_outline</mat-icon>
          <h3>Report not found</h3>
          <p>This report may not exist or you may not have access to it.</p>
          <a mat-flat-button color="primary" routerLink="/patient/results">Back to Results</a>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../../styles/variables' as *;

    .viewer-page { max-width: 900px; margin: 0 auto; }
    .viewer-nav { margin-bottom: 20px; }

    .report-shell {
      background: white; border-radius: $border-radius-lg;
      box-shadow: $shadow-md; border: 1px solid $border-color; overflow: hidden;
    }
    .report-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 28px 32px; background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);
      border-bottom: 1px solid $border-color;
      @media (max-width: 640px) { flex-direction: column; gap: 16px; }
    }
    .rh-left { display: flex; align-items: center; gap: 16px;
      .lab-logo { font-size: 2.5rem; }
      h2 { margin: 0 0 4px; font-size: 1.4rem; }
      .report-num { margin: 0; color: $text-secondary; font-size: 0.9rem; }
    }
    .rh-right { text-align: right;
      .report-date { margin: 8px 0 0; color: $text-secondary; font-size: 0.85rem; }
    }

    .results-section { padding: 28px 32px; }
    .results-section h4 { margin: 0 0 16px; font-size: 1rem; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.05em; }

    .results-table { border-radius: $border-radius; overflow: hidden; border: 1px solid $border-color; }
    .table-head {
      display: grid; grid-template-columns: 2fr 1fr 1.5fr 1fr;
      padding: 12px 16px; background: $gray-50;
      font-size: 0.75rem; font-weight: 600; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.04em;
      @media (max-width: 640px) { display: none; }
    }
    .table-row {
      display: grid; grid-template-columns: 2fr 1fr 1.5fr 1fr;
      padding: 14px 16px; border-top: 1px solid $gray-50; font-size: 0.875rem; align-items: center;
      &:hover { background: $gray-50; }
      &.interp-high { background: #fff5f5; }
      &.interp-low { background: #fffbeb; }
      &.interp-critical { background: #fee2e2; }
      @media (max-width: 640px) { grid-template-columns: 1fr 1fr; gap: 4px; }
    }
    .test-name { display: flex; flex-direction: column; gap: 2px;
      strong { font-weight: 600; }
      small { color: $text-secondary; font-size: 0.75rem; }
    }
    .result-val { font-weight: 700; small { font-weight: 400; color: $text-secondary; margin-left: 2px; } }
    .ref-range { color: $text-secondary; font-size: 0.8rem; }
    .interp-badge { padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; width: fit-content;
      &.badge-normal { background: #dcfce7; color: #166534; }
      &.badge-high { background: #fee2e2; color: #991b1b; }
      &.badge-low { background: #fef3c7; color: #92400e; }
      &.badge-critical { background: #fecaca; color: #7f1d1d; }
    }
    .no-results { color: $text-secondary; font-size: 0.875rem; margin: 0; }

    .notes-section { padding: 0 32px 28px;
      h4 { margin: 0 0 12px; font-size: 1rem; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .note-row { padding: 10px 16px; background: $gray-50; border-radius: $border-radius; margin-bottom: 8px; font-size: 0.875rem; }

    .report-actions { display: flex; gap: 12px; padding: 20px 32px; border-top: 1px solid $border-color; flex-wrap: wrap; }

    .not-found { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 24px; text-align: center;
      mat-icon { font-size: 48px; color: $gray-300; }
      h3 { margin: 0; }
      p { color: $text-secondary; margin: 0; }
    }
  `]
})
export class ReportViewerComponent implements OnInit {
  store = inject(ResultsStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private resultApi = inject(ResultApiService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('reportId');
    if (id) {
      this.store.loadReportById(id);
    } else {
      this.router.navigate(['/patient/results']);
    }
  }

  downloadPdf(): void {
    const report = this.store.currentReport();
    if (!report) return;
    this.resultApi.downloadReport(report.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${report.reportNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Failed to download report.'),
    });
  }

  print(): void {
    window.print();
  }
}
