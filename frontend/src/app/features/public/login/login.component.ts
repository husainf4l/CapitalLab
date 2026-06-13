import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <a routerLink="/" class="logo">
      <img src="/images/hero/logo.png" alt="Capital Lab" class="logo-img">
    </a>

    <h1 class="headline">Welcome back to<br>Capital Lab</h1>
    <p class="subline">Your health results and appointments, all in one place.</p>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">

      <div class="field">
        <input type="email" formControlName="email" placeholder="Email address"
               autocomplete="email" [class.input-error]="emailErr()" />
        @if (emailErr()) {
          <span class="err">Enter a valid email address</span>
        }
      </div>

      <div class="field">
        <div class="pass-wrap">
          <input [type]="showPass() ? 'text' : 'password'" formControlName="password"
                 placeholder="Password" autocomplete="current-password"
                 [class.input-error]="passErr()" />
          <button type="button" class="eye-btn" (click)="showPass.set(!showPass())" aria-label="Toggle password visibility">
            @if (showPass()) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>
        @if (passErr()) {
          <span class="err">Password is required</span>
        }
      </div>

      <button type="submit" class="submit-btn" [disabled]="form.invalid || loading()">
        <span>{{ loading() ? 'Signing in...' : 'Sign In' }}</span>
        @if (!loading()) {
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        }
      </button>

    </form>

    <p class="helper-link"><a routerLink="/forgot-password">Forgot your password?</a></p>
    <p class="footer-txt">Don't have an account? <a routerLink="/register">Create account</a></p>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      margin-bottom: 44px;
    }

    .logo-img {
      height: 40px;
      width: auto;
      object-fit: contain;
    }

    .headline {
      font-size: clamp(1.9rem, 3.2vw, 2.6rem);
      font-weight: 700;
      color: #000;
      line-height: 1.18;
      letter-spacing: -0.8px;
      margin: 0 0 12px;
    }

    .subline {
      font-size: 1rem;
      color: #6b7280;
      margin: 0 0 32px;
      line-height: 1.55;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    input {
      width: 100%;
      padding: 16px 20px;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      background: #fff;
      font-size: 1rem;
      color: #111827;
      outline: none;
      transition: border-color 0.18s;
      box-sizing: border-box;
      font-family: inherit;

      &::placeholder { color: #9ca3af; }
      &:focus { border-color: #000; }
    }

    .input-error { border-color: #fca5a5 !important; }

    .pass-wrap {
      position: relative;

      input { padding-right: 52px; }
    }

    .eye-btn {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      display: flex;
      align-items: center;
      padding: 4px;
      transition: color 0.15s;

      &:hover { color: #374151; }
    }

    .err {
      font-size: 0.8rem;
      color: #ef4444;
    }

    .submit-btn {
      width: 100%;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 16px;
      padding: 16px 24px;
      font-size: 1rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.18s;
      margin-top: 4px;

      &:hover:not(:disabled) { background: #111827; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .helper-link {
      text-align: center;
      margin: 14px 0 0;
      font-size: 0.875rem;

      a {
        color: #6b7280;
        text-decoration: none;
        transition: color 0.15s;
        &:hover { color: #000; }
      }
    }

    .footer-txt {
      text-align: center;
      font-size: 0.875rem;
      color: #6b7280;
      margin: 6px 0 0;

      a {
        color: #000;
        font-weight: 600;
        text-decoration: none;
        &:hover { text-decoration: underline; }
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  showPass = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  emailErr = () => this.form.get('email')?.invalid && this.form.get('email')?.touched;
  passErr = () => this.form.get('password')?.invalid && this.form.get('password')?.touched;

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
