import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface HealthEntry { name: string; status: 'Healthy' | 'Degraded' | 'Unhealthy'; duration?: string; description?: string; }
interface HealthPayload { status: string; entries: Record<string, { status: string; duration: string; description?: string; }>; }
interface VersionInfo { version: string; buildDate: string; environment: string; timestamp: string; }
interface HealthDetail {
  lastMigration: string;
  notificationPending: number;
  notificationFailed: number;
  notificationRetrying: number;
}

@Component({
  selector: 'app-admin-system-health',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>System Health</h2>
          <p class="sub">Real-time infrastructure status &amp; build information</p>
        </div>
        <button mat-stroked-button (click)="load()" aria-label="Refresh health status">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      <!-- Overall status + version -->
      <div class="top-row">
        <div class="overall-card" [class]="'overall-' + overallClass()">
          <mat-icon class="overall-icon">{{ overallIcon() }}</mat-icon>
          <div>
            <div class="overall-label">Overall Status</div>
            <div class="overall-status">{{ overallStatus() }}</div>
          </div>
        </div>

        @if (version()) {
          <div class="version-card">
            <div class="version-row">
              <span class="vk"><mat-icon class="vi">tag</mat-icon> API Version</span>
              <span class="vv code">{{ version()!.version }}</span>
            </div>
            <div class="version-row">
              <span class="vk"><mat-icon class="vi">build</mat-icon> Build Date</span>
              <span class="vv">{{ version()!.buildDate | date:'dd MMM yyyy, HH:mm' }}</span>
            </div>
            <div class="version-row">
              <span class="vk"><mat-icon class="vi">cloud</mat-icon> Environment</span>
              <span class="vv env-badge" [class]="'env-' + version()!.environment.toLowerCase()">{{ version()!.environment }}</span>
            </div>
            <div class="version-row">
              <span class="vk"><mat-icon class="vi">schedule</mat-icon> Checked At</span>
              <span class="vv">{{ version()!.timestamp | date:'HH:mm:ss' }}</span>
            </div>
            @if (detail()) {
              <div class="version-row">
                <span class="vk"><mat-icon class="vi">history</mat-icon> Last Migration</span>
                <span class="vv code small">{{ lastMigrationLabel() }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Notification queue status -->
      @if (detail()) {
        <h3 class="section-title">Notification Queue</h3>
        <div class="queue-row">
          <div class="queue-card" [class.queue-ok]="detail()!.notificationPending === 0">
            <div class="queue-icon pending"><mat-icon>hourglass_empty</mat-icon></div>
            <div class="queue-val">{{ detail()!.notificationPending }}</div>
            <div class="queue-lbl">Pending</div>
          </div>
          <div class="queue-card" [class.queue-warn]="detail()!.notificationRetrying > 0">
            <div class="queue-icon retrying"><mat-icon>replay</mat-icon></div>
            <div class="queue-val">{{ detail()!.notificationRetrying }}</div>
            <div class="queue-lbl">Retrying</div>
          </div>
          <div class="queue-card" [class.queue-danger]="detail()!.notificationFailed > 0">
            <div class="queue-icon failed"><mat-icon>error_outline</mat-icon></div>
            <div class="queue-val">{{ detail()!.notificationFailed }}</div>
            <div class="queue-lbl">Failed</div>
          </div>
          <div class="queue-card queue-ok">
            <div class="queue-icon ok"><mat-icon>check_circle_outline</mat-icon></div>
            <div class="queue-val">
              {{ detail()!.notificationFailed === 0 && detail()!.notificationRetrying === 0 ? 'OK' : 'Warn' }}
            </div>
            <div class="queue-lbl">Queue Health</div>
          </div>
        </div>
      }

      <!-- Service health checks -->
      <h3 class="section-title">Service Health</h3>

      @if (loading()) {
        <div class="checks-grid">
          @for (i of [1,2,3,4,5]; track i) { <div class="skel-check"></div> }
        </div>
      } @else {
        <div class="checks-grid">
          <!-- API server — always shown first -->
          <div class="check-card check-healthy">
            <div class="check-icon"><mat-icon>api</mat-icon></div>
            <div class="check-body">
              <div class="check-name">API Server</div>
              <div class="check-status"><span class="status-dot healthy"></span> Healthy</div>
              <div class="check-desc">{{ environment.apiUrl }}</div>
            </div>
          </div>

          @for (entry of entries(); track entry.name) {
            <div class="check-card" [class]="'check-' + entry.status.toLowerCase()">
              <div class="check-icon">
                <mat-icon>{{ iconForCheck(entry.name) }}</mat-icon>
              </div>
              <div class="check-body">
                <div class="check-name">{{ labelForCheck(entry.name) }}</div>
                <div class="check-status">
                  <span class="status-dot" [class]="entry.status.toLowerCase()"></span>
                  {{ entry.status }}
                </div>
                @if (entry.duration) { <div class="check-dur"><mat-icon class="dur-ico">timer</mat-icon> {{ entry.duration }}</div> }
                @if (entry.description) { <div class="check-desc">{{ entry.description }}</div> }
              </div>
            </div>
          }

          <!-- Redis — shown as "Not configured" if missing -->
          @if (!hasEntry('redis')) {
            <div class="check-card check-unknown">
              <div class="check-icon"><mat-icon>memory</mat-icon></div>
              <div class="check-body">
                <div class="check-name">Redis Cache</div>
                <div class="check-status"><span class="status-dot unknown"></span> Not configured</div>
                <div class="check-desc">Cache layer disabled</div>
              </div>
            </div>
          }

          <!-- Notification queue card -->
          @if (detail()) {
            <div class="check-card" [class]="detail()!.notificationFailed > 0 ? 'check-degraded' : 'check-healthy'">
              <div class="check-icon"><mat-icon>notifications</mat-icon></div>
              <div class="check-body">
                <div class="check-name">Notification Queue</div>
                <div class="check-status">
                  <span class="status-dot" [class]="detail()!.notificationFailed > 0 ? 'degraded' : 'healthy'"></span>
                  {{ detail()!.notificationFailed > 0 ? 'Degraded' : 'Healthy' }}
                </div>
                <div class="check-desc">{{ detail()!.notificationPending }} pending · {{ detail()!.notificationFailed }} failed</div>
              </div>
            </div>
          }
        </div>
      }

      @if (error()) {
        <div class="error-note" role="alert">
          <mat-icon>warning</mat-icon>
          Could not reach API health endpoint. The server may be unreachable from this browser.
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .sub { color: #64748b; font-size: .875rem; }

    .top-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px;
      @media (max-width: 640px) { grid-template-columns: 1fr; }
    }
    .overall-card { display: flex; align-items: center; gap: 16px; padding: 24px; border-radius: 12px; }
    .overall-icon { font-size: 40px; width: 40px; height: 40px; }
    .overall-healthy { background: #ecfdf5; color: #059669; }
    .overall-degraded { background: #fffbeb; color: #d97706; }
    .overall-unhealthy { background: #fef2f2; color: #dc2626; }
    .overall-unknown { background: #f8fafc; color: #64748b; }
    .overall-label { font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; opacity: .7; }
    .overall-status { font-size: 1.4rem; font-weight: 700; margin-top: 2px; }

    .version-card { background: #fff; border-radius: 12px; padding: 18px 22px; box-shadow: 0 1px 4px rgba(0,0,0,.08); display: flex; flex-direction: column; gap: 10px; }
    .version-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .vk { font-size: .8rem; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 4px; }
    .vi { font-size: 14px; width: 14px; height: 14px; }
    .vv { font-size: .875rem; color: #1e293b; font-weight: 600; }
    .code { font-family: monospace; font-size: .8rem; }
    .small { font-size: .72rem; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .env-badge { padding: 3px 8px; border-radius: 20px; font-size: .75rem; }
    .env-staging    { background: #fffbeb; color: #d97706; }
    .env-production { background: #ecfdf5; color: #059669; }
    .env-development{ background: #eff6ff; color: #2563eb; }

    .section-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 14px; }

    /* Notification queue row */
    .queue-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px;
      @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
    }
    .queue-card {
      background: #fff; border-radius: 10px; padding: 16px; text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,.07); border: 2px solid transparent; transition: border-color .2s;
    }
    .queue-ok    { border-color: #22c55e20; }
    .queue-warn  { border-color: #f59e0b40; }
    .queue-danger{ border-color: #ef444440; }
    .queue-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;
      mat-icon { font-size: 16px; }
      &.pending  { background: #eff6ff; color: #2563eb; }
      &.retrying { background: #fffbeb; color: #d97706; }
      &.failed   { background: #fef2f2; color: #dc2626; }
      &.ok       { background: #ecfdf5; color: #059669; }
    }
    .queue-val { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .queue-lbl { font-size: .75rem; color: #94a3b8; margin-top: 2px; }

    /* Service check cards */
    .checks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .check-card { display: flex; align-items: flex-start; gap: 14px; padding: 18px; border-radius: 12px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.08); border-left: 4px solid transparent; }
    .check-healthy  { border-left-color: #059669; }
    .check-degraded { border-left-color: #d97706; }
    .check-unhealthy{ border-left-color: #dc2626; }
    .check-unknown  { border-left-color: #94a3b8; }
    .check-icon { width: 36px; height: 36px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .check-healthy  .check-icon { background: #ecfdf5; color: #059669; }
    .check-degraded .check-icon { background: #fffbeb; color: #d97706; }
    .check-unhealthy.check-icon { background: #fef2f2; color: #dc2626; }
    .check-unknown  .check-icon { background: #f1f5f9; color: #94a3b8; }
    .check-name   { font-weight: 700; color: #1e293b; font-size: .9rem; }
    .check-status { display: flex; align-items: center; gap: 6px; font-size: .8rem; color: #64748b; margin-top: 3px; }
    .status-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .status-dot.healthy   { background: #22c55e; }
    .status-dot.degraded  { background: #f59e0b; }
    .status-dot.unhealthy { background: #ef4444; }
    .status-dot.unknown   { background: #94a3b8; }
    .check-dur  { display: flex; align-items: center; gap: 3px; font-size: .72rem; color: #94a3b8; margin-top: 3px; }
    .dur-ico    { font-size: 11px; width: 11px; height: 11px; }
    .check-desc { font-size: .73rem; color: #94a3b8; margin-top: 2px; }

    .skel-check { height: 90px; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); border-radius: 12px; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    .error-note { display: flex; align-items: center; gap: 8px; padding: 16px; background: #fffbeb; border-radius: 10px; color: #92400e; font-size: .875rem; margin-top: 16px; }
  `]
})
export class AdminSystemHealthComponent implements OnInit {
  private http = inject(HttpClient);
  entries = signal<HealthEntry[]>([]);
  version = signal<VersionInfo | null>(null);
  detail  = signal<HealthDetail | null>(null);
  loading = signal(false);
  error   = signal(false);
  environment = environment;

  overallStatus = () => {
    if (this.loading()) return 'Checking...';
    if (this.error()) return 'Unreachable';
    const e = this.entries();
    if (e.some(x => x.status === 'Unhealthy')) return 'Unhealthy';
    if (e.some(x => x.status === 'Degraded')) return 'Degraded';
    return e.length > 0 ? 'Healthy' : 'Unknown';
  };
  overallClass = () => this.overallStatus().toLowerCase();
  overallIcon = () => {
    const s = this.overallStatus();
    if (s === 'Healthy') return 'check_circle';
    if (s === 'Degraded') return 'warning';
    if (s === 'Unhealthy') return 'error';
    return 'help_outline';
  };
  hasEntry = (name: string) => this.entries().some(e => e.name.includes(name));

  lastMigrationLabel = () => {
    const m = this.detail()?.lastMigration ?? '';
    const parts = m.split('_');
    return parts.length > 1 ? parts.slice(1).join(' ') : m;
  };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set(false);

    this.http.get<VersionInfo>(`${environment.apiUrl.replace('/api/v1', '')}/api/version`).subscribe({
      next: v => this.version.set(v),
      error: () => {}
    });

    this.http.get<HealthPayload>(`${environment.apiUrl.replace('/api/v1', '')}/health`).subscribe({
      next: payload => {
        const mapped: HealthEntry[] = Object.entries(payload.entries ?? {}).map(([name, data]) => ({
          name,
          status: data.status as HealthEntry['status'],
          duration: data.duration,
          description: data.description
        }));
        this.entries.set(mapped);
        this.loading.set(false);
      },
      error: () => {
        this.entries.set([]);
        this.loading.set(false);
        this.error.set(true);
      }
    });

    this.http.get<any>(`${environment.apiUrl}/system/health-detail`).subscribe({
      next: r => this.detail.set(r.data),
      error: () => {}
    });
  }

  iconForCheck(name: string): string {
    if (name.includes('postgresql') || name.includes('sql')) return 'storage';
    if (name.includes('redis') || name.includes('cache')) return 'memory';
    if (name.includes('disk') || name.includes('storage')) return 'save';
    return 'check_circle_outline';
  }

  labelForCheck(name: string): string {
    const labels: Record<string, string> = {
      postgresql: 'PostgreSQL', redis: 'Redis Cache', disk: 'Disk Storage'
    };
    return labels[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
  }
}
