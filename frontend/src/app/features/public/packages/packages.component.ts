import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PackageApiService } from '../../../core/api/package-api.service';
import { HealthPackage } from '../../../core/models/health-package.models';
import { AppBadgeComponent } from '../../../shared/ui/app-badge/app-badge.component';
import { AppLoadingComponent } from '../../../shared/ui/app-loading/app-loading.component';
import { AppSearchBarComponent } from '../../../shared/ui/app-search-bar/app-search-bar.component';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, CommonModule, AppBadgeComponent, AppLoadingComponent, AppSearchBarComponent],
  template: `
    <div class="packages-page">
      <div class="page-hero">
        <div class="container">
          <h1>Health Packages</h1>
          <p>Comprehensive test bundles designed for your lifestyle and health goals</p>
          <app-search-bar placeholder="Search packages..." (searched)="onSearch($event)" />
        </div>
      </div>

      <div class="container page-body">
        @if (loading()) {
          <app-loading />
        } @else {
          <div class="packages-grid">
            @for (pkg of filteredPackages(); track pkg.id) {
              <div class="pkg-card" [class.is-popular]="pkg.isPopular">
                @if (pkg.isPopular) {
                  <div class="popular-ribbon">⭐ Most Popular</div>
                }
                <div class="pkg-top">
                  <h3>{{ pkg.name }}</h3>
                  @if (pkg.description) {
                    <p>{{ pkg.description }}</p>
                  }
                </div>

                <div class="pkg-tests">
                  <mat-icon>science</mat-icon>
                  <span>{{ pkg.testsCount || (pkg.tests ? pkg.tests.length : 0) }} Tests Included</span>
                </div>

                @if (pkg.turnaroundTime) {
                  <div class="pkg-tat">
                    <mat-icon>schedule</mat-icon>
                    <span>Results in {{ pkg.turnaroundTime }}</span>
                  </div>
                }

                <div class="pkg-pricing">
                  @if (pkg.originalPrice && pkg.originalPrice > pkg.price) {
                    <span class="original">SAR {{ pkg.originalPrice | number }}</span>
                    <app-badge variant="success">Save SAR {{ (pkg.originalPrice - pkg.price) | number }}</app-badge>
                  }
                  <div class="current-price">SAR {{ pkg.price | number }}</div>
                </div>

                <a mat-flat-button [color]="pkg.isPopular ? 'primary' : 'primary'" routerLink="/login" class="book-btn">
                  Book This Package
                </a>
                <a class="details-link" routerLink="/packages/{{ pkg.id }}">View Included Tests →</a>
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
      background: linear-gradient(135deg, #0f4c81 0%, $primary 100%);
      color: white; padding: 48px 0;
      h1 { color: white; font-size: 2.5rem; margin-bottom: 8px; }
      p { color: rgba(255,255,255,0.85); margin-bottom: 24px; }
    }

    .page-body { padding: 48px 0; }

    .packages-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

    .pkg-card {
      background: white; border-radius: $border-radius-lg; padding: 28px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      display: flex; flex-direction: column; gap: 16px; position: relative;
      transition: all 0.2s;
      &:hover { box-shadow: $shadow-md; }
      &.is-popular { border-color: $primary; box-shadow: 0 0 0 2px #{$primary-light}; }
    }

    .popular-ribbon {
      position: absolute; top: -1px; right: 24px;
      background: $primary; color: white; padding: 6px 16px;
      border-radius: 0 0 10px 10px; font-size: 0.8rem; font-weight: 600;
    }

    .pkg-top h3 { font-size: 1.25rem; margin: 0 0 6px; }
    .pkg-top p { font-size: 0.875rem; color: $text-secondary; margin: 0; }

    .pkg-tests, .pkg-tat {
      display: flex; align-items: center; gap: 8px;
      color: $text-secondary; font-size: 0.875rem;
      mat-icon { font-size: 18px; color: $primary; }
    }

    .pkg-pricing { display: flex; flex-direction: column; gap: 6px; }
    .original { text-decoration: line-through; color: $text-disabled; font-size: 0.875rem; }
    .current-price { font-size: 2rem; font-weight: 700; color: $primary; }

    .book-btn { width: 100%; margin-top: auto; }
    .details-link { text-align: center; color: $primary; font-size: 0.875rem; text-decoration: none; }
    .details-link:hover { text-decoration: underline; }

    @media (max-width: 992px) { .packages-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .packages-grid { grid-template-columns: 1fr; } }
  `]
})
export class PackagesComponent implements OnInit {
  private packageApi = inject(PackageApiService);

  packages = signal<HealthPackage[]>([]);
  filteredPackages = signal<HealthPackage[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.packageApi.getAll({ pageSize: 50 }).subscribe({
      next: res => {
        const items = res.data?.items ?? [];
        this.packages.set(items);
        this.filteredPackages.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(query: string): void {
    const q = query.toLowerCase();
    this.filteredPackages.set(
      this.packages().filter(p => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q))
    );
  }
}
