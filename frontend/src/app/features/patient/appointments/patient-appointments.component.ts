import { Component, inject, signal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Appointment } from '../../../core/models/appointment.models';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';
import { AppStatusBadgeComponent } from '../../../shared/ui/app-status-badge/app-status-badge.component';
import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { AppLoadingComponent } from '../../../shared/ui/app-loading/app-loading.component';
import { AppointmentsStore } from '../stores/appointments.store';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    RouterLink, MatButtonModule, MatIconModule, CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule,
    AppPageHeaderComponent, AppStatusBadgeComponent, AppEmptyStateComponent, AppLoadingComponent,
  ],
  template: `
    <div class="appointments-page">
      <app-page-header title="My Appointments" subtitle="Manage your lab appointments">
        <a mat-flat-button color="primary" routerLink="/patient/book">
          <mat-icon>add</mat-icon> Book Appointment
        </a>
      </app-page-header>

      <!-- Tabs -->
      <div class="tabs-row">
        <button class="tab-btn" [class.active]="store.activeTab() === 'upcoming'" (click)="store.activeTab.set('upcoming')">
          Upcoming <span class="tab-count">{{ store.upcoming().length }}</span>
        </button>
        <button class="tab-btn" [class.active]="store.activeTab() === 'past'" (click)="store.activeTab.set('past')">
          Past <span class="tab-count">{{ store.past().length }}</span>
        </button>
      </div>

      @if (store.isLoading()) {
        <app-loading />
      } @else if (store.displayed().length === 0) {
        <app-empty-state
          icon="calendar_today"
          title="No appointments"
          [description]="store.activeTab() === 'upcoming' ? 'You have no upcoming appointments. Book a test to get started.' : 'No past appointments found.'"
        >
          @if (store.activeTab() === 'upcoming') {
            <a mat-flat-button color="primary" routerLink="/patient/book">Book a Test</a>
          }
        </app-empty-state>
      } @else {
        <div class="appointments-list">
          @for (appt of store.displayed(); track appt.id) {
            <div class="appt-card">
              <div class="appt-date-block">
                <div class="date-day">{{ appt.appointmentDate | date:'d' }}</div>
                <div class="date-month">{{ appt.appointmentDate | date:'MMM' }}</div>
              </div>
              <div class="appt-body">
                <div class="appt-main">
                  <div>
                    <h5>{{ appt.type === 'home_collection' ? 'Home Collection' : 'Branch Visit' }}</h5>
                    <p class="appt-detail">{{ appt.branchName || 'Home Address' }} · {{ appt.appointmentTime }}</p>
                    @if (appt.tests?.length) {
                      <p class="appt-tests">{{ appt.tests!.length }} test(s) ordered</p>
                    }
                  </div>
                  <app-status-badge [status]="appt.status" />
                </div>
                @if (appt.status === 'pending' || appt.status === 'confirmed') {
                  <div class="appt-actions">
                    <button mat-stroked-button (click)="openReschedule(appt)">
                      <mat-icon>schedule</mat-icon> Reschedule
                    </button>
                    <button mat-stroked-button color="warn" [disabled]="cancelling() === appt.id" (click)="cancel(appt)">
                      <mat-icon>cancel</mat-icon>
                      {{ cancelling() === appt.id ? 'Cancelling…' : 'Cancel' }}
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Reschedule modal -->
      @if (rescheduleAppt()) {
        <div class="modal-overlay" (click)="closeReschedule()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h4>Reschedule Appointment</h4>
              <button mat-icon-button (click)="closeReschedule()"><mat-icon>close</mat-icon></button>
            </div>
            <p class="modal-sub">Choose a new date and time for your appointment.</p>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Date</mat-label>
              <input matInput type="date" [(ngModel)]="rescheduleDate" [min]="today" />
            </mat-form-field>
            <div class="time-slots">
              @for (slot of timeSlots; track slot) {
                <button class="time-slot" [class.selected]="rescheduleTime === slot" (click)="rescheduleTime = slot">
                  {{ slot }}
                </button>
              }
            </div>
            <div class="modal-actions">
              <button mat-stroked-button (click)="closeReschedule()">Cancel</button>
              <button mat-flat-button color="primary" [disabled]="!rescheduleDate || !rescheduleTime || rescheduling()"
                      (click)="confirmReschedule()">
                {{ rescheduling() ? 'Saving…' : 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .tabs-row { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid $border-color; }
    .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; font-size: 0.9rem; font-weight: 500; color: $text-secondary; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s;
      &:hover { color: $text-primary; }
      &.active { color: $primary; border-bottom-color: $primary; }
    }
    .tab-count { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: $gray-100; font-size: 0.7rem; margin-left: 6px; }
    .tab-btn.active .tab-count { background: $primary-light; color: $primary; }

    .appointments-list { display: flex; flex-direction: column; gap: 12px; }
    .appt-card {
      background: white; border-radius: $border-radius; border: 1px solid $border-color;
      box-shadow: $shadow-sm; display: flex; overflow: hidden;
    }
    .appt-date-block {
      background: $primary; color: white; padding: 16px 20px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-width: 70px; flex-shrink: 0;
    }
    .date-day { font-size: 1.75rem; font-weight: 700; line-height: 1; }
    .date-month { font-size: 0.75rem; opacity: 0.85; text-transform: uppercase; letter-spacing: 1px; }
    .appt-body { flex: 1; padding: 16px; }
    .appt-main { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;
      h5 { margin: 0 0 4px; font-size: 1rem; }
    }
    .appt-detail { margin: 0 0 2px; font-size: 0.8rem; color: $text-secondary; }
    .appt-tests { margin: 0; font-size: 0.8rem; color: $primary; }
    .appt-actions { display: flex; gap: 8px; flex-wrap: wrap; }

    /* Reschedule modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal-card { background: white; border-radius: $border-radius-lg; padding: 28px; width: 100%; max-width: 480px; box-shadow: $shadow-lg; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; h4 { margin: 0; } }
    .modal-sub { color: $text-secondary; font-size: 0.875rem; margin-bottom: 20px; }
    .full-width { width: 100%; }
    .time-slots { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0 20px; }
    .time-slot { padding: 8px 4px; border: 1.5px solid $border-color; border-radius: $border-radius; background: white; cursor: pointer; font-size: 0.8rem; text-align: center; transition: all 0.15s;
      &:hover { border-color: $primary; }
      &.selected { border-color: $primary; background: $primary; color: white; }
    }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
  `]
})
export class PatientAppointmentsComponent implements OnInit {
  store = inject(AppointmentsStore);
  private toast = inject(ToastService);

  cancelling = signal('');
  rescheduling = signal(false);
  rescheduleAppt = signal<Appointment | null>(null);
  rescheduleDate = '';
  rescheduleTime = '';
  today = new Date().toISOString().split('T')[0];

  timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  ngOnInit(): void {
    this.store.load();
  }

  async cancel(appt: Appointment): Promise<void> {
    this.cancelling.set(appt.id);
    const ok = await this.store.cancel(appt.id);
    this.cancelling.set('');
    if (ok) this.toast.success('Appointment cancelled.');
    else this.toast.error('Failed to cancel appointment.');
  }

  openReschedule(appt: Appointment): void {
    this.rescheduleAppt.set(appt);
    this.rescheduleDate = appt.appointmentDate;
    this.rescheduleTime = appt.appointmentTime ?? '';
  }

  closeReschedule(): void {
    this.rescheduleAppt.set(null);
    this.rescheduleDate = '';
    this.rescheduleTime = '';
  }

  async confirmReschedule(): Promise<void> {
    const appt = this.rescheduleAppt();
    if (!appt || !this.rescheduleDate || !this.rescheduleTime) return;
    this.rescheduling.set(true);
    const ok = await this.store.reschedule(appt.id, this.rescheduleDate, this.rescheduleTime);
    this.rescheduling.set(false);
    if (ok) {
      this.toast.success('Appointment rescheduled.');
      this.closeReschedule();
    } else {
      this.toast.error('Failed to reschedule appointment.');
    }
  }
}
