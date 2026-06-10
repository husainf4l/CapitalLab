import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PatientTimelineEvent } from '../../../core/api/doctor-api.service';

const EVENT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  appointment: { icon: 'event',          color: '#4f46e5', label: 'Appointment' },
  sample:      { icon: 'colorize',       color: '#0d9488', label: 'Sample' },
  result:      { icon: 'science',        color: '#f59e0b', label: 'Result' },
  report:      { icon: 'description',    color: '#22c55e', label: 'Report' },
  review:      { icon: 'rate_review',    color: '#8b5cf6', label: 'Review' },
  note:        { icon: 'sticky_note_2',  color: '#64748b', label: 'Note' },
  follow_up:   { icon: 'schedule_send',  color: '#ef4444', label: 'Follow Up' },
};

@Component({
  selector: 'medical-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="timeline">
      @for (event of events(); track event.id) {
        <div class="tl-event">
          <div class="tl-marker">
            <div class="tl-icon" [style.background]="config(event.type).color + '20'" [style.color]="config(event.type).color">
              <mat-icon>{{ config(event.type).icon }}</mat-icon>
            </div>
            <div class="tl-line"></div>
          </div>
          <div class="tl-content">
            <div class="tl-header">
              <span class="tl-type" [style.color]="config(event.type).color">{{ config(event.type).label }}</span>
              <span class="tl-date">{{ event.date | date:'dd MMM yyyy, h:mm a' }}</span>
            </div>
            <div class="tl-title">{{ event.title }}</div>
            @if (event.description) {
              <div class="tl-desc">{{ event.description }}</div>
            }
            @if (event.status) {
              <span class="tl-status">{{ event.status }}</span>
            }
          </div>
        </div>
      }
      @if (events().length === 0) {
        <div class="tl-empty">No timeline events</div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .timeline { display: flex; flex-direction: column; }
    .tl-event { display: flex; gap: 14px; }
    .tl-marker { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
    .tl-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 1;
      mat-icon { font-size: 18px; }
    }
    .tl-line { flex: 1; width: 2px; background: $border-color; margin: 4px 0; min-height: 20px; }
    .tl-event:last-child .tl-line { display: none; }
    .tl-content { padding-bottom: 20px; flex: 1; min-width: 0; }
    .tl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .tl-type { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .tl-date { font-size: 0.72rem; color: $text-secondary; }
    .tl-title { font-weight: 600; font-size: 0.875rem; margin-bottom: 2px; }
    .tl-desc { font-size: 0.8rem; color: $text-secondary; }
    .tl-status { display: inline-block; margin-top: 4px; padding: 1px 8px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; background: $gray-100; color: $text-secondary; }
    .tl-empty { padding: 40px 0; text-align: center; color: $text-secondary; }
  `]
})
export class MedicalTimelineComponent {
  events = input.required<PatientTimelineEvent[]>();
  config(type: string) { return EVENT_CONFIG[type] ?? EVENT_CONFIG['note']; }
}
