import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Patient } from '../../../core/models/patient.models';

@Component({
  selector: 'patient-summary-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="summary-card">
      <div class="card-top">
        <div class="avatar">{{ initials() }}</div>
        <div class="patient-info">
          <h3>{{ patient().fullName }}</h3>
          <div class="meta-row">
            <span><mat-icon>cake</mat-icon>{{ patient().dateOfBirth | date:'dd MMM yyyy' }}</span>
            <span><mat-icon>{{ patient().gender === 'male' ? 'male' : 'female' }}</mat-icon>{{ patient().gender | titlecase }}</span>
            @if (patient().bloodType) {
              <span class="blood-type">{{ patient().bloodType }}</span>
            }
          </div>
        </div>
        @if (showActions()) {
          <button mat-icon-button (click)="viewTimeline.emit(patient().id)">
            <mat-icon>timeline</mat-icon>
          </button>
        }
      </div>
      <div class="card-body">
        <div class="detail-row"><mat-icon>phone</mat-icon>{{ patient().phone }}</div>
        @if (patient().email) {
          <div class="detail-row"><mat-icon>email</mat-icon>{{ patient().email }}</div>
        }
        @if (patient().nationalId) {
          <div class="detail-row"><mat-icon>badge</mat-icon>{{ patient().nationalId }}</div>
        }
        @if (patient().address) {
          <div class="detail-row"><mat-icon>location_on</mat-icon>{{ patient().address }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .summary-card { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 20px; box-shadow: $shadow-sm; }
    .card-top { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
    .patient-info { flex: 1; h3 { margin: 0 0 6px; font-size: 1rem; } }
    .meta-row { display: flex; gap: 12px; flex-wrap: wrap;
      span { display: flex; align-items: center; gap: 3px; font-size: 0.78rem; color: $text-secondary; mat-icon { font-size: 14px; } }
    }
    .blood-type { background: #fee2e2; color: #991b1b; padding: 1px 8px; border-radius: 999px; font-size: 0.72rem !important; font-weight: 700; }
    .card-body { display: flex; flex-direction: column; gap: 6px; border-top: 1px solid $border-color; padding-top: 14px; }
    .detail-row { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: $text-secondary; mat-icon { font-size: 16px; color: $gray-400; } }
  `]
})
export class PatientSummaryCardComponent {
  patient = input.required<Patient>();
  showActions = input<boolean>(false);
  viewTimeline = output<string>();

  initials(): string {
    const p = this.patient();
    return ((p.firstName?.charAt(0) ?? '') + (p.lastName?.charAt(0) ?? '')).toUpperCase();
  }
}
