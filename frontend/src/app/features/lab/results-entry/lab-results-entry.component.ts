import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { LabResultsEntryStore } from '../stores/lab-results-entry.store';
import { LabStatusBadgeComponent } from '../shared/lab-status-badge.component';
import { SampleTimelineComponent } from '../shared/sample-timeline.component';

@Component({
  selector: 'app-lab-results-entry',
  standalone: true,
  imports: [
    FormsModule, CommonModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    LabStatusBadgeComponent, SampleTimelineComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Results Entry</h2>
          <p class="sub">QC-passed samples ready for results</p>
        </div>
        <button mat-icon-button (click)="store.load()"><mat-icon>refresh</mat-icon></button>
      </div>

      <div class="layout">
        <!-- Samples list -->
        <div class="samples-panel">
          <div class="panel-label">Ready Samples</div>
          @if (store.isLoading()) {
            <div class="loading-rows">
              @for (i of [1,2,3]; track i) { <div class="skel-row"></div> }
            </div>
          } @else if (store.samples().length === 0) {
            <div class="empty-state"><mat-icon>science</mat-icon><p>No samples ready</p></div>
          } @else {
            <div class="sample-list">
              @for (sample of store.samples(); track sample.id) {
                <div class="sample-item" [class.selected]="store.selectedSample()?.id === sample.id" (click)="store.selectSample(sample)">
                  <div class="si-top">
                    <span class="si-num">{{ sample.sampleNumber || sample.id.slice(0, 10) }}</span>
                    <lab-status-badge [status]="sample.status" />
                  </div>
                  <div class="si-patient">{{ sample.patientName || '—' }}</div>
                  <div class="si-test">{{ sample.testName || '—' }}</div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Results entry form -->
        <div class="entry-panel">
          @if (!store.selectedSample()) {
            <div class="no-selection">
              <mat-icon>edit_note</mat-icon>
              <p>Select a sample to enter results</p>
            </div>
          } @else {
            <div class="entry-form">
              <div class="form-header">
                <div>
                  <h3>{{ store.selectedSample()!.testName || 'Test Results' }}</h3>
                  <div class="form-sub">{{ store.selectedSample()!.patientName }} · {{ store.selectedSample()!.sampleNumber }}</div>
                </div>
                @if (store.hasCritical()) {
                  <div class="critical-flag"><mat-icon>priority_high</mat-icon> Critical Values Detected</div>
                }
              </div>

              <div class="timeline-wrap">
                <sample-timeline [status]="store.selectedSample()!.status" />
              </div>

              <!-- Result entries -->
              @if (store.results().length === 0) {
                <div class="loading-rows">
                  @for (i of [1,2]; track i) { <div class="skel-row tall"></div> }
                </div>
              } @else {
                @for (entry of store.results(); track $index) {
                  <div class="result-card" [class.critical]="entry.isCritical" [class.dirty]="entry.isDirty">
                    <div class="result-card-header">
                      <span class="test-label">{{ entry.testName || store.selectedSample()!.testName }}</span>
                      @if (entry.isDirty) { <span class="unsaved-chip">Unsaved</span> }
                      @if (entry.isCritical) { <span class="critical-chip"><mat-icon>warning</mat-icon> Critical</span> }
                    </div>

                    <div class="result-fields">
                      <mat-form-field appearance="outline">
                        <mat-label>Value</mat-label>
                        <input matInput [ngModel]="entry.value" (ngModelChange)="store.updateEntry($index, 'value', $event)" placeholder="e.g. 5.4" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Unit</mat-label>
                        <input matInput [ngModel]="entry.unit" (ngModelChange)="store.updateEntry($index, 'unit', $event)" placeholder="e.g. mmol/L" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Reference Range</mat-label>
                        <input matInput [ngModel]="entry.referenceRange" (ngModelChange)="store.updateEntry($index, 'referenceRange', $event)" placeholder="e.g. 3.9 – 6.1" />
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Interpretation</mat-label>
                        <mat-select [ngModel]="entry.interpretation" (ngModelChange)="store.updateEntry($index, 'interpretation', $event)">
                          <mat-option value="">— Select —</mat-option>
                          <mat-option value="normal">Normal</mat-option>
                          <mat-option value="high">High</mat-option>
                          <mat-option value="low">Low</mat-option>
                          <mat-option value="critical">Critical</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="notes-field">
                      <mat-label>Clinical Notes</mat-label>
                      <textarea matInput [ngModel]="entry.notes" (ngModelChange)="store.updateEntry($index, 'notes', $event)" rows="2"></textarea>
                    </mat-form-field>

                    @if (entry.isDirty) {
                      <div class="save-row">
                        <button mat-stroked-button class="btn-sm" [disabled]="store.isSaving()" (click)="saveDraft($index)">
                          <mat-icon>save</mat-icon> Save Draft
                        </button>
                      </div>
                    }
                  </div>
                }

                @if (store.hasCritical()) {
                  <div class="critical-warning">
                    <mat-icon>warning</mat-icon>
                    <div>
                      <strong>Critical values detected.</strong>
                      <p>These results must be communicated to the clinician before submission.</p>
                    </div>
                  </div>
                }

                <div class="submit-section">
                  <button mat-raised-button color="primary" [disabled]="store.isSaving() || store.results().length === 0" (click)="submitAll()">
                    @if (store.isSaving()) {
                      <ng-container><mat-icon class="spin">refresh</mat-icon> Submitting...</ng-container>
                    } @else {
                      <ng-container><mat-icon>send</mat-icon> Submit for Doctor Review</ng-container>
                    }
                  </button>
                  @if (submitSuccess) { <div class="success-banner"><mat-icon>check_circle</mat-icon> Results submitted successfully</div> }
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

    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
      h2 { margin: 0 0 4px; } .sub { margin: 0; font-size: 0.875rem; color: $text-secondary; }
    }

    .layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .panel-label { font-size: 0.85rem; font-weight: 600; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px; }

    .loading-rows { display: flex; flex-direction: column; gap: 8px; }
    .skel-row { height: 64px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;
      &.tall { height: 160px; }
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px 0; color: $text-secondary;
      mat-icon { font-size: 40px; opacity: 0.4; margin-bottom: 8px; } p { margin: 0; }
    }
    .sample-list { display: flex; flex-direction: column; gap: 6px; }
    .sample-item {
      padding: 12px 14px; border-radius: $border-radius; border: 1px solid $border-color;
      background: white; cursor: pointer; transition: all 0.15s;
      &:hover { border-color: $primary; }
      &.selected { border-color: $primary; background: #eff6ff; }
    }
    .si-top { display: flex; justify-content: space-between; align-items: center; }
    .si-num { font-family: monospace; font-size: 0.78rem; color: $text-secondary; }
    .si-patient { font-weight: 600; font-size: 0.875rem; margin: 4px 0 2px; }
    .si-test { font-size: 0.78rem; color: $text-secondary; }

    .entry-panel { background: white; border-radius: $border-radius; border: 1px solid $border-color; padding: 24px; }
    .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: $text-secondary;
      mat-icon { font-size: 52px; opacity: 0.3; margin-bottom: 12px; }
    }

    .form-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
      h3 { margin: 0 0 4px; } .form-sub { font-size: 0.8rem; color: $text-secondary; }
    }
    .critical-flag { display: flex; align-items: center; gap: 4px; padding: 6px 12px; background: #7f1d1d; color: white; border-radius: 999px; font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 16px; }
    }

    .timeline-wrap { margin-bottom: 24px; overflow-x: auto; }

    .result-card {
      border: 1px solid $border-color; border-radius: $border-radius; padding: 16px; margin-bottom: 16px; transition: border-color 0.2s;
      &.critical { border-color: #fca5a5; background: #fff5f5; }
      &.dirty { border-color: #fbbf24; }
    }
    .result-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .test-label { font-weight: 600; font-size: 0.9rem; flex: 1; }
    .unsaved-chip { padding: 2px 8px; border-radius: 999px; background: #fef3c7; color: #92400e; font-size: 0.72rem; font-weight: 600; }
    .critical-chip { display: flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 999px; background: #7f1d1d; color: white; font-size: 0.72rem; font-weight: 600;
      mat-icon { font-size: 12px; }
    }

    .result-fields { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }
    .notes-field { width: 100%; }
    .save-row { display: flex; justify-content: flex-end; }
    .btn-sm { font-size: 0.78rem; }

    .critical-warning { display: flex; gap: 10px; padding: 14px 16px; background: #fff5f5; border: 1px solid #fca5a5; border-radius: $border-radius; margin-bottom: 16px;
      mat-icon { color: $danger; flex-shrink: 0; }
      strong { display: block; color: $danger; margin-bottom: 4px; }
      p { margin: 0; font-size: 0.875rem; color: #7f1d1d; }
    }

    .submit-section { display: flex; align-items: center; gap: 16px; padding-top: 16px; border-top: 1px solid $border-color; }
    .success-banner { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #dcfce7; color: #166534; border-radius: $border-radius; font-size: 0.875rem; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LabResultsEntryComponent implements OnInit {
  store = inject(LabResultsEntryStore);
  submitSuccess = false;

  ngOnInit(): void { this.store.load(); }

  async saveDraft(index: number): Promise<void> {
    await this.store.saveDraft(index);
  }

  async submitAll(): Promise<void> {
    const ok = await this.store.submitAll();
    if (ok) {
      this.submitSuccess = true;
      setTimeout(() => { this.submitSuccess = false; }, 4000);
    }
  }
}
