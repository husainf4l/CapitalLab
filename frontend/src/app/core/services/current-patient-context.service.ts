import { Injectable, inject, signal, computed } from '@angular/core';
import { PatientApiService } from '../api/patient-api.service';
import { Patient } from '../models/patient.models';

// TODO: Replace with /auth/me endpoint once backend exposes patientId in JWT claims
@Injectable({ providedIn: 'root' })
export class CurrentPatientContextService {
  private patientApi = inject(PatientApiService);

  readonly profile = signal<Patient | null>(null);
  readonly isLoading = signal(false);
  readonly isLoaded = signal(false);

  readonly patientId = computed(() => this.profile()?.id ?? '');
  readonly fullName = computed(() => this.profile()?.fullName ?? '');
  readonly firstName = computed(() => this.profile()?.firstName ?? '');
  readonly initials = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase();
  });

  load(): void {
    if (this.isLoaded() || this.isLoading()) return;
    this.isLoading.set(true);
    this.patientApi.getProfile().subscribe({
      next: res => {
        if (res.success && res.data) this.profile.set(res.data);
        this.isLoaded.set(true);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoaded.set(true);
        this.isLoading.set(false);
      },
    });
  }

  reset(): void {
    this.profile.set(null);
    this.isLoaded.set(false);
    this.isLoading.set(false);
  }
}
