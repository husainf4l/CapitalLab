import { Injectable, inject, signal, computed } from '@angular/core';
import { AppointmentApiService } from '../../../core/api/appointment-api.service';
import { ResultApiService } from '../../../core/api/result-api.service';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { Appointment } from '../../../core/models/appointment.models';
import { Report } from '../../../core/models/result.models';

@Injectable({ providedIn: 'root' })
export class PatientDashboardStore {
  private appointmentApi = inject(AppointmentApiService);
  private resultApi = inject(ResultApiService);
  private patientApi = inject(PatientApiService);

  readonly upcomingAppointment = signal<Appointment | null>(null);
  readonly recentReports = signal<Report[]>([]);
  readonly familyMembersCount = signal(0);
  readonly upcomingCount = signal(0);
  readonly readyResultsCount = signal(0);
  readonly totalResultsCount = signal(0);
  readonly isLoading = signal(false);

  readonly stats = computed(() => ({
    upcomingAppointments: this.upcomingCount(),
    resultsReady: this.readyResultsCount(),
    totalResults: this.totalResultsCount(),
    familyMembers: this.familyMembersCount(),
  }));

  load(): void {
    this.isLoading.set(true);

    this.appointmentApi.getMyAppointments({ status: 'confirmed', page: 1 }).subscribe({
      next: res => {
        const items = res.data?.items ?? [];
        this.upcomingAppointment.set(items[0] ?? null);
        this.upcomingCount.set(res.data?.totalCount ?? items.length);
      },
      error: () => {},
    });

    this.resultApi.getMyReports().subscribe({
      next: res => {
        const items = res.data?.items ?? [];
        this.recentReports.set(items.slice(0, 3));
        this.totalResultsCount.set(res.data?.totalCount ?? items.length);
        this.readyResultsCount.set(items.filter(r => r.status === 'released').length);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

    this.patientApi.getFamilyMembers().subscribe({
      next: res => this.familyMembersCount.set((res.data ?? []).length),
      error: () => {},
    });
  }
}
