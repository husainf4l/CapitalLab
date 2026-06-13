import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContentApiService } from '../../../core/api/content-api.service';
import { ContentPostSummary } from '../../../core/models/content.models';

@Component({
  selector: 'app-popular-articles-widget',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="widget">
      <div class="widget-header">
        <h3 class="widget-title">Most Read Articles</h3>
        <a routerLink="/blog" class="view-all-link">View All →</a>
      </div>

      @if (loading()) {
        <div class="loading-list">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="sk-row">
              <div class="sk-rank"></div>
              <div class="sk-thumb"></div>
              <div class="sk-info">
                <div class="sk-line wide"></div>
                <div class="sk-line narrow"></div>
              </div>
            </div>
          }
        </div>
      } @else if (posts().length === 0) {
        <div class="empty">No articles yet.</div>
      } @else {
        <ol class="articles-list">
          @for (post of posts(); track post.id; let rank = $index) {
            <li class="article-row" [routerLink]="['/article', post.slug]">
              <span class="rank" [class.top3]="rank < 3">{{ rank + 1 }}</span>
              <div class="article-thumb">
                @if (post.thumbnailUrl) {
                  <img [src]="post.thumbnailUrl" [alt]="post.titleEn" loading="lazy" />
                } @else {
                  <div class="thumb-fallback">✍️</div>
                }
              </div>
              <div class="article-info">
                <p class="article-title">{{ post.titleEn }}</p>
                <div class="article-meta">
                  <span class="meta-views">{{ post.viewCount }} views</span>
                  <span class="meta-sep">·</span>
                  <span>{{ post.readingTimeMinutes }} min</span>
                </div>
              </div>
            </li>
          }
        </ol>
      }

      <a routerLink="/blog" class="view-all-btn">View All Articles</a>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .widget {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 22px;
    }

    /* Header */
    .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .widget-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .view-all-link { font-size: 13px; color: #7b1fa2; text-decoration: none; font-weight: 500; transition: opacity .2s; }
    .view-all-link:hover { opacity: .75; }

    /* Articles list */
    .articles-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
    .article-row { display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-radius: 9px; cursor: pointer; transition: background .15s; text-decoration: none; }
    .article-row:hover { background: var(--bg-surface); }

    /* Rank */
    .rank { width: 26px; height: 26px; border-radius: 50%; background: var(--bg-surface); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--text-muted); flex-shrink: 0; transition: all .2s; }
    .rank.top3 { background: linear-gradient(135deg, #7b1fa2, #9c27b0); border-color: transparent; color: white; }

    /* Thumbnail */
    .article-thumb { width: 52px; height: 52px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--bg-surface); }
    .article-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 22px; background: linear-gradient(135deg, #f3e5f5, #e1bee7); }

    /* Info */
    .article-info { flex: 1; min-width: 0; }
    .article-title { font-size: 13px; font-weight: 500; color: var(--text-primary); margin: 0 0 4px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .article-meta { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted); }
    .meta-views { color: #7b1fa2; font-weight: 500; }
    .meta-sep { color: var(--border); }

    /* Footer button */
    .view-all-btn { display: block; text-align: center; margin-top: 18px; padding: 10px 0; border: 1.5px solid #7b1fa2; border-radius: 8px; color: #7b1fa2; text-decoration: none; font-size: 13px; font-weight: 600; transition: all .2s; }
    .view-all-btn:hover { background: #7b1fa2; color: white; }

    /* Loading skeleton */
    .loading-list { display: flex; flex-direction: column; gap: 10px; }
    .sk-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
    .sk-rank { width: 26px; height: 26px; border-radius: 50%; background: var(--border); flex-shrink: 0; animation: shimmer 1.5s infinite; }
    .sk-thumb { width: 52px; height: 52px; border-radius: 8px; background: var(--border); flex-shrink: 0; animation: shimmer 1.5s infinite; }
    .sk-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .sk-line { height: 12px; border-radius: 6px; background: var(--border); animation: shimmer 1.5s infinite; }
    .sk-line.wide { width: 85%; }
    .sk-line.narrow { width: 45%; }
    @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }

    /* Empty */
    .empty { text-align: center; padding: 24px; color: var(--text-muted); font-size: 14px; }
  `]
})
export class PopularArticlesWidgetComponent implements OnInit {
  private api = inject(ContentApiService);

  posts = signal<ContentPostSummary[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.api.getPopularPosts(5).subscribe({
      next: r => this.posts.set(r.data ?? []),
      complete: () => this.loading.set(false),
    });
  }
}
