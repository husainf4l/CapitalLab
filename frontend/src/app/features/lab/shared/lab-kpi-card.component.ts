import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lab-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="kpi-card" [style.border-top-color]="color()">
      <div class="kpi-icon" [style.background]="color() + '18'">
        <mat-icon [style.color]="color()">{{ icon() }}</mat-icon>
      </div>
      <div class="kpi-body">
        <p class="kpi-label">{{ label() }}</p>
        <div class="kpi-value">
          @if (loading()) {
            <div class="kpi-skel"></div>
          } @else {
            <span>{{ value() }}</span>
          }
        </div>
        @if (sub()) {
          <p class="kpi-sub">{{ sub() }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .kpi-card {
      background: white; border-radius: $border-radius; padding: 20px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      border-top: 3px solid; display: flex; align-items: flex-start; gap: 14px;
    }
    .kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 22px; } }
    .kpi-body { flex: 1; min-width: 0; }
    .kpi-label { margin: 0 0 4px; font-size: 0.8rem; color: $text-secondary; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .kpi-value { font-size: 1.75rem; font-weight: 700; color: $text-primary; line-height: 1; }
    .kpi-skel { height: 28px; width: 60px; border-radius: 6px; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .kpi-sub { margin: 4px 0 0; font-size: 0.75rem; color: $text-secondary; }
  `]
})
export class LabKpiCardComponent {
  label = input.required<string>();
  value = input<number | string>(0);
  icon = input<string>('analytics');
  color = input<string>('#1a73e8');
  loading = input<boolean>(false);
  sub = input<string>('');
}
