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
              <div class="bar-track"><div class="bar-fill" [style.width.%]="pct(d.value)" [style.background]="color()"></div></div>
              <span class="bar-value">{{ prefix() }}{{ d.value.toLocaleString() }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .chart { background: white; border: 1px solid $border-color; border-radius: $border-radius-lg; padding: 20px; }
    .chart-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 16px; }
    .no-data { padding: 30px; text-align: center; color: $text-secondary; font-size: 0.85rem; }
    .bars { display: flex; flex-direction: column; gap: 12px; }
    .bar-row { display: flex; align-items: center; gap: 12px; }
    .bar-label { width: 130px; font-size: 0.8rem; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-track { flex: 1; height: 10px; background: $gray-100; border-radius: 999px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
    .bar-value { width: 90px; text-align: right; font-size: 0.8rem; font-weight: 700; color: $text-secondary; flex-shrink: 0; }
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
