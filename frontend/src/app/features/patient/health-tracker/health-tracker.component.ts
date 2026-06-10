import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';
import { HealthTrackerStore, TRACKER_METRICS } from '../stores/health-tracker.store';

@Component({
  selector: 'app-health-tracker',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule, AppPageHeaderComponent],
  template: `
    <div class="tracker-page">
      <app-page-header title="Health Tracker" subtitle="Monitor your key health indicators over time" />

      <!-- Metric selector tabs -->
      <div class="metric-tabs">
        @for (m of store.metrics; track m.id) {
          <button class="metric-tab" [class.active]="store.selectedMetricId() === m.id"
                  [style.--tab-color]="m.color" (click)="store.selectMetric(m.id)">
            <span class="tab-icon">{{ m.icon }}</span>
            <span class="tab-name">{{ m.name }}</span>
          </button>
        }
      </div>

      <!-- Selected metric detail -->
      <div class="metric-detail-card" [style.border-left-color]="store.selectedMetric().color">
        <div class="metric-header">
          <div class="metric-icon-wrap" [style.background]="store.selectedMetric().color + '20'">
            {{ store.selectedMetric().icon }}
          </div>
          <div class="metric-meta">
            <h3>{{ store.selectedMetric().name }}</h3>
            <span class="normal-range">Normal: {{ store.selectedMetric().normalRange }} {{ store.selectedMetric().unit }}</span>
          </div>
          @if (store.latestResult()) {
            <div class="latest-value">
              <span class="val" [style.color]="store.selectedMetric().color">{{ store.latestResult()!.value }}</span>
              <span class="unit">{{ store.selectedMetric().unit }}</span>
            </div>
          } @else if (!store.isLoading()) {
            <div class="no-data-badge">No data</div>
          }
        </div>

        <!-- Chart -->
        <div class="chart-area">
          @if (store.isLoading()) {
            <div class="chart-loading">
              <div class="skel skel-chart"></div>
            </div>
          } @else if (store.chartPoints().length >= 2) {
            <svg class="trend-chart" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient [id]="'grad-' + store.selectedMetricId()" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" [style.stop-color]="store.selectedMetric().color" stop-opacity="0.25" />
                  <stop offset="100%" [style.stop-color]="store.selectedMetric().color" stop-opacity="0" />
                </linearGradient>
              </defs>
              <!-- Area fill -->
              <path
                [attr.d]="areaPath()"
                [attr.fill]="'url(#grad-' + store.selectedMetricId() + ')'"
              />
              <!-- Line -->
              <polyline
                [attr.points]="linePoints()"
                [style.stroke]="store.selectedMetric().color"
                stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"
              />
              <!-- Data point dots -->
              @for (pt of store.chartPoints(); track pt.x) {
                <circle
                  [attr.cx]="pt.x * 3"
                  [attr.cy]="pt.y * 0.8"
                  r="3"
                  [style.fill]="store.selectedMetric().color"
                />
              }
            </svg>
          } @else if (store.resultsForSelected().length === 1) {
            <div class="single-point">
              <div class="single-value" [style.color]="store.selectedMetric().color">
                {{ store.resultsForSelected()[0].value }} {{ store.selectedMetric().unit }}
              </div>
              <p class="single-date">{{ store.resultsForSelected()[0].performedAt | date:'mediumDate' }}</p>
              <p class="chart-hint">Add more tests to see trends</p>
            </div>
          } @else {
            <div class="empty-chart">
              <mat-icon>show_chart</mat-icon>
              <p>No {{ store.selectedMetric().name }} results found</p>
              <p class="sub">Book a test to start tracking</p>
            </div>
          }
        </div>

        <!-- History list -->
        @if (store.resultsForSelected().length > 0) {
          <div class="history-list">
            <h5>History</h5>
            @for (r of store.resultsForSelected().slice().reverse(); track r.id) {
              <div class="history-row">
                <span class="h-date">{{ r.performedAt | date:'mediumDate' }}</span>
                <span class="h-value" [style.color]="store.selectedMetric().color">{{ r.value }} {{ store.selectedMetric().unit }}</span>
                <span class="h-interp" [class]="'interp-' + (r.interpretation ?? 'normal')">{{ r.interpretation ?? 'Normal' | titlecase }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- All metrics overview grid -->
      <h4 class="section-title">All Metrics Overview</h4>
      <div class="metrics-grid">
        @for (m of store.metrics; track m.id) {
          <div class="mini-metric" [style.border-left-color]="m.color" (click)="store.selectMetric(m.id)">
            <div class="mm-icon" [style.background]="m.color + '15'">{{ m.icon }}</div>
            <div class="mm-info">
              <p class="mm-name">{{ m.name }}</p>
              <p class="mm-val" [style.color]="m.color">
                {{ getLatestForMetric(m.id) || '—' }}
                <span class="mm-unit">{{ m.unit }}</span>
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .metric-tabs {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;
    }
    .metric-tab {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px;
      border: 1.5px solid $border-color; border-radius: 999px;
      background: white; cursor: pointer; font-size: 0.85rem; font-weight: 500;
      color: $text-secondary; transition: all 0.2s;
      &:hover { border-color: var(--tab-color); color: var(--tab-color); }
      &.active { border-color: var(--tab-color); background: var(--tab-color); color: white; }
      .tab-icon { font-size: 1rem; }
    }

    .metric-detail-card {
      background: white; border-radius: $border-radius-lg; padding: 24px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      border-left: 4px solid; margin-bottom: 32px;
    }
    .metric-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .metric-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; flex-shrink: 0; }
    .metric-meta { flex: 1; h3 { margin: 0 0 4px; } }
    .normal-range { font-size: 0.75rem; color: $text-secondary; }
    .latest-value { text-align: right; .val { font-size: 2rem; font-weight: 700; } .unit { font-size: 0.85rem; color: $text-secondary; margin-left: 2px; } }
    .no-data-badge { padding: 4px 12px; border-radius: 999px; background: $gray-100; color: $text-secondary; font-size: 0.8rem; }

    .chart-area { height: 100px; margin-bottom: 20px; }
    .chart-loading .skel-chart { width: 100%; height: 100%; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .trend-chart { width: 100%; height: 100%; display: block; }

    .single-point { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 4px;
      .single-value { font-size: 1.75rem; font-weight: 700; }
      .single-date { font-size: 0.8rem; color: $text-secondary; margin: 0; }
      .chart-hint { font-size: 0.75rem; color: $gray-400; margin: 0; }
    }
    .empty-chart { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: $text-secondary;
      mat-icon { font-size: 32px; color: $gray-300; }
      p { margin: 4px 0 0; font-size: 0.875rem; }
      .sub { font-size: 0.75rem; color: $gray-400; margin-top: 2px; }
    }

    .history-list { border-top: 1px solid $border-color; padding-top: 16px;
      h5 { margin: 0 0 12px; font-size: 0.85rem; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.05em; }
    }
    .history-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid $gray-50; font-size: 0.85rem;
      &:last-child { border-bottom: none; }
    }
    .h-date { flex: 1; color: $text-secondary; }
    .h-value { font-weight: 700; }
    .h-interp { padding: 2px 10px; border-radius: 999px; font-size: 0.75rem;
      &.interp-normal, &.interp-Normal { background: #dcfce7; color: #166534; }
      &.interp-high, &.interp-High { background: #fee2e2; color: #991b1b; }
      &.interp-low, &.interp-Low { background: #fef3c7; color: #92400e; }
      &.interp-critical, &.interp-Critical { background: #fee2e2; color: #7f1d1d; }
    }

    .section-title { font-size: 1rem; font-weight: 600; margin-bottom: 16px; color: $text-secondary; }
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }
    .mini-metric {
      background: white; border-radius: $border-radius; padding: 14px;
      box-shadow: $shadow-sm; border: 1px solid $border-color; border-left: 3px solid;
      display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;
      &:hover { box-shadow: $shadow-md; transform: translateY(-1px); }
    }
    .mm-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
    .mm-info { flex: 1; min-width: 0; }
    .mm-name { margin: 0 0 2px; font-size: 0.8rem; color: $text-secondary; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mm-val { margin: 0; font-size: 0.95rem; font-weight: 700; }
    .mm-unit { font-size: 0.7rem; font-weight: 400; color: $text-secondary; margin-left: 2px; }
  `]
})
export class HealthTrackerComponent implements OnInit {
  store = inject(HealthTrackerStore);

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
