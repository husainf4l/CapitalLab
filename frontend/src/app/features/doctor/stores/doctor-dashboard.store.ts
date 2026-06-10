import { Injectable, inject, signal, computed } from '@angular/core';
import { DoctorApiService, DoctorDashboardStats } from '../../../core/api/doctor-api.service';
import { Patient } from '../../../core/models/patient.models';

const DEFAULT_STATS: DoctorDashboardStats = {
  pendingReviews: 0, criticalResults: 0, reportsToday: 0,
  followUpsToday: 0, patientsReviewed: 0, avgReviewTimeMinutes: 0,
};

@Injectable({ providedIn: 'root' })
export class DoctorDashboardStore {
  private api = inject(DoctorApiService);

  readonly stats = signal<DoctorDashboardStats>(DEFAULT_STATS);
  readonly isLoading = signal(false);
  readonly error = signal('');

  // Patient search state
  readonly searchQuery = signal('');
  readonly searchResults = signal<Patient[]>([]);
  readonly isSearching = signal(false);
  readonly showResults = signal(false);

  readonly hasCritical = computed(() => this.stats().criticalResults > 0);

  load(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.api.getDashboardStats().subscribe({
      next: res => { this.stats.set(res.data ?? DEFAULT_STATS); this.isLoading.set(false); },
      error: () => { this.error.set('Failed to load dashboard'); this.isLoading.set(false); },
    });
  }

  search(query: string): void {
    this.searchQuery.set(query);
    if (!query.trim()) { this.searchResults.set([]); this.showResults.set(false); return; }
    this.isSearching.set(true);
    this.api.searchPatients(query).subscribe({
      next: res => {
        this.searchResults.set(res.data ?? []);
        this.showResults.set(true);
        this.isSearching.set(false);
      },
      error: () => { this.isSearching.set(false); },
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showResults.set(false);
  }
}
