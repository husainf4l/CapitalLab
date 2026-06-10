import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CriticalResultLevel } from '../../../core/models/critical-result.models';

@Component({
  selector: 'critical-result-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <span class="badge" [class.high]="level() === 'critical_high'" [class.low]="level() === 'critical_low'">
      <mat-icon>{{ level() === 'critical_high' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
      {{ label() }}
    </span>
  `,
  styles: [`
    .badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
      mat-icon { font-size: 13px; }
      &.high { background: #7f1d1d; color: #fef2f2; }
      &.low { background: #1e3a5f; color: #dbeafe; }
    }
  `]
})
export class CriticalResultBadgeComponent {
  level = input.required<CriticalResultLevel>();
  label = computed(() => this.level() === 'critical_high' ? 'Critical High' : 'Critical Low');
}
