import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { BranchApiService } from '../../../core/api/branch-api.service';
import { Branch } from '../../../core/models/branch.models';
import { AppLoadingComponent } from '../../../shared/ui/app-loading/app-loading.component';
import { AppSearchBarComponent } from '../../../shared/ui/app-search-bar/app-search-bar.component';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, CommonModule, AppLoadingComponent, AppSearchBarComponent],
  template: `
    <div class="branches-page">
      <div class="page-hero">
        <div class="container">
          <h1>Our Branches</h1>
          <p>Find a Capital Lab branch near you</p>
          <app-search-bar placeholder="Search by city or branch name..." (searched)="onSearch($event)" />
        </div>
      </div>

      <div class="container page-body">
        @if (loading()) {
          <app-loading />
        } @else {
          <div class="branches-grid">
            @for (branch of filteredBranches(); track branch.id) {
              <div class="branch-card">
                <div class="branch-header">
                  <div class="branch-icon"><mat-icon>domain</mat-icon></div>
                  <div>
                    <h4>{{ branch.name }}</h4>
                    <span class="branch-city">{{ branch.city }}</span>
                  </div>
                </div>

                <div class="branch-info">
                  <div class="info-row">
                    <mat-icon>location_on</mat-icon>
                    <span>{{ branch.address }}</span>
                  </div>
                  <div class="info-row">
                    <mat-icon>phone</mat-icon>
                    <span>{{ branch.phone }}</span>
                  </div>
                  @if (branch.email) {
                    <div class="info-row">
                      <mat-icon>email</mat-icon>
                      <span>{{ branch.email }}</span>
                    </div>
                  }
                </div>

                @if (branch.openingHours && branch.openingHours.length) {
                  <div class="hours-section">
                    <h6>Opening Hours</h6>
                    @for (day of branch.openingHours.slice(0,3); track day.dayOfWeek) {
                      <div class="hour-row">
                        <span class="day">{{ day.dayOfWeek }}</span>
                        <span class="time">{{ day.isClosed ? 'Closed' : day.openTime + ' – ' + day.closeTime }}</span>
                      </div>
                    }
                  </div>
                }

                <!-- Map placeholder -->
                <div class="map-placeholder">
                  <mat-icon>map</mat-icon>
                  <span>View on Map</span>
                </div>

                <a mat-flat-button color="primary" routerLink="/login" [queryParams]="{branch: branch.id}" class="book-btn">
                  Book at This Branch
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .page-hero {
      background: linear-gradient(135deg, #1a237e 0%, $primary 100%);
      color: white; padding: 48px 0;
      h1 { color: white; font-size: 2.5rem; margin-bottom: 8px; }
      p { color: rgba(255,255,255,0.85); margin-bottom: 24px; }
    }

    .page-body { padding: 48px 0; }
    .branches-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

    .branch-card {
      background: white; border-radius: $border-radius; padding: 24px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      display: flex; flex-direction: column; gap: 16px;
    }

    .branch-header { display: flex; align-items: center; gap: 12px; }
    .branch-icon { width: 48px; height: 48px; background: $primary-light; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { color: $primary; font-size: 26px; } }
    .branch-header h4 { margin: 0; font-size: 1rem; }
    .branch-city { font-size: 0.8rem; color: $text-secondary; }

    .branch-info { display: flex; flex-direction: column; gap: 8px; }
    .info-row { display: flex; gap: 8px; align-items: flex-start; font-size: 0.875rem; color: $text-secondary;
      mat-icon { font-size: 16px; color: $primary; flex-shrink: 0; margin-top: 1px; }
    }

    .hours-section h6 { font-size: 0.75rem; text-transform: uppercase; color: $text-secondary; letter-spacing: 0.5px; margin: 0 0 8px; }
    .hour-row { display: flex; justify-content: space-between; font-size: 0.8rem; padding: 4px 0; border-bottom: 1px solid $gray-100; }
    .day { font-weight: 500; }
    .time { color: $text-secondary; }

    .map-placeholder {
      background: $gray-100; border-radius: $border-radius; padding: 16px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      color: $text-secondary; font-size: 0.875rem; cursor: pointer;
      mat-icon { color: $primary; }
      &:hover { background: $primary-light; color: $primary; }
    }

    .book-btn { width: 100%; }

    @media (max-width: 992px) { .branches-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .branches-grid { grid-template-columns: 1fr; } }
  `]
})
export class BranchesComponent implements OnInit {
  private branchApi = inject(BranchApiService);

  branches = signal<Branch[]>([]);
  filteredBranches = signal<Branch[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.branchApi.getActive().subscribe({
      next: res => {
        const items = res.data ?? [];
        this.branches.set(items);
        this.filteredBranches.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(query: string): void {
    const q = query.toLowerCase();
    this.filteredBranches.set(
      this.branches().filter(b =>
        b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
      )
    );
  }
}
