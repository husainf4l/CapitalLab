import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { DoctorApiService } from '../../../core/api/doctor-api.service';
import { Patient } from '../../../core/models/patient.models';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Patient Search</h2>
        <p class="sub">Search by name, national ID, phone or report number</p>
      </div>

      <div class="search-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search patients</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          @if (isSearching()) { <mat-icon matSuffix class="spin">refresh</mat-icon> }
          <input matInput [(ngModel)]="query" (ngModelChange)="search($event)" placeholder="Start typing..." />
        </mat-form-field>
      </div>

      @if (isSearching()) {
        <div class="loading-rows">
          @for (i of [1,2,3]; track i) { <div class="skel-row"></div> }
        </div>
      } @else if (searched() && results().length === 0) {
        <div class="empty-state">
          <mat-icon>person_search</mat-icon>
          <p>No patients found for "{{ query }}"</p>
        </div>
      } @else if (results().length > 0) {
        <div class="results-list">
          @for (patient of results(); track patient.id) {
            <div class="patient-row" (click)="viewTimeline(patient.id)">
              <div class="p-avatar">{{ initials(patient) }}</div>
              <div class="p-info">
                <div class="p-name">{{ patient.fullName }}</div>
                <div class="p-meta">
                  <span><mat-icon>phone</mat-icon>{{ patient.phone }}</span>
                  @if (patient.nationalId) { <span><mat-icon>badge</mat-icon>{{ patient.nationalId }}</span> }
                  <span><mat-icon>{{ patient.gender === 'male' ? 'male' : 'female' }}</mat-icon>{{ patient.gender | titlecase }}</span>
                </div>
              </div>
              <button mat-stroked-button class="btn-sm">
                <mat-icon>timeline</mat-icon> View Timeline
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="hint-state">
          <mat-icon>manage_search</mat-icon>
          <p>Enter at least 2 characters to search</p>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    $accent: #4f46e5;

    .page { max-width: 800px; }
    .page-header { margin-bottom: 20px; h2 { margin: 0 0 4px; } .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; } }
    .search-card { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 20px; margin-bottom: 20px; box-shadow: $shadow-sm; }
    .search-field { width: 100%; }
    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-rows { display: flex; flex-direction: column; gap: 10px; }
    .skel-row { height: 64px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .empty-state, .hint-state { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: $text-secondary;
      mat-icon { font-size: 48px; opacity: 0.3; margin-bottom: 10px; }
      p { margin: 0; }
    }

    .results-list { display: flex; flex-direction: column; gap: 8px; }
    .patient-row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: white; border: 1px solid $border-color; border-radius: $border-radius; cursor: pointer; box-shadow: $shadow-sm; transition: all 0.15s;
      &:hover { border-color: $accent; box-shadow: $shadow-md; }
    }
    .p-avatar { width: 44px; height: 44px; border-radius: 50%; background: #e0e7ff; color: $accent; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
    .p-info { flex: 1; }
    .p-name { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
    .p-meta { display: flex; gap: 12px; flex-wrap: wrap;
      span { display: flex; align-items: center; gap: 3px; font-size: 0.75rem; color: $text-secondary; mat-icon { font-size: 13px; } }
    }
    .btn-sm { font-size: 0.78rem; }
  `]
})
export class PatientSearchComponent implements OnInit {
  private api = inject(DoctorApiService);
  private router = inject(Router);

  query = '';
  results = signal<Patient[]>([]);
  isSearching = signal(false);
  searched = signal(false);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {}

  search(q: string): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (q.trim().length < 2) { this.results.set([]); this.searched.set(false); return; }
    this.searchTimer = setTimeout(() => {
      this.isSearching.set(true);
      this.api.searchPatients(q).subscribe({
        next: res => { this.results.set(res.data ?? []); this.searched.set(true); this.isSearching.set(false); },
        error: () => { this.isSearching.set(false); this.searched.set(true); },
      });
    }, 300);
  }

  viewTimeline(id: string): void { this.router.navigate(['/doctor/patients', id]); }

  initials(p: Patient): string {
    return ((p.firstName?.charAt(0) ?? '') + (p.lastName?.charAt(0) ?? '')).toUpperCase();
  }
}
