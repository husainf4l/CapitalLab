import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';


@Component({
  selector: 'app-patient-notifications',
  standalone: true,
  imports: [MatIconModule, CommonModule, AppPageHeaderComponent],
  template: `
    <div class="notif-page">
      <app-page-header title="Notifications" subtitle="Stay updated on your results and appointments" />
      <div class="notif-list">
        @for (n of notifications; track n.id) {
          <div class="notif-item" [class.unread]="!n.read">
            <div class="notif-icon" [class]="'type-' + n.type">
              <mat-icon>{{ iconForType(n.type) }}</mat-icon>
            </div>
            <div class="notif-body">
              <p class="notif-title">{{ n.title }}</p>
              <p class="notif-msg">{{ n.message }}</p>
              <p class="notif-time">{{ n.time }}</p>
            </div>
            @if (!n.read) {
              <div class="unread-dot"></div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .notif-list { display: flex; flex-direction: column; gap: 2px; }
    .notif-item {
      display: flex; align-items: flex-start; gap: 12px; padding: 16px;
      background: white; border-radius: $border-radius; border: 1px solid $border-color;
      transition: all 0.2s;
      &.unread { background: $primary-light; border-color: rgba(26,115,232,0.2); }
    }
    .notif-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      &.type-result { background: #dcfce7; mat-icon { color: $success; } }
      &.type-appointment { background: #dbeafe; mat-icon { color: $primary; } }
      &.type-reminder { background: #fef3c7; mat-icon { color: $warning; } }
    }
    .notif-body { flex: 1; }
    .notif-title { font-weight: 600; margin: 0 0 2px; font-size: 0.9rem; }
    .notif-msg { margin: 0 0 4px; font-size: 0.8rem; color: $text-secondary; }
    .notif-time { margin: 0; font-size: 0.75rem; color: $text-disabled; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: $primary; flex-shrink: 0; margin-top: 4px; }
  `]
})
export class PatientNotificationsComponent {
  notifications = [
    { id: '1', type: 'result', title: 'Results Ready', message: 'Your Blood Panel results are now available. Click to view.', time: '2 hours ago', read: false },
    { id: '2', type: 'appointment', title: 'Appointment Confirmed', message: 'Your appointment on Dec 15 at 9:00 AM has been confirmed.', time: '1 day ago', read: false },
    { id: '3', type: 'reminder', title: 'Fasting Reminder', message: 'Reminder: Please fast for 8 hours before tomorrow\'s blood test.', time: '2 days ago', read: true },
    { id: '4', type: 'result', title: 'Report Shared', message: 'Your thyroid report has been shared with Dr. Ahmed Al-Rashid.', time: '5 days ago', read: true },
  ];

  iconForType(type: string): string {
    return type === 'result' ? 'science' : type === 'appointment' ? 'calendar_today' : 'notifications';
  }
}
