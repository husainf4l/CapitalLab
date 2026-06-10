import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SampleStatus } from '../../../core/models/sample.models';

interface TimelineStep {
  key: SampleStatus;
  label: string;
  icon: string;
}

const STEPS: TimelineStep[] = [
  { key: 'pending_collection', label: 'Pending', icon: 'schedule' },
  { key: 'collected',          label: 'Collected', icon: 'colorize' },
  { key: 'received',           label: 'Received', icon: 'input' },
  { key: 'processing',         label: 'Processing', icon: 'autorenew' },
  { key: 'qc_pending',         label: 'QC Check', icon: 'verified_user' },
  { key: 'qc_passed',          label: 'QC Passed', icon: 'check_circle' },
  { key: 'results_pending',    label: 'Results', icon: 'science' },
  { key: 'completed',          label: 'Complete', icon: 'task_alt' },
];

const STATUS_ORDER: Record<string, number> = {
  pending_collection: 0,
  collected: 1,
  received: 2,
  processing: 3,
  qc_pending: 4,
  qc_passed: 5,
  qc_failed: 5,
  results_pending: 6,
  completed: 7,
};

@Component({
  selector: 'sample-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="timeline">
      @for (step of steps; track step.key) {
        <div class="tl-step" [class.done]="isDone(step.key)" [class.active]="isActive(step.key)" [class.failed]="isFailed(step.key)">
          <div class="tl-dot">
            <mat-icon>{{ isDone(step.key) || isFailed(step.key) ? (isFailed(step.key) ? 'close' : 'check') : step.icon }}</mat-icon>
          </div>
          <span class="tl-label">{{ step.label }}</span>
          @if (!isLast(step)) {
            <div class="tl-line" [class.done]="isDone(step.key)"></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .timeline { display: flex; align-items: flex-start; gap: 0; overflow-x: auto; padding: 8px 0; }
    .tl-step { display: flex; flex-direction: column; align-items: center; position: relative; min-width: 60px; }
    .tl-dot {
      width: 32px; height: 32px; border-radius: 50%; border: 2px solid $border-color;
      background: white; display: flex; align-items: center; justify-content: center; z-index: 1;
      mat-icon { font-size: 16px; color: $gray-400; }
      .done > & { border-color: $success; background: $success; mat-icon { color: white; } }
      .active > & { border-color: $primary; background: $primary; mat-icon { color: white; } }
      .failed > & { border-color: $danger; background: $danger; mat-icon { color: white; } }
    }
    .tl-label { font-size: 0.65rem; color: $text-secondary; margin-top: 4px; text-align: center; white-space: nowrap; }
    .tl-line { position: absolute; top: 15px; left: 50%; width: 60px; height: 2px; background: $border-color; z-index: 0; &.done { background: $success; } }
  `]
})
export class SampleTimelineComponent {
  status = input.required<string>();
  readonly steps = STEPS;

  currentOrder = computed(() => STATUS_ORDER[this.status()] ?? 0);

  isDone(key: string): boolean {
    return STATUS_ORDER[key] < this.currentOrder();
  }

  isActive(key: string): boolean {
    return STATUS_ORDER[key] === this.currentOrder() && this.status() !== 'qc_failed';
  }

  isFailed(key: string): boolean {
    return this.status() === 'qc_failed' && key === 'qc_pending';
  }

  isLast(step: TimelineStep): boolean {
    return step.key === STEPS[STEPS.length - 1].key;
  }
}
