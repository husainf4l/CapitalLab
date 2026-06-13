import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="error-state" role="alert">
      <mat-icon class="err-icon" aria-hidden="true">error_outline</mat-icon>
      <h3>{{ title() }}</h3>
      @if (message()) {
        <p class="err-msg">{{ message() }}</p>
      }
      @if (showRetry()) {
        <button mat-stroked-button color="warn" (click)="retry.emit()" class="retry-btn">
          <mat-icon>refresh</mat-icon> Try Again
        </button>
      }
      @if (supportText()) {
        <p class="support-text">{{ supportText() }}</p>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .error-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: $spacing-3xl $spacing-lg; text-align: center;
    }
    .err-icon { font-size: 56px; width: 56px; height: 56px; color: $danger; opacity: 0.7; margin-bottom: $spacing-md; }
    h3 { font-size: $font-size-lg; color: $text-primary; margin: 0 0 $spacing-sm; }
    .err-msg { font-size: $font-size-sm; color: $text-secondary; margin: 0 0 $spacing-lg; max-width: 400px; }
    .retry-btn { margin-bottom: $spacing-md; }
    .support-text { font-size: $font-size-xs; color: $text-disabled; margin: 0; }
  `]
})
export class AppErrorStateComponent {
  title       = input('Something went wrong');
  message     = input('');
  showRetry   = input(true);
  supportText = input('');
  retry       = output<void>();
}
