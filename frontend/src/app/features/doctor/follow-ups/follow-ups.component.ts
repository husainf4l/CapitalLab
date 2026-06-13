import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FollowUpsStore } from '../stores/follow-ups.store';
import { FollowUpCardComponent } from '../shared/follow-up-card.component';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-follow-ups',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatInputModule, FollowUpCardComponent, AppEmptyStateComponent, A11yModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Follow Ups</h2>
          <p class="sub">Manage patient follow-up appointments</p>
        </div>
        <button mat-raised-button color="primary" (click)="store.showForm.set(true)">
          <mat-icon>add</mat-icon> New Follow Up
        </button>
      </div>

      <!-- Summary chips -->
      <div class="summary-chips">
        <div class="chip pending"><span>{{ store.pending().length }}</span><label>Pending</label></div>
        <div class="chip scheduled"><span>{{ store.scheduled().length }}</span><label>Scheduled</label></div>
        <div class="chip completed"><span>{{ store.completed().length }}</span><label>Completed</label></div>
      </div>

      <!-- Status filter -->
      <div class="filters-bar">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [ngModel]="store.filterStatus()" (ngModelChange)="store.filterStatus.set($event); store.load()">
            <mat-option value="">All</mat-option>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="scheduled">Scheduled</mat-option>
            <mat-option value="completed">Completed</mat-option>
            <mat-option value="cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Create modal -->
      @if (store.showForm()) {
        <div class="modal-backdrop" (click)="store.showForm.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()" (keydown.escape)="store.showForm.set(false)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="followup-form-title">
            <h3 id="followup-form-title">New Follow Up</h3>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Patient ID</mat-label>
              <input matInput [ngModel]="store.formPatientId()" (ngModelChange)="store.formPatientId.set($event)" placeholder="Enter patient ID" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Reason</mat-label>
              <input matInput [ngModel]="store.formReason()" (ngModelChange)="store.formReason.set($event)" placeholder="e.g. Recheck HbA1c in 3 months" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Scheduled Date</mat-label>
              <input matInput type="date" [ngModel]="store.formDate()" (ngModelChange)="store.formDate.set($event)" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Notes (optional)</mat-label>
              <textarea matInput [ngModel]="store.formNotes()" (ngModelChange)="store.formNotes.set($event)" rows="3"></textarea>
            </mat-form-field>
            <div class="modal-actions">
              <button mat-stroked-button (click)="store.showForm.set(false)">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="!canCreate() || store.isSaving()" (click)="create()">
                @if (store.isSaving()) {
                  <ng-container><mat-icon class="spin">refresh</mat-icon> Saving...</ng-container>
                } @else {
                  <ng-container><mat-icon>save</mat-icon> Create</ng-container>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- List -->
      @if (store.isLoading()) {
        <div class="fu-grid">
          @for (i of [1,2,3,4]; track i) { <div class="skel-card"></div> }
        </div>
      } @else if (store.filtered().length === 0) {
        <app-empty-state icon="schedule_send" title="No follow-ups found" description="Scheduled patient follow-ups will appear here." />
      } @else {
        <div class="fu-grid">
          @for (fu of store.filtered(); track fu.id) {
            <follow-up-card [followUp]="fu" (complete)="complete($event)" (cancel)="cancel($event)" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .page { max-width: 1000px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
      h2 { margin: 0 0 4px; } .sub { margin: 0; font-size: 0.875rem; color: $text-secondary; }
    }
    .summary-chips { display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
    .chip { display: flex; flex-direction: column; align-items: center; padding: 12px 24px; border-radius: $border-radius; background: white; border: 1px solid $border-color; box-shadow: $shadow-sm;
      span { font-size: 1.4rem; font-weight: 700; } label { font-size: 0.75rem; color: $text-secondary; }
      &.pending { border-top: 3px solid #f59e0b; span { color: #f59e0b; } }
      &.scheduled { border-top: 3px solid #4f46e5; span { color: #4f46e5; } }
      &.completed { border-top: 3px solid $success; span { color: $success; } }
    }
    .filters-bar { margin-bottom: 18px; mat-form-field { min-width: 160px; } }

    .fu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
      @media (max-width: 700px) { grid-template-columns: 1fr; }
    }
    .skel-card { height: 110px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 56px 0; color: $text-secondary;
      mat-icon { font-size: 48px; opacity: 0.3; margin-bottom: 10px; } p { margin: 0; }
    }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal-card { background: white; border-radius: $border-radius-lg; padding: 28px; width: 460px; max-width: 100%; max-height: 90vh; overflow-y: auto;
      h3 { margin: 0 0 18px; }
    }
    .full { width: 100%; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class FollowUpsComponent implements OnInit {
  store = inject(FollowUpsStore);

  ngOnInit(): void { this.store.load(); }

  canCreate(): boolean {
    return this.store.formPatientId().trim().length > 0
      && this.store.formReason().trim().length > 0
      && this.store.formDate().length > 0;
  }

  async create(): Promise<void> { await this.store.create(); }
  async complete(id: string): Promise<void> { await this.store.complete(id); }
  async cancel(id: string): Promise<void> { await this.store.cancel(id); }
}
