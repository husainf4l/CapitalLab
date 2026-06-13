import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Meta, Title } from '@angular/platform-browser';
import { ContentApiService } from '../../../core/api/content-api.service';
import { ContentPostDetail } from '../../../core/models/content.models';
import { JsonLdService } from '../../../core/services/json-ld.service';
import { SocialShareComponent } from '../../../shared/components/social-share/social-share.component';
import { NewsletterSubscribeComponent } from '../../../shared/components/newsletter-subscribe/newsletter-subscribe.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe, SocialShareComponent, NewsletterSubscribeComponent],
  template: `
    <div class="article-page">
      @if (loading()) {
        <div class="container article-skeleton">
          <div class="sk-hero"></div>
          <div class="sk-title"></div>
          <div class="sk-meta"></div>
          <div class="sk-body"></div>
        </div>
      } @else if (!post()) {
        <div class="container not-found">
          <div class="nf-icon">📄</div>
          <h2>Article not found</h2>
          <p>This article may have been removed or is unavailable.</p>
          <a routerLink="/news" class="btn-back">← Back to News</a>
        </div>
      } @else {
        <article class="article-wrapper">
          <!-- Hero -->
          @if (post()!.featuredImageUrl) {
            <div class="article-hero">
              <img [src]="post()!.featuredImageUrl" [alt]="post()!.titleEn" />
              <div class="hero-overlay"></div>
            </div>
          }

          <div class="container">
            <div class="article-layout">
              <!-- Main content -->
              <main class="article-main">
                <!-- Breadcrumb -->
                <nav class="breadcrumb">
                  <a routerLink="/">Home</a>
                  <span>/</span>
                  <a [routerLink]="post()!.type === 'Blog' ? '/blog' : '/news'">
                    {{ post()!.type === 'Blog' ? 'Blog' : 'News' }}
                  </a>
                  <span>/</span>
                  <span>{{ post()!.titleEn }}</span>
                </nav>

                <!-- Category & type -->
                <div class="article-labels">
                  @if (post()!.categoryNameEn) {
                    <a [routerLink]="['/news']" [queryParams]="{category: post()!.categorySlug}" class="label-cat">
                      {{ post()!.categoryNameEn }}
                    </a>
                  }
                  <span class="label-type">{{ post()!.type }}</span>
                </div>

                <h1>{{ post()!.titleEn }}</h1>
                @if (post()!.summaryEn) { <p class="article-summary">{{ post()!.summaryEn }}</p> }

                <!-- Meta -->
                <div class="article-meta">
                  @if (post()!.authorName) {
                    <div class="author-chip">
                      @if (post()!.authorImageUrl) {
                        <img [src]="post()!.authorImageUrl" [alt]="post()!.authorName!" class="author-avatar" />
                      } @else {
                        <div class="author-initial">{{ post()!.authorName!.charAt(0) }}</div>
                      }
                      <div>
                        <div class="author-name">{{ post()!.authorName }}</div>
                        @if (post()!.authorJobTitle) { <div class="author-title">{{ post()!.authorJobTitle }}</div> }
                      </div>
                    </div>
                  }
                  <div class="meta-details">
                    <span>{{ post()!.publishedAt | date:'longDate' }}</span>
                    <span>·</span>
                    <span>{{ post()!.readingTimeMinutes }} min read</span>
                    <span>·</span>
                    <span>{{ post()!.viewCount | number }} views</span>
                  </div>
                </div>

                <hr class="divider" />

                <!-- Body -->
                <div class="article-body" [innerHTML]="safeContent()"></div>

                <!-- Tags -->
                @if (post()!.tags.length) {
                  <div class="article-tags">
                    <span class="tags-label">Tags:</span>
                    @for (tag of post()!.tags; track tag.id) {
                      <span class="tag-chip">{{ tag.name }}</span>
                    }
                  </div>
                }

                <!-- Social Share -->
                <div class="share-row">
                  <app-social-share [url]="articleUrl()" [title]="post()!.titleEn"></app-social-share>
                </div>

                <!-- Lead Generation CTAs -->
                <div class="lead-cta-grid">
                  <a routerLink="/patient/book" class="lead-cta book">
                    <span class="cta-icon">🗓️</span>
                    <div>
                      <div class="cta-title">Book a Test</div>
                      <div class="cta-sub">Schedule at a branch or at home</div>
                    </div>
                  </a>
                  <a routerLink="/tests" class="lead-cta tests">
                    <span class="cta-icon">🔬</span>
                    <div>
                      <div class="cta-title">View All Tests</div>
                      <div class="cta-sub">Browse our full test catalog</div>
                    </div>
                  </a>
                  <a routerLink="/patient/home-collection" class="lead-cta home-collect">
                    <span class="cta-icon">🏠</span>
                    <div>
                      <div class="cta-title">Home Collection</div>
                      <div class="cta-sub">We come to you</div>
                    </div>
                  </a>
                  <a routerLink="/packages" class="lead-cta packages">
                    <span class="cta-icon">📦</span>
                    <div>
                      <div class="cta-title">Health Packages</div>
                      <div class="cta-sub">Comprehensive wellness panels</div>
                    </div>
                  </a>
                </div>

                <!-- Newsletter -->
                <div class="article-newsletter">
                  <app-newsletter-subscribe></app-newsletter-subscribe>
                </div>
              </main>

              <!-- Sidebar -->
              <aside class="article-sidebar">
                <!-- Related posts -->
                @if (post()!.relatedPosts.length) {
                  <div class="sidebar-card">
                    <h4>Related Articles</h4>
                    <div class="related-list">
                      @for (rel of post()!.relatedPosts; track rel.id) {
                        <a [routerLink]="['/article', rel.slug]" class="related-item">
                          @if (rel.thumbnailUrl) {
                            <img [src]="rel.thumbnailUrl" [alt]="rel.titleEn" class="related-thumb" />
                          } @else {
                            <div class="related-thumb-placeholder">✍️</div>
                          }
                          <div>
                            <p class="related-title">{{ rel.titleEn }}</p>
                            <span class="related-date">{{ rel.publishedAt | date:'mediumDate' }}</span>
                          </div>
                        </a>
                      }
                    </div>
                  </div>
                }

                <!-- Author bio -->
                @if (post()!.authorBio) {
                  <div class="sidebar-card author-bio-card">
                    <h4>About the Author</h4>
                    @if (post()!.authorImageUrl) {
                      <img [src]="post()!.authorImageUrl" [alt]="post()!.authorName!" class="bio-avatar" />
                    }
                    <p class="bio-name">{{ post()!.authorName }}</p>
                    @if (post()!.authorJobTitle) { <p class="bio-title">{{ post()!.authorJobTitle }}</p> }
                    <p class="bio-text">{{ post()!.authorBio }}</p>
                  </div>
                }
              </aside>
            </div>
          </div>
        </article>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .article-page { min-height: 100vh; background: var(--bg-surface); }
    .article-hero { position: relative; height: 480px; overflow: hidden; }
    .article-hero img { width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.4)); }
    .article-wrapper { padding-bottom: 80px; }
    .article-layout { display: grid; grid-template-columns: 1fr 320px; gap: 48px; padding: 48px 24px; }
    .article-main { min-width: 0; }
    .breadcrumb { display: flex; gap: 8px; font-size: 13px; color: var(--text-muted); margin-bottom: 20px; flex-wrap: wrap; }
    .breadcrumb a { color: var(--accent); text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .article-labels { display: flex; gap: 8px; margin-bottom: 16px; }
    .label-cat { padding: 4px 12px; background: var(--accent); color: #fff; border-radius: 20px; font-size: 12px; font-weight: 600; text-decoration: none; }
    .label-type { padding: 4px 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-secondary); }
    h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 700; color: var(--text-primary); line-height: 1.25; margin: 0 0 16px; }
    .article-summary { font-size: 1.1rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px; }
    .article-meta { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 24px; }
    .author-chip { display: flex; align-items: center; gap: 12px; }
    .author-avatar, .author-initial { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .author-initial { background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; }
    .author-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .author-title { font-size: 12px; color: var(--text-muted); }
    .meta-details { display: flex; gap: 8px; font-size: 13px; color: var(--text-muted); align-items: center; flex-wrap: wrap; }
    .divider { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
    .article-body { font-size: 16px; line-height: 1.8; color: var(--text-primary); }
    .article-body :global(h2) { font-size: 1.5rem; font-weight: 700; margin: 32px 0 16px; }
    .article-body :global(h3) { font-size: 1.2rem; font-weight: 600; margin: 24px 0 12px; }
    .article-body :global(p) { margin: 0 0 16px; }
    .article-body :global(img) { max-width: 100%; border-radius: 8px; margin: 16px 0; }
    .article-body :global(ul), .article-body :global(ol) { margin: 0 0 16px 24px; }
    .article-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 32px; align-items: center; }
    .tags-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
    .tag-chip { padding: 4px 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--text-secondary); }
    .article-sidebar { display: flex; flex-direction: column; gap: 24px; }
    .sidebar-card { background: var(--bg-card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); }
    .sidebar-card h4 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
    .related-list { display: flex; flex-direction: column; gap: 12px; }
    .related-item { display: flex; gap: 12px; text-decoration: none; padding: 8px; border-radius: 8px; transition: background .2s; }
    .related-item:hover { background: var(--bg-surface); }
    .related-thumb { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
    .related-thumb-placeholder { width: 64px; height: 64px; border-radius: 8px; background: var(--bg-surface); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    .related-title { font-size: 13px; font-weight: 500; color: var(--text-primary); margin: 0 0 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .related-date { font-size: 11px; color: var(--text-muted); }
    .author-bio-card { text-align: center; }
    .bio-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; margin-bottom: 8px; }
    .bio-name { font-weight: 600; color: var(--text-primary); margin: 0; }
    .bio-title { font-size: 12px; color: var(--text-muted); margin: 4px 0 8px; }
    .bio-text { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0; text-align: left; }
    .not-found { text-align: center; padding: 120px 20px; }
    .nf-icon { font-size: 64px; margin-bottom: 16px; }
    .not-found h2 { font-size: 1.8rem; color: var(--text-primary); margin-bottom: 8px; }
    .not-found p { color: var(--text-muted); margin-bottom: 24px; }
    .btn-back { display: inline-block; padding: 10px 24px; background: var(--accent); color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .article-skeleton { padding: 48px 24px; }
    .sk-hero { height: 480px; border-radius: 12px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 32px; }
    .sk-title { height: 48px; width: 70%; border-radius: 8px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 16px; }
    .sk-meta { height: 24px; width: 40%; border-radius: 6px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 32px; }
    .sk-body { height: 400px; border-radius: 8px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .share-row { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border); }
    .lead-cta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 32px; }
    .lead-cta {
      display: flex; align-items: center; gap: 12px; padding: 16px;
      border-radius: 12px; text-decoration: none; border: 1px solid var(--border);
      transition: transform .2s, box-shadow .2s; background: var(--bg-card);
      &:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    }
    .cta-icon { font-size: 1.5rem; flex-shrink: 0; }
    .cta-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .cta-sub { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
    .article-newsletter { margin-top: 40px; }
    @media (max-width: 600px) { .lead-cta-grid { grid-template-columns: 1fr; } }
    @media (max-width: 1024px) { .article-layout { grid-template-columns: 1fr; } .article-sidebar { display: none; } }
  `]
})
export class ArticleComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ContentApiService);
  private jsonLd = inject(JsonLdService);
  private sanitizer = inject(DomSanitizer);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private destroy$ = new Subject<void>();

  post = signal<ContentPostDetail | null>(null);
  loading = signal(true);
  safeContent = signal<SafeHtml>('');

  articleUrl(): string {
    const p = this.post();
    if (!p) return window.location.href;
    return `${window.location.origin}/article/${p.slug}`;
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params.get('slug')!;
      this.loading.set(true);
      this.api.getPostBySlug(slug).subscribe({
        next: r => {
          this.post.set(r.data ?? null);
          if (r.data?.contentEn) {
            this.safeContent.set(this.sanitizer.bypassSecurityTrustHtml(r.data.contentEn));
          }
          if (r.data) this.applyMeta(r.data);
        },
        complete: () => this.loading.set(false)
      });
    });
  }

  private applyMeta(p: ContentPostDetail): void {
    const title = p.metaTitle ?? p.titleEn;
    const desc = p.metaDescription ?? p.summaryEn ?? '';
    const image = p.featuredImageUrl ?? p.thumbnailUrl ?? '';
    const url = `${window.location.origin}/article/${p.slug}`;

    this.titleService.setTitle(`${title} | Capital Lab`);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ name: 'keywords', content: p.keywords ?? '' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    if (p.publishedAt) {
      this.meta.updateTag({ property: 'article:published_time', content: p.publishedAt });
    }
    if (p.authorName) {
      this.meta.updateTag({ property: 'article:author', content: p.authorName });
    }

    // JSON-LD structured data
    const schema = p.type === 'Blog'
      ? this.jsonLd.blogPostingSchema({ title, description: desc, imageUrl: image, author: p.authorName, publishedAt: p.publishedAt, url })
      : this.jsonLd.articleSchema({ title, description: desc, imageUrl: image, author: p.authorName, publishedAt: p.publishedAt, updatedAt: p.updatedAt, url, keywords: p.keywords });

    this.jsonLd.setSchema([
      schema,
      this.jsonLd.breadcrumbSchema([
        { name: 'Home', url: window.location.origin },
        { name: p.type === 'Blog' ? 'Blog' : 'News', url: `${window.location.origin}/${p.type === 'Blog' ? 'blog' : 'news'}` },
        { name: p.titleEn, url },
      ]),
    ]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.jsonLd.removeSchema();
  }
}
