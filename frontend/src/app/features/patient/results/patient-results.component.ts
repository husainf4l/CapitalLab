import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { ResultApiService } from '../../../core/api/result-api.service';
import { FamilyMember } from '../../../core/models/patient.models';
import { Report } from '../../../core/models/result.models';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';
import { AppStatusBadgeComponent } from '../../../shared/ui/app-status-badge/app-status-badge.component';
import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { AppLoadingComponent } from '../../../shared/ui/app-loading/app-loading.component';
import { ResultsStore } from '../stores/results.store';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-patient-results',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, CommonModule, FormsModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    AppPageHeaderComponent, AppStatusBadgeComponent, AppEmptyStateComponent, AppLoadingComponent,
  ],
  template: `
    <div class="results-page">
      <app-page-header title="My Results" subtitle="View and download your lab reports" />

      <!-- Filters -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search reports</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [ngModel]="store.searchTerm()" (ngModelChange)="store.searchTerm.set($event)" placeholder="Report #, test name…" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Family Member</mat-label>
          <mat-select [(ngModel)]="selectedMemberId" (ngModelChange)="onMemberChange($event)">
            <mat-option value="">All Members</mat-option>
            @for (m of familyMembers(); track m.id) {
              <mat-option [value]="m.id">{{ m.fullName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Results -->
      @if (store.isLoading()) {
        <app-loading />
      } @else if (store.filteredReports().length === 0) {
        <app-empty-state icon="science" title="No results found" description="Your lab results will appear here once your tests are complete." />
      } @else {
        <div class="results-list">
          @for (report of store.filteredReports(); track report.id) {
            <div class="report-card">
              <div class="report-main">
                <div class="report-icon">📋</div>
                <div class="report-info">
                  <h5>Report #{{ report.reportNumber }}</h5>
                  <p class="report-meta">
                    {{ report.results?.length || 0 }} test(s) ·
                    {{ report.generatedAt ? (report.generatedAt | date:'mediumDate') : 'Pending' }}
                  </p>
                </div>
                <app-status-badge [status]="report.status" />
              </div>
              <div class="report-actions">
                <button mat-stroked-button (click)="viewReport(report)">
                  <mat-icon>visibility</mat-icon> View
                </button>
                @if (report.isDownloadable) {
                  <button mat-stroked-button color="primary" (click)="downloadReport(report)">
                    <mat-icon>download</mat-icon> PDF
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .filters-bar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 240px; }
    .filter-field { min-width: 200px; }
    .results-list { display: flex; flex-direction: column; gap: 12px; }
    .report-card {
      background: white; border-radius: $border-radius; padding: 20px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      @media (max-width: 768px) { flex-direction: column; align-items: flex-start; }
    }
    .report-main { display: flex; align-items: center; gap: 12px; flex: 1; }
    .report-icon { font-size: 2rem; }
    .report-info h5 { margin: 0 0 4px; font-size: 1rem; }
    .report-meta { margin: 0; font-size: 0.8rem; color: $text-secondary; }
    .report-actions { display: flex; gap: 8px; flex-shrink: 0;
      button { font-size: 0.8rem; }
      mat-icon { font-size: 16px; }
    }
  `]
})
export class PatientResultsComponent implements OnInit {
  store = inject(ResultsStore);
  private router = inject(Router);
  private patientApi = inject(PatientApiService);
  private resultApi = inject(ResultApiService);
  private toast = inject(ToastService);

  familyMembers = signal<FamilyMember[]>([]);
  selectedMemberId = '';

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
