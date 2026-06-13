import { Injectable, inject, signal } from '@angular/core';
import { OwnerAnalyticsApiService } from '../../../core/api/owner-analytics-api.service';
import {
  OwnerOverview, RevenueAnalytics, BranchPerformance, TestAnalytics,
  PatientAnalytics,
} from '../../../core/models/owner-analytics.models';

const EMPTY_OVERVIEW: OwnerOverview = {
  totalRevenue: 0, netRevenue: 0, outstandingBalance: 0, totalPatients: 0, newPatients: 0,
  totalTests: 0, totalAppointments: 0, averageTurnaroundHours: 0, lowStockItems: 0, pendingInsuranceClaims: 0,
};

@Injectable({ providedIn: 'root' })
export class OwnerOverviewStore {
  private api = inject(OwnerAnalyticsApiService);
  readonly overview = signal<OwnerOverview>(EMPTY_OVERVIEW);
  readonly branches = signal<BranchPerformance[]>([]);
  readonly revenue = signal<RevenueAnalytics | null>(null);
  readonly isLoading = signal(false);

  load(): void {
    this.isLoading.set(true);
    this.api.getOverview().subscribe({
      next: res => { this.overview.set(res.data ?? EMPTY_OVERVIEW); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
    this.api.getBranches().subscribe({ next: res => this.branches.set(res.data ?? []) });
    this.api.getRevenue(30).subscribe({ next: res => this.revenue.set(res.data ?? null) });
  }
}

@Injectable({ providedIn: 'root' })
export class OwnerRevenueStore {
  private api = inject(OwnerAnalyticsApiService);
  readonly data = signal<RevenueAnalytics | null>(null);
  readonly isLoading = signal(false);
  readonly range = signal(30);

  load(): void {
    this.isLoading.set(true);
    this.api.getRevenue(this.range()).subscribe({
      next: res => { this.data.set(res.data ?? null); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  setRange(days: number): void { this.range.set(days); this.load(); }
}

@Injectable({ providedIn: 'root' })
export class OwnerBranchesStore {
  private api = inject(OwnerAnalyticsApiService);
  readonly branches = signal<BranchPerformance[]>([]);
  readonly isLoading = signal(false);

  load(): void {
    this.isLoading.set(true);
    this.api.getBranches().subscribe({
      next: res => { this.branches.set(res.data ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class OwnerTestsStore {
  private api = inject(OwnerAnalyticsApiService);
  readonly data = signal<TestAnalytics | null>(null);
  readonly isLoading = signal(false);

  load(): void {
    this.isLoading.set(true);
    this.api.getTests().subscribe({
      next: res => { this.data.set(res.data ?? null); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
}

@Injectable({ providedIn: 'root' })
export class OwnerPatientsStore {
  private api = inject(OwnerAnalyticsApiService);
  readonly data = signal<PatientAnalytics | null>(null);
  readonly isLoading = signal(false);

  load(): void {
    this.isLoading.set(true);
    this.api.getPatients().subscribe({
      next: res => { this.data.set(res.data ?? null); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
}

