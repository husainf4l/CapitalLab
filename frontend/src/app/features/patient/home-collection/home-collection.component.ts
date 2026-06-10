import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HomeCollectionApiService } from '../../../core/api/home-collection-api.service';
import { HomeCollectionRequest } from '../../../core/models/home-collection.models';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';
import { AppStatusBadgeComponent } from '../../../shared/ui/app-status-badge/app-status-badge.component';
import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { ToastService } from '../../../core/services/toast.service';
import { CurrentPatientContextService } from '../../../core/services/current-patient-context.service';

@Component({
  selector: 'app-home-collection',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule, CommonModule,
    AppPageHeaderComponent, AppStatusBadgeComponent, AppEmptyStateComponent,
  ],
  template: `
    <div class="hc-page">
      <app-page-header title="Home Collection" subtitle="Request a nurse or technician to collect your sample at home" />

      <div class="hc-layout">
        <!-- Request Form -->
        <div class="hc-form-card">
          <h4>New Request</h4>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="hc-form">
            <mat-form-field appearance="outline">
              <mat-label>Full Address</mat-label>
              <textarea matInput rows="2" formControlName="address"></textarea>
              <mat-icon matSuffix>location_on</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <mat-select formControlName="city">
                @for (city of cities; track city) {
                  <mat-option [value]="city">{{ city }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Preferred Date</mat-label>
              <input matInput type="date" formControlName="preferredDate" [min]="today" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Preferred Time Slot</mat-label>
              <mat-select formControlName="preferredTimeSlot">
                @for (slot of timeSlots; track slot) {
                  <mat-option [value]="slot">{{ slot }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Notes (optional)</mat-label>
              <textarea matInput rows="2" formControlName="notes" placeholder="Any special instructions..."></textarea>
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
              <mat-icon>home</mat-icon>
              {{ submitting() ? 'Submitting...' : 'Request Collection' }}
            </button>
          </form>
        </div>

        <!-- Request List -->
        <div class="hc-list-card">
          <h4>My Requests</h4>
          @if (requests().length === 0) {
            <app-empty-state icon="home" title="No requests yet" description="Submit your first home collection request." />
          } @else {
            <div class="requests-list">
              @for (req of requests(); track req.id) {
                <div class="req-item">
                  <div class="req-icon">🏠</div>
                  <div class="req-info">
                    <p class="req-address">{{ req.address }}</p>
                    <p class="req-date">{{ req.preferredDate }} · {{ req.preferredTimeSlot }}</p>
                    <p class="req-tests">{{ req.tests?.length || 0 }} test(s)</p>
                  </div>
                  <div class="req-status">
                    <app-status-badge [status]="req.status" />
                    @if (req.status === 'requested') {
                      <button mat-icon-button color="warn" (click)="cancelRequest(req)" title="Cancel">
                        <mat-icon>cancel</mat-icon>
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
    @use '../../../../styles/variables' as *;
    .hc-layout { display: grid; grid-template-columns: 400px 1fr; gap: 24px;
      @media (max-width: 992px) { grid-template-columns: 1fr; }
    }
    .hc-form-card, .hc-list-card {
      background: white; border-radius: $border-radius; padding: 24px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      h4 { margin: 0 0 20px; }
    }
    .hc-form { display: flex; flex-direction: column; gap: 4px; }
    mat-form-field { width: 100%; }
    .requests-list { display: flex; flex-direction: column; gap: 12px; }
    .req-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: $gray-50; border-radius: $border-radius; }
    .req-icon { font-size: 1.5rem; }
    .req-info { flex: 1;
      p { margin: 0 0 2px; }
      .req-address { font-weight: 500; font-size: 0.875rem; }
      .req-date, .req-tests { font-size: 0.75rem; color: $text-secondary; }
    }
    .req-status { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
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

  cities = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina', 'Khobar'];
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
