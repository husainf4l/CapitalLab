import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FollowUp, FollowUpStatus } from '../../../core/models/follow-up.models';

const STATUS_MAP: Record<FollowUpStatus, { label: string; cls: string }> = {
  pending:   { label: 'Pending',    cls: 'warning' },
  scheduled: { label: 'Scheduled',  cls: 'info' },
  completed: { label: 'Completed',  cls: 'success' },
  cancelled: { label: 'Cancelled',  cls: 'danger' },
};

@Component({
  selector: 'follow-up-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="fu-card" [class.overdue]="isOverdue()">
      <div class="fu-header">
        <div class="fu-info">
          <div class="fu-patient">{{ followUp().patientName || 'Patient' }}</div>
          <div class="fu-reason">{{ followUp().reason }}</div>
        </div>
        <span class="status-badge" [class]="statusCls()">{{ statusLabel() }}</span>
      </div>
      <div class="fu-meta">
        <span><mat-icon>calendar_today</mat-icon>{{ followUp().scheduledDate | date:'dd MMM yyyy' }}</span>
        @if (isOverdue()) { <span class="overdue-tag">Overdue</span> }
      </div>
      @if (followUp().notes) {
        <p class="fu-notes">{{ followUp().notes }}</p>
      }
      @if (followUp().status === 'pending' || followUp().status === 'scheduled') {
        <div class="fu-actions">
          <button mat-stroked-button class="btn-sm" color="primary" (click)="complete.emit(followUp().id)">
            <mat-icon>check</mat-icon> Complete
          </button>
          <button mat-stroked-button class="btn-sm" color="warn" (click)="cancel.emit(followUp().id)">
            <mat-icon>close</mat-icon> Cancel
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .fu-card { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 14px 16px; box-shadow: $shadow-sm;
      &.overdue { border-color: #fca5a5; background: #fff5f5; }
    }
    .fu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .fu-patient { font-weight: 600; font-size: 0.875rem; }
    .fu-reason { font-size: 0.8rem; color: $text-secondary; margin-top: 2px; }
    .status-badge { padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; white-space: nowrap;
      &.warning { background: #fef3c7; color: #92400e; }
      &.info    { background: #dbeafe; color: #1e40af; }
      &.success { background: #dcfce7; color: #166534; }
      &.danger  { background: #fee2e2; color: #991b1b; }
    }
    .fu-meta { display: flex; align-items: center; gap: 10px; font-size: 0.78rem; color: $text-secondary;
      span { display: flex; align-items: center; gap: 3px; mat-icon { font-size: 14px; } }
    }
    .overdue-tag { background: #fee2e2; color: $danger; padding: 1px 8px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
    .fu-notes { margin: 8px 0 0; font-size: 0.8rem; color: $text-secondary; }
    .fu-actions { display: flex; gap: 6px; margin-top: 10px; }
    .btn-sm { font-size: 0.78rem; line-height: 1.6; }
  `]
})
export class FollowUpCardComponent {
  followUp = input.required<FollowUp>();
  complete = output<string>();
  cancel = output<string>();

  statusLabel(): string { return STATUS_MAP[this.followUp().status]?.label ?? this.followUp().status; }
  statusCls(): string { return STATUS_MAP[this.followUp().status]?.cls ?? 'neutral'; }
  isOverdue(): boolean {
    if (this.followUp().status === 'completed' || this.followUp().status === 'cancelled') return false;
    return new Date(this.followUp().scheduledDate) < new Date();
  }
}
