import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LinePoint { label: string; value: number; }

@Component({
  selector: 'owner-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart">
      <div class="chart-title">{{ title() }}</div>
      @if (points().length < 2) {
        <div class="no-data">Not enough data</div>
      } @else {
        <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" class="svg" preserveAspectRatio="none">
          <path [attr.d]="areaPath()" [attr.fill]="color() + '22'" />
          <polyline [attr.points]="linePoints()" fill="none" [attr.stroke]="color()" stroke-width="2" stroke-linejoin="round" />
          @for (p of coords(); track $index) { <circle [attr.cx]="p.x" [attr.cy]="p.y" r="2.5" fill="white" [attr.stroke]="color()" stroke-width="2" /> }
        </svg>
        <div class="x-axis">@for (l of xLabels(); track $index) { <span>{{ l }}</span> }</div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .chart { background: white; border: 1px solid $border-color; border-radius: $border-radius-lg; padding: 20px; }
    .chart-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 16px; }
    .no-data { padding: 30px; text-align: center; color: $text-secondary; font-size: 0.85rem; }
    .svg { width: 100%; height: 140px; display: block; overflow: visible; }
    .x-axis { display: flex; justify-content: space-between; margin-top: 6px; span { font-size: 0.65rem; color: $text-secondary; } }
  `]
})
export class OwnerLineChartComponent {
  title = input.required<string>();
  points = input<LinePoint[]>([]);
  color = input<string>('#4f46e5');

  readonly W = 500; readonly H = 130; readonly PAD = 6;
  private min = computed(() => Math.min(...this.points().map(p => p.value)));
  private max = computed(() => Math.max(...this.points().map(p => p.value)));
  private range = computed(() => (this.max() - this.min()) || 1);

  coords = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return [];
    return pts.map((p, i) => ({
      x: this.PAD + (i / (pts.length - 1)) * (this.W - 2 * this.PAD),
      y: this.H - this.PAD - ((p.value - this.min()) / this.range()) * (this.H - 2 * this.PAD),
    }));
  });

  xLabels = computed(() => {
    const pts = this.points();
    if (pts.length <= 6) return pts.map(p => p.label);
    const step = Math.floor(pts.length / 5);
    return [0, step, step * 2, step * 3, pts.length - 1].map(i => pts[i]?.label ?? '');
  });

  linePoints(): string { return this.coords().map(p => `${p.x},${p.y}`).join(' '); }
  areaPath(): string {
    const c = this.coords(); if (!c.length) return '';
    return `M${c[0].x},${this.H} ${c.map(p => `L${p.x},${p.y}`).join(' ')} L${c[c.length - 1].x},${this.H}Z`;
  }
}
