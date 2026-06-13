import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="forgot-container">
      <div class="forgot-header">
        <h2>Forgot Password?</h2>
        <p>Enter your email and we'll send you a reset link.</p>
      </div>

      @if (sent()) {
        <div class="success-box">
          <div class="success-icon"><mat-icon>mark_email_read</mat-icon></div>
          <h3>Check Your Email</h3>
          <p>We sent a password reset link to your email address.</p>
          <a routerLink="/login">Back to Login</a>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="forgot-form">
          <mat-form-field appearance="outline">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" />
            <mat-icon matSuffix>email</mat-icon>
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()" class="submit-btn">
            Send Reset Link
          </button>
          <a routerLink="/login" class="back-link">← Back to Login</a>
        </form>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .forgot-header { margin-bottom: 32px;
      h2 { font-size: 1.75rem; margin-bottom: 6px; }
      p { color: $text-secondary; margin: 0; }
    }
    .forgot-form { display: flex; flex-direction: column; gap: 16px; }
    mat-form-field { width: 100%; }
    .submit-btn { width: 100%; height: 48px; font-size: 1rem; }
    .back-link { text-align: center; color: $primary; text-decoration: none; font-size: 0.875rem; }
    .success-box {
      text-align: center; padding: 32px; background: #dcfce7; border-radius: $border-radius; border: 1px solid #86efac;
      .success-icon { margin-bottom: 16px; mat-icon { font-size: 52px !important; width: 52px !important; height: 52px !important; color: $primary; } }
      h3 { color: $success; margin-bottom: 8px; }
      p { color: $text-secondary; margin-bottom: 16px; }
      a { color: $primary; text-decoration: none; font-weight: 500; }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(false);
  sent = signal(false);

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.authService.forgotPassword({ email: this.form.value.email! }).subscribe({
      next: () => { this.sent.set(true); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
