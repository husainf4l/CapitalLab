import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ResultApiService } from '../../../core/api/result-api.service';
import { DoctorReviewStore } from '../stores/doctor-review.store';
import { ReportPreviewPanelComponent } from '../shared/report-preview-panel.component';
import { Report } from '../../../core/models/result.models';

@Component({
  selector: 'app-report-review',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatInputModule, ReportPreviewPanelComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Reports</h2>
          <p class="sub">Browse, preview and release lab reports</p>
        </div>
        <button mat-icon-button (click)="load()"><mat-icon>refresh</mat-icon></button>
      </div>

      <div class="layout">
        <!-- Report list -->
        <div class="list-col">
          <div class="filters">
            <mat-form-field appearance="outline" class="flex-field">
              <mat-label>Search</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [(ngModel)]="search" (ngModelChange)="load()" placeholder="Patient or report #" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="status" (ngModelChange)="load()">
                <mat-option value="">All</mat-option>
                <mat-option value="reviewed">Under Review</mat-option>
                <mat-option value="released">Released</mat-option>
                <mat-option value="completed">Completed</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (isLoading()) {
            @for (i of [1,2,3,4]; track i) { <div class="skel-row"></div> }
          } @else if (reports().length === 0) {
            <div class="empty-state"><mat-icon>description</mat-icon><p>No reports found</p></div>
          } @else {
            <div class="report-list">
              @for (report of reports(); track report.id) {
                <div class="report-item" [class.selected]="selected()?.id === report.id" (click)="select(report)">
                  <div class="ri-top">
                    <span class="ri-num">#{{ report.reportNumber }}</span>
                    <span class="status-pill" [class]="report.status">{{ report.status | titlecase }}</span>
                  </div>
                  <div class="ri-patient">{{ report.patientName || '—' }}</div>
                  <div class="ri-date">{{ report.generatedAt | date:'dd MMM yyyy' }}</div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Preview + QR -->
        <div class="preview-col">
          @if (!selected()) {
            <div class="no-selection">
              <mat-icon>description</mat-icon>
              <p>Select a report to preview</p>
            </div>
          } @else {
            <report-preview-panel
              [report]="selected()!"
              [showDecision]="selected()!.status === 'reviewed'"
              (approve)="approve($event)"
              (retest)="requestRetest($event)"
              (download)="download($event)"
              (print)="print()"
              (close)="selected.set(null)" />

            <!-- QR verification -->
            <div class="qr-card">
              <h4>QR Verification</h4>
              <div class="qr-content">
                <div class="qr-box">
                  <mat-icon>qr_code_2</mat-icon>
                </div>
                <div class="qr-info">
                  <p>Patients and physicians can scan this code to verify report authenticity.</p>
                  <div class="qr-ref">Ref: {{ selected()!.reportNumber }}</div>
                  @if (selected()!.status === 'released') {
                    <span class="verified-tag"><mat-icon>verified</mat-icon> Released & Verifiable</span>
                  } @else {
                    <span class="pending-tag">Pending release</span>
                  }
                </div>
              </div>
            </div>

            @if (actionMsg()) {
              <div class="action-msg" [class.error]="actionError()">
                <mat-icon>{{ actionError() ? 'error' : 'check_circle' }}</mat-icon> {{ actionMsg() }}
              </div>
            }
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
      .flex-field { flex: 1; min-width: 150px; } mat-form-field { min-width: 120px; }
    }
    .skel-row { height: 70px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 8px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px 0; color: $text-secondary;
      mat-icon { font-size: 40px; opacity: 0.4; margin-bottom: 8px; } p { margin: 0; }
    }

    .report-list { display: flex; flex-direction: column; gap: 6px; }
    .report-item { padding: 12px 14px; border-radius: $border-radius; border: 1px solid $border-color; cursor: pointer; background: white; transition: all 0.15s;
      &:hover { border-color: $accent; }
      &.selected { border-color: $accent; background: #eef2ff; }
    }
    .ri-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .ri-num { font-family: monospace; font-size: 0.78rem; color: $text-secondary; }
    .status-pill { padding: 1px 8px; border-radius: 999px; font-size: 0.68rem; font-weight: 600;
      &.reviewed { background: #dbeafe; color: #1e40af; }
      &.released { background: #dcfce7; color: #166534; }
      &.completed { background: #dcfce7; color: #166534; }
      &.pending { background: #fef3c7; color: #92400e; }
    }
    .ri-patient { font-weight: 600; font-size: 0.875rem; margin-bottom: 2px; }
    .ri-date { font-size: 0.75rem; color: $text-secondary; }

    .preview-col { display: flex; flex-direction: column; gap: 16px; }
    .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; background: white; border: 1px solid $border-color; border-radius: $border-radius; color: $text-secondary;
      mat-icon { font-size: 52px; opacity: 0.3; margin-bottom: 12px; }
    }
    .qr-card { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 20px;
      h4 { margin: 0 0 14px; font-size: 0.875rem; }
    }
    .qr-content { display: flex; gap: 16px; align-items: center; }
    .qr-box { width: 90px; height: 90px; border: 2px solid $text-primary; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 56px; }
    }
    .qr-info { flex: 1; p { margin: 0 0 8px; font-size: 0.85rem; color: $text-secondary; } }
    .qr-ref { font-family: monospace; font-size: 0.8rem; margin-bottom: 8px; }
    .verified-tag { display: inline-flex; align-items: center; gap: 4px; color: #166534; background: #dcfce7; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; mat-icon { font-size: 14px; } }
    .pending-tag { display: inline-block; color: #92400e; background: #fef3c7; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .action-msg { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #dcfce7; color: #166534; border-radius: $border-radius; font-size: 0.875rem;
      &.error { background: #fee2e2; color: #991b1b; }
    }
  `]
})
export class ReportReviewComponent implements OnInit {
  private api = inject(ResultApiService);
  private reviewStore = inject(DoctorReviewStore);

  reports = signal<Report[]>([]);
  selected = signal<Report | null>(null);
  isLoading = signal(false);
  search = '';
  status = '';
  actionMsg = signal('');
  actionError = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.api.getAllReports({ status: this.status || undefined, search: this.search || undefined }).subscribe({
      next: res => { this.reports.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  select(report: Report): void {
    this.selected.set(report);
    this.actionMsg.set('');
  }

  async approve(id: string): Promise<void> {
    this.reviewStore.doctorNotes.set('');
    const ok = await this.reviewStore.approve(id);
    if (ok) {
      this.reports.update(list => list.map(r => r.id === id ? { ...r, status: 'released' } : r));
      this.selected.update(r => r ? { ...r, status: 'released' } : r);
      this.showMsg('Report approved and released to patient', false);
    } else {
      this.showMsg('Failed to release report', true);
    }
  }

  async requestRetest(id: string): Promise<void> {
    const ok = await this.reviewStore.requestRetest(id);
    if (ok) {
      this.reports.update(list => list.filter(r => r.id !== id));
      this.selected.set(null);
      this.showMsg('Retest requested', false);
    } else {
      this.showMsg('Failed to request retest', true);
    }
  }

  download(id: string): void {
    this.api.downloadReport(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.showMsg('Download failed', true),
    });
  }

  print(): void { window.print(); }

  private showMsg(msg: string, error: boolean): void {
    this.actionMsg.set(msg);
    this.actionError.set(error);
    setTimeout(() => this.actionMsg.set(''), 4000);
  }
}
