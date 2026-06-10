import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading-spinner">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .loading-spinner {
      display: flex; align-items: center; justify-content: center; padding: $spacing-3xl;
    }
    .spinner {
      width: 40px; height: 40px; border: 3px solid $gray-200;
      border-top-color: $primary; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AppLoadingComponent {}
