import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrentPatientContextService } from '../../../core/services/current-patient-context.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatIconModule, CommonModule,
  ],
  template: `
    <div class="profile-page">

      <!-- ── Hero Strip ── -->
      <div class="hero-strip">
        <div class="hero-orb"></div>
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-name">{{ authService.currentUser()?.fullName ?? 'My Profile' }}</h1>
            <p class="hero-email">{{ authService.currentUser()?.email }}</p>
            <span class="hero-badge">
              <mat-icon>badge</mat-icon>
              Patient
            </span>
          </div>
          <div class="hero-avatar">{{ initials() }}</div>
        </div>
      </div>

      <!-- ── 3-column info strip ── -->
      <div class="info-strip">
        <div class="info-pill">
          <mat-icon class="pill-icon blood">water_drop</mat-icon>
          <div class="pill-body">
            <span class="pill-label">Blood Type</span>
            <span class="pill-value">{{ form.value.bloodType || '—' }}</span>
          </div>
        </div>
        <div class="info-pill">
          <mat-icon class="pill-icon dob">cake</mat-icon>
          <div class="pill-body">
            <span class="pill-label">Date of Birth</span>
            <span class="pill-value">{{ form.value.dateOfBirth || '—' }}</span>
          </div>
        </div>
        <div class="info-pill">
          <mat-icon class="pill-icon gender">person</mat-icon>
          <div class="pill-body">
            <span class="pill-label">Gender</span>
            <span class="pill-value" style="text-transform:capitalize">{{ form.value.gender || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- ── Form Card ── -->
      <div class="form-card">
        <div class="card-header">
          <mat-icon class="card-header-icon">manage_accounts</mat-icon>
          <div>
            <h2 class="card-title">Personal Information</h2>
            <p class="card-subtitle">Keep your details up to date</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Identity section -->
          <div class="section-divider">
            <span class="section-label">Identity</span>
          </div>

          <div class="form-row-2">
            <div class="field-group">
              <label class="fl">First Name</label>
              <input class="fi" formControlName="firstName" placeholder="e.g. Ahmad" />
            </div>
            <div class="field-group">
              <label class="fl">Last Name</label>
              <input class="fi" formControlName="lastName" placeholder="e.g. Karimi" />
            </div>
          </div>

          <div class="field-group">
            <label class="fl">Phone Number</label>
            <input class="fi" formControlName="phone" placeholder="+966 5x xxx xxxx" />
          </div>

          <div class="form-row-2">
            <div class="field-group">
              <label class="fl">Date of Birth</label>
              <input class="fi" type="date" formControlName="dateOfBirth" />
            </div>
            <div class="field-group">
              <label class="fl">Gender</label>
              <select class="fi" formControlName="gender">
                <option value="">— Select —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div class="field-group">
            <label class="fl">Blood Type</label>
            <select class="fi" formControlName="bloodType">
              <option value="">— Select —</option>
              @for (bt of bloodTypes; track bt) {
                <option [value]="bt">{{ bt }}</option>
              }
            </select>
          </div>

          <!-- Location section -->
          <div class="section-divider">
            <span class="section-label">Location</span>
          </div>

          <div class="field-group">
            <label class="fl">Address</label>
            <textarea class="fi ta" formControlName="address" rows="3" placeholder="Street, City, Country"></textarea>
          </div>

          <!-- Save area -->
          @if (saving()) {
            <div class="saving-banner">
              <mat-icon>check_circle</mat-icon>
              Saving your changes…
            </div>
          }

          <button type="submit" class="save-btn" [disabled]="form.invalid || saving()">
            <mat-icon>save</mat-icon>
            {{ saving() ? 'Saving…' : 'Save Changes' }}
          </button>

        </form>
      </div>

    </div>
  `,
  styles: [`
    .profile-page {
      max-width: 780px;
      margin: 0 auto;
      padding: 0 0 48px;
    }

    /* ── Hero Strip ── */
    .hero-strip {
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #1e9df1, #1565c0);
      border-radius: 20px;
      min-height: 140px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      padding: 0 32px;
    }
    .hero-orb {
      position: absolute;
      left: -60px;
      top: -60px;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      filter: blur(32px);
      pointer-events: none;
    }
    .hero-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 24px;
    }
    .hero-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .hero-name {
      margin: 0;
      font-size: 1.7rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .hero-email {
      margin: 0;
      color: rgba(255,255,255,0.78);
      font-size: 0.88rem;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255,255,255,0.18);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 10px 3px 6px;
      border-radius: 20px;
      margin-top: 4px;
      width: fit-content;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .hero-avatar {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: white;
      color: #1565c0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 800;
      flex-shrink: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
      letter-spacing: -0.02em;
    }

    /* ── Info Strip ── */
    .info-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .info-pill {
      background: white;
      border-radius: 14px;
      border: 1.5px solid #e8edf3;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.05);
    }
    .pill-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      flex-shrink: 0;
    }
    .pill-icon.blood  { color: #e53e3e; }
    .pill-icon.dob    { color: #d69e2e; }
    .pill-icon.gender { color: #3182ce; }
    .pill-body {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }
    .pill-label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #a0aab4;
    }
    .pill-value {
      font-size: 0.92rem;
      font-weight: 700;
      color: #1a202c;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Form Card ── */
    .form-card {
      background: white;
      border-radius: 18px;
      border: 1.5px solid #e8edf3;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
      padding: 28px 32px 32px;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 26px;
      padding-bottom: 20px;
      border-bottom: 1.5px solid #f0f4f8;
    }
    .card-header-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #1e9df1;
    }
    .card-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a202c;
    }
    .card-subtitle {
      margin: 2px 0 0;
      font-size: 0.82rem;
      color: #72767a;
    }

    /* ── Section dividers ── */
    .section-divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 22px 0 14px;
    }
    .section-divider::before,
    .section-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e8edf3;
    }
    .section-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #a0aab4;
      white-space: nowrap;
    }

    /* ── Field helpers ── */
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 14px;
    }
    .fl {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #72767a;
      margin-bottom: 0;
    }
    .fi {
      padding: 11px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9rem;
      width: 100%;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: white;
      color: #1a202c;
      font-family: inherit;
      appearance: auto;
    }
    .fi:focus {
      border-color: #1e9df1;
      box-shadow: 0 0 0 3px rgba(30,157,241,0.12);
    }
    .fi::placeholder {
      color: #c0c8d0;
    }
    .ta {
      resize: vertical;
      min-height: 76px;
    }

    /* ── Saving banner ── */
    .saving-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f0fff4;
      border: 1.5px solid #9ae6b4;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.86rem;
      font-weight: 600;
      color: #276749;
      margin-bottom: 14px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #38a169; }
    }

    /* ── Save button ── */
    .save-btn {
      width: 100%;
      height: 46px;
      background: linear-gradient(135deg, #1e9df1, #1565c0);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: 0.01em;
      transition: opacity 0.2s, transform 0.15s;
      margin-top: 8px;
      font-family: inherit;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .save-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
    .save-btn:active:not(:disabled) { transform: translateY(0); }
    .save-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .profile-page { padding: 0 0 32px; }
      .hero-strip { padding: 0 20px; border-radius: 16px; }
      .hero-name { font-size: 1.3rem; }
      .hero-avatar { width: 60px; height: 60px; font-size: 1.4rem; }
      .info-strip { grid-template-columns: 1fr; }
      .form-card { padding: 20px 18px 24px; }
      .form-row-2 { grid-template-columns: 1fr; }
    }
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
