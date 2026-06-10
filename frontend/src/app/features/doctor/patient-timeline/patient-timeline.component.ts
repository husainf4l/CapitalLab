import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PatientTimelineStore } from '../stores/patient-timeline.store';
import { PatientSummaryCardComponent } from '../shared/patient-summary-card.component';
import { MedicalTimelineComponent } from '../shared/medical-timeline.component';

const FILTERS = [
  { key: 'all',         label: 'All',         icon: 'view_list' },
  { key: 'appointment', label: 'Appointments', icon: 'event' },
  { key: 'sample',      label: 'Samples',      icon: 'colorize' },
  { key: 'result',      label: 'Results',      icon: 'science' },
  { key: 'report',      label: 'Reports',      icon: 'description' },
  { key: 'review',      label: 'Reviews',      icon: 'rate_review' },
  { key: 'note',        label: 'Notes',        icon: 'sticky_note_2' },
  { key: 'follow_up',   label: 'Follow Ups',   icon: 'schedule_send' },
];

@Component({
  selector: 'app-patient-timeline',
  standalone: true,
  imports: [RouterLink, CommonModule, MatButtonModule, MatIconModule, PatientSummaryCardComponent, MedicalTimelineComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <button mat-icon-button routerLink="/doctor/patients"><mat-icon>arrow_back</mat-icon></button>
        <div class="header-text">
          <h2>Patient Timeline</h2>
          @if (store.patient()) {
            <p class="sub">{{ store.patient()!.fullName }} · {{ store.filteredEvents().length }} events</p>
          }
        </div>
        <button mat-icon-button (click)="reload()"><mat-icon>refresh</mat-icon></button>
      </div>

      <div class="layout">
        <!-- Left: patient info -->
        <div class="info-col">
          @if (store.isLoadingPatient()) {
            <div class="skel-card"></div>
          } @else if (store.patient()) {
            <patient-summary-card [patient]="store.patient()!" [showActions]="false" />
          }

          <!-- Filter pills -->
          <div class="filter-section">
            <p class="filter-label">Filter by type</p>
            @for (f of filters; track f.key) {
              <button class="filter-btn" [class.active]="store.activeFilter() === f.key" (click)="store.activeFilter.set(f.key)">
                <mat-icon>{{ f.icon }}</mat-icon> {{ f.label }}
              </button>
            }
          </div>
        </div>

        <!-- Right: timeline -->
        <div class="timeline-col">
          @if (store.isLoading()) {
            <div class="loading-state">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="skel-event"></div>
              }
            </div>
          } @else if (store.error()) {
            <div class="error-state">
              <mat-icon>error_outline</mat-icon>
              <p>{{ store.error() }}</p>
              <button mat-stroked-button (click)="reload()">Retry</button>
            </div>
          } @else if (store.groupedByYear().length === 0) {
            <div class="empty-state">
              <mat-icon>timeline</mat-icon>
              <p>No timeline events found</p>
            </div>
          } @else {
            @for (group of store.groupedByYear(); track group[0]) {
              <div class="year-group">
                <div class="year-label">{{ group[0] }}</div>
                <medical-timeline [events]="group[1]" />
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    $accent: #4f46e5;

    .page { max-width: 1200px; }
    .page-header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px;
      .header-text { flex: 1; h2 { margin: 0 0 2px; font-size: 1.2rem; } .sub { margin: 0; font-size: 0.85rem; color: $text-secondary; } }
    }

    .layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .skel-card { height: 160px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 16px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .filter-section { margin-top: 16px; background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 14px; }
    .filter-label { margin: 0 0 10px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: $text-secondary; }
    .filter-btn {
      display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 10px; margin-bottom: 2px;
      border: none; background: none; border-radius: 6px; cursor: pointer; font-size: 0.83rem; color: $text-secondary; transition: all 0.15s; text-align: left;
      mat-icon { font-size: 16px; }
      &:hover { background: $gray-100; }
      &.active { background: #e0e7ff; color: $accent; font-weight: 600; }
    }

    .skel-event { height: 60px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 12px; }
    .error-state, .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 0; color: $text-secondary; text-align: center;
      mat-icon { font-size: 48px; opacity: 0.35; margin-bottom: 12px; }
      p { margin: 0 0 12px; }
    }

    .year-group { margin-bottom: 28px; }
    .year-label { font-size: 0.8rem; font-weight: 700; color: $text-secondary; background: $gray-100; border-radius: 999px; padding: 3px 14px; display: inline-block; margin-bottom: 16px; }
  `]
})
export class PatientTimelineComponent implements OnInit, OnDestroy {
  store = inject(PatientTimelineStore);
  private route = inject(ActivatedRoute);

  filters = FILTERS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('patientId') ?? '';
    if (id) this.store.load(id);
  }

  ngOnDestroy(): void { this.store.reset(); }

  reload(): void {
    const id = this.route.snapshot.paramMap.get('patientId') ?? '';
    if (id) this.store.load(id);
  }
}
