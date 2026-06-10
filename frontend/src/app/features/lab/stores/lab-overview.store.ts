import { Injectable, inject, signal, computed } from '@angular/core';
import { AppointmentApiService } from '../../../core/api/appointment-api.service';
import { SampleApiService } from '../../../core/api/sample-api.service';
import { TestOrderApiService } from '../../../core/api/test-order-api.service';
import { ResultApiService } from '../../../core/api/result-api.service';

export interface LabKpi {
  todayAppointments: number;
  pendingOrders: number;
  samplesCollected: number;
  samplesProcessing: number;
  qcPending: number;
  resultsPendingReview: number;
  completedReports: number;
}

@Injectable({ providedIn: 'root' })
export class LabOverviewStore {
  private appointmentApi = inject(AppointmentApiService);
  private sampleApi = inject(SampleApiService);
  private orderApi = inject(TestOrderApiService);
  private resultApi = inject(ResultApiService);

  readonly kpi = signal<LabKpi>({
    todayAppointments: 0,
    pendingOrders: 0,
    samplesCollected: 0,
    samplesProcessing: 0,
    qcPending: 0,
    resultsPendingReview: 0,
    completedReports: 0,
  });

  readonly isLoading = signal(false);
  readonly lastRefreshed = signal<Date | null>(null);

  load(): void {
    this.isLoading.set(true);

    this.appointmentApi.getTodayForLab().subscribe({
      next: res => this.kpi.update(k => ({ ...k, todayAppointments: res.data?.totalCount ?? 0 })),
      error: () => {},
    });

    this.orderApi.getAllForLab({ status: 'pending' }).subscribe({
      next: res => this.kpi.update(k => ({ ...k, pendingOrders: res.data?.totalCount ?? 0 })),
      error: () => {},
    });

    this.sampleApi.getAll({ status: 'collected' }).subscribe({
      next: res => this.kpi.update(k => ({ ...k, samplesCollected: res.data?.totalCount ?? 0 })),
      error: () => {},
    });

    this.sampleApi.getAll({ status: 'processing' }).subscribe({
      next: res => this.kpi.update(k => ({ ...k, samplesProcessing: res.data?.totalCount ?? 0 })),
      error: () => {},
    });

    this.sampleApi.getAll({ status: 'qc_pending' }).subscribe({
      next: res => this.kpi.update(k => ({ ...k, qcPending: res.data?.totalCount ?? 0 })),
      error: () => {},
    });

    this.resultApi.getAllResults({ status: 'pending' }).subscribe({
      next: res => this.kpi.update(k => ({ ...k, resultsPendingReview: res.data?.totalCount ?? 0 })),
      error: () => {},
    });

    this.resultApi.getAllReports({ status: 'completed' }).subscribe({
      next: res => {
        this.kpi.update(k => ({ ...k, completedReports: res.data?.totalCount ?? 0 }));
        this.isLoading.set(false);
        this.lastRefreshed.set(new Date());
      },
      error: () => this.isLoading.set(false),
    });
  }
}
