import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface NotificationItem {
  id: string; type: string; channel: string; title: string; message: string;
  status: string; createdAt: string; readAt: string | null;
  retryCount?: number; failureReason?: string; nextAttemptAt?: string | null;
}
interface SendTestForm { userId: string; channel: number; title: string; message: string; }

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Notification Operations</h2>
          <p class="sub">Delivery monitoring, retry management &amp; diagnostics</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="retryFailed()" [disabled]="failed() === 0 || retrying()" aria-label="Retry all failed notifications">
            <mat-icon>{{ retrying() ? 'hourglass_empty' : 'replay' }}</mat-icon>
            Retry Failed{{ failed() > 0 ? ' (' + failed() + ')' : '' }}
          </button>
          <button mat-raised-button color="primary" (click)="showSendForm = !showSendForm" aria-label="Send test notification">
            <mat-icon>send</mat-icon> Send Test
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon blue"><mat-icon>notifications</mat-icon></div>
          <div><div class="kpi-val">{{ total() }}</div><div class="kpi-lbl">Total Sent</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><mat-icon>check_circle</mat-icon></div>
          <div><div class="kpi-val">{{ delivered() }}</div><div class="kpi-lbl">Delivered</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon red"><mat-icon>error</mat-icon></div>
          <div><div class="kpi-val">{{ failed() }}</div><div class="kpi-lbl">Failed</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange"><mat-icon>replay</mat-icon></div>
          <div><div class="kpi-val">{{ retried() }}</div><div class="kpi-lbl">Retrying</div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon gray"><mat-icon>schedule</mat-icon></div>
          <div><div class="kpi-val">{{ pendingCount() }}</div><div class="kpi-lbl">Pending</div></div>
        </div>
        <div class="kpi-card rate-card" [class.good]="deliveryRate() >= 90" [class.warn]="deliveryRate() < 90 && deliveryRate() >= 70" [class.bad]="deliveryRate() < 70">
          <div class="rate-val">{{ deliveryRate() | number:'1.0-0' }}%</div>
          <div class="rate-lbl">Delivery Rate</div>
          <div class="rate-bar-wrap"><div class="rate-bar" [style.width.%]="deliveryRate()"></div></div>
        </div>
      </div>

      <!-- Send Test Form -->
      @if (showSendForm) {
        <div class="panel">
          <h3>Send Test Notification</h3>
          <div class="form-grid">
            <div class="field">
              <label for="userId">User ID</label>
              <input id="userId" type="text" [(ngModel)]="testForm.userId" placeholder="User UUID" />
            </div>
            <div class="field">
              <label for="channel">Channel</label>
              <select id="channel" [(ngModel)]="testForm.channel">
                <option [value]="5">In-App</option><option [value]="1">Email</option>
                <option [value]="2">SMS</option><option [value]="3">WhatsApp</option><option [value]="4">Push</option>
              </select>
            </div>
            <div class="field">
              <label for="notif-title">Title</label>
              <input id="notif-title" type="text" [(ngModel)]="testForm.title" placeholder="Notification title" />
            </div>
            <div class="field">
              <label for="notif-msg">Message</label>
              <input id="notif-msg" type="text" [(ngModel)]="testForm.message" placeholder="Notification message" />
            </div>
          </div>
          <div class="form-actions">
            <button mat-flat-button color="primary" (click)="sendTest()">Send</button>
            <button mat-stroked-button (click)="showSendForm = false">Cancel</button>
          </div>
        </div>
      }

      <!-- Filters -->
      <div class="filter-bar">
        <div class="status-pills" role="group" aria-label="Filter by status">
          @for (s of statusFilters; track s.value) {
            <button class="pill" [class.active]="filterStatus() === s.value" (click)="filterStatus.set(s.value)" [attr.aria-pressed]="filterStatus() === s.value">
              {{ s.label }}
              @if (s.count() > 0) { <span class="pill-count">{{ s.count() }}</span> }
            </button>
          }
        </div>
        <input class="search-input" type="search" [(ngModel)]="filterText" placeholder="Filter by title or type…" aria-label="Search notifications" />
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="skel-list">@for (i of [1,2,3,4,5]; track i) { <div class="skel"></div> }</div>
      } @else if (visibleItems().length === 0) {
        <div class="empty-state" role="status">
          <mat-icon aria-hidden="true">notifications_none</mat-icon>
          <p>No notifications match this filter</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table class="data-table" aria-label="Notification log">
            <thead>
              <tr>
                <th scope="col">Notification</th><th scope="col">Type</th>
                <th scope="col">Channel</th><th scope="col">Status</th>
                <th scope="col">Retry</th><th scope="col">Sent</th>
              </tr>
            </thead>
            <tbody>
              @for (n of visibleItems(); track n.id) {
                <tr [class.row-failed]="n.status === 'Failed'" [class.row-retrying]="(n.retryCount ?? 0) > 0 && n.status === 'Pending'">
                  <td>
                    <div class="notif-title">{{ n.title }}</div>
                    <div class="notif-msg">{{ n.message }}</div>
                    @if (n.failureReason) { <div class="failure-reason">{{ n.failureReason }}</div> }
                  </td>
                  <td><span class="badge">{{ n.type }}</span></td>
                  <td><mat-icon class="ch-icon" [title]="n.channel">{{ channelIcon(n.channel) }}</mat-icon></td>
                  <td><span class="status-badge" [class]="'status-' + n.status.toLowerCase()">{{ n.status }}</span></td>
                  <td>
                    @if ((n.retryCount ?? 0) > 0) {
                      <span class="retry-badge">#{{ n.retryCount }}</span>
                    } @else { <span class="muted">—</span> }
                  </td>
                  <td class="time-col">{{ n.createdAt | date:'dd MMM, HH:mm' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1200px; display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;
      h2 { margin: 0 0 4px; font-size: 1.5rem; font-weight: 700; color: $text-primary; }
      .sub { color: $text-secondary; font-size: .875rem; margin: 0; }
    }
    .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .kpi-row { display: grid; grid-template-columns: repeat(6,1fr); gap: 12px;
      @media (max-width: 1100px) { grid-template-columns: repeat(3,1fr); }
      @media (max-width: 600px) { grid-template-columns: repeat(2,1fr); }
    }
    .kpi-card { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
    .kpi-icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 19px; } }
    .kpi-icon.blue   { background: #dbeafe; color: #1d4ed8; } .kpi-icon.green { background: #dcfce7; color: #16a34a; }
    .kpi-icon.red    { background: #fee2e2; color: #dc2626; } .kpi-icon.orange { background: #ffedd5; color: #c2410c; }
    .kpi-icon.gray   { background: $gray-100; color: $text-secondary; }
    .kpi-val { font-size: 1.3rem; font-weight: 700; color: $text-primary; line-height: 1; }
    .kpi-lbl { font-size: 0.7rem; color: $text-secondary; margin-top: 3px; }
    .rate-card { flex-direction: column; align-items: flex-start; gap: 5px; }
    .rate-val { font-size: 1.3rem; font-weight: 700; line-height: 1; color: $text-primary; }
    .rate-lbl { font-size: 0.7rem; color: $text-secondary; }
    .rate-bar-wrap { width: 100%; height: 4px; background: $gray-100; border-radius: 2px; }
    .rate-bar { height: 100%; border-radius: 2px; background: #16a34a; transition: width 0.5s; }
    .rate-card.good .rate-val { color: #16a34a; } .rate-card.good .rate-bar { background: #16a34a; }
    .rate-card.warn .rate-val { color: #d97706; } .rate-card.warn .rate-bar { background: #d97706; }
    .rate-card.bad  .rate-val { color: #dc2626; } .rate-card.bad  .rate-bar { background: #dc2626; }
    .panel { background: white; border-radius: $border-radius; border: 1px solid $border-color; padding: 20px; }
    .panel h3 { margin: 0 0 14px; font-size: 1rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .field { display: flex; flex-direction: column; gap: 5px; label { font-size: .85rem; font-weight: 600; color: $text-primary; } }
    .field input, .field select { padding: 7px 11px; border: 1px solid $border-color; border-radius: 7px; font-size: .9rem; &:focus { outline: none; border-color: $primary; } }
    .form-actions { display: flex; gap: 10px; }
    .filter-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .status-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .pill { padding: 5px 12px; border-radius: 999px; border: 1px solid $border-color; background: white; font-size: 0.78rem; font-weight: 600; cursor: pointer; color: $text-secondary; transition: all 0.15s; display: flex; align-items: center; gap: 5px;
      &:hover { border-color: $primary; color: $primary; } &.active { background: $primary; color: white; border-color: $primary; }
    }
    .pill-count { background: rgba(255,255,255,0.3); border-radius: 999px; padding: 0 5px; font-size: 0.68rem; }
    .search-input { flex: 1; min-width: 180px; padding: 6px 14px; border: 1px solid $border-color; border-radius: 999px; font-size: .875rem; outline: none; &:focus { border-color: $primary; } }
    .table-wrap { background: white; border-radius: $border-radius; border: 1px solid $border-color; overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; min-width: 640px; }
    .data-table th { background: $gray-50; padding: 10px 14px; text-align: left; font-size: .75rem; font-weight: 600; color: $text-secondary; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid $border-color; }
    .data-table td { padding: 11px 14px; border-bottom: 1px solid $gray-50; font-size: .875rem; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .row-failed td:first-child { border-left: 3px solid #fca5a5; }
    .row-retrying td:first-child { border-left: 3px solid #fdba74; }
    .notif-title { font-weight: 600; color: $text-primary; }
    .notif-msg { font-size: .78rem; color: $text-secondary; margin-top: 2px; }
    .failure-reason { font-size: .73rem; color: #dc2626; margin-top: 3px; font-style: italic; }
    .badge { background: #eff6ff; color: #2563eb; font-size: .73rem; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
    .ch-icon { font-size: 18px; color: $text-secondary; display: block; }
    .status-badge { font-size: .75rem; padding: 3px 10px; border-radius: 20px; font-weight: 600; white-space: nowrap; }
    .status-sent,.status-delivered { background: #ecfdf5; color: #059669; }
    .status-pending   { background: #fffbeb; color: #d97706; }
    .status-failed    { background: #fef2f2; color: #dc2626; }
    .status-read      { background: $gray-100; color: $text-secondary; }
    .status-scheduled { background: #eff6ff; color: #2563eb; }
    .retry-badge { font-size: .73rem; background: #ffedd5; color: #c2410c; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
    .muted { color: $text-disabled; }
    .time-col { white-space: nowrap; color: $text-secondary; font-size: .78rem; }
    .skel-list { display: flex; flex-direction: column; gap: 8px; }
    .skel { height: 52px; background: linear-gradient(90deg,$gray-100 25%,$gray-200 50%,$gray-100 75%); background-size: 200% 100%; border-radius: $border-radius; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: $text-secondary; gap: 12px; mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: .35; } p { margin: 0; } }
  `]
})
export class AdminNotificationsComponent implements OnInit {
  private http = inject(HttpClient);
  items = signal<NotificationItem[]>([]);
  loading = signal(false);
  retrying = signal(false);
  showSendForm = false;
  filterText = '';
  filterStatus = signal<string>('All');
  testForm: SendTestForm = { userId: '', channel: 5, title: '', message: '' };

  total        = computed(() => this.items().length);
  delivered    = computed(() => this.items().filter(n => n.status === 'Sent' || n.status === 'Delivered').length);
  failed       = computed(() => this.items().filter(n => n.status === 'Failed').length);
  pendingCount = computed(() => this.items().filter(n => n.status === 'Pending' && !(n.retryCount ?? 0)).length);
  retried      = computed(() => this.items().filter(n => (n.retryCount ?? 0) > 0).length);
  deliveryRate = computed(() => { const t = this.total(); return t === 0 ? 100 : Math.round((this.delivered() / t) * 100); });

  statusFilters = [
    { value: 'All',      label: 'All',      count: this.total },
    { value: 'Pending',  label: 'Pending',  count: this.pendingCount },
    { value: 'Sent',     label: 'Delivered',count: this.delivered },
    { value: 'Failed',   label: 'Failed',   count: this.failed },
    { value: 'Retrying', label: 'Retrying', count: this.retried },
    { value: 'Read',     label: 'Read',     count: computed(() => this.items().filter(n => n.status === 'Read').length) },
  ];

  visibleItems = computed(() => {
    let list = this.items();
    const status = this.filterStatus();
    if (status === 'Retrying') list = list.filter(n => (n.retryCount ?? 0) > 0 && n.status === 'Pending');
    else if (status !== 'All') list = list.filter(n => n.status === status);
    const text = this.filterText.toLowerCase();
    if (text) list = list.filter(n => n.title.toLowerCase().includes(text) || n.type.toLowerCase().includes(text));
    return list;
  });

  channelIcon(channel: string): string {
    const m: Record<string,string> = { Email:'email', SMS:'sms', WhatsApp:'chat', Push:'notifications', InApp:'inbox' };
    return m[channel] ?? 'notifications';
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/notifications`).subscribe({
      next: r => { this.items.set(r.data?.items ?? []); this.loading.set(false); },
      error: () => { this.items.set([]); this.loading.set(false); }
    });
  }

  retryFailed() {
    this.retrying.set(true);
    this.http.post(`${environment.apiUrl}/notifications/retry-failed`, {}).subscribe({
      next: () => setTimeout(() => { this.retrying.set(false); this.load(); }, 3000),
      error: () => this.retrying.set(false),
    });
  }

  sendTest() {
    if (!this.testForm.userId || !this.testForm.title) return;
    this.http.post(`${environment.apiUrl}/notifications/send-test`, this.testForm).subscribe({
      next: () => { this.showSendForm = false; this.load(); },
      error: () => {}
    });
  }
}
