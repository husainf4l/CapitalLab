import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="placeholder-page">
      <div class="placeholder-content">
        <div class="icon">⚙️</div>
        <h2>Admin Panel</h2>
        <p>The admin panel is under development. It will provide full system configuration, user management, and reporting.</p>
        <a mat-flat-button color="primary" routerLink="/">Back to Home</a>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;
    .placeholder-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: $bg-body; }
    .placeholder-content { text-align: center; padding: 48px; }
    .icon { font-size: 5rem; margin-bottom: 24px; }
    h2 { font-size: 2rem; margin-bottom: 12px; color: $text-primary; }
    p { color: $text-secondary; max-width: 400px; margin: 0 auto 32px; }
  `]
})
export class AdminPlaceholderComponent {}
