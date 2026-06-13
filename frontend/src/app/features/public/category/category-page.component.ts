import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { ContentApiService } from '../../../core/api/content-api.service';
import { ContentCategoryDetail, ContentPostSummary } from '../../../core/models/content.models';
import { JsonLdService } from '../../../core/services/json-ld.service';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe],
  template: `
    <div class="category-page">

      @if (loading()) {
        <!-- Loading skeleton -->
        <div class="sk-hero-bar"></div>
        <div class="container sk-body">
          <div class="sk-featured"></div>
          <div class="sk-grid">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="sk-card"></div>
            }
          </div>
        </div>

      } @else if (!category()) {
        <!-- Not found -->
        <div class="not-found container">
          <div class="nf-icon">📂</div>
          <h2>Category not found</h2>
          <p>This category doesn't exist or has been removed.</p>
          <a routerLink="/blog" class="btn-back">← Back to Blog</a>
        </div>

      } @else if (category(); as cat) {
        <!-- Breadcrumb -->
        <nav class="breadcrumb container">
          <a routerLink="/">Home</a>
          <span>/</span>
          <a routerLink="/blog">Blog</a>
          <span>/</span>
          <span>{{ cat.nameEn }}</span>
        </nav>

        <!-- Category hero -->
        <section class="category-hero">
          <div class="container">
            <span class="category-tag">Category</span>
            <h1>{{ cat.nameEn }}</h1>
            @if (cat.description) {
              <p class="category-desc">{{ cat.description }}</p>
            }
            <div class="post-count-chip">
              <span>{{ cat.postCount }}</span> Articles
            </div>
          </div>
        </section>

        <!-- Featured posts section -->
        @if (cat.featuredPosts.length) {
          <section class="featured-section container">
            <h2 class="section-title">Featured in this Category</h2>
            <div class="featured-list">
              @for (post of cat.featuredPosts; track post.id) {
                <div class="featured-card" [routerLink]="['/article', post.slug]">
                  <div class="featured-img">
                    @if (post.featuredImageUrl || post.thumbnailUrl) {
                      <img [src]="post.featuredImageUrl || post.thumbnailUrl" [alt]="post.titleEn" loading="lazy" />
                    } @else {
                      <div class="img-placeholder">✍️</div>
                    }
                    <span class="featured-label">Featured</span>
                  </div>
                  <div class="featured-body">
                    <h3>{{ post.titleEn }}</h3>
                    @if (post.summaryEn) {
                      <p>{{ post.summaryEn }}</p>
                    }
                    <div class="card-meta">
                      @if (post.authorName) { <span>By {{ post.authorName }}</span> }
                      @if (post.publishedAt) { <span>{{ post.publishedAt | date:'mediumDate' }}</span> }
                      <span>{{ post.readingTimeMinutes }} min read</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        }

        <!-- Recent posts grid -->
        @if (cat.recentPosts.length) {
          <section class="recent-section container">
            <h2 class="section-title">Recent Articles</h2>
            <div class="posts-grid">
              @for (post of cat.recentPosts; track post.id) {
                <article class="post-card" [routerLink]="['/article', post.slug]">
                  <div class="card-thumb">
                    @if (post.thumbnailUrl) {
                      <img [src]="post.thumbnailUrl" [alt]="post.titleEn" loading="lazy" />
                    } @else {
                      <div class="thumb-placeholder">✍️</div>
                    }
                  </div>
                  <div class="card-body">
                    <h3>{{ post.titleEn }}</h3>
                    @if (post.summaryEn) {
                      <p class="card-summary">{{ post.summaryEn }}</p>
                    }
                    <div class="card-meta">
                      @if (post.publishedAt) { <span>{{ post.publishedAt | date:'mediumDate' }}</span> }
                      <span>{{ post.readingTimeMinutes }} min read</span>
                    </div>
                  </div>
                </article>
              }
            </div>
          </section>
        } @else {
          <div class="empty-posts container">
            <p>No articles in this category yet.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .category-page { min-height: 100vh; background: var(--bg-surface); }

    /* Breadcrumb */
    .breadcrumb { display: flex; align-items: center; gap: 8px; padding: 16px 24px; font-size: 13px; color: var(--text-muted); }
    .breadcrumb a { color: var(--text-muted); text-decoration: none; transition: color .2s; }
    .breadcrumb a:hover { color: #065f46; }
    .breadcrumb span { color: var(--border); }

    /* Hero */
    .category-hero { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); color: white; padding: 72px 0 60px; text-align: center; }
    .category-hero .container { padding: 0 24px; }
    .category-tag { display: inline-block; padding: 4px 14px; background: rgba(255,255,255,.15); border-radius: 20px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px; }
    .category-hero h1 { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; color: white; margin: 0 0 16px; line-height: 1.2; }
    .category-desc { color: rgba(255,255,255,.8); font-size: 1.1rem; max-width: 600px; margin: 0 auto 24px; line-height: 1.6; }
    .post-count-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 18px; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25); border-radius: 20px; font-size: 14px; color: rgba(255,255,255,.9); }
    .post-count-chip span { font-weight: 700; font-size: 18px; color: white; }

    /* Sections */
    .featured-section, .recent-section { padding: 48px 24px; }
    .section-title { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin: 0 0 24px; padding-bottom: 12px; border-bottom: 2px solid var(--border); }

    /* Featured list — large horizontal cards */
    .featured-list { display: flex; flex-direction: column; gap: 24px; }
    .featured-card { display: grid; grid-template-columns: 380px 1fr; gap: 0; background: var(--bg-card); border-radius: 16px; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: box-shadow .2s, transform .2s; }
    .featured-card:hover { box-shadow: 0 16px 40px rgba(0,0,0,.12); transform: translateY(-2px); }
    .featured-img { position: relative; height: 240px; overflow: hidden; background: var(--bg-surface); }
    .featured-img img { width: 100%; height: 100%; object-fit: cover; }
    .img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 52px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); }
    .featured-label { position: absolute; top: 14px; left: 14px; padding: 4px 12px; background: #065f46; color: white; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .featured-body { padding: 32px; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
    .featured-body h3 { font-size: 1.35rem; font-weight: 700; color: var(--text-primary); line-height: 1.35; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .featured-body p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

    /* Posts grid */
    .posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .post-card { background: var(--bg-card); border-radius: 12px; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: transform .2s, box-shadow .2s; }
    .post-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.12); }
    .card-thumb { height: 180px; overflow: hidden; background: var(--bg-surface); }
    .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); }
    .card-body { padding: 18px; }
    .card-body h3 { font-size: 1rem; font-weight: 600; margin: 0 0 8px; color: var(--text-primary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-summary { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-meta { display: flex; gap: 10px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; }

    /* Skeleton */
    .sk-hero-bar { height: 240px; background: linear-gradient(135deg, #064e3b, #065f46); margin-bottom: 0; }
    .sk-body { padding: 48px 24px; }
    .sk-featured { height: 240px; border-radius: 16px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 40px; }
    .sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .sk-card { height: 280px; border-radius: 12px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Not found */
    .not-found { text-align: center; padding: 100px 20px; color: var(--text-muted); }
    .nf-icon { font-size: 64px; margin-bottom: 16px; }
    .not-found h2 { font-size: 1.6rem; color: var(--text-primary); margin-bottom: 10px; }
    .btn-back { display: inline-block; margin-top: 20px; padding: 10px 24px; background: #065f46; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; }

    .empty-posts { padding: 40px 24px 60px; color: var(--text-muted); text-align: center; font-size: 15px; }

    @media (max-width: 900px) {
      .posts-grid { grid-template-columns: repeat(2, 1fr); }
      .featured-card { grid-template-columns: 1fr; }
      .featured-img { height: 220px; }
    }
    @media (max-width: 600px) {
      .posts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ContentApiService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private jsonLd = inject(JsonLdService);
  private destroy$ = new Subject<void>();

  category = signal<ContentCategoryDetail | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params.get('slug');
      if (!slug) { this.loading.set(false); return; }
      this.loading.set(true);
      this.api.getCategoryBySlug(slug).pipe(takeUntil(this.destroy$)).subscribe({
        next: r => {
          const cat = r.data ?? null;
          this.category.set(cat);
          if (cat) {
            this.titleService.setTitle(`${cat.nameEn} | Capital Lab`);
            const desc = cat.description ?? `Browse ${cat.postCount} articles in ${cat.nameEn}`;
            this.meta.updateTag({ name: 'description', content: desc });
            this.meta.updateTag({ property: 'og:title', content: `${cat.nameEn} | Capital Lab` });
            this.meta.updateTag({ property: 'og:description', content: desc });
            this.jsonLd.setSchema({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: cat.nameEn,
              description: cat.description,
              url: `https://capitallab.com/blog/category/${cat.slug}`,
            });
          }
        },
        complete: () => this.loading.set(false),
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.jsonLd.removeSchema();
  }
}
