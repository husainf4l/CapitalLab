import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  // Appointment
  pending:          { label: 'Pending',      cls: 'warning' },
  confirmed:        { label: 'Confirmed',    cls: 'info' },
  completed:        { label: 'Completed',    cls: 'success' },
  cancelled:        { label: 'Cancelled',    cls: 'danger' },
  no_show:          { label: 'No Show',      cls: 'danger' },
  in_progress:      { label: 'In Progress',  cls: 'info' },
  // Order
  processing:       { label: 'Processing',   cls: 'info' },
  sample_collected: { label: 'Collected',    cls: 'info' },
  // Sample
  pending_collection: { label: 'Pending',    cls: 'warning' },
  collected:        { label: 'Collected',    cls: 'info' },
  received:         { label: 'Received',     cls: 'info' },
  qc_pending:       { label: 'QC Pending',   cls: 'warning' },
  qc_passed:        { label: 'QC Passed',    cls: 'success' },
  qc_failed:        { label: 'QC Failed',    cls: 'danger' },
  results_pending:  { label: 'Results',      cls: 'warning' },
  stored:           { label: 'Stored',       cls: 'neutral' },
  disposed:         { label: 'Disposed',     cls: 'neutral' },
  // Result
  partial:          { label: 'Partial',      cls: 'warning' },
  reviewed:         { label: 'Under Review', cls: 'info' },
  released:         { label: 'Released',     cls: 'success' },
  // Review
  approved:         { label: 'Approved',     cls: 'success' },
  retest_requested: { label: 'Retest',       cls: 'danger' },
  rejected:         { label: 'Rejected',     cls: 'danger' },
  // Interpretation
  normal:           { label: 'Normal',       cls: 'success' },
  high:             { label: 'High',         cls: 'danger' },
  low:              { label: 'Low',          cls: 'warning' },
  critical:         { label: 'Critical',     cls: 'critical' },
};

@Component({
  selector: 'lab-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [class]="badgeCls()">{{ badgeLabel() }}</span>`,
  styles: [`
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
    .warning  { background: #fef3c7; color: #92400e; }
    .info     { background: #dbeafe; color: #1e40af; }
    .success  { background: #dcfce7; color: #166534; }
    .danger   { background: #fee2e2; color: #991b1b; }
    .critical { background: #7f1d1d; color: #fff; }
    .neutral  { background: #f3f4f6; color: #6b7280; }
  `]
})
export class LabStatusBadgeComponent {
  status = input.required<string>();
  badgeCls = computed(() => STATUS_MAP[this.status()]?.cls ?? 'neutral');
  badgeLabel = computed(() => STATUS_MAP[this.status()]?.label ?? this.status());
}
