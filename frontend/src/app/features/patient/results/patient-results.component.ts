import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { ResultApiService } from '../../../core/api/result-api.service';
import { FamilyMember } from '../../../core/models/patient.models';
import { Report } from '../../../core/models/result.models';
import { ResultsStore } from '../stores/results.store';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-patient-results',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, CommonModule, FormsModule,
  ],
  template: `
    <div class="results-page">

      <!-- Hero Strip -->
      <div class="hero-strip">
        <div class="hero-left">
          <div class="hero-icon-circle">
            <mat-icon>science</mat-icon>
          </div>
          <div class="hero-text">
            <div class="hero-title">My Results</div>
            <div class="hero-subtitle">View and download your lab reports</div>
          </div>
        </div>
        <div class="hero-count-pill">
          {{ store.filteredReports().length }} reports
        </div>
      </div>

      <!-- Search + Filter Bar -->
      <div class="filter-bar">
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            class="search-input"
            type="text"
            placeholder="Report #, test name…"
            [ngModel]="store.searchTerm()"
            (ngModelChange)="store.searchTerm.set($event)"
          />
        </div>

        <div class="member-select-wrap">
          <select
            class="member-select"
            [(ngModel)]="selectedMemberId"
            (ngModelChange)="onMemberChange($event)"
          >
            <option value="">All Members</option>
            @for (m of familyMembers(); track m.id) {
              <option [value]="m.id">{{ m.fullName }}</option>
            }
          </select>
        </div>

        <div class="status-pills">
          <button class="status-pill" [class.active]="statusFilter === ''" (click)="statusFilter = ''">All</button>
          <button class="status-pill" [class.active]="statusFilter === 'released'" (click)="statusFilter = 'released'">Released</button>
          <button class="status-pill" [class.active]="statusFilter === 'pending'" (click)="statusFilter = 'pending'">Pending</button>
          <button class="status-pill" [class.active]="statusFilter === 'completed'" (click)="statusFilter = 'completed'">Completed</button>
        </div>
      </div>

      <!-- Loading State -->
      @if (store.isLoading()) {
        <div class="results-list">
          @for (s of [1,2,3,4]; track s) {
            <div class="skeleton-card">
              <div class="skeleton-shimmer"></div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @else if ((statusFilter ? store.filteredReports().filter(r => r.status === statusFilter) : store.filteredReports()).length === 0) {
        <div class="empty-state">
          <div class="empty-icon-circle">
            <mat-icon>science</mat-icon>
          </div>
          <div class="empty-title">No reports found</div>
          <div class="empty-subtitle">Your lab reports will appear here once ready</div>
          <button mat-flat-button class="empty-cta" (click)="router.navigate(['/patient/book'])">
            Book a Test
          </button>
        </div>
      }

      <!-- Results List -->
      @else {
        <div class="results-list">
          @for (report of (statusFilter ? store.filteredReports().filter(r => r.status === statusFilter) : store.filteredReports()); track report.id) {
            <div class="report-card">
              <div class="accent-bar" [ngClass]="'accent-' + (report.status || 'default')"></div>
              <div class="card-body">
                <div class="icon-badge" [ngClass]="'badge-' + (report.status || 'default')">
                  <mat-icon>description</mat-icon>
                </div>
                <div class="info-block">
                  <div class="report-number">Report #{{ report.reportNumber }}</div>
                  <div class="report-meta">{{ report.results.length }} test(s) · {{ report.generatedAt | date:'d MMM yyyy' }}</div>
                </div>
                <div class="status-chip" [ngClass]="'chip-' + (report.status || 'default')">
                  {{ report.status | titlecase }}
                </div>
                <div class="card-actions">
                  <button mat-stroked-button class="action-btn view-btn" (click)="viewReport(report)">
                    <mat-icon>visibility</mat-icon> View
                  </button>
                  @if (report.isDownloadable) {
                    <button mat-flat-button class="action-btn pdf-btn" (click)="downloadReport(report)">
                      <mat-icon>download</mat-icon> PDF
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .results-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    /* ── Hero Strip ── */
    .hero-strip {
      background: linear-gradient(135deg, #1e9df1 0%, #1565c0 100%);
      border-radius: 16px;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .hero-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .hero-icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon {
        color: #fff;
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
    }
    .hero-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .hero-title {
      color: #fff;
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .hero-subtitle {
      color: #fff;
      font-size: 0.85rem;
      opacity: 0.8;
    }
    .hero-count-pill {
      background: rgba(255,255,255,0.18);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 6px 18px;
      border-radius: 999px;
      white-space: nowrap;
    }

    /* ── Filter Bar ── */
    .filter-bar {
      background: #fff;
      border-radius: 12px;
      padding: 16px 20px;
      border: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 200px;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 20px;
      width: 20px;
      height: 20px;
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 11px 14px 11px 42px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #1e293b;
      background: #fff;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus {
        border-color: #1e9df1;
        box-shadow: 0 0 0 3px rgba(30,157,241,0.12);
      }
      &::placeholder { color: #94a3b8; }
    }
    .member-select-wrap {
      min-width: 180px;
    }
    .member-select {
      width: 100%;
      padding: 11px 36px 11px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #1e293b;
      background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 12px center;
      -webkit-appearance: none;
      appearance: none;
      outline: none;
      cursor: pointer;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus {
        border-color: #1e9df1;
        box-shadow: 0 0 0 3px rgba(30,157,241,0.12);
      }
    }
    .status-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .status-pill {
      padding: 7px 16px;
      border-radius: 999px;
      border: 1.5px solid #e2e8f0;
      background: #fff;
      color: #72767a;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      &:hover {
        border-color: #1e9df1;
        color: #1e9df1;
      }
      &.active {
        background: #1e9df1;
        border-color: #1e9df1;
        color: #fff;
      }
    }

    /* ── Results List ── */
    .results-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Skeleton ── */
    .skeleton-card {
      height: 76px;
      border-radius: 14px;
      background: #f1f5f9;
      overflow: hidden;
      position: relative;
    }
    .skeleton-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* ── Report Card ── */
    .report-card {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      display: flex;
      transition: all 0.2s;
      &:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        border-color: #1e9df1;
      }
    }
    .accent-bar {
      width: 4px;
      flex-shrink: 0;
      &.accent-released { background: #10b981; }
      &.accent-pending  { background: #f59e0b; }
      &.accent-completed { background: #3b82f6; }
      &.accent-default  { background: #94a3b8; }
    }
    .card-body {
      flex: 1;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
      &.badge-released { background: #dcfce7; mat-icon { color: #10b981; } }
      &.badge-pending  { background: #fef3c7; mat-icon { color: #f59e0b; } }
      &.badge-completed { background: #dbeafe; mat-icon { color: #3b82f6; } }
      &.badge-default  { background: #f1f5f9; mat-icon { color: #94a3b8; } }
    }
    .info-block {
      flex: 1;
      min-width: 0;
    }
    .report-number {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .report-meta {
      font-size: 0.78rem;
      color: #72767a;
      margin-top: 2px;
    }
    .status-chip {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 12px;
      border-radius: 999px;
      white-space: nowrap;
      flex-shrink: 0;
      &.chip-released  { background: #dcfce7; color: #15803d; }
      &.chip-pending   { background: #fef3c7; color: #b45309; }
      &.chip-completed { background: #dbeafe; color: #1d4ed8; }
      &.chip-default   { background: #f1f5f9; color: #64748b; }
    }
    .card-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .action-btn {
      font-size: 0.8rem !important;
      height: 34px !important;
      line-height: 34px !important;
      padding: 0 12px !important;
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }
    .pdf-btn {
      background: #1e9df1 !important;
      color: #fff !important;
    }

    /* ── Empty State ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 56px 24px;
      gap: 12px;
      text-align: center;
    }
    .empty-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #dbeafe;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
      mat-icon {
        color: #1e9df1;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }
    .empty-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
    }
    .empty-subtitle {
      font-size: 0.85rem;
      color: #72767a;
    }
    .empty-cta {
      margin-top: 8px;
      background: #1e9df1 !important;
      color: #fff !important;
      border-radius: 8px !important;
      padding: 0 24px !important;
    }

    /* ── Mobile ── */
    @media (max-width: 600px) {
      .results-page { padding: 16px; }
      .hero-strip { padding: 20px 20px; flex-wrap: wrap; }
      .card-body { flex-wrap: wrap; }
      .card-actions { width: 100%; }
    }
  `]
})
export class PatientResultsComponent implements OnInit {
  store = inject(ResultsStore);
  router = inject(Router);
  private patientApi = inject(PatientApiService);
  private resultApi = inject(ResultApiService);
  private toast = inject(ToastService);

  familyMembers = signal<FamilyMember[]>([]);
  selectedMemberId = '';
  statusFilter = '';

  ngOnInit(): void {
    this.store.loadReports();
    this.patientApi.getFamilyMembers().subscribe({
      next: res => this.familyMembers.set(res.data ?? []),
      error: () => {},
    });
  }

  onMemberChange(memberId: string): void {
    this.store.loadReports(memberId || undefined);
  }

  viewReport(report: Report): void {
    this.router.navigate(['/patient/results', report.id]);
  }

  downloadReport(report: Report): void {
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
}
