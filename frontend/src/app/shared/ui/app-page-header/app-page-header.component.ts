import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="header-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: $spacing-xl; gap: $spacing-md;
      @media (max-width: 768px) { flex-direction: column; }
    }
    .page-title { font-size: $font-size-2xl; font-weight: $font-weight-bold; margin: 0; }
    .page-subtitle { font-size: $font-size-sm; color: $text-secondary; margin: 4px 0 0; }
    .header-actions { display: flex; align-items: center; gap: $spacing-sm; flex-shrink: 0; }
  `]
})
export class AppPageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
}
