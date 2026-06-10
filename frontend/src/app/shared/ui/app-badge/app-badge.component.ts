import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [class]="'badge-' + variant()"><ng-content /></span>`,
  styles: [`
    @use '../../../../styles/variables' as *;
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: $border-radius-full;
      font-size: $font-size-xs; font-weight: $font-weight-semibold; white-space: nowrap;
    }
    .badge-primary { background: $primary-light; color: $primary; }
    .badge-success { background: #dcfce7; color: $success; }
    .badge-warning { background: #fef3c7; color: $warning; }
    .badge-danger { background: #fee2e2; color: $danger; }
    .badge-info { background: #e0f2fe; color: $info; }
    .badge-neutral { background: $gray-100; color: $gray-600; }
  `]
})
export class AppBadgeComponent {
  variant = input<BadgeVariant>('neutral');
}
