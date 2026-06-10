import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { CriticalResultsStore } from '../stores/critical-results.store';
import { CriticalResultBadgeComponent } from '../shared/critical-result-badge.component';
import { CriticalResult } from '../../../core/models/critical-result.models';

@Component({
  selector: 'app-critical-results',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatInputModule, CriticalResultBadgeComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Critical Results</h2>
          <p class="sub">
            <span class="unack-count">{{ store.unacknowledged().length }} unacknowledged</span>
          </p>
        </div>
        <button mat-icon-button (click)="store.load()"><mat-icon>refresh</mat-icon></button>
      </div>

      <!-- Summary chips -->
      <div class="summary-chips">
        <div class="chip critical-high">
          <mat-icon>arrow_upward</mat-icon>
          <span>{{ store.criticalHigh().length }}</span>
          <label>Critical High</label>
        </div>
        <div class="chip critical-low">
          <mat-icon>arrow_downward</mat-icon>
          <span>{{ store.criticalLow().length }}</span>
          <label>Critical Low</label>
        </div>
        <div class="chip unack">
          <mat-icon>notifications_active</mat-icon>
          <span>{{ store.unacknowledged().length }}</span>
          <label>Unacknowledged</label>
        </div>
        <div class="chip ack">
          <mat-icon>check_circle</mat-icon>
          <span>{{ store.acknowledged().length }}</span>
          <label>Acknowledged</label>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [ngModel]="store.filterStatus()" (ngModelChange)="store.filterStatus.set($event); store.load()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="unacknowledged">Unacknowledged</mat-option>
            <mat-option value="acknowledged">Acknowledged</mat-option>
            <mat-option value="actioned">Actioned</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Level</mat-label>
          <mat-select [ngModel]="store.filterLevel()" (ngModelChange)="store.filterLevel.set($event)">
            <mat-option value="">All Levels</mat-option>
            <mat-option value="critical_high">Critical High</mat-option>
            <mat-option value="critical_low">Critical Low</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Detail panel -->
      @if (store.selectedResult()) {
        <div class="detail-panel">
          <div class="dp-header">
            <div>
              <h4>{{ store.selectedResult()!.testName }}</h4>
              <critical-result-badge [level]="store.selectedResult()!.level" />
            </div>
            <button mat-icon-button (click)="store.clearSelection()"><mat-icon>close</mat-icon></button>
          </div>
          <div class="dp-grid">
            <div class="dp-item"><label>Patient</label><span>{{ store.selectedResult()!.patientName || '—' }}</span></div>
            <div class="dp-item"><label>Value</label><span class="val-big">{{ store.selectedResult()!.value }} {{ store.selectedResult()!.unit }}</span></div>
            <div class="dp-item"><label>Reference Range</label><span>{{ store.selectedResult()!.referenceRange || '—' }}</span></div>
            <div class="dp-item"><label>Detected</label><span>{{ store.selectedResult()!.detectedAt | date:'dd MMM yyyy, h:mm a' }}</span></div>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput [ngModel]="store.noteInput()" (ngModelChange)="store.noteInput.set($event)" rows="2" placeholder="Add acknowledgement notes..."></textarea>
          </mat-form-field>
          <div class="dp-actions">
            @if (store.selectedResult()!.status === 'unacknowledged') {
              <button mat-raised-button color="primary" [disabled]="!!store.isActing()" (click)="acknowledge(store.selectedResult()!.id)">
                <mat-icon>check</mat-icon> Acknowledge
              </button>
            }
            <button mat-stroked-button [disabled]="!store.noteInput() || !!store.isActing()" (click)="addNote(store.selectedResult()!.id)">
              <mat-icon>note_add</mat-icon> Add Note
            </button>
            <button mat-stroked-button color="warn" [disabled]="!!store.isActing()" (click)="requestRetest(store.selectedResult()!.id)">
              <mat-icon>refresh</mat-icon> Request Retest
            </button>
            <button mat-stroked-button (click)="openTimeline(store.selectedResult()!)">
              <mat-icon>timeline</mat-icon> Patient Timeline
            </button>
          </div>
        </div>
      }

      <!-- Results list -->
      @if (store.isLoading()) {
        <div class="loading-rows">
          @for (i of [1,2,3,4]; track i) { <div class="skel-row"></div> }
        </div>
      } @else if (store.filtered().length === 0) {
        <div class="empty-state">
          <mat-icon>verified</mat-icon>
          <p>No critical results matching current filters</p>
        </div>
      } @else {
        <div class="results-table-wrap">
          <table class="results-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Value</th>
                <th>Level</th>
                <th>Status</th>
                <th>Detected</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of store.filtered(); track r.id) {
                <tr [class.unack-row]="r.status === 'unacknowledged'" (click)="store.select(r)">
                  <td>{{ r.patientName || '—' }}</td>
                  <td><strong>{{ r.testName }}</strong></td>
                  <td class="val-cell">{{ r.value }} <span class="unit">{{ r.unit }}</span></td>
                  <td><critical-result-badge [level]="r.level" /></td>
                  <td>
                    <span class="status-badge" [class]="r.status">{{ statusLabel(r.status) }}</span>
                  </td>
                  <td class="date-cell">{{ r.detectedAt | date:'dd MMM, HH:mm' }}</td>
                  <td>
                    <div class="row-actions">
                      @if (r.status === 'unacknowledged') {
                        <button mat-stroked-button class="btn-xs" (click)="$event.stopPropagation(); quickAck(r)">Ack</button>
                      }
                      <button mat-icon-button class="btn-icon" (click)="$event.stopPropagation(); openTimeline(r)">
                        <mat-icon>timeline</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
      h2 { margin: 0 0 4px; } .sub { margin: 0; }
    }
    .unack-count { background: #fee2e2; color: $danger; padding: 2px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; }

    .summary-chips { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .chip { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: $border-radius; background: white; border: 1px solid $border-color; box-shadow: $shadow-sm;
      mat-icon { font-size: 18px; } span { font-size: 1.3rem; font-weight: 700; } label { font-size: 0.78rem; color: $text-secondary; }
      &.critical-high { border-top: 3px solid #7f1d1d; mat-icon { color: #7f1d1d; } span { color: #7f1d1d; } }
      &.critical-low  { border-top: 3px solid #1e3a5f; mat-icon { color: #1e3a5f; } span { color: #1e3a5f; } }
      &.unack { border-top: 3px solid $danger; mat-icon { color: $danger; } span { color: $danger; } }
      &.ack   { border-top: 3px solid $success; mat-icon { color: $success; } span { color: $success; } }
    }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; mat-form-field { min-width: 150px; } }

    .detail-panel { background: #fffbeb; border: 1px solid #fcd34d; border-radius: $border-radius; padding: 20px; margin-bottom: 20px; }
    .dp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;
      h4 { margin: 0 0 6px; font-size: 1rem; }
    }
    .dp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 14px; }
    .dp-item { label { display: block; font-size: 0.75rem; color: $text-secondary; margin-bottom: 2px; } span { font-weight: 500; } }
    .val-big { font-size: 1.1rem; font-weight: 700; color: $danger; }
    .full-width { width: 100%; }
    .dp-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }

    .loading-rows { display: flex; flex-direction: column; gap: 8px; }
    .skel-row { height: 52px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: $text-secondary;
      mat-icon { font-size: 48px; color: $success; opacity: 0.4; margin-bottom: 10px; }
      p { margin: 0; }
    }

    .results-table-wrap { overflow-x: auto; background: white; border: 1px solid $border-color; border-radius: $border-radius; box-shadow: $shadow-sm; }
    .results-table { width: 100%; border-collapse: collapse; font-size: 0.875rem;
      th { background: $gray-50; padding: 9px 12px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: $text-secondary; border-bottom: 1px solid $border-color; }
      td { padding: 11px 12px; border-bottom: 1px solid $gray-100; vertical-align: middle; cursor: pointer; }
      tr:last-child td { border-bottom: none; }
      tr.unack-row { background: #fff5f5; }
      tr:hover td { background: $gray-50; }
    }
    .val-cell { font-weight: 700; } .unit { font-weight: 400; font-size: 0.8rem; color: $text-secondary; }
    .date-cell { font-size: 0.78rem; color: $text-secondary; white-space: nowrap; }
    .status-badge { padding: 2px 8px; border-radius: 999px; font-size: 0.7rem; font-weight: 600;
      &.unacknowledged { background: #fee2e2; color: $danger; }
      &.acknowledged   { background: #dcfce7; color: #166534; }
      &.actioned       { background: #dbeafe; color: #1e40af; }
    }
    .row-actions { display: flex; align-items: center; gap: 4px; }
    .btn-xs { font-size: 0.72rem; padding: 2px 8px; line-height: 1.6; }
    .btn-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; mat-icon { font-size: 16px; } }
  `]
})
export class CriticalResultsComponent implements OnInit {
  store = inject(CriticalResultsStore);
  private router = inject(Router);

  ngOnInit(): void { this.store.load(); }

  statusLabel(s: string): string {
    return s === 'unacknowledged' ? 'Unacknowledged' : s === 'acknowledged' ? 'Acknowledged' : 'Actioned';
  }

  async acknowledge(id: string): Promise<void> { await this.store.acknowledge(id); }
  async addNote(id: string): Promise<void> { await this.store.addNote(id); }
  async requestRetest(id: string): Promise<void> { await this.store.requestRetest(id); }

  async quickAck(r: CriticalResult): Promise<void> {
    this.store.select(r);
    await this.store.acknowledge(r.id);
  }

  openTimeline(r: CriticalResult): void {
    this.router.navigate(['/doctor/patients', r.patientId]);
  }
}
