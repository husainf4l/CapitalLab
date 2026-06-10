import { Injectable, inject, signal } from '@angular/core';
import { DoctorApiService, DoctorAnalytics } from '../../../core/api/doctor-api.service';

const DEFAULT: DoctorAnalytics = {
  patientsReviewed: 0, criticalCases: 0, avgReviewTime: 0,
  reportsReleased: 0, reviewsByDay: [], criticalByDay: [], topTests: [],
};

@Injectable({ providedIn: 'root' })
export class DoctorAnalyticsStore {
  private api = inject(DoctorApiService);

  readonly data = signal<DoctorAnalytics>(DEFAULT);
  readonly isLoading = signal(false);
  readonly range = signal<'7d' | '30d' | '90d'>('30d');

  load(): void {
    this.isLoading.set(true);
    this.api.getAnalytics(this.range()).subscribe({
      next: res => { this.data.set(res.data ?? DEFAULT); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  setRange(r: '7d' | '30d' | '90d'): void {
    this.range.set(r);
    this.load();
  }
}
