import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  imports: [
    RouterLink, ReactiveFormsModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="register-container">
      <div class="register-header">
        <h2>Create Your Account</h2>
        <p>Register as a patient to book appointments and view your results online.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="register-form">

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" autocomplete="given-name" />
            @if (form.get('firstName')?.hasError('required') && form.get('firstName')?.touched) {
              <mat-error>First name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" autocomplete="family-name" />
            @if (form.get('lastName')?.hasError('required') && form.get('lastName')?.touched) {
              <mat-error>Last name is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="gender">
              <mat-option [value]="0">Male</mat-option>
              <mat-option [value]="1">Female</mat-option>
            </mat-select>
            @if (form.get('gender')?.hasError('required') && form.get('gender')?.touched) {
              <mat-error>Gender is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date of Birth</mat-label>
            <input matInput [matDatepicker]="dob" formControlName="dateOfBirth" autocomplete="bday" />
            <mat-datepicker-toggle matIconSuffix [for]="dob" />
            <mat-datepicker #dob [startAt]="defaultDobStart" startView="multi-year" />
            @if (form.get('dateOfBirth')?.hasError('required') && form.get('dateOfBirth')?.touched) {
              <mat-error>Date of birth is required</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Phone Number</mat-label>
          <input matInput type="tel" formControlName="phone" autocomplete="tel" placeholder="+962 7X XXX XXXX" />
          <mat-icon matSuffix>phone</mat-icon>
          @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
            <mat-error>Phone number is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email Address</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
          <mat-icon matSuffix>email</mat-icon>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>Email is required</mat-error>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Enter a valid email address</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="new-password" />
          <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
            <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
            <mat-error>Password is required</mat-error>
          }
          @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
            <mat-error>Password must be at least 8 characters</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Confirm Password</mat-label>
          <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="confirmPassword" autocomplete="new-password" />
          @if (form.get('confirmPassword')?.hasError('required') && form.get('confirmPassword')?.touched) {
            <mat-error>Please confirm your password</mat-error>
          }
          @if (form.get('confirmPassword')?.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
            <mat-error>Passwords do not match</mat-error>
          }
        </mat-form-field>

        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()" class="submit-btn">
          @if (loading()) {
            <mat-spinner diameter="20" />
          } @else {
            Create Account
          }
        </button>
      </form>

      <div class="register-footer">
        <p>Already have an account? <a routerLink="/login">Sign In</a></p>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .register-header {
      margin-bottom: 28px;
      h2 { font-size: 1.75rem; margin-bottom: 6px; }
      p { color: $text-secondary; margin: 0; font-size: 0.9rem; }
    }
    .register-form { display: flex; flex-direction: column; gap: 4px; }
    mat-form-field { width: 100%; }
    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }
    .submit-btn {
      width: 100%; height: 48px; font-size: 1rem; margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .register-footer {
      margin-top: 24px; text-align: center; color: $text-secondary;
      a { color: $primary; font-weight: 500; text-decoration: none; }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);
  showPassword = signal(false);
  readonly defaultDobStart = new Date(1990, 0, 1);
  readonly maxDob = new Date();

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    gender: [null as number | null, Validators.required],
    dateOfBirth: [null as Date | null, Validators.required],
    phone: ['', [Validators.required, Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const v = this.form.value;
    const dob = v.dateOfBirth as Date;
    const dobStr = `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`;

    this.authService.register({
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phone: v.phone!,
      gender: v.gender!,
      dateOfBirth: dobStr,
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
