import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  if (confirm?.hasError('passwordMismatch')) {
    confirm.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <a routerLink="/" class="logo">
      <img src="/images/hero/logo.png" alt="Capital Lab" class="logo-img">
    </a>

    <h1 class="headline">Create your<br>account</h1>
    <p class="subline">Book appointments, view results, and manage your health online.</p>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">

      <div class="row-2">
        <div class="field">
          <input type="text" formControlName="firstName" placeholder="First name"
                 autocomplete="given-name" [class.input-error]="err('firstName')" />
          @if (err('firstName')) { <span class="err">Required</span> }
        </div>
        <div class="field">
          <input type="text" formControlName="lastName" placeholder="Last name"
                 autocomplete="family-name" [class.input-error]="err('lastName')" />
          @if (err('lastName')) { <span class="err">Required</span> }
        </div>
      </div>

      <div class="row-2">
        <div class="field">
          <div class="select-wrap">
            <select formControlName="gender" [class.input-error]="err('gender')" [class.placeholder]="form.get('gender')?.value === ''">
              <option value="" disabled>Gender</option>
              <option value="0">Male</option>
              <option value="1">Female</option>
            </select>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          @if (err('gender')) { <span class="err">Required</span> }
        </div>
        <div class="field">
          <input type="date" formControlName="dateOfBirth"
                 autocomplete="bday" [class.input-error]="err('dateOfBirth')"
                 [max]="today" />
          @if (err('dateOfBirth')) { <span class="err">Required</span> }
        </div>
      </div>

      <div class="field">
        <input type="tel" formControlName="phone" placeholder="Phone number"
               autocomplete="tel" [class.input-error]="err('phone')" />
        @if (err('phone')) { <span class="err">Phone number is required</span> }
      </div>

      <div class="field">
        <input type="email" formControlName="email" placeholder="Email address"
               autocomplete="email" [class.input-error]="err('email')" />
        @if (err('email')) { <span class="err">Enter a valid email address</span> }
      </div>

      <div class="field">
        <div class="pass-wrap">
          <input [type]="showPass() ? 'text' : 'password'" formControlName="password"
                 placeholder="Password (min. 8 characters)" autocomplete="new-password"
                 [class.input-error]="err('password')" />
          <button type="button" class="eye-btn" (click)="showPass.set(!showPass())" aria-label="Toggle password">
            @if (showPass()) {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>
        @if (err('password')) { <span class="err">Password must be at least 8 characters</span> }
      </div>

      <div class="field">
        <input [type]="showPass() ? 'text' : 'password'" formControlName="confirmPassword"
               placeholder="Confirm password" autocomplete="new-password"
               [class.input-error]="err('confirmPassword')" />
        @if (err('confirmPassword')) { <span class="err">Passwords do not match</span> }
      </div>

      <button type="submit" class="submit-btn" [disabled]="form.invalid || loading()">
        <span>{{ loading() ? 'Creating account...' : 'Create Account' }}</span>
        @if (!loading()) {
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        }
      </button>

    </form>

    <p class="footer-txt">Already have an account? <a routerLink="/login">Sign in</a></p>
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
      margin-bottom: 36px;
    }

    .logo-img {
      height: 40px;
      width: auto;
      object-fit: contain;
    }

    .headline {
      font-size: clamp(1.8rem, 3vw, 2.5rem);
      font-weight: 700;
      color: #000;
      line-height: 1.18;
      letter-spacing: -0.8px;
      margin: 0 0 10px;
    }

    .subline {
      font-size: 0.95rem;
      color: #6b7280;
      margin: 0 0 28px;
      line-height: 1.55;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    input, select {
      width: 100%;
      padding: 15px 20px;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      background: #fff;
      font-size: 0.95rem;
      color: #111827;
      outline: none;
      transition: border-color 0.18s;
      box-sizing: border-box;
      font-family: inherit;

      &::placeholder { color: #9ca3af; }
      &:focus { border-color: #000; }
    }

    input[type="date"] {
      color: #111827;
      &::-webkit-datetime-edit-text,
      &::-webkit-datetime-edit-month-field,
      &::-webkit-datetime-edit-day-field,
      &::-webkit-datetime-edit-year-field { color: #111827; }
    }

    .input-error { border-color: #fca5a5 !important; }

    .select-wrap {
      position: relative;

      select {
        appearance: none;
        -webkit-appearance: none;
        padding-right: 44px;
        cursor: pointer;
      }

      select.placeholder { color: #9ca3af; }

      .chevron {
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        pointer-events: none;
      }
    }

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
      font-size: 0.78rem;
      color: #ef4444;
    }

    .submit-btn {
      width: 100%;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 16px;
      padding: 15px 24px;
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

    .footer-txt {
      text-align: center;
      font-size: 0.875rem;
      color: #6b7280;
      margin: 14px 0 0;

      a {
        color: #000;
        font-weight: 600;
        text-decoration: none;
        &:hover { text-decoration: underline; }
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  showPass = signal(false);
  readonly today = new Date().toISOString().split('T')[0];

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    gender: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const v = this.form.value;

    this.authService.register({
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phone: v.phone!,
      gender: Number(v.gender),
      dateOfBirth: v.dateOfBirth!,
      password: v.password!,
      confirmPassword: v.confirmPassword!,
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Account created! Welcome to Capital Lab.');
          this.router.navigate(['/patient/dashboard']);
        } else {
          this.toast.error(res.message || 'Registration failed. Please try again.');
          this.loading.set(false);
        }
      },
      error: (err) => {
        const msg = err?.error?.errorMessage || err?.error?.message || 'Registration failed. Please try again.';
        this.toast.error(msg);
        this.loading.set(false);
      },
    });
  }
}
