import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { ContentApiService } from '../../../core/api/content-api.service';
import { ContentAuthorDetail, ContentPostSummary } from '../../../core/models/content.models';
import { JsonLdService } from '../../../core/services/json-ld.service';

@Component({
  selector: 'app-author-page',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe],
  template: `
    <div class="author-page">

      @if (loading()) {
        <!-- Loading skeleton -->
        <div class="author-skeleton">
          <div class="sk-hero">
            <div class="sk-avatar"></div>
            <div class="sk-info">
              <div class="sk-line wide"></div>
              <div class="sk-line medium"></div>
              <div class="sk-line narrow"></div>
            </div>
          </div>
          <div class="container sk-grid">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="sk-card"></div>
            }
          </div>
        </div>

      } @else if (!author()) {
        <!-- Not found state -->
        <div class="not-found container">
          <div class="nf-icon">👤</div>
          <h2>Author not found</h2>
          <p>This author profile doesn't exist or has been removed.</p>
          <a routerLink="/" class="btn-back">← Back to Home</a>
        </div>

      } @else if (author(); as a) {
        <!-- Breadcrumb -->
        <nav class="breadcrumb container">
          <a routerLink="/">Home</a>
          <span>/</span>
          <a routerLink="/blog">Authors</a>
          <span>/</span>
          <span>{{ a.fullName }}</span>
        </nav>

        <!-- Hero section -->
        <section class="author-hero">
          <div class="container author-hero-inner">
            <div class="author-avatar-wrap">
              @if (a.imageUrl) {
                <img [src]="a.imageUrl" [alt]="a.fullName" class="author-img" />
              } @else {
                <div class="author-initials">{{ initials() }}</div>
              }
            </div>
            <div class="author-meta">
              <h1 class="author-name">{{ a.fullName }}</h1>
              @if (a.jobTitle) {
                <p class="author-job">{{ a.jobTitle }}</p>
              }
              <div class="author-badges">
                @if (a.credentials) {
                  @for (cred of credentialList(); track cred) {
                    <span class="cred-badge">{{ cred }}</span>
                  }
                }
                <span class="post-count-badge">{{ a.postCount }} Articles</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Bio section -->
        @if (a.bio) {
          <section class="bio-section container">
            <h2 class="section-title">About</h2>
            <p class="bio-text">{{ a.bio }}</p>
          </section>
        }

        <!-- Articles grid -->
        @if (a.recentPosts.length) {
          <section class="articles-section container">
            <h2 class="section-title">Published Articles</h2>
            <div class="articles-grid">
              @for (post of a.recentPosts; track post.id) {
                <article class="article-card" [routerLink]="['/article', post.slug]">
                  <div class="card-thumb">
                    @if (post.thumbnailUrl) {
                      <img [src]="post.thumbnailUrl" [alt]="post.titleEn" loading="lazy" />
                    } @else {
                      <div class="thumb-placeholder">✍️</div>
                    }
                  </div>
                  <div class="card-body">
                    @if (post.categoryNameEn) {
                      <span class="card-cat">{{ post.categoryNameEn }}</span>
                    }
                    <h3>{{ post.titleEn }}</h3>
                    @if (post.summaryEn) {
                      <p class="card-summary">{{ post.summaryEn }}</p>
                    }
                    <div class="card-meta">
                      @if (post.publishedAt) {
                        <span>{{ post.publishedAt | date:'mediumDate' }}</span>
                      }
                      <span>{{ post.readingTimeMinutes }} min read</span>
                    </div>
                  </div>
                </article>
              }
            </div>
          </section>
        } @else {
          <section class="empty-posts container">
            <p>No published articles yet.</p>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .author-page { min-height: 100vh; background: var(--bg-surface); }

    /* Breadcrumb */
    .breadcrumb { display: flex; align-items: center; gap: 8px; padding: 16px 24px; font-size: 13px; color: var(--text-muted); }
    .breadcrumb a { color: var(--text-muted); text-decoration: none; transition: color .2s; }
    .breadcrumb a:hover { color: #7b1fa2; }
    .breadcrumb span { color: var(--border); }

    /* Hero */
    .author-hero { background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 50%, #9c27b0 100%); color: white; padding: 60px 0; }
    .author-hero-inner { display: flex; align-items: center; gap: 36px; padding: 0 24px; flex-wrap: wrap; }
    .author-avatar-wrap { flex-shrink: 0; }
    .author-img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,.3); box-shadow: 0 8px 32px rgba(0,0,0,.2); }
    .author-initials { width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,.2); border: 4px solid rgba(255,255,255,.3); display: flex; align-items: center; justify-content: center; font-size: 42px; font-weight: 700; color: white; }
    .author-meta { flex: 1; }
    .author-name { font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 800; color: white; margin: 0 0 8px; }
    .author-job { font-size: 1.1rem; color: rgba(255,255,255,.8); margin: 0 0 16px; }
    .author-badges { display: flex; gap: 10px; flex-wrap: wrap; }
    .cred-badge { padding: 5px 14px; background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.3); border-radius: 20px; font-size: 12px; font-weight: 600; color: white; }
    .post-count-badge { padding: 5px 14px; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25); border-radius: 20px; font-size: 12px; color: rgba(255,255,255,.9); }

    /* Bio */
    .bio-section { padding: 48px 24px 0; max-width: 800px; }
    .section-title { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin: 0 0 16px; padding-bottom: 12px; border-bottom: 2px solid var(--border); }
    .bio-text { font-size: 1rem; color: var(--text-secondary); line-height: 1.8; margin: 0; }

    /* Articles */
    .articles-section { padding: 40px 24px 60px; }
    .articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-top: 8px; }
    .article-card { background: var(--bg-card); border-radius: 12px; overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: transform .2s, box-shadow .2s; }
    .article-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.12); }
    .card-thumb { height: 180px; overflow: hidden; background: var(--bg-surface); }
    .card-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; background: linear-gradient(135deg, #f3e5f5, #e1bee7); }
    .card-body { padding: 18px; }
    .card-cat { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #7b1fa2; }
    .card-body h3 { font-size: 1rem; font-weight: 600; margin: 6px 0 8px; color: var(--text-primary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-summary { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-meta { display: flex; gap: 10px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; }

    /* Skeleton */
    .author-skeleton { padding: 24px; }
    .sk-hero { display: flex; gap: 24px; align-items: center; padding: 40px 24px; background: linear-gradient(135deg, #4a148c, #7b1fa2); border-radius: 12px; margin-bottom: 40px; }
    .sk-avatar { width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,.2); flex-shrink: 0; }
    .sk-info { flex: 1; display: flex; flex-direction: column; gap: 12px; }
    .sk-line { height: 16px; border-radius: 8px; background: rgba(255,255,255,.2); animation: shimmer 1.5s infinite; }
    .sk-line.wide { width: 60%; }
    .sk-line.medium { width: 40%; }
    .sk-line.narrow { width: 25%; }
    .sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .sk-card { height: 300px; border-radius: 12px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Not found */
    .not-found { text-align: center; padding: 100px 20px; color: var(--text-muted); }
    .nf-icon { font-size: 64px; margin-bottom: 16px; }
    .not-found h2 { font-size: 1.6rem; color: var(--text-primary); margin-bottom: 10px; }
    .btn-back { display: inline-block; margin-top: 20px; padding: 10px 24px; background: #7b1fa2; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; }

    /* Empty */
    .empty-posts { padding: 40px 24px; color: var(--text-muted); text-align: center; font-size: 15px; }

    @media (max-width: 600px) {
      .author-hero-inner { flex-direction: column; text-align: center; }
      .author-badges { justify-content: center; }
    }
  `]
})
export class AuthorPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ContentApiService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private jsonLd = inject(JsonLdService);
  private destroy$ = new Subject<void>();

  author = signal<ContentAuthorDetail | null>(null);
  loading = signal(true);

  initials = () => {
    const a = this.author();
    if (!a) return '';
    return a.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  credentialList = () => {
    const creds = this.author()?.credentials;
    if (!creds) return [];
    return creds.split(',').map(c => c.trim()).filter(Boolean);
  };

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params.get('slug');
      if (!slug) { this.loading.set(false); return; }
      this.loading.set(true);
      this.api.getAuthorBySlug(slug).pipe(takeUntil(this.destroy$)).subscribe({
        next: r => {
          const author = r.data ?? null;
          this.author.set(author);
          if (author) {
            this.titleService.setTitle(`${author.fullName} | Capital Lab`);
            this.meta.updateTag({ name: 'description', content: author.bio ?? `Articles by ${author.fullName}` });
            this.meta.updateTag({ property: 'og:title', content: `${author.fullName} | Capital Lab` });
            this.meta.updateTag({ property: 'og:description', content: author.bio ?? '' });
            if (author.imageUrl) {
              this.meta.updateTag({ property: 'og:image', content: author.imageUrl });
            }
            this.jsonLd.setSchema({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: author.fullName,
              jobTitle: author.jobTitle,
              description: author.bio,
              image: author.imageUrl,
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
