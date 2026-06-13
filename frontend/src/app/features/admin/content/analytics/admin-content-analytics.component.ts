import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ContentAnalytics, ContentPostSummary, ContentCategory } from '../../../../core/models/content.models';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-admin-content-analytics',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1>Content Analytics</h1>
          <p>Performance overview for all published content</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-icon class="spin">autorenew</mat-icon>
          <span>Loading analytics...</span>
        </div>
      } @else if (analytics(); as data) {
        <!-- Stats grid -->
        <div class="stats-grid">
          @for (card of statCards(); track card.label) {
            <div class="stat-card" [style.--card-color]="card.color" [style.--card-bg]="card.bg">
              <div class="stat-icon">
                <mat-icon>{{ card.icon }}</mat-icon>
              </div>
              <div class="stat-body">
                <span class="stat-value">{{ card.value | number }}</span>
                <span class="stat-label">{{ card.label }}</span>
              </div>
            </div>
          }
        </div>

        <div class="bottom-grid">
          <!-- Top articles table -->
          <div class="panel">
            <div class="panel-header">
              <mat-icon>trending_up</mat-icon>
              <h2>Top Articles</h2>
            </div>
            @if (data.topPosts.length) {
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col" class="col-article">Article</th>
                      <th scope="col" class="col-type">Type</th>
                      <th scope="col" class="col-views">Views</th>
                      <th scope="col" class="col-date">Published</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (post of data.topPosts; track post.id) {
                      <tr>
                        <td class="col-article">
                          <div class="post-row">
                            <div class="post-thumb">
                              @if (post.thumbnailUrl) {
                                <img [src]="post.thumbnailUrl" [alt]="post.titleEn" />
                              } @else {
                                <div class="thumb-fallback">✍️</div>
                              }
                            </div>
                            <span class="post-title">{{ post.titleEn }}</span>
                          </div>
                        </td>
                        <td class="col-type">
                          <span class="type-badge" [class]="'type-' + post.type.toLowerCase()">{{ post.type }}</span>
                        </td>
                        <td class="col-views">
                          <span class="views-num">{{ post.viewCount | number }}</span>
                        </td>
                        <td class="col-date">
                          {{ post.publishedAt | date:'mediumDate' }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="panel-empty">No post data available.</div>
            }
          </div>

          <!-- Top categories -->
          <div class="panel panel-narrow">
            <div class="panel-header">
              <mat-icon>category</mat-icon>
              <h2>Top Categories</h2>
            </div>
            @if (data.topCategories.length) {
              <div class="cat-list">
                @for (cat of data.topCategories; track cat.id; let i = $index) {
                  <div class="cat-row">
                    <div class="cat-rank">{{ i + 1 }}</div>
                    <div class="cat-info">
                      <span class="cat-name">{{ cat.nameEn }}</span>
                      <div class="cat-bar-wrap">
                        <div class="cat-bar" [style.width.%]="barWidth(cat.postCount)"></div>
                      </div>
                    </div>
                    <span class="cat-count">{{ cat.postCount }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="panel-empty">No categories found.</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../../styles/variables' as *;

    .page-wrapper { padding: 24px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
    .page-header p { color: var(--text-muted); font-size: 14px; margin: 0; }

    /* Loading */
    .loading-state { display: flex; align-items: center; gap: 10px; padding: 60px; color: var(--text-muted); justify-content: center; font-size: 15px; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Stats grid */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card { display: flex; align-items: center; gap: 14px; padding: 18px 20px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); }
    .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: var(--card-bg, #f3e5f5); flex-shrink: 0; }
    .stat-icon mat-icon { color: var(--card-color, #7b1fa2); font-size: 22px; width: 22px; height: 22px; }
    .stat-body { display: flex; flex-direction: column; gap: 2px; }
    .stat-value { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }

    /* Bottom grid */
    .bottom-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }

    /* Panels */
    .panel { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
    .panel-header { display: flex; align-items: center; gap: 8px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
    .panel-header mat-icon { color: var(--text-muted); font-size: 20px; width: 20px; height: 20px; }
    .panel-header h2 { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
    .panel-empty { padding: 40px; text-align: center; color: var(--text-muted); font-size: 14px; }

    /* Table */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    thead th { padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); background: var(--bg-surface); text-align: left; border-bottom: 1px solid var(--border); }
    tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: var(--bg-surface); }
    tbody td { padding: 12px 16px; font-size: 14px; color: var(--text-secondary); vertical-align: middle; }
    .col-article { width: 50%; }
    .col-type { width: 15%; }
    .col-views { width: 15%; text-align: right; }
    .col-date { width: 20%; text-align: right; }
    .post-row { display: flex; align-items: center; gap: 10px; }
    .post-thumb { width: 40px; height: 40px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: var(--bg-surface); }
    .post-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .post-title { font-size: 13px; color: var(--text-primary); font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .type-badge { padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .type-blog { background: #dbeafe; color: #1d4ed8; }
    .type-news { background: #d1fae5; color: #065f46; }
    .type-promotion { background: #fef9c3; color: #854d0e; }
    .type-announcement { background: #f3e5f5; color: #7b1fa2; }
    .views-num { font-weight: 600; color: var(--text-primary); }

    /* Categories panel */
    .cat-list { padding: 8px 0; }
    .cat-row { display: flex; align-items: center; gap: 10px; padding: 10px 16px; }
    .cat-row:hover { background: var(--bg-surface); }
    .cat-rank { width: 22px; height: 22px; border-radius: 50%; background: var(--bg-surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--text-muted); flex-shrink: 0; }
    .cat-info { flex: 1; min-width: 0; }
    .cat-name { font-size: 13px; font-weight: 500; color: var(--text-primary); display: block; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cat-bar-wrap { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
    .cat-bar { height: 100%; background: linear-gradient(90deg, #7b1fa2, #9c27b0); border-radius: 2px; transition: width .4s; }
    .cat-count { font-size: 12px; font-weight: 600; color: var(--text-muted); flex-shrink: 0; }

    @media (max-width: 960px) {
      .bottom-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminContentAnalyticsComponent implements OnInit {
  private api = inject(ContentApiService);

  analytics = signal<ContentAnalytics | null>(null);
  loading = signal(true);

  statCards = () => {
    const a = this.analytics();
    if (!a) return [];
    return [
      { label: 'Total Posts',        value: a.totalPosts,        icon: 'article',       color: '#7b1fa2', bg: '#f3e5f5' },
      { label: 'Published',          value: a.publishedPosts,    icon: 'check_circle',  color: '#065f46', bg: '#d1fae5' },
      { label: 'Drafts',             value: a.draftPosts,        icon: 'edit_note',     color: '#b45309', bg: '#fef9c3' },
      { label: 'Scheduled',          value: a.scheduledPosts,    icon: 'schedule',      color: '#1d4ed8', bg: '#dbeafe' },
      { label: 'Total Views',        value: a.totalViews,        icon: 'visibility',    color: '#0f766e', bg: '#ccfbf1' },
      { label: 'Active Subscribers', value: a.activeSubscribers, icon: 'mark_email_read', color: '#9333ea', bg: '#f5f3ff' },
    ] as StatCard[];
  };

  barWidth(count: number): number {
    const cats = this.analytics()?.topCategories ?? [];
    const max = Math.max(...cats.map(c => c.postCount), 1);
    return Math.round((count / max) * 100);
  }

  ngOnInit(): void {
    this.api.getAnalytics().subscribe({
      next: r => this.analytics.set(r.data ?? null),
      complete: () => this.loading.set(false),
    });
  }
}
