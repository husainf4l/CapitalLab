import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Notification { id: string; type: string; title: string; message: string; createdAt: string; readAt: string | null; }

@Component({
  selector: 'app-patient-notifications',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CommonModule],
  template: `
    <div class="notif-page">

      <!-- Hero strip -->
      <div class="hero-strip">
        <div class="hero-left">
          <div class="hero-icon-circle">
            <mat-icon>notifications</mat-icon>
          </div>
          <div class="hero-text">
            <div class="hero-title">Notifications</div>
            <div class="hero-subtitle">Stay updated on your health journey</div>
          </div>
        </div>
        @if (unread() > 0) {
          <div class="hero-right">
            <div class="unread-badge">{{ unread() }}</div>
            <button class="mark-all-btn" (click)="markAllRead()">Mark all read</button>
          </div>
        }
      </div>

      <!-- Unread banner -->
      @if (unread() > 0 && !loading()) {
        <div class="unread-banner">
          <mat-icon style="font-size:18px;width:18px;height:18px;">info</mat-icon>
          <span>You have {{ unread() }} unread notification{{ unread() > 1 ? 's' : '' }}</span>
          <button class="banner-mark-btn" (click)="markAllRead()">Mark all read</button>
        </div>
      }

      <!-- Loading skeletons -->
      @if (loading()) {
        <div class="notif-list">
          @for (i of [1,2,3,4]; track i) {
            <div class="skel-row"></div>
          }
        </div>
      } @else if (items().length === 0) {
        <!-- Empty state -->
        <div class="empty-state">
          <div class="empty-icon-circle">
            <mat-icon class="empty-icon">notifications_none</mat-icon>
          </div>
          <p class="empty-title">No notifications yet</p>
          <p class="empty-desc">Your reminders and result alerts will appear here</p>
        </div>
      } @else {
        <!-- Notification items -->
        <div class="notif-list">
          @for (n of items(); track n.id) {
            <div class="notif-item" [class.unread]="!n.readAt" (click)="markRead(n)">
              <div class="notif-icon-circle" [ngClass]="'type-' + n.type">
                <mat-icon>{{ iconForType(n.type) }}</mat-icon>
              </div>
              <div class="notif-body">
                <p class="notif-title">{{ n.title }}</p>
                <p class="notif-msg">{{ n.message }}</p>
                <p class="notif-time">{{ n.createdAt | date:'dd MMM, HH:mm' }}</p>
              </div>
              @if (!n.readAt) {
                <div class="unread-dot"></div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-page {
      max-width: 700px;
    }

    /* Hero strip */
    .hero-strip {
      background: linear-gradient(135deg, #1e9df1 0%, #1565c0 100%);
      border-radius: 16px;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .hero-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .hero-icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon {
        color: white;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .hero-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hero-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: white;
    }

    .hero-subtitle {
      font-size: 0.85rem;
      color: white;
      opacity: 0.8;
    }

    .hero-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .unread-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: white;
      color: #1e9df1;
      font-weight: 800;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mark-all-btn {
      background: white;
      color: #1565c0;
      border: none;
      border-radius: 999px;
      padding: 8px 18px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }

    /* Unread banner */
    .unread-banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: #1d4ed8;
      font-weight: 500;
      margin-bottom: 12px;
      mat-icon {
        color: #1d4ed8;
      }
    }

    .banner-mark-btn {
      background: none;
      border: none;
      color: #1d4ed8;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      margin-left: auto;
      padding: 0;
    }

    /* Notification list */
    .notif-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Skeleton rows */
    .skel-row {
      height: 76px;
      border-radius: 14px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Notification item */
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px 18px;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      background: white;
      transition: all 0.2s;

      &.unread {
        background: #f0f9ff;
        border-color: #bae6fd;
      }

      &:hover {
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      }
    }

    /* Icon circle per type */
    .notif-icon-circle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.type-result,
      &.type-Report,
      &.type-ReportReady {
        background: #dcfce7;
        mat-icon { color: #10b981; }
      }

      &.type-appointment,
      &.type-Appointment,
      &.type-AppointmentConfirmed {
        background: #dbeafe;
        mat-icon { color: #1e9df1; }
      }

      &.type-reminder,
      &.type-Reminder {
        background: #fef3c7;
        mat-icon { color: #f59e0b; }
      }

      &.type-system {
        background: #f1f5f9;
        mat-icon { color: #64748b; }
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    /* Body */
    .notif-body {
      flex: 1;
      min-width: 0;
    }

    .notif-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f1419;
      margin: 0 0 3px;
    }

    .notif-msg {
      font-size: 0.82rem;
      color: #72767a;
      margin: 0 0 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notif-time {
      font-size: 0.72rem;
      color: #94a3b8;
      margin: 0;
    }

    /* Unread pulsing dot */
    .unread-dot {
      width: 8px;
      height: 8px;
      background: #1e9df1;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 6px;
      animation: blink 2s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f0f9ff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .empty-icon {
      font-size: 60px;
      width: 60px;
      height: 60px;
      color: #94a3b8;
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f1419;
      margin: 0 0 8px;
    }

    .empty-desc {
      font-size: 0.85rem;
      color: #72767a;
      margin: 0;
    }
  `]
})
export class PatientNotificationsComponent implements OnInit {
  private http = inject(HttpClient);
  items = signal<Notification[]>([]);
  loading = signal(false);
  unread = () => this.items().filter(n => !n.readAt).length;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/me/notifications`).subscribe({
      next: r => { this.items.set(r.data?.items ?? []); this.loading.set(false); },
      error: () => {
        this.items.set([
          { id: '1', type: 'result', title: 'Results Ready', message: 'Your Blood Panel results are now available.', createdAt: new Date().toISOString(), readAt: null },
          { id: '2', type: 'appointment', title: 'Appointment Confirmed', message: 'Your appointment has been confirmed.', createdAt: new Date(Date.now() - 86400000).toISOString(), readAt: null },
        ]);
        this.loading.set(false);
      }
    });
  }

  markRead(n: Notification) {
    if (n.readAt) return;
    this.http.post(`${environment.apiUrl}/notifications/${n.id}/read`, {}).subscribe({
      next: () => { this.items.update(arr => arr.map(x => x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)); }
    });
  }

  markAllRead() {
    const unreadIds = this.items().filter(n => !n.readAt).map(n => n.id);
    unreadIds.forEach(id => this.http.post(`${environment.apiUrl}/notifications/${id}/read`, {}).subscribe());
    this.items.update(arr => arr.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  }

  iconForType(type: string): string {
    if (type?.includes('result') || type?.includes('Report') || type?.includes('Ready')) return 'science';
    if (type?.includes('appointment') || type?.includes('Appointment')) return 'calendar_today';
    return 'notifications';
  }
}
