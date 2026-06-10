import { Component, input, computed } from '@angular/core';
import { AppBadgeComponent, BadgeVariant } from '../app-badge/app-badge.component';

type StatusMap = Record<string, { label: string; variant: BadgeVariant }>;

const STATUS_MAP: StatusMap = {
  // Appointments
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  no_show: { label: 'No Show', variant: 'neutral' },
  // Results
  released: { label: 'Released', variant: 'success' },
  reviewed: { label: 'Reviewed', variant: 'primary' },
  partial: { label: 'Partial', variant: 'warning' },
  // Samples
  collected: { label: 'Collected', variant: 'info' },
  processing: { label: 'Processing', variant: 'warning' },
  // Home Collection
  requested: { label: 'Requested', variant: 'info' },
  assigned: { label: 'Assigned', variant: 'primary' },
  delivered: { label: 'Delivered', variant: 'success' },
  // General
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'neutral' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [AppBadgeComponent],
  template: `
    <app-badge [variant]="config().variant">{{ config().label }}</app-badge>
  `
})
export class AppStatusBadgeComponent {
  status = input.required<string>();

  config = computed(() => {
    return STATUS_MAP[this.status().toLowerCase()] ?? { label: this.status(), variant: 'neutral' as BadgeVariant };
  });
}
