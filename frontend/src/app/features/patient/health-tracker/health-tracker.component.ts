import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HealthTrackerStore, TRACKER_METRICS } from '../stores/health-tracker.store';

@Component({
  selector: 'app-health-tracker',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule],
  template: `
    <div class="tracker-page">

      <!-- Hero Strip -->
      <div class="hero">
        <div class="hero-left">
          <div class="hero-icon-wrap"><mat-icon>monitor_heart</mat-icon></div>
          <div>
            <h1 class="hero-title">Health Tracker</h1>
            <p class="hero-sub">Monitor your key health indicators over time</p>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hs-num">{{ store.results().length }}</span>
            <span class="hs-label">Total Results</span>
          </div>
          <div class="hero-stat">
            <span class="hs-num">{{ TRACKER_METRICS.length }}</span>
            <span class="hs-label">Metrics Tracked</span>
          </div>
        </div>
      </div>

      <!-- Metric selector tabs -->
      <div class="metric-tabs">
        @for (m of store.metrics; track m.id) {
          <button class="metric-tab" [class.active]="store.selectedMetricId() === m.id"
                  [style.--tab-color]="m.color" (click)="store.selectMetric(m.id)">
            <div class="tab-dot" [style.background]="m.color"></div>
            <mat-icon class="tab-icon">{{ m.icon }}</mat-icon>
            <span class="tab-name">{{ m.name }}</span>
            @if (getLatestForMetric(m.id)) {
              <span class="tab-val">{{ getLatestForMetric(m.id) }} <em>{{ m.unit }}</em></span>
            }
          </button>
        }
      </div>

      <!-- Selected metric detail -->
      <div class="metric-detail-card">
        <!-- Card header -->
        <div class="metric-header">
          <div class="metric-icon-wrap" [style.background]="store.selectedMetric().color + '18'">
            <mat-icon [style.color]="store.selectedMetric().color">{{ store.selectedMetric().icon }}</mat-icon>
          </div>
          <div class="metric-meta">
            <h3>{{ store.selectedMetric().name }}</h3>
            <span class="normal-range">
              <mat-icon style="font-size:13px;width:13px;height:13px;vertical-align:middle;color:#94a3b8">info</mat-icon>
              Normal: {{ store.selectedMetric().normalRange }} {{ store.selectedMetric().unit }}
            </span>
          </div>
          @if (store.latestResult()) {
            <div class="latest-value">
              <span class="val" [style.color]="store.selectedMetric().color">{{ store.latestResult()!.value }}</span>
              <span class="unit">{{ store.selectedMetric().unit }}</span>
              <span class="val-label">Latest</span>
            </div>
          } @else if (!store.isLoading()) {
            <div class="no-data-badge">No data yet</div>
          }
        </div>

        <!-- Accent bar -->
        <div class="metric-accent-bar" [style.background]="store.selectedMetric().color"></div>

        <!-- Chart -->
        <div class="chart-area">
          @if (store.isLoading()) {
            <div class="chart-skel"></div>
          } @else if (store.chartPoints().length >= 2) {
            <svg class="trend-chart" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient [id]="'grad-' + store.selectedMetricId()" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" [style.stop-color]="store.selectedMetric().color" stop-opacity="0.3" />
                  <stop offset="100%" [style.stop-color]="store.selectedMetric().color" stop-opacity="0.02" />
                </linearGradient>
              </defs>
              <path
                [attr.d]="areaPath()"
                [attr.fill]="'url(#grad-' + store.selectedMetricId() + ')'"
              />
              <polyline
                [attr.points]="linePoints()"
                [style.stroke]="store.selectedMetric().color"
                stroke-width="2.5" fill="none" stroke-linejoin="round" stroke-linecap="round"
              />
              @for (pt of store.chartPoints(); track pt.x) {
                <circle
                  [attr.cx]="pt.x * 3"
                  [attr.cy]="pt.y * 0.8"
                  r="3.5"
                  [style.fill]="store.selectedMetric().color"
                  stroke="white" stroke-width="1.5"
                />
              }
            </svg>
          } @else if (store.resultsForSelected().length === 1) {
            <div class="single-point">
              <div class="single-value" [style.color]="store.selectedMetric().color">
                {{ store.resultsForSelected()[0].value }} {{ store.selectedMetric().unit }}
              </div>
              <p class="single-date">{{ store.resultsForSelected()[0].performedAt | date:'mediumDate' }}</p>
              <p class="chart-hint">Add more tests to see your trend</p>
            </div>
          } @else {
            <div class="empty-chart">
              <div class="empty-icon-wrap"><mat-icon>show_chart</mat-icon></div>
              <p class="empty-title">No {{ store.selectedMetric().name }} results yet</p>
              <p class="empty-sub">Book a test to start tracking your {{ store.selectedMetric().name }}</p>
            </div>
          }
        </div>

        <!-- History list -->
        @if (store.resultsForSelected().length > 0) {
          <div class="history-list">
            <p class="history-title">Result History</p>
            @for (r of store.resultsForSelected().slice().reverse(); track r.id) {
              <div class="history-row">
                <div class="h-date-wrap">
                  <mat-icon class="h-cal-icon">calendar_today</mat-icon>
                  <span class="h-date">{{ r.performedAt | date:'d MMM yyyy' }}</span>
                </div>
                <span class="h-value" [style.color]="store.selectedMetric().color">
                  {{ r.value }}<em> {{ store.selectedMetric().unit }}</em>
                </span>
                <span class="h-interp" [class]="'interp-' + (r.interpretation ?? 'normal')">
                  {{ r.interpretation ?? 'Normal' | titlecase }}
                </span>
              </div>
            }
          </div>
        }
      </div>

      <!-- Overview grid -->
      <p class="section-title">All Metrics Overview</p>
      <div class="metrics-grid">
        @for (m of store.metrics; track m.id) {
          <div class="mini-metric" [class.active-metric]="store.selectedMetricId() === m.id"
               [style.--m-color]="m.color" (click)="store.selectMetric(m.id)">
            <div class="mm-icon" [style.background]="m.color + '18'">
              <mat-icon [style.color]="m.color">{{ m.icon }}</mat-icon>
            </div>
            <div class="mm-info">
              <p class="mm-name">{{ m.name }}</p>
              @if (getLatestForMetric(m.id)) {
                <p class="mm-val" [style.color]="m.color">
                  {{ getLatestForMetric(m.id) }}<span class="mm-unit"> {{ m.unit }}</span>
                </p>
              } @else {
                <p class="mm-empty">No data</p>
              }
            </div>
            <mat-icon class="mm-arrow">chevron_right</mat-icon>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .tracker-page { max-width: 860px; }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, #1e9df1 0%, #1474c4 55%, #1565c0 100%);
      border-radius: 16px; padding: 24px 32px; margin-bottom: 24px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .hero-left { display: flex; align-items: center; gap: 16px; }
    .hero-icon-wrap {
      width: 48px; height: 48px; border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: white; font-size: 24px; width: 24px; height: 24px; }
    }
    .hero-title { margin: 0 0 4px; font-size: 1.4rem; font-weight: 700; color: white; }
    .hero-sub { margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.8); }
    .hero-stats { display: flex; gap: 24px; }
    .hero-stat { text-align: center; }
    .hs-num { display: block; font-size: 1.6rem; font-weight: 800; color: white; line-height: 1; }
    .hs-label { font-size: 0.72rem; color: rgba(255,255,255,0.75); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
    @media (max-width: 580px) {
      .hero { flex-direction: column; align-items: flex-start; }
      .hero-stats { align-self: stretch; justify-content: center; }
    }

    /* Metric tabs */
    .metric-tabs {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;
    }
    .metric-tab {
      display: flex; align-items: center; gap: 7px; padding: 8px 14px;
      border: 1.5px solid #e2e8f0; border-radius: 999px;
      background: white; cursor: pointer; font-size: 0.82rem; font-weight: 500;
      color: #72767a; transition: all 0.2s; position: relative;
      &:hover { border-color: var(--tab-color); color: var(--tab-color); }
      &.active {
        border-color: var(--tab-color); background: var(--tab-color);
        color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      &.active .tab-val { background: rgba(255,255,255,0.25); color: white; }
    }
    .tab-dot { display: none; }
    .tab-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }
    .tab-name { font-weight: 600; }
    .tab-val {
      font-size: 0.72rem; font-weight: 700; background: rgba(0,0,0,0.06);
      padding: 1px 7px; border-radius: 999px; margin-left: 2px;
      em { font-style: normal; font-weight: 400; opacity: 0.8; }
    }

    /* Detail card */
    .metric-detail-card {
      background: white; border-radius: 16px; padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
      margin-bottom: 28px; overflow: hidden; position: relative;
    }
    .metric-accent-bar {
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
    }
    .metric-header {
      display: flex; align-items: center; gap: 16px; margin-bottom: 20px; margin-top: 4px;
    }
    .metric-icon-wrap {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 26px !important; width: 26px !important; height: 26px !important; }
    }
    .metric-meta { flex: 1; h3 { margin: 0 0 5px; font-size: 1.1rem; font-weight: 700; } }
    .normal-range { font-size: 0.75rem; color: #72767a; display: flex; align-items: center; gap: 4px; }
    .latest-value {
      text-align: right;
      .val { font-size: 2.2rem; font-weight: 800; line-height: 1; display: block; }
      .unit { font-size: 0.82rem; color: #72767a; }
      .val-label { display: block; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-top: 2px; }
    }
    .no-data-badge {
      padding: 6px 14px; border-radius: 999px; background: #f1f5f9;
      color: #72767a; font-size: 0.78rem; font-weight: 500; white-space: nowrap;
    }

    /* Chart */
    .chart-area { height: 110px; margin-bottom: 0; }
    .chart-skel {
      width: 100%; height: 100%; border-radius: 12px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%; animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .trend-chart { width: 100%; height: 100%; display: block; }

    .single-point {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; gap: 4px;
      .single-value { font-size: 2rem; font-weight: 800; }
      .single-date { font-size: 0.8rem; color: #72767a; margin: 0; }
      .chart-hint { font-size: 0.75rem; color: #94a3b8; margin: 0; }
    }
    .empty-chart {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; gap: 8px;
    }
    .empty-icon-wrap {
      width: 44px; height: 44px; border-radius: 50%; background: #f1f5f9;
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: #94a3b8; font-size: 22px; width: 22px; height: 22px; }
    }
    .empty-title { margin: 0; font-size: 0.9rem; font-weight: 700; color: #0f1419; }
    .empty-sub { margin: 0; font-size: 0.78rem; color: #94a3b8; }

    /* History */
    .history-list {
      border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 20px;
    }
    .history-title {
      margin: 0 0 12px; font-size: 0.72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em; color: #72767a;
    }
    .history-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid #f8fafc; font-size: 0.85rem;
      &:last-child { border-bottom: none; }
    }
    .h-date-wrap { flex: 1; display: flex; align-items: center; gap: 6px; color: #72767a; }
    .h-cal-icon { font-size: 13px !important; width: 13px !important; height: 13px !important; color: #94a3b8; }
    .h-date { font-size: 0.82rem; }
    .h-value { font-weight: 700; font-size: 0.9rem; em { font-style: normal; font-size: 0.72rem; font-weight: 400; opacity: 0.75; } }
    .h-interp {
      padding: 3px 11px; border-radius: 999px; font-size: 0.7rem; font-weight: 700;
      &.interp-normal, &.interp-Normal { background: #dcfce7; color: #166534; }
      &.interp-high, &.interp-High { background: #fee2e2; color: #991b1b; }
      &.interp-low, &.interp-Low { background: #fef3c7; color: #92400e; }
      &.interp-critical, &.interp-Critical { background: #fee2e2; color: #7f1d1d; }
    }

    /* Overview grid */
    .section-title {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #72767a; margin: 0 0 14px;
    }
    .metrics-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }
    .mini-metric {
      background: white; border-radius: 14px; padding: 14px 16px;
      border: 1.5px solid #e2e8f0;
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; transition: all 0.2s;
      &:hover {
        border-color: var(--m-color);
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
        transform: translateY(-1px);
      }
      &.active-metric { border-color: var(--m-color); background: #f8fafc; }
    }
    .mm-icon {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 20px !important; width: 20px !important; height: 20px !important; }
    }
    .mm-info { flex: 1; min-width: 0; }
    .mm-name { margin: 0 0 2px; font-size: 0.75rem; color: #72767a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mm-val { margin: 0; font-size: 0.95rem; font-weight: 800; }
    .mm-unit { font-size: 0.68rem; font-weight: 400; color: #72767a; }
    .mm-empty { margin: 0; font-size: 0.78rem; color: #94a3b8; font-style: italic; }
    .mm-arrow { color: #e2e8f0; font-size: 18px !important; width: 18px !important; height: 18px !important; flex-shrink: 0; }
    .mini-metric:hover .mm-arrow { color: var(--m-color); }
  `]
})
export class HealthTrackerComponent implements OnInit {
  store = inject(HealthTrackerStore);
  readonly TRACKER_METRICS = TRACKER_METRICS;

  ngOnInit(): void {
    this.store.loadResults();
  }

  linePoints(): string {
    return this.store.chartPoints()
      .map(p => `${p.x * 3},${p.y * 0.8}`)
      .join(' ');
  }

  areaPath(): string {
    const pts = this.store.chartPoints();
    if (pts.length === 0) return '';
    const line = pts.map(p => `${p.x * 3},${p.y * 0.8}`).join(' L ');
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `M ${first.x * 3},80 L ${line} L ${last.x * 3},80 Z`;
  }

  getLatestForMetric(metricId: string): string | null {
    const metric = TRACKER_METRICS.find(m => m.id === metricId);
    if (!metric) return null;
    const results = this.store.results()
      .filter(r => {
        const code = (r.testCode ?? '').toUpperCase();
        const name = (r.testName ?? '').toLowerCase();
        return metric.codes.some(c => code === c) || name.includes(metric.name.toLowerCase());
      })
      .sort((a, b) => new Date(a.performedAt ?? '').getTime() - new Date(b.performedAt ?? '').getTime());
    return results.length > 0 ? (results[results.length - 1].value ?? null) : null;
  }
}
