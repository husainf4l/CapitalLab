import { Injectable, inject, signal, computed } from '@angular/core';
import { ReviewApiService } from '../../../core/api/review-api.service';
import { ResultApiService } from '../../../core/api/result-api.service';
import { Report } from '../../../core/models/result.models';
import { DoctorReview } from '../../../core/models/review.models';

@Injectable({ providedIn: 'root' })
export class DoctorReviewStore {
  private reviewApi = inject(ReviewApiService);
  private resultApi = inject(ResultApiService);

  readonly pendingReports = signal<Report[]>([]);
  readonly selectedReport = signal<Report | null>(null);
  readonly isLoading = signal(false);
  readonly isActing = signal('');
  readonly error = signal('');

  readonly filterUrgency = signal<'all' | 'critical'>('all');
  readonly searchTerm = signal('');
  readonly doctorNotes = signal('');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.pendingReports().filter(r => {
      if (term && !(r.patientName ?? '').toLowerCase().includes(term) && !r.reportNumber?.includes(term)) return false;
      if (this.filterUrgency() === 'critical') {
        return r.results?.some(res => res.interpretation === 'critical');
      }
      return true;
    });
  });

  readonly hasCriticalInSelected = computed(() =>
    this.selectedReport()?.results?.some(r => r.interpretation === 'critical') ?? false
  );

  load(): void {
    this.isLoading.set(true);
    this.resultApi.getAllReports({ status: 'reviewed' }).subscribe({
      next: res => { this.pendingReports.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); },
    });
  }

  select(report: Report): void {
    this.selectedReport.set(report);
    this.doctorNotes.set('');
  }

  clearSelection(): void {
    this.selectedReport.set(null);
    this.doctorNotes.set('');
  }

  approve(reportId: string): Promise<boolean> {
    this.isActing.set(reportId);
    return new Promise(resolve => {
      this.reviewApi.create({ reportId, notes: this.doctorNotes() }).subscribe({
        next: reviewRes => {
          if (!reviewRes.data) { this.isActing.set(''); resolve(false); return; }
          this.reviewApi.approve(reviewRes.data.id, { notes: this.doctorNotes() }).subscribe({
            next: () => {
              this.resultApi.releaseReport(reportId).subscribe({
                next: () => {
                  this.pendingReports.update(list => list.filter(r => r.id !== reportId));
                  this.selectedReport.set(null);
                  this.isActing.set('');
                  resolve(true);
                },
                error: () => { this.isActing.set(''); resolve(false); },
              });
            },
            error: () => { this.isActing.set(''); resolve(false); },
          });
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  requestRetest(reportId: string): Promise<boolean> {
    this.isActing.set(reportId);
    return new Promise(resolve => {
      this.reviewApi.create({ reportId, notes: this.doctorNotes() }).subscribe({
        next: reviewRes => {
          if (!reviewRes.data) { this.isActing.set(''); resolve(false); return; }
          this.reviewApi.requestRetest(reviewRes.data.id, { notes: this.doctorNotes() }).subscribe({
            next: () => {
              this.pendingReports.update(list => list.filter(r => r.id !== reportId));
              this.selectedReport.set(null);
              this.isActing.set('');
              resolve(true);
            },
            error: () => { this.isActing.set(''); resolve(false); },
          });
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }
}
