import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

type ChartSlot = '1' | '2' | '3' | '4' | '5';

@Component({
  selector: 'owner-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <div class="kpi">
      <div class="kpi-top">
        <div class="kpi-icon" [class]="'slot-' + slot()">
          <mat-icon>{{ icon() }}</mat-icon>
        </div>
        <button mat-icon-button class="menu-btn" [matMenuTriggerFor]="menu" aria-label="Options">
          <mat-icon>more_horiz</mat-icon>
        </button>
        <mat-menu #menu>
          <button mat-menu-item><mat-icon>open_in_new</mat-icon>View Details</button>
          <button mat-menu-item><mat-icon>flag</mat-icon>Set Target</button>
          <button mat-menu-item><mat-icon>file_download</mat-icon>Export</button>
        </mat-menu>
      </div>

      @if (loading()) {
        <div class="skeleton skeleton-val"></div>
        <div class="skeleton skeleton-sub"></div>
      } @else {
        <div class="kpi-value">{{ display() }}</div>
        <div class="kpi-meta">
          @if (trend() !== 0) {
            <span class="trend" [class.up]="trend() > 0" [class.down]="trend() < 0">
              <mat-icon>{{ trend() > 0 ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
              {{ trend() > 0 ? '+' : '' }}{{ trend() | number:'1.1-1' }}%
            </span>
            <span class="trend-lbl">vs last month</span>
          }
          @if (sub()) { <span class="kpi-sub">{{ sub() }}</span> }
        </div>
      }

      <div class="kpi-label">{{ label() }}</div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .kpi {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: $border-radius-xl;
      padding: $spacing-xl;
      box-shadow: $shadow-md;
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
      transition: box-shadow $transition-normal, transform $transition-normal;
      &:hover { box-shadow: $shadow-lg; transform: translateY(-2px); }
    }

    .kpi-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: $spacing-xs;
    }

    .kpi-icon {
      width: 48px; height: 48px;
      border-radius: $border-radius-lg;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
      &.slot-1 { background: color-mix(in srgb, var(--chart-1) 12%, var(--background)); color: var(--chart-1); }
      &.slot-2 { background: color-mix(in srgb, var(--chart-2) 12%, var(--background)); color: var(--chart-2); }
      &.slot-3 { background: color-mix(in srgb, var(--chart-3) 12%, var(--background)); color: var(--chart-3); }
      &.slot-4 { background: color-mix(in srgb, var(--chart-4) 12%, var(--background)); color: var(--chart-4); }
      &.slot-5 { background: color-mix(in srgb, var(--chart-5) 12%, var(--background)); color: var(--chart-5); }
    }

    .menu-btn {
      color: var(--muted-foreground) !important;
      opacity: 0.5;
      width: 32px; height: 32px; line-height: 32px;
      &:hover { opacity: 1; }
    }

    .kpi-value {
      font-size: 2.5rem;
      font-weight: $font-weight-bold;
      color: var(--foreground);
      line-height: 1;
      letter-spacing: -0.03em;
    }

    .kpi-meta {
      display: flex; align-items: center; gap: $spacing-sm; flex-wrap: wrap; min-height: 22px;
    }

    .trend {
      display: inline-flex; align-items: center; gap: 2px;
      padding: 3px 9px 3px 6px;
      border-radius: $border-radius-full;
      font-size: $font-size-xs; font-weight: $font-weight-semibold;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
      &.up { background: color-mix(in srgb, var(--chart-2) 12%, var(--background)); color: var(--chart-2); }
      &.down { background: color-mix(in srgb, var(--chart-5) 12%, var(--background)); color: var(--chart-5); }
    }

    .trend-lbl, .kpi-sub {
      font-size: $font-size-xs;
      color: var(--muted-foreground);
    }

    .kpi-label {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: var(--muted-foreground);
    }

    .skeleton {
      border-radius: $border-radius;
      background: linear-gradient(90deg, var(--border) 25%, var(--accent) 50%, var(--border) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      &-val { height: 40px; width: 110px; }
      &-sub { height: 14px; width: 72px; }
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class OwnerKpiCardComponent {
  label = input.required<string>();
  value = input<number | string>(0);
  icon = input<string>('insights');
  slot = input<ChartSlot>('1');
  trend = input<number>(0);
  loading = input<boolean>(false);
  sub = input<string>('');
  prefix = input<string>('');
  suffix = input<string>('');

  display(): string {
    const v = this.value();
    const n = typeof v === 'number' ? v.toLocaleString() : v;
    return `${this.prefix()}${n}${this.suffix()}`;
  }
}
