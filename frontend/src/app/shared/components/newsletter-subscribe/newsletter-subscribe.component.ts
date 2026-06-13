import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentApiService } from '../../../core/api/content-api.service';

@Component({
  selector: 'app-newsletter-subscribe',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="newsletter-widget">
      <div class="newsletter-icon">✉️</div>
      <h3>Stay Informed</h3>
      <p>Get the latest health articles and lab news delivered to your inbox.</p>

      @if (success()) {
        <div class="newsletter-success">
          <span>✓</span> You're now subscribed! Thank you.
        </div>
      } @else {
        <form class="newsletter-form" (submit)="subscribe($event)">
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            placeholder="your@email.com"
            class="newsletter-input"
            required
          />
          <button type="submit" class="newsletter-btn" [disabled]="loading()">
            @if (loading()) { Subscribing… } @else { Subscribe }
          </button>
        </form>
        @if (error()) {
          <p class="newsletter-error">{{ error() }}</p>
        }
      }
    </div>
  `,
  styles: [`
    .newsletter-widget {
      background: linear-gradient(135deg, #4a148c, #7b1fa2);
      border-radius: 16px; padding: 32px; color: white; text-align: center;
    }
    .newsletter-icon { font-size: 2rem; margin-bottom: 12px; }
    h3 { color: white; margin: 0 0 8px; font-size: 1.25rem; }
    p { color: rgba(255,255,255,0.85); margin: 0 0 20px; font-size: 0.9rem; }
    .newsletter-form { display: flex; gap: 8px; max-width: 380px; margin: 0 auto; }
    .newsletter-input {
      flex: 1; padding: 10px 14px; border: none; border-radius: 8px;
      font-size: 0.9rem; outline: none;
    }
    .newsletter-btn {
      padding: 10px 20px; background: white; color: #7b1fa2;
      border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s; white-space: nowrap;
      &:hover:not(:disabled) { opacity: 0.9; }
      &:disabled { opacity: 0.7; cursor: default; }
    }
    .newsletter-success {
      background: rgba(255,255,255,0.2); border-radius: 8px;
      padding: 12px 20px; font-weight: 500;
      span { color: #a5d6a7; margin-right: 8px; }
    }
    .newsletter-error { color: #ffcdd2; font-size: 0.85rem; margin-top: 8px; }
    @media (max-width: 480px) {
      .newsletter-form { flex-direction: column; }
    }
  `]
})
export class NewsletterSubscribeComponent {
  private api = inject(ContentApiService);

  email = '';
  loading = signal(false);
  success = signal(false);
  error = signal('');

  subscribe(e: Event): void {
    e.preventDefault();
    if (!this.email || this.loading()) return;

    this.loading.set(true);
    this.error.set('');

    this.api.subscribe({ email: this.email, language: 'en' }).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.errorMessage || 'Subscription failed. Please try again.';
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }
}
