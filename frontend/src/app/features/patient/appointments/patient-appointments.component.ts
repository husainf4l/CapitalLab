import { Component, inject, signal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Appointment } from '../../../core/models/appointment.models';
import { AppointmentsStore } from '../stores/appointments.store';
import { ToastService } from '../../../core/services/toast.service';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    RouterLink, MatButtonModule, MatIconModule, CommonModule, FormsModule, A11yModule,
  ],
  template: `
    <div class="appointments-page">

      <!-- Hero Strip -->
      <div class="hero-strip">
        <div class="hero-left">
          <div class="hero-icon-wrap">
            <mat-icon>calendar_month</mat-icon>
          </div>
          <div class="hero-text">
            <h1 class="hero-title">My Appointments</h1>
            <p class="hero-sub">Manage and track your lab visits</p>
          </div>
        </div>
        <a routerLink="/patient/book" class="hero-btn">
          <mat-icon style="font-size:18px;width:18px;height:18px;">add</mat-icon>
          Book Appointment
        </a>
      </div>

      <!-- Pill Tabs -->
      <div class="tabs-pill-row">
        <div class="tabs-pill-container">
          <button
            class="tab-pill-btn"
            [class.active]="store.activeTab() === 'upcoming'"
            (click)="store.activeTab.set('upcoming')"
          >
            Upcoming
            <span class="tab-badge" [class.active]="store.activeTab() === 'upcoming'">{{ store.upcoming().length }}</span>
          </button>
          <button
            class="tab-pill-btn"
            [class.active]="store.activeTab() === 'past'"
            (click)="store.activeTab.set('past')"
          >
            Past
            <span class="tab-badge" [class.active]="store.activeTab() === 'past'">{{ store.past().length }}</span>
          </button>
        </div>
      </div>

      <!-- Loading Skeletons -->
      @if (store.isLoading()) {
        <div class="skeleton-list">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
      }

      <!-- Empty State -->
      @else if (store.displayed().length === 0) {
        <div class="empty-state-card">
          <div class="empty-icon-wrap">
            <mat-icon>calendar_today</mat-icon>
          </div>
          <h3 class="empty-title">No appointments</h3>
          <p class="empty-sub">
            {{ store.activeTab() === 'upcoming'
              ? 'You have no upcoming appointments. Book a test to get started.'
              : 'No past appointments found.' }}
          </p>
          @if (store.activeTab() === 'upcoming') {
            <a routerLink="/patient/book" class="empty-book-btn">
              <mat-icon style="font-size:18px;width:18px;height:18px;">add</mat-icon>
              Book a Test
            </a>
          }
        </div>
      }

      <!-- Appointment Cards -->
      @else {
        <div class="appointments-list">
          @for (appt of store.displayed(); track appt.id) {
            <div class="appt-card">

              <!-- Date Block -->
              <div class="appt-date-block">
                <div class="date-day">{{ appt.appointmentDate | date:'d' }}</div>
                <div class="date-month">{{ appt.appointmentDate | date:'MMM' }}</div>
              </div>

              <!-- Card Body -->
              <div class="appt-body">
                <div class="appt-top-row">
                  <h5 class="appt-title">{{ appt.type === 'home_collection' ? 'Home Collection' : 'Branch Visit' }}</h5>
                  <span class="status-chip status-{{ appt.status }}">{{ appt.status | titlecase }}</span>
                </div>

                <div class="appt-detail-row">
                  <mat-icon class="detail-icon">location_on</mat-icon>
                  <span>{{ appt.branchName || 'Home Address' }}</span>
                  <span class="detail-sep">·</span>
                  <mat-icon class="detail-icon">schedule</mat-icon>
                  <span>{{ appt.appointmentTime }}</span>
                </div>

                @if (appt.tests?.length) {
                  <span class="tests-pill">{{ appt.tests!.length }} test(s) ordered</span>
                }

                @if (appt.status === 'pending' || appt.status === 'confirmed') {
                  <div class="appt-actions">
                    <button class="action-btn reschedule-btn" (click)="openReschedule(appt)">
                      <mat-icon style="font-size:15px;width:15px;height:15px;">schedule</mat-icon>
                      Reschedule
                    </button>
                    <button
                      class="action-btn cancel-btn"
                      [disabled]="cancelling() === appt.id"
                      (click)="cancel(appt)"
                    >
                      <mat-icon style="font-size:15px;width:15px;height:15px;">cancel</mat-icon>
                      {{ cancelling() === appt.id ? 'Cancelling…' : 'Cancel' }}
                    </button>
                  </div>
                }
              </div>

            </div>
          }
        </div>
      }

      <!-- Reschedule Modal -->
      @if (rescheduleAppt()) {
        <div class="modal-overlay" (click)="closeReschedule()">
          <div
            class="modal-card"
            (click)="$event.stopPropagation()"
            (keydown.escape)="closeReschedule()"
            cdkTrapFocus
            cdkTrapFocusAutoCapture
            role="dialog"
            aria-modal="true"
            aria-labelledby="reschedule-title"
          >
            <div class="modal-header">
              <h4 id="reschedule-title">Reschedule Appointment</h4>
              <button class="modal-close-btn" aria-label="Close reschedule dialog" (click)="closeReschedule()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <p class="modal-sub">Choose a new date and time for your appointment.</p>

            <label class="date-label">New Date</label>
            <input
              class="date-input"
              type="date"
              [(ngModel)]="rescheduleDate"
              [min]="today"
            />

            <div class="time-slots">
              @for (slot of timeSlots; track slot) {
                <button
                  class="time-slot"
                  [class.selected]="rescheduleTime === slot"
                  (click)="rescheduleTime = slot"
                >
                  {{ slot }}
                </button>
              }
            </div>

            <div class="modal-actions">
              <button class="modal-btn modal-cancel-btn" (click)="closeReschedule()">Cancel</button>
              <button
                class="modal-btn modal-confirm-btn"
                [disabled]="!rescheduleDate || !rescheduleTime || rescheduling()"
                (click)="confirmReschedule()"
              >
                {{ rescheduling() ? 'Saving…' : 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .appointments-page {
      padding: 0;
    }

    /* ── Hero Strip ── */
    .hero-strip {
      background: linear-gradient(135deg, #1e9df1 0%, #1565c0 100%);
      border-radius: 16px;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .hero-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .hero-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }
    }
    .hero-title {
      margin: 0 0 2px;
      color: white;
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .hero-sub {
      margin: 0;
      color: white;
      font-size: 0.8rem;
      opacity: 0.8;
    }
    .hero-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: white;
      color: #1565c0;
      font-weight: 700;
      border-radius: 999px;
      padding: 10px 22px;
      font-size: 0.85rem;
      text-decoration: none;
      transition: box-shadow 0.2s;
      flex-shrink: 0;
      &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
    }

    /* ── Pill Tabs ── */
    .tabs-pill-row {
      margin-bottom: 20px;
    }
    .tabs-pill-container {
      background: #f1f5f9;
      border-radius: 999px;
      padding: 4px;
      display: inline-flex;
      gap: 4px;
    }
    .tab-pill-btn {
      padding: 8px 20px;
      border-radius: 999px;
      border: none;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      background: transparent;
      color: #72767a;
      display: flex;
      align-items: center;
      &.active {
        background: white;
        color: #1e9df1;
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        .tab-badge { background: #1e9df1; color: white; }
      }
    }
    .tab-badge {
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 999px;
      margin-left: 6px;
    }

    /* ── Loading Skeletons ── */
    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .skeleton-card {
      height: 84px;
      border-radius: 14px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ── Empty State ── */
    .empty-state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    .empty-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #dbeafe;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      mat-icon { color: #1e9df1; font-size: 28px; width: 28px; height: 28px; }
    }
    .empty-title {
      margin: 0 0 8px;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f1419;
    }
    .empty-sub {
      margin: 0 0 20px;
      font-size: 0.875rem;
      color: #72767a;
      max-width: 320px;
    }
    .empty-book-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #1e9df1, #1565c0);
      color: white;
      font-weight: 700;
      border-radius: 999px;
      padding: 10px 22px;
      font-size: 0.875rem;
      text-decoration: none;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 4px 14px rgba(30,157,241,0.4); }
    }

    /* ── Appointment Cards ── */
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .appt-card {
      background: white;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      display: flex;
      transition: all 0.2s;
      &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    }
    .appt-date-block {
      background: linear-gradient(180deg, #1e9df1, #1565c0);
      min-width: 72px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 12px;
      color: white;
      flex-shrink: 0;
    }
    .date-day {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
    }
    .date-month {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.85;
      margin-top: 2px;
    }
    .appt-body {
      flex: 1;
      padding: 16px 20px;
    }
    .appt-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    .appt-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f1419;
      margin: 0 0 4px;
    }
    .appt-detail-row {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.82rem;
      color: #72767a;
    }
    .detail-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #94a3b8;
    }
    .detail-sep {
      margin: 0 2px;
      color: #cbd5e1;
    }
    .tests-pill {
      display: inline-flex;
      background: #ede9fe;
      color: #7c3aed;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 999px;
      margin-top: 6px;
    }
    .appt-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      border: 1.5px solid;
      background: white;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .reschedule-btn {
      border-color: #1e9df1;
      color: #1e9df1;
      &:hover { background: #eff6ff; }
    }
    .cancel-btn {
      border-color: #fca5a5;
      color: #dc2626;
      &:hover { background: #fef2f2; }
    }

    /* ── Status Chips ── */
    .status-chip {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 11px;
      border-radius: 999px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .status-confirmed  { background: #dcfce7; color: #15803d; }
    .status-pending    { background: #fef3c7; color: #92400e; }
    .status-in_progress { background: #dbeafe; color: #1d4ed8; }
    .status-cancelled  { background: #fee2e2; color: #991b1b; }
    .status-completed  { background: #f0fdf4; color: #166534; }

    /* ── Reschedule Modal ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-card {
      background: white;
      border-radius: 20px;
      padding: 28px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      h4 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f1419; }
    }
    .modal-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
      padding: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #72767a; }
      &:hover { background: #e2e8f0; }
    }
    .modal-sub {
      color: #72767a;
      font-size: 0.875rem;
      margin: 0 0 20px;
    }
    .date-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
    }
    .date-input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #0f1419;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      margin-bottom: 16px;
      &:focus {
        border-color: #1e9df1;
        box-shadow: 0 0 0 3px rgba(30,157,241,0.15);
      }
    }
    .time-slots {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 20px;
      @media (max-width: 640px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 420px) { grid-template-columns: repeat(2, 1fr); }
    }
    .time-slot {
      padding: 9px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      background: white;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      text-align: center;
      transition: all 0.15s;
      color: #374151;
      &:hover { border-color: #1e9df1; }
      &.selected {
        border-color: #1e9df1;
        background: #eff6ff;
        color: #1e9df1;
        font-weight: 700;
      }
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .modal-btn {
      padding: 9px 22px;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .modal-cancel-btn {
      background: white;
      border: 1.5px solid #e2e8f0;
      color: #374151;
      &:hover { border-color: #94a3b8; }
    }
    .modal-confirm-btn {
      background: linear-gradient(135deg, #1e9df1, #1565c0);
      border: none;
      color: white;
      &:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(30,157,241,0.4); }
    }
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
