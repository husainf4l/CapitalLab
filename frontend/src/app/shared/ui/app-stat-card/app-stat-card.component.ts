import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="stat-card" [style.--accent]="color()">
      <div class="stat-icon">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <div class="stat-info">
        <div class="stat-value">{{ value() }}</div>
        <div class="stat-label">{{ label() }}</div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .stat-card {
      background: white; border-radius: $border-radius; padding: $spacing-lg;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      display: flex; align-items: center; gap: $spacing-md;
      border-left: 4px solid var(--accent, #{$primary});
    }
    .stat-icon {
      width: 48px; height: 48px; border-radius: $border-radius;
      background: color-mix(in srgb, var(--accent, #{$primary}) 15%, transparent);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: var(--accent, #{$primary}); }
    }
    .stat-value { font-size: $font-size-2xl; font-weight: $font-weight-bold; color: $text-primary; }
    .stat-label { font-size: $font-size-sm; color: $text-secondary; margin-top: 2px; }
  `]
})
export class AppStatCardComponent {
  icon = input.required<string>();
  label = input.required<string>();
  value = input.required<string | number>();
  color = input<string>('#1a73e8');
}
