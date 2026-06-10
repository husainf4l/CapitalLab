import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="auth-layout">
      <div class="auth-brand">
        <div class="brand-content">
          <div class="logo-area">
            <span class="logo-icon">🧪</span>
            <h1>Capital Lab</h1>
            <p>Trusted Diagnostics Since 2010</p>
          </div>
          <div class="brand-features">
            <div class="feature">
              <span class="feature-icon">⚡</span>
              <span>Fast Results</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🏠</span>
              <span>Home Collection</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔒</span>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
      <div class="auth-form-area">
        <div class="auth-form-container">
          <a routerLink="/" class="back-home">← Back to Website</a>
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;

    .auth-layout { display: flex; min-height: 100vh; }

    .auth-brand {
      flex: 1; background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 48px; color: white;
      @media (max-width: 768px) { display: none; }
    }

    .brand-content { max-width: 400px; }
    .logo-area { margin-bottom: 48px; }
    .logo-icon { font-size: 3rem; }
    h1 { font-size: 2.5rem; color: white; margin: 16px 0 8px; }
    p { color: rgba(255,255,255,0.8); font-size: 1.1rem; }

    .brand-features { display: flex; flex-direction: column; gap: 16px; }
    .feature {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.15); border-radius: 12px; padding: 16px;
      font-size: 1rem; font-weight: 500;
    }
    .feature-icon { font-size: 1.5rem; }

    .auth-form-area {
      width: 480px; display: flex; align-items: center; justify-content: center;
      padding: 48px; background: $bg-body;
      @media (max-width: 768px) { width: 100%; }
      @media (max-width: 480px) { padding: 24px; }
    }

    .auth-form-container { width: 100%; }

    .back-home {
      display: inline-block; color: $text-secondary; text-decoration: none;
      font-size: 0.875rem; margin-bottom: 32px;
      &:hover { color: $primary; }
    }
  `]
})
export class AuthLayoutComponent {}
