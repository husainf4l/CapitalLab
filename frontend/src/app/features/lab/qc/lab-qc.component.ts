import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { LabQcStore } from '../stores/lab-qc.store';
import { SampleTimelineComponent } from '../shared/sample-timeline.component';

@Component({
  selector: 'app-lab-qc',
  standalone: true,
  imports: [
    FormsModule, CommonModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    SampleTimelineComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Quality Control</h2>
          <p class="sub">{{ store.queue().length }} samples pending review</p>
        </div>
        <button mat-icon-button (click)="store.load()"><mat-icon>refresh</mat-icon></button>
      </div>

      <div class="layout">
        <!-- Queue -->
        <div class="queue-panel">
          <div class="queue-header">QC Queue</div>
          @if (store.isLoading()) {
            <div class="loading-rows">
              @for (i of [1,2,3]; track i) { <div class="skel-row"></div> }
            </div>
          } @else if (store.queue().length === 0) {
            <div class="empty-state">
              <mat-icon>verified_user</mat-icon>
              <p>QC queue is empty</p>
              <span>All samples have been processed</span>
            </div>
          } @else {
            <div class="queue-list">
              @for (sample of store.queue(); track sample.id) {
                <div class="queue-item" [class.selected]="store.selectedSample()?.id === sample.id" (click)="store.openQc(sample)">
                  <div class="qi-num">{{ sample.sampleNumber || sample.id.slice(0, 10) }}</div>
                  <div class="qi-patient">{{ sample.patientName || '—' }}</div>
                  <div class="qi-meta">
                    <span class="type-tag">{{ sample.sampleType }}</span>
                    <span>{{ sample.collectedAt | date:'dd MMM HH:mm' }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- QC Form -->
        <div class="qc-form-panel">
          @if (!store.selectedSample()) {
            <div class="no-selection">
              <mat-icon>verified_user</mat-icon>
              <p>Select a sample from the queue to perform quality check</p>
            </div>
          } @else {
            <div class="qc-form">
              <div class="form-header">
                <div>
                  <h3>QC for Sample {{ store.selectedSample()!.sampleNumber || store.selectedSample()!.id.slice(0, 10) }}</h3>
                  <div class="form-sub">{{ store.selectedSample()!.patientName }} · {{ store.selectedSample()!.testName || '—' }}</div>
                </div>
                <button mat-icon-button (click)="store.closeQc()"><mat-icon>close</mat-icon></button>
              </div>

              <div class="timeline-wrap">
                <sample-timeline [status]="store.selectedSample()!.status" />
              </div>

              <div class="info-grid">
                <div class="info-item"><label>Sample Type</label><span>{{ store.selectedSample()!.sampleType }}</span></div>
                <div class="info-item"><label>Collected At</label><span>{{ store.selectedSample()!.collectedAt | date:'dd MMM HH:mm' }}</span></div>
                <div class="info-item"><label>Branch</label><span>{{ store.selectedSample()!.branchName || '—' }}</span></div>
                <div class="info-item"><label>Test</label><span>{{ store.selectedSample()!.testName || '—' }}</span></div>
              </div>

              <div class="decision-section">
                <h4>QC Decision</h4>
                <div class="decision-btns">
                  <button class="decision-btn pass" [class.selected]="decision() === 'pass'" (click)="decision.set('pass')">
                    <mat-icon>check_circle</mat-icon> Pass
                  </button>
                  <button class="decision-btn fail" [class.selected]="decision() === 'fail'" (click)="decision.set('fail')">
                    <mat-icon>cancel</mat-icon> Fail
                  </button>
                  <button class="decision-btn recollect" [class.selected]="decision() === 'recollect'" (click)="decision.set('recollect')">
                    <mat-icon>refresh</mat-icon> Recollect
                  </button>
                </div>

                <mat-form-field appearance="outline" class="notes-field">
                  <mat-label>Notes {{ decision() !== 'pass' ? '(required)' : '(optional)' }}</mat-label>
                  <textarea matInput [(ngModel)]="notes" rows="3" placeholder="Enter QC notes..."></textarea>
                </mat-form-field>

                @if (decision() === 'fail') {
                  <div class="fail-warning">
                    <mat-icon>warning</mat-icon>
                    Failing this sample will prevent results from being entered. The order may need a new sample collection.
                  </div>
                }

                <div class="submit-row">
                  <button mat-stroked-button (click)="store.closeQc()">Cancel</button>
                  <button mat-raised-button color="primary"
                    [disabled]="!decision() || (decision() !== 'pass' && !notes) || store.isSubmitting()"
                    (click)="submit()">
                    @if (store.isSubmitting()) {
                      <ng-container><mat-icon class="spin">refresh</mat-icon> Submitting...</ng-container>
                    } @else {
                      <ng-container><mat-icon>send</mat-icon> Submit QC</ng-container>
                    }
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h2 { margin: 0 0 4px; }
      .sub { margin: 0; font-size: 0.875rem; color: $text-secondary; }
    }

    .layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .queue-header { font-size: 0.85rem; font-weight: 600; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px; }

    .loading-rows { display: flex; flex-direction: column; gap: 8px; }
    .skel-row { height: 72px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; color: $text-secondary; text-align: center;
      mat-icon { font-size: 44px; color: #22c55e; margin-bottom: 8px; }
      p { margin: 0 0 4px; font-weight: 500; }
      span { font-size: 0.85rem; opacity: 0.7; }
    }

    .queue-list { display: flex; flex-direction: column; gap: 6px; }
    .queue-item {
      padding: 12px 14px; border-radius: $border-radius; border: 1px solid $border-color;
      background: white; cursor: pointer; transition: all 0.15s;
      &:hover { border-color: #f59e0b; }
      &.selected { border-color: #f59e0b; background: #fffbeb; }
    }
    .qi-num { font-family: monospace; font-size: 0.78rem; color: $text-secondary; }
    .qi-patient { font-weight: 600; font-size: 0.875rem; margin: 2px 0; }
    .qi-meta { display: flex; justify-content: space-between; font-size: 0.78rem; color: $text-secondary; margin-top: 4px; }
    .type-tag { background: $gray-100; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; }

    .qc-form-panel { background: white; border-radius: $border-radius; border: 1px solid $border-color; padding: 24px; }
    .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: $text-secondary; text-align: center;
      mat-icon { font-size: 52px; color: #f59e0b; margin-bottom: 12px; }
      p { margin: 0; max-width: 260px; }
    }

    .form-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
      h3 { margin: 0 0 4px; }
      .form-sub { font-size: 0.8rem; color: $text-secondary; }
    }
    .timeline-wrap { margin-bottom: 24px; overflow-x: auto; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
    .info-item { label { display: block; font-size: 0.75rem; color: $text-secondary; margin-bottom: 2px; } span { font-weight: 500; font-size: 0.875rem; } }

    .decision-section { h4 { font-size: 0.875rem; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 14px; } }
    .decision-btns { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .decision-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 20px; border-radius: $border-radius; border: 2px solid $border-color;
      background: white; cursor: pointer; font-size: 0.875rem; font-weight: 600;
      transition: all 0.15s; mat-icon { font-size: 18px; }
      &.pass:hover, &.pass.selected { border-color: #16a34a; background: #dcfce7; color: #15803d; }
      &.fail:hover, &.fail.selected { border-color: $danger; background: #fee2e2; color: $danger; }
      &.recollect:hover, &.recollect.selected { border-color: #f59e0b; background: #fef3c7; color: #b45309; }
    }

    .notes-field { width: 100%; }
    .fail-warning { display: flex; align-items: flex-start; gap: 8px; padding: 12px 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: $border-radius; color: #c2410c; font-size: 0.875rem; margin-bottom: 16px;
      mat-icon { font-size: 18px; flex-shrink: 0; }
    }
    .submit-row { display: flex; justify-content: flex-end; gap: 10px; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LabQcComponent implements OnInit {
  store = inject(LabQcStore);
  decision = signal<'pass' | 'fail' | 'recollect' | ''>('');
  notes = '';

  ngOnInit(): void { this.store.load(); }

  async submit(): Promise<void> {
    const sample = this.store.selectedSample();
    if (!sample || !this.decision()) return;

    const d = this.decision();
    await this.store.submitQc(sample.id, {
      status: d === 'pass' ? 'passed' : d === 'fail' ? 'failed' : 'recollect_required',
      notes: this.notes || undefined,
    });

    this.decision.set('');
    this.notes = '';
  }
}
