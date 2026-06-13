import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HomeCollectionApiService } from '../../../core/api/home-collection-api.service';
import { HomeCollectionRequest } from '../../../core/models/home-collection.models';
import { ToastService } from '../../../core/services/toast.service';
import { CurrentPatientContextService } from '../../../core/services/current-patient-context.service';

@Component({
  selector: 'app-home-collection',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatInputModule, MatIconModule, CommonModule,
  ],
  template: `
    <div class="hc-page">

      <!-- Hero Strip -->
      <div class="hc-hero">
        <div class="hero-left">
          <div class="hero-icon-circle">
            <mat-icon>home</mat-icon>
          </div>
          <div class="hero-text">
            <h1>Home Collection</h1>
            <p>Our certified phlebotomists come to you</p>
          </div>
        </div>
        <div class="hero-pills">
          <span class="hero-pill"><span class="pill-check">✓</span> 7 days a week</span>
          <span class="hero-pill"><span class="pill-check">✓</span> Results in 24h</span>
          <span class="hero-pill"><span class="pill-check">✓</span> Certified team</span>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="hc-layout">

        <!-- Form Card -->
        <div class="hc-form-card">
          <div class="card-title">
            <mat-icon class="card-title-icon">calendar_today</mat-icon>
            <span>Schedule a Collection</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="hc-form">

            <!-- City selector -->
            <div class="field-group">
              <label class="field-label">
                <mat-icon class="label-icon">location_city</mat-icon>
                City
              </label>
              <div class="city-pills">
                @for (city of cities; track city) {
                  <button
                    type="button"
                    class="city-pill"
                    [class.active]="form.get('city')?.value === city"
                    (click)="form.get('city')?.setValue(city)">
                    {{ city }}
                  </button>
                }
              </div>
            </div>

            <!-- Address -->
            <div class="field-group">
              <label class="field-label">
                <mat-icon class="label-icon">location_on</mat-icon>
                Address
              </label>
              <textarea
                formControlName="address"
                rows="3"
                class="native-input"
                placeholder="Enter your full address..."></textarea>
            </div>

            <!-- Preferred Date -->
            <div class="field-group">
              <label class="field-label">
                <mat-icon class="label-icon">event</mat-icon>
                Preferred Date
              </label>
              <input
                type="date"
                formControlName="preferredDate"
                [min]="today"
                class="native-input" />
            </div>

            <!-- Time Slot -->
            <div class="field-group">
              <label class="field-label">
                <mat-icon class="label-icon">schedule</mat-icon>
                Time Slot
              </label>
              <div class="time-slots-grid">
                @for (slot of timeSlots; track slot) {
                  <div
                    class="time-slot-card"
                    [class.active]="form.get('preferredTimeSlot')?.value === slot"
                    (click)="form.get('preferredTimeSlot')?.setValue(slot)">
                    <mat-icon class="slot-icon">access_time</mat-icon>
                    <span class="slot-text">{{ slot }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Notes -->
            <div class="field-group">
              <label class="field-label">
                <mat-icon class="label-icon">notes</mat-icon>
                Notes <span class="optional-tag">(optional)</span>
              </label>
              <textarea
                formControlName="notes"
                rows="2"
                class="native-input"
                placeholder="Any special instructions..."></textarea>
            </div>

            <button type="submit" class="submit-btn" [disabled]="form.invalid || submitting()">
              <mat-icon>home</mat-icon>
              {{ submitting() ? 'Submitting...' : 'Request Collection' }}
            </button>
          </form>
        </div>

        <!-- Requests List Card -->
        <div class="hc-list-card">
          <div class="card-title">
            <mat-icon class="card-title-icon">list_alt</mat-icon>
            <span>My Requests</span>
          </div>

          @if (requests().length === 0) {
            <div class="empty-state">
              <div class="empty-icon-circle">
                <mat-icon>home</mat-icon>
              </div>
              <p class="empty-title">No requests yet</p>
              <p class="empty-sub">Your collection history will appear here</p>
            </div>
          } @else {
            <div class="requests-list">
              @for (req of requests(); track req.id) {
                <div class="req-item" [class]="'status-' + req.status">
                  <div class="req-icon-badge">
                    <mat-icon>home</mat-icon>
                  </div>
                  <div class="req-info">
                    <p class="req-address">{{ req.address }}</p>
                    <p class="req-meta">
                      <mat-icon class="meta-icon">event</mat-icon>
                      {{ req.preferredDate }}
                      <span class="meta-sep">·</span>
                      <mat-icon class="meta-icon">schedule</mat-icon>
                      {{ req.preferredTimeSlot }}
                    </p>
                    <span class="tests-pill">{{ req.tests.length }} test(s)</span>
                  </div>
                  <div class="req-right">
                    <span class="status-chip" [class]="'chip-' + req.status">{{ req.status }}</span>
                    @if (req.status === 'requested') {
                      <button
                        type="button"
                        class="cancel-btn"
                        aria-label="Cancel home collection request"
                        title="Cancel"
                        (click)="cancelRequest(req)">
                        <mat-icon>close</mat-icon>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .hc-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ── Hero Strip ── */
    .hc-hero {
      background: linear-gradient(135deg, #1e9df1 0%, #1565c0 100%);
      padding: 28px 32px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }

    .hero-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .hero-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        color: white;
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
    }

    .hero-text {
      h1 {
        margin: 0 0 4px;
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        line-height: 1.2;
      }
      p {
        margin: 0;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.85);
      }
    }

    .hero-pills {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .hero-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.18);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .pill-check {
      color: #a5f3a5;
      font-weight: 700;
    }

    /* ── Two-column Layout ── */
    .hc-layout {
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 24px;

      @media (max-width: 1024px) {
        grid-template-columns: minmax(0, 380px) 1fr;
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    /* ── Shared Card ── */
    .hc-form-card,
    .hc-list-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      font-size: 1rem;
      font-weight: 600;
      color: #1a202c;
    }

    .card-title-icon {
      color: #1e9df1;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* ── Form ── */
    .hc-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #4a5568;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .label-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
      color: #1e9df1;
    }

    .optional-tag {
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
      color: #a0aec0;
    }

    /* Native input styles */
    .native-input {
      padding: 11px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.875rem;
      width: 100%;
      box-sizing: border-box;
      outline: none;
      background: white;
      font-family: inherit;
      color: #1a202c;
      resize: vertical;
      transition: border-color 0.15s, box-shadow 0.15s;

      &:focus {
        border-color: #1e9df1;
        box-shadow: 0 0 0 3px rgba(30, 157, 241, 0.12);
      }

      &::placeholder {
        color: #a0aec0;
      }
    }

    /* City pill toggles */
    .city-pills {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      flex-wrap: nowrap;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .city-pill {
      padding: 7px 16px;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
      background: white;
      color: #4a5568;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.15s;
      font-family: inherit;

      &:hover {
        border-color: #1e9df1;
        color: #1e9df1;
      }

      &.active {
        background: #1e9df1;
        border-color: #1e9df1;
        color: white;
      }
    }

    /* Time slot grid */
    .time-slots-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .time-slot-card {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s;
      background: white;

      &:hover {
        border-color: #1e9df1;
        background: rgba(30, 157, 241, 0.04);
      }

      &.active {
        border-color: #1e9df1;
        background: rgba(30, 157, 241, 0.08);

        .slot-icon,
        .slot-text {
          color: #1565c0;
        }
      }
    }

    .slot-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #a0aec0;
      flex-shrink: 0;
      transition: color 0.15s;
    }

    .slot-text {
      font-size: 0.78rem;
      font-weight: 500;
      color: #4a5568;
      line-height: 1.3;
      transition: color 0.15s;
    }

    /* Submit button */
    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 46px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #1e9df1 0%, #1565c0 100%);
      color: white;
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.15s, transform 0.1s;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    /* ── Requests List ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(30, 157, 241, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;

      mat-icon {
        color: #1e9df1;
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
    }

    .empty-title {
      margin: 0 0 6px;
      font-size: 1rem;
      font-weight: 700;
      color: #1a202c;
    }

    .empty-sub {
      margin: 0;
      font-size: 0.85rem;
      color: #718096;
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .req-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 14px 14px 18px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #a0aec0;
      background: #fafafa;
      transition: box-shadow 0.15s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
      }

      &.status-requested {
        border-left-color: #1e9df1;
      }

      &.status-completed {
        border-left-color: #38a169;
      }

      &.status-cancelled {
        border-left-color: #e53e3e;
        opacity: 0.7;
      }
    }

    .req-icon-badge {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(30, 157, 241, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        color: #1e9df1;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .req-info {
      flex: 1;
      min-width: 0;
    }

    .req-address {
      margin: 0 0 4px;
      font-weight: 600;
      font-size: 0.875rem;
      color: #1a202c;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .req-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 0 6px;
      font-size: 0.76rem;
      color: #718096;
    }

    .meta-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      color: #a0aec0;
    }

    .meta-sep {
      margin: 0 2px;
      color: #cbd5e0;
    }

    .tests-pill {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      background: #edf2f7;
      color: #4a5568;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .req-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      flex-shrink: 0;
    }

    .status-chip {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: capitalize;
      background: #e2e8f0;
      color: #4a5568;

      &.chip-requested {
        background: rgba(30, 157, 241, 0.12);
        color: #1565c0;
      }

      &.chip-completed {
        background: rgba(56, 161, 105, 0.12);
        color: #276749;
      }

      &.chip-cancelled {
        background: rgba(229, 62, 62, 0.1);
        color: #c53030;
      }
    }

    .cancel-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid #fed7d7;
      background: #fff5f5;
      color: #e53e3e;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
      padding: 0;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      &:hover {
        background: #fed7d7;
      }
    }
  `]
})
export class HomeCollectionComponent implements OnInit {
  private hcApi = inject(HomeCollectionApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private ctx = inject(CurrentPatientContextService);

  requests = signal<HomeCollectionRequest[]>([]);
  submitting = signal(false);
  today = new Date().toISOString().split('T')[0];

  cities = ['Amman', 'Irbid', 'Zarqa', 'Aqaba', 'Zarqa', 'Karak'];
  timeSlots = ['7:00 AM – 9:00 AM', '9:00 AM – 11:00 AM', '11:00 AM – 1:00 PM', '1:00 PM – 3:00 PM', '3:00 PM – 5:00 PM'];

  form = this.fb.group({
    address: ['', Validators.required],
    city: ['', Validators.required],
    preferredDate: ['', Validators.required],
    preferredTimeSlot: ['', Validators.required],
    notes: [''],
  });

  ngOnInit(): void {
    this.ctx.load();
    this.hcApi.getMyRequests().subscribe({
      next: res => this.requests.set(res.data?.items ?? []),
      error: () => {},
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const { address, city, preferredDate, preferredTimeSlot, notes } = this.form.value;
    this.hcApi.create({
      patientId: this.ctx.patientId(),
      address: address!,
      city: city!,
      preferredDate: preferredDate!,
      preferredTimeSlot: preferredTimeSlot!,
      testIds: [],
      notes: notes ?? undefined,
    }).subscribe({
      next: res => {
        this.requests.update(list => [res.data, ...list]);
        this.toast.success('Home collection request submitted!');
        this.form.reset();
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  cancelRequest(req: HomeCollectionRequest): void {
    this.hcApi.cancel(req.id).subscribe({
      next: () => {
        this.requests.update(list => list.map(r => r.id === req.id ? { ...r, status: 'cancelled' as const } : r));
        this.toast.success('Request cancelled.');
      },
      error: () => {},
    });
  }
}
