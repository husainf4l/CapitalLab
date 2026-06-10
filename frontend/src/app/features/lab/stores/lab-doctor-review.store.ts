import { Injectable, inject, signal } from '@angular/core';
import { ReviewApiService } from '../../../core/api/review-api.service';
import { ResultApiService } from '../../../core/api/result-api.service';
import { DoctorReview } from '../../../core/models/review.models';
import { Report } from '../../../core/models/result.models';

@Injectable({ providedIn: 'root' })
export class LabDoctorReviewStore {
  private reviewApi = inject(ReviewApiService);
  private resultApi = inject(ResultApiService);

  readonly reviews = signal<DoctorReview[]>([]);
  readonly pendingReports = signal<Report[]>([]);
  readonly selectedReport = signal<Report | null>(null);
  readonly isLoading = signal(false);
  readonly isActing = signal('');
  readonly searchTerm = signal('');
  readonly doctorNotes = signal('');

  loadPending(): void {
    this.isLoading.set(true);

    this.resultApi.getAllReports({ status: 'reviewed' }).subscribe({
      next: res => {
        this.pendingReports.set(res.data?.items ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectReport(report: Report): void {
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
