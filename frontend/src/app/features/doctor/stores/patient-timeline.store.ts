import { Injectable, inject, signal, computed } from '@angular/core';
import { DoctorApiService, PatientTimelineEvent } from '../../../core/api/doctor-api.service';
import { Patient } from '../../../core/models/patient.models';

@Injectable({ providedIn: 'root' })
export class PatientTimelineStore {
  private api = inject(DoctorApiService);

  readonly patient = signal<Patient | null>(null);
  readonly events = signal<PatientTimelineEvent[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingPatient = signal(false);
  readonly error = signal('');
  readonly activeFilter = signal<string>('all');

  readonly filteredEvents = computed(() => {
    const f = this.activeFilter();
    if (f === 'all') return this.events();
    return this.events().filter(e => e.type === f);
  });

  readonly groupedByYear = computed(() => {
    const map = new Map<number, PatientTimelineEvent[]>();
    for (const e of this.filteredEvents()) {
      const year = new Date(e.date).getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(e);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  });

  loadPatient(patientId: string): void {
    this.isLoadingPatient.set(true);
    this.api.getPatientById(patientId).subscribe({
      next: res => { this.patient.set(res.data); this.isLoadingPatient.set(false); },
      error: () => this.isLoadingPatient.set(false),
    });
  }

  loadTimeline(patientId: string): void {
    this.isLoading.set(true);
    this.error.set('');
    this.api.getPatientTimeline(patientId).subscribe({
      next: res => {
        const sorted = (res.data ?? []).sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.events.set(sorted);
        this.isLoading.set(false);
      },
      error: () => { this.error.set('Failed to load timeline'); this.isLoading.set(false); },
    });
  }

  load(patientId: string): void {
    this.loadPatient(patientId);
    this.loadTimeline(patientId);
  }

  reset(): void {
    this.patient.set(null);
    this.events.set([]);
    this.error.set('');
    this.activeFilter.set('all');
  }
}
