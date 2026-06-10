import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      @if (description()) {
        <p>{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .empty-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: $spacing-3xl $spacing-lg; text-align: center; color: $text-secondary;
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: $gray-300; margin-bottom: $spacing-lg; }
    h3 { font-size: $font-size-xl; color: $text-primary; margin: 0 0 $spacing-sm; }
    p { font-size: $font-size-sm; margin: 0 0 $spacing-lg; max-width: 400px; }
  `]
})
export class AppEmptyStateComponent {
  icon = input<string>('inbox');
  title = input<string>('No data found');
  description = input<string>('');
}
