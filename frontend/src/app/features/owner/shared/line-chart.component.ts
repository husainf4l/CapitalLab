import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LinePoint { label: string; value: number; }

@Component({
  selector: 'owner-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <h4 class="chart-title">{{ title() }}</h4>
          @if (points().length > 0) {
            <p class="chart-sub">{{ points().length }} data points · Last value: {{ lastVal() | number:'1.0-0' }}</p>
          }
        </div>
        <div class="chart-legend">
          <span class="legend-dot" [style.background]="color()"></span>
          <span class="legend-txt">Revenue</span>
        </div>
      </div>

      @if (points().length < 2) {
        <div class="no-data">
          <span class="no-data-icon">📊</span>
          <span>Waiting for data…</span>
        </div>
      } @else {
        <div class="chart-body">
          <div class="y-axis">
            @for (lbl of yLabels(); track $index) {
              <span>{{ lbl }}</span>
            }
          </div>
          <div class="svg-wrap">
            <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" preserveAspectRatio="none" class="chart-svg"
                 [style.--chart-color]="color()">
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style="stop-color:var(--chart-color);stop-opacity:0.25"/>
                  <stop offset="100%" style="stop-color:var(--chart-color);stop-opacity:0"/>
                </linearGradient>
              </defs>
              <!-- grid lines -->
              @for (gl of gridLines(); track $index) {
                <line [attr.x1]="PAD" [attr.x2]="W - PAD" [attr.y1]="gl" [attr.y2]="gl"
                      stroke="var(--border)" stroke-width="1" stroke-dasharray="4,4"/>
              }
              <!-- area fill -->
              <path [attr.d]="areaPath()" fill="url(#area-grad)"/>
              <!-- line -->
              <path [attr.d]="linePath()" fill="none" stroke="var(--chart-color)"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- data points -->
              @for (p of coords(); track $index) {
                <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3.5"
                        fill="var(--background)" stroke="var(--chart-color)" stroke-width="2"/>
              }
            </svg>
          </div>
        </div>
        <div class="x-axis">
          @for (lbl of xLabels(); track $index) { <span>{{ lbl }}</span> }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .chart-card {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: $border-radius-xl;
      padding: $spacing-xl;
      box-shadow: $shadow-md;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .chart-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: $spacing-lg;
      gap: $spacing-md;
    }

    .chart-title {
      margin: 0 0 4px;
      font-size: $font-size-md;
      font-weight: $font-weight-semibold;
      color: var(--foreground);
    }

    .chart-sub {
      margin: 0;
      font-size: $font-size-xs;
      color: var(--muted-foreground);
    }

    .chart-legend {
      display: flex; align-items: center; gap: 6px; flex-shrink: 0;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: $border-radius-full;
      padding: 5px 12px;
    }

    .legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .legend-txt { font-size: $font-size-xs; font-weight: $font-weight-medium; color: var(--foreground); }

    .no-data {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: $spacing-sm; color: var(--muted-foreground); font-size: $font-size-sm; padding: $spacing-2xl;
      .no-data-icon { font-size: 2rem; }
    }

    .chart-body {
      display: flex; align-items: stretch; gap: 8px; flex: 1;
    }

    .y-axis {
      display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;
      padding-bottom: 4px;
      span { font-size: 0.65rem; color: var(--muted-foreground); white-space: nowrap; }
    }

    .svg-wrap { flex: 1; }
    .chart-svg { width: 100%; height: 160px; display: block; overflow: visible; }

    .x-axis {
      display: flex; justify-content: space-between;
      padding-left: 48px;
      margin-top: 8px;
      span { font-size: 0.65rem; color: var(--muted-foreground); }
    }
  `]
})
export class OwnerLineChartComponent {
  title = input.required<string>();
  points = input<LinePoint[]>([]);
  color = input<string>('var(--chart-1)');

  readonly W = 500; readonly H = 140; readonly PAD = 8;

  private min = computed(() => Math.min(...this.points().map(p => p.value)));
  private max = computed(() => Math.max(...this.points().map(p => p.value)));
  private range = computed(() => (this.max() - this.min()) || 1);

  lastVal = computed(() => this.points().at(-1)?.value ?? 0);

  coords = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return [];
    return pts.map((p, i) => ({
      x: this.PAD + (i / (pts.length - 1)) * (this.W - 2 * this.PAD),
      y: this.H - this.PAD - ((p.value - this.min()) / this.range()) * (this.H - 2 * this.PAD),
    }));
  });

  gridLines = computed(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) =>
      this.PAD + (i / count) * (this.H - 2 * this.PAD));
  });

  yLabels = computed(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => {
      const v = this.min() + ((count - i) / count) * this.range();
      return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : Math.round(v).toString();
    });
  });

  xLabels = computed(() => {
    const pts = this.points();
    if (pts.length <= 7) return pts.map(p => p.label);
    const step = Math.floor(pts.length / 6);
    return [0, step, step * 2, step * 3, step * 4, pts.length - 1]
      .map(i => pts[i]?.label ?? '');
  });

  linePath(): string {
    const c = this.coords();
    if (c.length < 2) return '';
    let d = `M ${c[0].x},${c[0].y}`;
    for (let i = 1; i < c.length; i++) {
      const p0 = c[Math.max(0, i - 2)];
      const p1 = c[i - 1];
      const p2 = c[i];
      const p3 = c[Math.min(c.length - 1, i + 1)];
      const tension = 0.4;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  areaPath(): string {
    const c = this.coords();
    if (!c.length) return '';
    return `${this.linePath()} L${c[c.length - 1].x},${this.H} L${c[0].x},${this.H}Z`;
  }
}
