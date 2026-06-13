import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabTestApiService } from '../../../core/api/lab-test-api.service';
import { LabTest, TestCategory } from '../../../core/models/lab-test.models';
import { AppSearchBarComponent } from '../../../shared/ui/app-search-bar/app-search-bar.component';
import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { AppLoadingComponent } from '../../../shared/ui/app-loading/app-loading.component';
import { AppBadgeComponent } from '../../../shared/ui/app-badge/app-badge.component';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [
    RouterLink, MatButtonModule, MatIconModule, CommonModule, FormsModule,
    AppSearchBarComponent, AppEmptyStateComponent, AppLoadingComponent, AppBadgeComponent,
  ],
  template: `
    <div class="tests-page">
      <div class="page-hero">
        <div class="container">
          <h1>Lab Tests</h1>
          <p>Browse our comprehensive catalogue of diagnostic tests</p>
          <app-search-bar
            placeholder="Search by test name, code, or category..."
            (searched)="onSearch($event)"
          />
        </div>
      </div>

      <div class="container page-body">
        <!-- Category Filter -->
        <div class="category-filter">
          <button
            class="cat-btn"
            [class.active]="selectedCategory() === null"
            (click)="selectCategory(null)"
          >All Tests</button>
          @for (cat of categories(); track cat.id) {
            <button
              class="cat-btn"
              [class.active]="selectedCategory() === cat.id"
              (click)="selectCategory(cat.id)"
            >{{ cat.name }}</button>
          }
        </div>

        <!-- Tests Grid -->
        @if (loading()) {
          <app-loading />
        } @else if (tests().length === 0) {
          <app-empty-state icon="science" title="No tests found" description="Try adjusting your search or category filter." />
        } @else {
          <div class="tests-grid">
            @for (test of tests(); track test.id) {
              <div class="test-card">
                <div class="test-header">
                  <div>
                    <h4>{{ test.name }}</h4>
                    <span class="test-code">{{ test.code }}</span>
                  </div>
                  @if (test.isHomeCollectionAvailable) {
                    <app-badge variant="success">Home</app-badge>
                  }
                </div>
                <div class="test-meta">
                  <div class="meta-item">
                    <mat-icon>science</mat-icon>
                    <span>{{ test.sampleType }}</span>
                  </div>
                  <div class="meta-item">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ test.turnaroundTime }}</span>
                  </div>
                </div>
                @if (test.preparationInstructions) {
                  <p class="prep-note"><mat-icon>warning</mat-icon> {{ test.preparationInstructions }}</p>
                }
                <div class="test-footer">
                  <div class="test-price">SAR {{ test.price | number }}</div>
                  <a mat-flat-button color="primary" routerLink="/login" class="book-test-btn">
                    Book Now
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <button mat-stroked-button [disabled]="currentPage() <= 1" (click)="changePage(currentPage() - 1)">← Prev</button>
              <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
              <button mat-stroked-button [disabled]="currentPage() >= totalPages()" (click)="changePage(currentPage() + 1)">Next →</button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .page-hero {
      background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
      color: white; padding: 48px 0;
      h1 { color: white; font-size: 2.5rem; margin-bottom: 8px; }
      p { color: rgba(255,255,255,0.85); margin-bottom: 24px; }
      app-search-bar { max-width: 600px; display: block; }
    }

    .page-body { padding: 32px 0; }

    .category-filter {
      display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;
    }
    .cat-btn {
      padding: 8px 16px; border-radius: $border-radius-full;
      border: 1px solid $border-color; background: white;
      cursor: pointer; font-size: 0.875rem; font-weight: 500; color: $text-secondary;
      transition: all 0.2s;
      &:hover { border-color: $primary; color: $primary; }
      &.active { background: $primary; color: white; border-color: $primary; }
    }

    .tests-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

    .test-card {
      background: white; border-radius: $border-radius; padding: 20px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      display: flex; flex-direction: column; gap: 12px;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: $shadow-md; }
    }

    .test-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .test-header h4 { margin: 0 0 4px; font-size: 1rem; }
    .test-code { font-size: 0.75rem; color: $text-secondary; font-family: monospace; }

    .test-meta { display: flex; gap: 12px; }
    .meta-item {
      display: flex; align-items: center; gap: 4px; color: $text-secondary; font-size: 0.8rem;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .prep-note { font-size: 0.8rem; color: $warning; background: #fef3c7; padding: 8px; border-radius: 8px; margin: 0; display: flex; align-items: flex-start; gap: 6px; mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; } }

    .test-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
    .test-price { font-size: 1.25rem; font-weight: 700; color: $primary; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 32px; }

    @media (max-width: 992px) { .tests-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .tests-grid { grid-template-columns: 1fr; } }
  `]
})
export class TestsComponent implements OnInit {
  private labTestApi = inject(LabTestApiService);
  private route = inject(ActivatedRoute);

  tests = signal<LabTest[]>([]);
  categories = signal<TestCategory[]>([]);
  loading = signal(false);
  selectedCategory = signal<string | null>(null);
  searchQuery = '';
  currentPage = signal(1);
  totalPages = signal(1);

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.searchQuery = params['q'];
      this.loadTests();
    });
  }

  loadCategories(): void {
    this.labTestApi.getCategories().subscribe({
      next: res => this.categories.set(res.items ?? []),
      error: () => {},
    });
  }

  loadTests(): void {
    this.loading.set(true);
    this.labTestApi.getTests({
      searchTerm: this.searchQuery,
      categoryId: this.selectedCategory() ?? undefined,
      pageNumber: this.currentPage(),
      pageSize: 12,
    }).subscribe({
      next: res => {
        this.tests.set(res.data?.items ?? []);
        this.totalPages.set(res.data?.totalPages ?? 1);
        this.loading.set(false);
      },
      error: () => {
        this.tests.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.currentPage.set(1);
    this.loadTests();
  }

  selectCategory(id: string | null): void {
    this.selectedCategory.set(id);
    this.currentPage.set(1);
    this.loadTests();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadTests();
  }
}
