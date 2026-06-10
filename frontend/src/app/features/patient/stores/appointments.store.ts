import { Injectable, inject, signal, computed } from '@angular/core';
import { AppointmentApiService } from '../../../core/api/appointment-api.service';
import { Appointment } from '../../../core/models/appointment.models';

@Injectable({ providedIn: 'root' })
export class AppointmentsStore {
  private appointmentApi = inject(AppointmentApiService);

  readonly appointments = signal<Appointment[]>([]);
  readonly isLoading = signal(false);
  readonly activeTab = signal<'upcoming' | 'past'>('upcoming');

  readonly upcoming = computed(() =>
    this.appointments()
      .filter(a => a.status === 'pending' || a.status === 'confirmed')
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
  );

  readonly past = computed(() =>
    this.appointments()
      .filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show')
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
  );

  readonly displayed = computed(() =>
    this.activeTab() === 'upcoming' ? this.upcoming() : this.past()
  );

  load(): void {
    this.isLoading.set(true);
    this.appointmentApi.getMyAppointments().subscribe({
      next: res => {
        this.appointments.set(res.data?.items ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  cancel(id: string): Promise<boolean> {
    return new Promise(resolve => {
      this.appointmentApi.cancel(id).subscribe({
        next: () => {
          this.appointments.update(list =>
            list.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a)
          );
          resolve(true);
        },
        error: () => resolve(false),
      });
    });
  }

  reschedule(id: string, date: string, time: string): Promise<boolean> {
    return new Promise(resolve => {
      this.appointmentApi.reschedule(id, date, time).subscribe({
        next: res => {
          if (res.data) {
            this.appointments.update(list =>
              list.map(a => a.id === id ? { ...res.data! } : a)
            );
          }
          resolve(true);
        },
        error: () => resolve(false),
      });
    });
  }
}
