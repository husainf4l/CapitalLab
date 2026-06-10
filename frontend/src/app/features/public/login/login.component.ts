import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule, CommonModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-header">
        <h2>Welcome Back</h2>
        <p>Sign in to your Capital Lab account</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
        <mat-form-field appearance="outline">
          <mat-label>Email Address</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
          <mat-icon matSuffix>email</mat-icon>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>Email is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
          <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())">
            <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
            <mat-error>Password is required</mat-error>
          }
        </mat-form-field>

        <div class="form-extras">
          <a routerLink="/forgot-password" class="forgot-link">Forgot Password?</a>
        </div>

        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()" class="submit-btn">
          @if (loading()) {
            <mat-spinner diameter="20" />
          } @else {
            Sign In
          }
        </button>
      </form>

      <div class="login-footer">
        <p>New patient? <a routerLink="/register">Create an Account</a></p>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .login-header { margin-bottom: 32px;
      h2 { font-size: 1.75rem; margin-bottom: 6px; }
      p { color: $text-secondary; margin: 0; }
    }
    .login-form { display: flex; flex-direction: column; gap: 4px; }
    mat-form-field { width: 100%; }
    .form-extras { display: flex; justify-content: flex-end; margin-bottom: 8px; }
    .forgot-link { font-size: 0.875rem; color: $primary; text-decoration: none; &:hover { text-decoration: underline; } }
    .submit-btn { width: 100%; height: 48px; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .login-footer { margin-top: 24px; text-align: center; color: $text-secondary;
      a { color: $primary; font-weight: 500; text-decoration: none; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password } = this.form.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigate([this.authService.getRedirectUrl()]);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
