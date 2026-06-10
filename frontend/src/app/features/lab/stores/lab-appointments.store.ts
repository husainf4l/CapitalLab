import { Injectable, inject, signal, computed } from '@angular/core';
import { AppointmentApiService } from '../../../core/api/appointment-api.service';
import { Appointment } from '../../../core/models/appointment.models';

@Injectable({ providedIn: 'root' })
export class LabAppointmentsStore {
  private api = inject(AppointmentApiService);

  readonly appointments = signal<Appointment[]>([]);
  readonly isLoading = signal(false);
  readonly isActing = signal('');

  // Filters
  readonly filterStatus = signal('');
  readonly filterBranch = signal('');
  readonly filterDate = signal(new Date().toISOString().split('T')[0]);
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.appointments().filter(a => {
      if (term && !(a.patientName ?? '').toLowerCase().includes(term) && !a.id.includes(term)) return false;
      return true;
    });
  });

  load(): void {
    this.isLoading.set(true);
    const params = {
      status: this.filterStatus() || undefined,
      branchId: this.filterBranch() || undefined,
      date: this.filterDate() || undefined,
      search: this.searchTerm() || undefined,
    };
    this.api.getAllForLab(params).subscribe({
      next: res => { this.appointments.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  loadToday(): void {
    this.isLoading.set(true);
    this.api.getTodayForLab({ status: this.filterStatus() || undefined }).subscribe({
      next: res => { this.appointments.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  confirm(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.confirm(id).subscribe({
        next: res => {
          if (res.data) this.appointments.update(list => list.map(a => a.id === id ? res.data! : a));
          this.isActing.set('');
          resolve(true);
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  start(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.start(id).subscribe({
        next: res => {
          if (res.data) this.appointments.update(list => list.map(a => a.id === id ? res.data! : a));
          this.isActing.set('');
          resolve(true);
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  complete(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.completeAppointment(id).subscribe({
        next: res => {
          if (res.data) this.appointments.update(list => list.map(a => a.id === id ? res.data! : a));
          this.isActing.set('');
          resolve(true);
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  cancel(id: string, reason?: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.cancelAppointment(id, reason).subscribe({
        next: () => {
          this.appointments.update(list => list.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a));
          this.isActing.set('');
          resolve(true);
        },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }
}
