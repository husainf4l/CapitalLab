import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TrendPoint { label: string; value: number; date?: string; }

@Component({
  selector: 'trend-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrap">
      <div class="chart-header">
        <span class="chart-title">{{ title() }}</span>
        @if (unit()) { <span class="chart-unit">{{ unit() }}</span> }
        @if (latestValue() !== null) {
          <span class="chart-latest" [class.critical]="isCritical()">{{ latestValue() }} {{ unit() }}</span>
        }
      </div>

      @if (points().length < 2) {
        <div class="no-data">Not enough data</div>
      } @else {
        <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" class="chart-svg" preserveAspectRatio="none">
          <!-- Reference range band -->
          @if (refMin() !== null && refMax() !== null) {
            <rect [attr.x]="0" [attr.y]="toY(refMax()!)" [attr.width]="W" [attr.height]="toY(refMin()!) - toY(refMax()!)"
              fill="rgba(34,197,94,0.08)" />
          }

          <!-- Area fill -->
          <path [attr.d]="areaPath()" fill="rgba(99,102,241,0.12)" />

          <!-- Line -->
          <polyline [attr.points]="linePoints()" fill="none" stroke="#6366f1" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

          <!-- Data points -->
          @for (pt of chartPoints(); track $index) {
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3" fill="white" stroke="#6366f1" stroke-width="2" />
          }
        </svg>

        <!-- X axis labels -->
        <div class="x-labels">
          @for (pt of xLabels(); track $index) {
            <span>{{ pt }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .chart-wrap { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 16px; }
    .chart-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .chart-title { font-weight: 600; font-size: 0.875rem; flex: 1; }
    .chart-unit { font-size: 0.75rem; color: $text-secondary; }
    .chart-latest { padding: 2px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 700; background: #e0e7ff; color: #4f46e5;
      &.critical { background: #fee2e2; color: $danger; }
    }
    .no-data { display: flex; align-items: center; justify-content: center; height: 80px; color: $text-secondary; font-size: 0.85rem; }
    .chart-svg { width: 100%; height: 110px; display: block; overflow: visible; }
    .x-labels { display: flex; justify-content: space-between; margin-top: 4px;
      span { font-size: 0.65rem; color: $text-secondary; }
    }
  `]
})
export class TrendChartComponent {
  title = input.required<string>();
  points = input<TrendPoint[]>([]);
  unit = input<string>('');
  refMin = input<number | null>(null);
  refMax = input<number | null>(null);

  readonly W = 400;
  readonly H = 100;
  readonly PAD = 8;

  private minVal = computed(() => Math.min(...this.points().map(p => p.value)));
  private maxVal = computed(() => Math.max(...this.points().map(p => p.value)));
  private range = computed(() => (this.maxVal() - this.minVal()) || 1);

  readonly latestValue = computed(() => this.points().length ? this.points()[this.points().length - 1].value : null);
  readonly isCritical = computed(() => {
    const v = this.latestValue();
    if (v === null) return false;
    const mn = this.refMin(), mx = this.refMax();
    return (mn !== null && v < mn) || (mx !== null && v > mx);
  });

  readonly chartPoints = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return [];
    return pts.map((p, i) => ({
      x: this.PAD + (i / (pts.length - 1)) * (this.W - 2 * this.PAD),
      y: this.toY(p.value),
    }));
  });

  readonly xLabels = computed(() => {
    const pts = this.points();
    if (!pts.length) return [];
    if (pts.length <= 5) return pts.map(p => p.label);
    const step = Math.floor(pts.length / 4);
    return [pts[0], pts[step], pts[step * 2], pts[step * 3], pts[pts.length - 1]].map(p => p.label);
  });

  toY(value: number): number {
    return this.H - this.PAD - ((value - this.minVal()) / this.range()) * (this.H - 2 * this.PAD);
  }

  linePoints(): string {
    return this.chartPoints().map(p => `${p.x},${p.y}`).join(' ');
  }

  areaPath(): string {
    const pts = this.chartPoints();
    if (!pts.length) return '';
    const start = `M${pts[0].x},${this.H}`;
    const line = pts.map(p => `L${p.x},${p.y}`).join(' ');
    const end = `L${pts[pts.length - 1].x},${this.H}Z`;
    return `${start} ${line} ${end}`;
  }
}
