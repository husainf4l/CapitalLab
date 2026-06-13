import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="reset-container">
      <div class="reset-header">
        <h2>Reset Password</h2>
        <p>Enter your new password below.</p>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="reset-form">
        <mat-form-field appearance="outline">
          <mat-label>New Password</mat-label>
          <input matInput [type]="showPw() ? 'text' : 'password'" formControlName="password" />
          <button mat-icon-button matSuffix type="button" [attr.aria-label]="showPw() ? 'Hide password' : 'Show password'" (click)="showPw.set(!showPw())">
            <mat-icon>{{ showPw() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Confirm Password</mat-label>
          <input matInput [type]="showPw() ? 'text' : 'password'" formControlName="confirmPassword" />
        </mat-form-field>
        @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
          <p class="error-msg">Passwords do not match</p>
        }
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()" class="submit-btn">
          Reset Password
        </button>
      </form>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .reset-header { margin-bottom: 32px;
      h2 { font-size: 1.75rem; margin-bottom: 6px; }
      p { color: $text-secondary; margin: 0; }
    }
    .reset-form { display: flex; flex-direction: column; gap: 4px; }
    mat-form-field { width: 100%; }
    .submit-btn { width: 100%; height: 48px; margin-top: 8px; }
    .error-msg { color: $danger; font-size: 0.875rem; margin: -8px 0 4px; }
  `]
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  showPw = signal(false);

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(g: any) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const token = this.route.snapshot.queryParams['token'] ?? '';
    const email = this.route.snapshot.queryParams['email'] ?? '';
    this.authService.resetPassword({
      token,
      email,
      newPassword: this.form.value.password!,
      confirmPassword: this.form.value.confirmPassword!,
    }).subscribe({
      next: () => {
        this.toast.success('Password reset successfully!');
        this.router.navigate(['/login']);
      },
      error: () => this.loading.set(false),
    });
  }
}
