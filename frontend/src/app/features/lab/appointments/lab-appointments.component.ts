import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { LabAppointmentsStore } from '../stores/lab-appointments.store';
import { LabStatusBadgeComponent } from '../shared/lab-status-badge.component';

@Component({
  selector: 'app-lab-appointments',
  standalone: true,
  imports: [
    FormsModule, CommonModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatInputModule, LabStatusBadgeComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Appointments</h2>
        <div class="header-actions">
          <button mat-stroked-button (click)="loadToday()">Today</button>
          <button mat-stroked-button (click)="loadAll()">All</button>
          <button mat-icon-button (click)="store.load()"><mat-icon>refresh</mat-icon></button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search patient or ID</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [ngModel]="store.searchTerm()" (ngModelChange)="onSearch($event)" placeholder="Search..." />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [ngModel]="store.filterStatus()" (ngModelChange)="store.filterStatus.set($event); store.load()">
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="confirmed">Confirmed</mat-option>
            <mat-option value="in_progress">In Progress</mat-option>
            <mat-option value="completed">Completed</mat-option>
            <mat-option value="cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Date</mat-label>
          <input matInput type="date" [ngModel]="store.filterDate()" (ngModelChange)="store.filterDate.set($event); store.load()" />
        </mat-form-field>
      </div>

      <!-- Cancel modal -->
      @if (cancelTarget()) {
        <div class="modal-backdrop" (click)="cancelTarget.set(null)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3>Cancel Appointment</h3>
            <p>Reason (optional)</p>
            <textarea [(ngModel)]="cancelReason" rows="3" class="notes-input" placeholder="Enter reason..."></textarea>
            <div class="modal-actions">
              <button mat-stroked-button (click)="cancelTarget.set(null)">Back</button>
              <button mat-raised-button color="warn" (click)="confirmCancel()">Confirm Cancel</button>
            </div>
          </div>
        </div>
      }

      <!-- Table -->
      @if (store.isLoading()) {
        <div class="loading-rows">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="skel-row"></div>
          }
        </div>
      } @else if (store.filtered().length === 0) {
        <div class="empty-state">
          <mat-icon>event_busy</mat-icon>
          <p>No appointments found</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Date / Time</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (apt of store.filtered(); track apt.id) {
                <tr>
                  <td>
                    <div class="patient-cell">
                      <div class="avatar">{{ (apt.patientName || 'P').charAt(0) }}</div>
                      <span>{{ apt.patientName || '—' }}</span>
                    </div>
                  </td>
                  <td><span class="type-badge" [class.home]="apt.type === 'home_collection'">{{ apt.type === 'home_collection' ? 'Home' : 'Lab' }}</span></td>
                  <td>
                    <div>{{ apt.appointmentDate | date:'dd MMM yyyy' }}</div>
                    <div class="time-sub">{{ apt.appointmentTime || '—' }}</div>
                  </td>
                  <td>{{ apt.branchName || '—' }}</td>
                  <td><lab-status-badge [status]="apt.status" /></td>
                  <td>
                    <div class="action-btns">
                      @if (apt.status === 'pending') {
                        <button mat-stroked-button class="btn-sm" [disabled]="store.isActing() === apt.id" (click)="confirm(apt.id)">
                          @if (store.isActing() === apt.id) { <mat-icon class="spin">refresh</mat-icon> } @else { Confirm }
                        </button>
                      }
                      @if (apt.status === 'confirmed') {
                        <button mat-stroked-button class="btn-sm" color="primary" [disabled]="store.isActing() === apt.id" (click)="start(apt.id)">
                          Start
                        </button>
                      }
                      @if (apt.status === 'in_progress') {
                        <button mat-stroked-button class="btn-sm" color="accent" [disabled]="store.isActing() === apt.id" (click)="complete(apt.id)">
                          Complete
                        </button>
                      }
                      @if (apt.status !== 'cancelled' && apt.status !== 'completed') {
                        <button mat-icon-button class="btn-cancel" (click)="cancelTarget.set(apt.id)">
                          <mat-icon>close</mat-icon>
                        </button>
                      }
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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; }
    }
    .header-actions { display: flex; gap: 8px; align-items: center; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
      mat-form-field { min-width: 160px; }
      .search-field { flex: 1; min-width: 220px; }
    }

    .loading-rows { display: flex; flex-direction: column; gap: 8px; }
    .skel-row { height: 52px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px 0; color: $text-secondary;
      mat-icon { font-size: 48px; opacity: 0.4; margin-bottom: 12px; }
    }

    .table-wrap { overflow-x: auto; background: white; border-radius: $border-radius; box-shadow: $shadow-sm; border: 1px solid $border-color; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem;
      th { background: $gray-50; padding: 10px 14px; text-align: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: $text-secondary; border-bottom: 1px solid $border-color; }
      td { padding: 12px 14px; border-bottom: 1px solid $gray-100; vertical-align: middle; }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: $gray-50; }
    }
    .patient-cell { display: flex; align-items: center; gap: 8px; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: $text-secondary; flex-shrink: 0; }
    .time-sub { font-size: 0.78rem; color: $text-secondary; }
    .type-badge { padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; background: #dbeafe; color: #1e40af;
      &.home { background: #d1fae5; color: #065f46; }
    }
    .action-btns { display: flex; align-items: center; gap: 4px; }
    .btn-sm { padding: 4px 12px; font-size: 0.78rem; line-height: 1.6; }
    .btn-cancel mat-icon { font-size: 18px; color: $danger; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; }
    .modal-card { background: white; border-radius: $border-radius-lg; padding: 28px; width: 440px; max-width: calc(100vw - 32px);
      h3 { margin: 0 0 12px; }
      p { margin: 0 0 8px; font-size: 0.875rem; color: $text-secondary; }
    }
    .notes-input { width: 100%; padding: 10px; border: 1px solid $border-color; border-radius: $border-radius; font-size: 0.875rem; resize: vertical; box-sizing: border-box; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class LabAppointmentsComponent implements OnInit {
  store = inject(LabAppointmentsStore);
  cancelTarget = signal<string | null>(null);
  cancelReason = '';

  ngOnInit(): void {
    this.loadToday();
  }

  loadToday(): void { this.store.loadToday(); }
  loadAll(): void { this.store.load(); }

  onSearch(term: string): void {
    this.store.searchTerm.set(term);
  }

  async confirm(id: string): Promise<void> { await this.store.confirm(id); }
  async start(id: string): Promise<void> { await this.store.start(id); }
  async complete(id: string): Promise<void> { await this.store.complete(id); }

  async confirmCancel(): Promise<void> {
    const id = this.cancelTarget();
    if (!id) return;
    await this.store.cancel(id, this.cancelReason || undefined);
    this.cancelTarget.set(null);
    this.cancelReason = '';
  }
}
