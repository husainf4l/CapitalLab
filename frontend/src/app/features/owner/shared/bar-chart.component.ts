import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BarDatum { label: string; value: number; }

@Component({
  selector: 'owner-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart">
      <div class="chart-title">{{ title() }}</div>
      @if (data().length === 0) {
        <div class="no-data">No data available</div>
      } @else {
        <div class="bars">
          @for (d of data(); track $index) {
            <div class="bar-row">
              <span class="bar-label">{{ d.label }}</span>
              <div class="bar-track" [style.color]="color()"><div class="bar-fill" [style.width.%]="pct(d.value)"></div></div>
              <span class="bar-value">{{ prefix() }}{{ d.value.toLocaleString() }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .chart {
      background: var(--background); border: 1px solid var(--border);
      border-radius: $border-radius-xl; padding: $spacing-xl; box-shadow: $shadow-md; height: 100%;
      display: flex; flex-direction: column;
    }
    .chart-title { font-weight: $font-weight-semibold; font-size: $font-size-md; color: var(--foreground); margin-bottom: $spacing-lg; }
    .no-data { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--muted-foreground); font-size: $font-size-sm; }
    .bars { display: flex; flex-direction: column; gap: $spacing-md; flex: 1; justify-content: center; }
    .bar-row { display: flex; align-items: center; gap: $spacing-sm; }
    .bar-label { width: 120px; font-size: $font-size-xs; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--foreground); font-weight: $font-weight-medium; }
    .bar-track { flex: 1; height: 8px; background: var(--card); border-radius: $border-radius-full; overflow: hidden; border: 1px solid var(--border); }
    .bar-fill { height: 100%; border-radius: $border-radius-full; transition: width 0.5s ease; background: currentColor; }
    .bar-value { width: 80px; text-align: right; font-size: $font-size-xs; font-weight: $font-weight-semibold; color: var(--muted-foreground); flex-shrink: 0; }
  `]
})
export class OwnerBarChartComponent {
  title = input.required<string>();
  data = input<BarDatum[]>([]);
  color = input<string>('#4f46e5');
  prefix = input<string>('');

  private max = computed(() => Math.max(...this.data().map(d => d.value), 1));
  pct(v: number): number { return (v / this.max()) * 100; }
}
