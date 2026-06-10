import { Injectable, inject, signal, computed } from '@angular/core';
import { ResultApiService } from '../../../core/api/result-api.service';
import { Report } from '../../../core/models/result.models';

@Injectable({ providedIn: 'root' })
export class ResultsStore {
  private resultApi = inject(ResultApiService);

  readonly reports = signal<Report[]>([]);
  readonly currentReport = signal<Report | null>(null);
  readonly isLoading = signal(false);
  readonly isReportLoading = signal(false);
  readonly searchTerm = signal('');

  readonly filteredReports = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.reports();
    return this.reports().filter(r =>
      r.reportNumber.toLowerCase().includes(term) ||
      r.results?.some(res => res.testName?.toLowerCase().includes(term))
    );
  });

  loadReports(memberId?: string): void {
    this.isLoading.set(true);
    const params = memberId ? { familyMemberId: memberId } : undefined;
    this.resultApi.getMyReports(params).subscribe({
      next: res => {
        this.reports.set(res.data?.items ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  loadReportById(id: string): void {
    this.isReportLoading.set(true);
    this.resultApi.getReportById(id).subscribe({
      next: res => {
        this.currentReport.set(res.data ?? null);
        this.isReportLoading.set(false);
      },
      error: () => this.isReportLoading.set(false),
    });
  }
}
