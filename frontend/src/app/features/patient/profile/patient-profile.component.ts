import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrentPatientContextService } from '../../../core/services/current-patient-context.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule, CommonModule, AppPageHeaderComponent,
  ],
  template: `
    <div class="profile-page">
      <app-page-header title="My Profile" subtitle="Update your personal information" />

      <div class="profile-layout">
        <div class="profile-avatar-card">
          <div class="avatar">{{ initials() }}</div>
          <h4>{{ authService.currentUser()?.fullName }}</h4>
          <p>{{ authService.currentUser()?.email }}</p>
          <button mat-stroked-button>Change Photo</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="profile-form-card">
          <h4>Personal Information</h4>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" />
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date of Birth</mat-label>
            <input matInput type="date" formControlName="dateOfBirth" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="male">Male</mat-option>
              <mat-option value="female">Female</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Blood Type</mat-label>
            <mat-select formControlName="bloodType">
              @for (bt of bloodTypes; track bt) {
                <mat-option [value]="bt">{{ bt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Address</mat-label>
            <textarea matInput rows="2" formControlName="address"></textarea>
          </mat-form-field>
          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .profile-avatar-card {
      background: white; border-radius: $border-radius; padding: 32px 24px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
      h4 { margin: 0; }
      p { margin: 0; color: $text-secondary; font-size: 0.875rem; }
    }
    .avatar {
      width: 80px; height: 80px; border-radius: 50%; background: $primary;
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: 700;
    }
    .profile-form-card {
      background: white; border-radius: $border-radius; padding: 24px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      h4 { margin: 0 0 20px; }
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; @media (max-width: 576px) { grid-template-columns: 1fr; } }
    mat-form-field { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
  `]
})
export class PatientProfileComponent implements OnInit {
  authService = inject(AuthService);
  ctx = inject(CurrentPatientContextService);
  private patientApi = inject(PatientApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  saving = signal(false);
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', Validators.required],
    dateOfBirth: [''],
    gender: [''],
    bloodType: [''],
    address: [''],
  });

  initials(): string {
    const ctx = this.ctx.initials();
    if (ctx) return ctx;
    const name = this.authService.currentUser()?.fullName ?? '';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  ngOnInit(): void {
    this.ctx.load();
    this.patientApi.getProfile().subscribe({
      next: res => {
        const p = res.data;
        if (p) {
          this.form.patchValue({
            firstName: p.firstName,
            lastName: p.lastName,
            phone: p.phone,
            dateOfBirth: p.dateOfBirth,
            gender: p.gender,
            bloodType: p.bloodType ?? '',
            address: p.address ?? '',
          });
        }
      },
      error: () => {},
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.patientApi.updateProfile({
      firstName: v.firstName!,
      lastName: v.lastName!,
      fullName: `${v.firstName} ${v.lastName}`,
      phone: v.phone!,
      dateOfBirth: v.dateOfBirth ?? '',
      gender: v.gender as 'male' | 'female',
      bloodType: v.bloodType ?? undefined,
      address: v.address ?? undefined,
    }).subscribe({
      next: () => { this.toast.success('Profile updated!'); this.saving.set(false); },
      error: () => this.saving.set(false),
    });
  }
}
