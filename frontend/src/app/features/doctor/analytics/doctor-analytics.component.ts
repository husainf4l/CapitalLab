import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DoctorAnalyticsStore } from '../stores/doctor-analytics.store';
import { TrendChartComponent, TrendPoint } from '../shared/trend-chart.component';

@Component({
  selector: 'app-doctor-analytics',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TrendChartComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Analytics</h2>
          <p class="sub">Your review activity and performance</p>
        </div>
        <div class="range-toggle">
          @for (r of ranges; track r.value) {
            <button class="range-btn" [class.active]="store.range() === r.value" (click)="store.setRange(r.value)">
              {{ r.label }}
            </button>
          }
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        @for (card of kpiCards(); track card.label) {
          <div class="kpi-card" [style.border-top-color]="card.color">
            <div class="kpi-icon" [style.background]="card.color + '18'">
              <mat-icon [style.color]="card.color">{{ card.icon }}</mat-icon>
            </div>
            <div class="kpi-body">
              <p class="kpi-label">{{ card.label }}</p>
              @if (store.isLoading()) {
                <div class="kpi-skel"></div>
              } @else {
                <div class="kpi-value">{{ card.value }}</div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <trend-chart title="Review Activity" [points]="reviewPoints()" unit="reviews" />
        <trend-chart title="Critical Alerts" [points]="criticalPoints()" unit="alerts" />
      </div>

      <!-- Top tests + reports released -->
      <div class="bottom-grid">
        <div class="panel">
          <h4>Most Common Tests</h4>
          @if (store.data().topTests.length === 0) {
            <div class="mini-empty">No data</div>
          } @else {
            <div class="test-list">
              @for (test of store.data().topTests; track test.name) {
                <div class="test-row">
                  <span class="test-name">{{ test.name }}</span>
                  <div class="test-bar-wrap">
                    <div class="test-bar" [style.width.%]="barWidth(test.count)"></div>
                  </div>
                  <span class="test-count">{{ test.count }}</span>
                </div>
              }
            </div>
          }
        </div>

        <div class="panel reports-panel">
          <h4>Reports Released</h4>
          <div class="big-stat">
            <mat-icon>description</mat-icon>
            <div class="big-num">{{ store.data().reportsReleased }}</div>
            <div class="big-label">in selected period</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    $accent: #4f46e5;

    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
      h2 { margin: 0 0 4px; } .sub { margin: 0; font-size: 0.875rem; color: $text-secondary; }
    }
    .range-toggle { display: flex; gap: 2px; background: white; border: 1px solid $border-color; border-radius: 999px; padding: 3px; }
    .range-btn { border: none; background: none; padding: 6px 16px; border-radius: 999px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: $text-secondary; transition: all 0.15s;
      &.active { background: $accent; color: white; }
    }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px;
      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }
    .kpi-card { background: white; border: 1px solid $border-color; border-top: 3px solid; border-radius: $border-radius; padding: 18px; box-shadow: $shadow-sm; display: flex; align-items: flex-start; gap: 12px; }
    .kpi-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 20px; } }
    .kpi-body { flex: 1; }
    .kpi-label { margin: 0 0 4px; font-size: 0.78rem; color: $text-secondary; }
    .kpi-value { font-size: 1.7rem; font-weight: 700; line-height: 1; }
    .kpi-skel { height: 28px; width: 56px; border-radius: 6px; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;
      @media (max-width: 800px) { grid-template-columns: 1fr; }
    }

    .bottom-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px;
      @media (max-width: 800px) { grid-template-columns: 1fr; }
    }
    .panel { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 20px;
      h4 { margin: 0 0 16px; font-size: 0.9rem; }
    }
    .mini-empty { padding: 24px; text-align: center; color: $text-secondary; font-size: 0.85rem; }
    .test-list { display: flex; flex-direction: column; gap: 10px; }
    .test-row { display: flex; align-items: center; gap: 12px; }
    .test-name { width: 130px; font-size: 0.82rem; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .test-bar-wrap { flex: 1; height: 8px; background: $gray-100; border-radius: 999px; overflow: hidden; }
    .test-bar { height: 100%; background: $accent; border-radius: 999px; }
    .test-count { width: 30px; text-align: right; font-size: 0.82rem; font-weight: 700; color: $text-secondary; }

    .reports-panel { display: flex; flex-direction: column; }
    .big-stat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4px;
      mat-icon { font-size: 36px; color: $accent; }
      .big-num { font-size: 2.4rem; font-weight: 700; }
      .big-label { font-size: 0.8rem; color: $text-secondary; }
    }
  `]
})
export class DoctorAnalyticsComponent implements OnInit {
  store = inject(DoctorAnalyticsStore);

  ranges: { value: '7d' | '30d' | '90d'; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  ngOnInit(): void { this.store.load(); }

  kpiCards() {
    const d = this.store.data();
    return [
      { label: 'Patients Reviewed', icon: 'how_to_reg',    color: '#4f46e5', value: d.patientsReviewed },
      { label: 'Critical Cases',    icon: 'priority_high', color: '#ef4444', value: d.criticalCases },
      { label: 'Avg Review (min)',  icon: 'timer',         color: '#8b5cf6', value: d.avgReviewTime },
      { label: 'Reports Released',  icon: 'description',   color: '#22c55e', value: d.reportsReleased },
    ];
  }

  reviewPoints(): TrendPoint[] {
    return this.store.data().reviewsByDay.map(d => ({
      label: this.shortDate(d.date), value: d.count, date: d.date,
    }));
  }

  criticalPoints(): TrendPoint[] {
    return this.store.data().criticalByDay.map(d => ({
      label: this.shortDate(d.date), value: d.count, date: d.date,
    }));
  }

  barWidth(count: number): number {
    const max = Math.max(...this.store.data().topTests.map(t => t.count), 1);
    return (count / max) * 100;
  }

  private shortDate(date: string): string {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
}
