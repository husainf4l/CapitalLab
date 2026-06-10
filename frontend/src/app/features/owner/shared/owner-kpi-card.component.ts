import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'owner-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="kpi" [style.--accent]="color()">
      <div class="kpi-head">
        <span class="kpi-label">{{ label() }}</span>
        <div class="kpi-icon"><mat-icon>{{ icon() }}</mat-icon></div>
      </div>
      @if (loading()) {
        <div class="kpi-skel"></div>
      } @else {
        <div class="kpi-value">{{ display() }}</div>
      }
      @if (sub()) { <div class="kpi-sub">{{ sub() }}</div> }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .kpi { background: white; border: 1px solid $border-color; border-radius: $border-radius-lg; padding: 20px; box-shadow: $shadow-sm; position: relative; overflow: hidden;
      &::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--accent); }
    }
    .kpi-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .kpi-label { font-size: 0.8rem; color: $text-secondary; font-weight: 500; }
    .kpi-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--accent) 14%, white); mat-icon { font-size: 20px; color: var(--accent); } }
    .kpi-value { font-size: 1.9rem; font-weight: 800; color: $text-primary; line-height: 1; letter-spacing: -0.02em; }
    .kpi-skel { height: 30px; width: 80px; border-radius: 6px; background: linear-gradient(90deg,$gray-100 25%,$gray-200 50%,$gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .kpi-sub { font-size: 0.75rem; color: $text-secondary; margin-top: 6px; }
  `]
})
export class OwnerKpiCardComponent {
  label = input.required<string>();
  value = input<number | string>(0);
  icon = input<string>('insights');
  color = input<string>('#4f46e5');
  loading = input<boolean>(false);
  sub = input<string>('');
  prefix = input<string>('');
  suffix = input<string>('');

  display(): string {
    const v = this.value();
    if (typeof v === 'number') return `${this.prefix()}${v.toLocaleString()}${this.suffix()}`;
    return `${this.prefix()}${v}${this.suffix()}`;
  }
}
