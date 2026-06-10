import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { LabSamplesStore } from '../stores/lab-samples.store';
import { LabStatusBadgeComponent } from '../shared/lab-status-badge.component';
import { SampleTimelineComponent } from '../shared/sample-timeline.component';
import { Sample } from '../../../core/models/sample.models';

@Component({
  selector: 'app-lab-samples',
  standalone: true,
  imports: [
    FormsModule, CommonModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    LabStatusBadgeComponent, SampleTimelineComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Samples</h2>
        <button mat-icon-button (click)="store.load()"><mat-icon>refresh</mat-icon></button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search sample / patient</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [ngModel]="store.searchTerm()" (ngModelChange)="store.searchTerm.set($event); store.load()" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [ngModel]="store.filterStatus()" (ngModelChange)="store.filterStatus.set($event); store.load()">
            <mat-option value="">All</mat-option>
            <mat-option value="pending_collection">Pending Collection</mat-option>
            <mat-option value="collected">Collected</mat-option>
            <mat-option value="received">Received</mat-option>
            <mat-option value="processing">Processing</mat-option>
            <mat-option value="qc_pending">QC Pending</mat-option>
            <mat-option value="qc_passed">QC Passed</mat-option>
            <mat-option value="qc_failed">QC Failed</mat-option>
            <mat-option value="results_pending">Results Pending</mat-option>
            <mat-option value="completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select [ngModel]="store.filterType()" (ngModelChange)="store.filterType.set($event); store.load()">
            <mat-option value="">All Types</mat-option>
            <mat-option value="blood">Blood</mat-option>
            <mat-option value="urine">Urine</mat-option>
            <mat-option value="serum">Serum</mat-option>
            <mat-option value="swab">Swab</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="layout">
        <!-- Sample list -->
        <div class="samples-panel">
          @if (store.isLoading()) {
            <div class="loading-rows">
              @for (i of [1,2,3,4]; track i) { <div class="skel-row"></div> }
            </div>
          } @else if (store.samples().length === 0) {
            <div class="empty-state"><mat-icon>science</mat-icon><p>No samples found</p></div>
          } @else {
            <div class="sample-list">
              @for (sample of store.samples(); track sample.id) {
                <div class="sample-item" [class.selected]="store.selectedSample()?.id === sample.id" (click)="store.selectSample(sample)">
                  <div class="si-top">
                    <span class="si-num">{{ sample.sampleNumber || sample.id.slice(0, 8) }}</span>
                    <lab-status-badge [status]="sample.status" />
                  </div>
                  <div class="si-patient">{{ sample.patientName || '—' }}</div>
                  <div class="si-meta">
                    <span class="type-tag">{{ sample.sampleType }}</span>
                    <span>{{ sample.collectedAt | date:'dd MMM HH:mm' }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Sample detail -->
        <div class="detail-panel">
          @if (!store.selectedSample()) {
            <div class="no-selection"><mat-icon>touch_app</mat-icon><p>Select a sample to view details and actions</p></div>
          } @else {
            <div class="sample-detail">
              <div class="detail-header">
                <div>
                  <h3>Sample {{ store.selectedSample()!.sampleNumber || store.selectedSample()!.id.slice(0, 8) }}</h3>
                  <div class="detail-sub">{{ store.selectedSample()!.sampleType }} · {{ store.selectedSample()!.testName || '—' }}</div>
                </div>
                <lab-status-badge [status]="store.selectedSample()!.status" />
              </div>

              <!-- Timeline -->
              <div class="timeline-wrap">
                <sample-timeline [status]="store.selectedSample()!.status" />
              </div>

              <!-- Info -->
              <div class="info-grid">
                <div class="info-item"><label>Patient</label><span>{{ store.selectedSample()!.patientName || '—' }}</span></div>
                <div class="info-item"><label>Branch</label><span>{{ store.selectedSample()!.branchName || '—' }}</span></div>
                <div class="info-item"><label>Collected</label><span>{{ store.selectedSample()!.collectedAt | date:'dd MMM yyyy HH:mm' }}</span></div>
                <div class="info-item"><label>Received</label><span>{{ store.selectedSample()!.receivedAt | date:'dd MMM yyyy HH:mm' }}</span></div>
              </div>

              <!-- Actions -->
              <div class="actions-section">
                <h4>Workflow Actions</h4>
                <div class="action-row">
                  @if (store.selectedSample()!.status === 'pending_collection') {
                    <button mat-raised-button color="primary" [disabled]="!!store.isActing()" (click)="collect()">
                      <mat-icon>colorize</mat-icon> Collect Sample
                    </button>
                  }
                  @if (store.selectedSample()!.status === 'collected') {
                    <button mat-raised-button color="primary" [disabled]="!!store.isActing()" (click)="receive()">
                      <mat-icon>input</mat-icon> Mark Received
                    </button>
                  }
                  @if (store.selectedSample()!.status === 'received') {
                    <button mat-raised-button color="primary" [disabled]="!!store.isActing()" (click)="startProcessing()">
                      <mat-icon>autorenew</mat-icon> Start Processing
                    </button>
                  }
                  @if (store.selectedSample()!.status === 'processing') {
                    <button mat-raised-button color="accent" [disabled]="!!store.isActing()" (click)="completeProcessing()">
                      <mat-icon>done</mat-icon> Complete Processing
                    </button>
                  }
                  @if (!!store.isActing()) {
                    <mat-icon class="spin">refresh</mat-icon>
                  }
                </div>

                <!-- QC notes for failed -->
                @if (store.selectedSample()!.status === 'qc_failed') {
                  <div class="qc-failed-notice">
                    <mat-icon>error</mat-icon>
                    <div>
                      <strong>QC Failed</strong>
                      <p>{{ store.selectedSample()!.qcNotes || 'No notes' }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h2 { margin: 0; } }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
      .search-field { flex: 1; min-width: 220px; }
      mat-form-field { min-width: 150px; }
    }

    .layout { display: grid; grid-template-columns: 360px 1fr; gap: 20px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .loading-rows { display: flex; flex-direction: column; gap: 8px; }
    .skel-row { height: 72px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px 0; color: $text-secondary;
      mat-icon { font-size: 40px; opacity: 0.4; margin-bottom: 8px; }
    }
    .sample-list { display: flex; flex-direction: column; gap: 6px; }
    .sample-item {
      padding: 12px 14px; border-radius: $border-radius; border: 1px solid $border-color;
      background: white; cursor: pointer; transition: all 0.15s;
      &:hover { border-color: $primary; }
      &.selected { border-color: $primary; background: #eff6ff; }
    }
    .si-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .si-num { font-size: 0.78rem; font-family: monospace; color: $text-secondary; }
    .si-patient { font-weight: 600; font-size: 0.875rem; }
    .si-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 0.78rem; color: $text-secondary; }
    .type-tag { background: $gray-100; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; text-transform: uppercase; }

    .detail-panel { background: white; border-radius: $border-radius; border: 1px solid $border-color; padding: 24px; }
    .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: $text-secondary;
      mat-icon { font-size: 48px; opacity: 0.3; margin-bottom: 8px; }
    }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
      h3 { margin: 0 0 4px; }
      .detail-sub { font-size: 0.8rem; color: $text-secondary; }
    }
    .timeline-wrap { margin-bottom: 24px; overflow-x: auto; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
    .info-item { label { display: block; font-size: 0.75rem; color: $text-secondary; margin-bottom: 2px; } span { font-weight: 500; font-size: 0.875rem; } }
    .actions-section { h4 { font-size: 0.875rem; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 12px; } }
    .action-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .spin { animation: spin 0.8s linear infinite; color: $primary; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .qc-failed-notice { display: flex; gap: 10px; padding: 12px 16px; background: #fee2e2; border-radius: $border-radius; margin-top: 16px;
      mat-icon { color: $danger; flex-shrink: 0; }
      strong { display: block; color: $danger; margin-bottom: 4px; }
      p { margin: 0; font-size: 0.875rem; color: #7f1d1d; }
    }
  `]
})
export class LabSamplesComponent implements OnInit {
  store = inject(LabSamplesStore);

  ngOnInit(): void { this.store.load(); }
  async collect(): Promise<void> { if (this.store.selectedSample()) await this.store.collect(this.store.selectedSample()!.id); }
  async receive(): Promise<void> { if (this.store.selectedSample()) await this.store.receive(this.store.selectedSample()!.id); }
  async startProcessing(): Promise<void> { if (this.store.selectedSample()) await this.store.startProcessing(this.store.selectedSample()!.id); }
  async completeProcessing(): Promise<void> { if (this.store.selectedSample()) await this.store.completeProcessing(this.store.selectedSample()!.id); }
}
