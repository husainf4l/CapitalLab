import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentApiService } from '../../../core/api/content-api.service';
import { ContentPostSummary, ContentCategory } from '../../../core/models/content.models';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, DatePipe],
  template: `
    <div class="news-page">
      <section class="page-hero">
        <div class="container">
          <span class="page-tag">Latest Updates</span>
          <h1>News & Announcements</h1>
          <p>Stay informed with the latest news from Capital Lab</p>
        </div>
      </section>

      <section class="content-section container">
        <!-- Filters -->
        <div class="filters-bar">
          <div class="search-box">
            <input type="text" placeholder="Search news..." [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" />
            <span class="search-icon">⌕</span>
          </div>
          <div class="category-pills">
            <button [class.active]="!selectedCategory()" (click)="selectCategory(null)">All</button>
            @for (cat of categories(); track cat.id) {
              <button [class.active]="selectedCategory() === cat.id" (click)="selectCategory(cat.id)">{{ cat.nameEn }}</button>
            }
          </div>
        </div>

        <!-- Grid -->
        @if (loading()) {
          <div class="loading-grid">
            @for (i of [1,2,3,4,5,6]; track i) { <div class="skeleton-card"></div> }
          </div>
        } @else if (posts().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📰</div>
            <h3>No news found</h3>
            <p>Check back soon for the latest updates.</p>
          </div>
        } @else {
          <div class="posts-grid">
            @for (post of posts(); track post.id) {
              <article class="post-card" [routerLink]="['/news', post.slug]">
                <div class="card-image">
                  @if (post.thumbnailUrl) {
                    <img [src]="post.thumbnailUrl" [alt]="post.titleEn" loading="lazy" />
                  } @else {
                    <div class="image-placeholder"><span>📰</span></div>
                  }
                  @if (post.isFeatured) { <span class="badge-featured">Featured</span> }
                </div>
                <div class="card-body">
                  @if (post.categoryNameEn) { <span class="card-cat">{{ post.categoryNameEn }}</span> }
                  <h3>{{ post.titleEn }}</h3>
                  @if (post.summaryEn) { <p class="card-summary">{{ post.summaryEn }}</p> }
                  <div class="card-meta">
                    <span>{{ post.publishedAt | date:'mediumDate' }}</span>
                    <span>{{ post.readingTimeMinutes }} min read</span>
                  </div>
                </div>
              </article>
            }
          </div>

          @if (hasMore()) {
            <div class="load-more">
              <button class="btn-load" (click)="loadMore()" [disabled]="loadingMore()">
                {{ loadingMore() ? 'Loading...' : 'Load More' }}
              </button>
            </div>
          }
        }
      </section>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .news-page { min-height: 100vh; background: var(--bg-surface); }
    .page-hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 80px 0 60px; color: #fff; text-align: center; }
    .page-tag { display: inline-block; padding: 4px 14px; background: rgba(255,255,255,.1); border-radius: 20px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; }
    .page-hero h1 { font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin: 0 0 12px; }
    .page-hero p { color: rgba(255,255,255,.7); font-size: 1.1rem; }
    .content-section { padding: 48px 24px; }
    .filters-bar { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin-bottom: 36px; }
    .search-box { position: relative; flex: 1; min-width: 220px; }
    .search-box input { width: 100%; padding: 10px 40px 10px 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); color: var(--text-primary); font-size: 14px; }
    .search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
    .category-pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .category-pills button { padding: 6px 16px; border: 1px solid var(--border); border-radius: 20px; background: none; cursor: pointer; color: var(--text-secondary); font-size: 13px; transition: all .2s; }
    .category-pills button.active, .category-pills button:hover { background: var(--accent); border-color: var(--accent); color: #fff; }
    .posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .post-card { background: var(--bg-card); border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform .2s, box-shadow .2s; border: 1px solid var(--border); }
    .post-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.12); }
    .card-image { position: relative; height: 200px; overflow: hidden; background: var(--bg-surface); }
    .card-image img { width: 100%; height: 100%; object-fit: cover; }
    .image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; background: linear-gradient(135deg, #f0f4ff, #e8f0fe); }
    .badge-featured { position: absolute; top: 12px; right: 12px; background: var(--accent); color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .card-body { padding: 20px; }
    .card-cat { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--accent); }
    .card-body h3 { font-size: 1.05rem; font-weight: 600; margin: 8px 0; color: var(--text-primary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-summary { font-size: 14px; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin: 0 0 12px; }
    .card-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .skeleton-card { height: 340px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty-state { text-align: center; padding: 80px 20px; color: var(--text-muted); }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.4rem; color: var(--text-primary); margin-bottom: 8px; }
    .load-more { text-align: center; margin-top: 48px; }
    .btn-load { padding: 12px 36px; border: 2px solid var(--accent); border-radius: 8px; background: none; color: var(--accent); font-size: 15px; cursor: pointer; transition: all .2s; }
    .btn-load:hover:not(:disabled) { background: var(--accent); color: #fff; }
    .btn-load:disabled { opacity: .5; cursor: not-allowed; }
  `]
})
export class NewsComponent implements OnInit {
  private api = inject(ContentApiService);

  posts = signal<ContentPostSummary[]>([]);
  categories = signal<ContentCategory[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  selectedCategory = signal<string | null>(null);
  searchQuery = '';
  private page = 1;
  hasMore = signal(false);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.api.getCategories().subscribe(r => this.categories.set(r.data ?? []));
    this.loadPosts(true);
  }

  selectCategory(id: string | null) {
    this.selectedCategory.set(id);
    this.loadPosts(true);
  }

  onSearch() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadPosts(true), 350);
  }

  loadMore() {
    this.page++;
    this.loadPosts(false);
  }

  private loadPosts(reset: boolean) {
    if (reset) { this.page = 1; this.loading.set(true); }
    else this.loadingMore.set(true);

    this.api.getPosts({
      page: this.page, pageSize: 9,
      type: 'News',
      categoryId: this.selectedCategory() ?? undefined,
      search: this.searchQuery || undefined,
    }).subscribe({
      next: r => {
        const items = r.data?.items ?? [];
        this.posts.set(reset ? items : [...this.posts(), ...items]);
        this.hasMore.set((r.data?.totalCount ?? 0) > this.posts().length);
      },
      complete: () => { this.loading.set(false); this.loadingMore.set(false); }
    });
  }
}
