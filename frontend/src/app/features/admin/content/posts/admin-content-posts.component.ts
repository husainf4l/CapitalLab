import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ContentPostSummary, ContentPostType } from '../../../../core/models/content.models';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-admin-content-posts',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, DatePipe, MatIconModule, A11yModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <h1>Content Posts</h1>
          <p>Manage news, blog articles, promotions, and announcements</p>
        </div>
        <a routerLink="/admin/content/posts/new" class="btn-primary">
          <mat-icon>add</mat-icon> New Post
        </a>
      </div>

      <!-- Filters -->
      <div class="filters-row">
        <input type="text" placeholder="Search posts..." [(ngModel)]="search" (ngModelChange)="onSearch()" class="search-input" />
        <select [(ngModel)]="typeFilter" (ngModelChange)="load(true)" class="filter-select">
          <option value="">All Types</option>
          <option value="News">News</option>
          <option value="Blog">Blog</option>
          <option value="Promotion">Promotion</option>
          <option value="Announcement">Announcement</option>
        </select>
        <select [(ngModel)]="publishedFilter" (ngModelChange)="load(true)" class="filter-select">
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="loading-state">Loading posts...</div>
      } @else if (posts().length === 0) {
        <div class="empty-state">
          <mat-icon>article</mat-icon>
          <p>No posts found. <a routerLink="/admin/content/posts/new">Create your first post</a>.</p>
        </div>
      } @else {
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Published</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (post of posts(); track post.id) {
                <tr>
                  <td>
                    <div class="post-title-cell">
                      @if (post.thumbnailUrl) {
                        <img [src]="post.thumbnailUrl" [alt]="post.titleEn" class="post-thumb" />
                      }
                      <div>
                        <span class="post-title">{{ post.titleEn }}</span>
                        @if (post.isFeatured) { <span class="badge-featured">Featured</span> }
                      </div>
                    </div>
                  </td>
                  <td><span [class]="'type-badge type-' + post.type.toLowerCase()">{{ post.type }}</span></td>
                  <td>{{ post.categoryNameEn ?? '—' }}</td>
                  <td>{{ post.authorName ?? '—' }}</td>
                  <td>
                    <span [class]="post.isPublished ? 'status-badge published' : 'status-badge draft'">
                      {{ post.isPublished ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td>{{ post.publishedAt ? (post.publishedAt | date:'mediumDate') : '—' }}</td>
                  <td>{{ post.viewCount | number }}</td>
                  <td>
                    <div class="actions-cell">
                      <a [routerLink]="['/admin/content/posts', post.slug, 'edit']" class="action-btn" title="Edit">
                        <mat-icon>edit</mat-icon>
                      </a>
                      <button class="action-btn" (click)="togglePublish(post)" [title]="post.isPublished ? 'Unpublish' : 'Publish'">
                        <mat-icon>{{ post.isPublished ? 'unpublished' : 'publish' }}</mat-icon>
                      </button>
                      <button class="action-btn danger" (click)="confirmDelete(post)" title="Delete">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <div class="table-footer">
            <span>{{ totalCount() }} posts total</span>
            <div class="pagination">
              <button [disabled]="page() === 1" (click)="changePage(page() - 1)">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span>Page {{ page() }} of {{ totalPages() }}</span>
              <button [disabled]="page() === totalPages()" (click)="changePage(page() + 1)">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete confirm dialog -->
      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="deleteTarget.set(null)">
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="deleteTarget.set(null)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="posts-del-title">
            <h3 id="posts-del-title">Delete Post?</h3>
            <p>Are you sure you want to delete <strong>{{ deleteTarget()!.titleEn }}</strong>? This cannot be undone.</p>
            <div class="modal-actions">
              <button class="btn-ghost" (click)="deleteTarget.set(null)">Cancel</button>
              <button class="btn-danger" (click)="doDelete()">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../../styles/variables' as *;
    .page-wrapper { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
    .page-header p { color: var(--text-muted); font-size: 14px; margin: 0; }
    .btn-primary { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--accent); color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
    .filters-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-input, .filter-select { padding: 9px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); color: var(--text-primary); font-size: 14px; }
    .search-input { flex: 1; min-width: 200px; }
    .table-card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); background: var(--bg-surface); border-bottom: 1px solid var(--border); }
    .data-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text-secondary); }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--bg-surface); }
    .post-title-cell { display: flex; align-items: center; gap: 10px; }
    .post-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; }
    .post-title { font-weight: 500; color: var(--text-primary); display: block; }
    .badge-featured { font-size: 10px; padding: 2px 7px; background: #fef3c7; color: #92400e; border-radius: 10px; font-weight: 600; }
    .type-badge { padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .type-news { background: #dbeafe; color: #1e40af; }
    .type-blog { background: #d1fae5; color: #065f46; }
    .type-promotion { background: #fef3c7; color: #92400e; }
    .type-announcement { background: #ede9fe; color: #5b21b6; }
    .status-badge { padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .status-badge.published { background: #d1fae5; color: #065f46; }
    .status-badge.draft { background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border); }
    .actions-cell { display: flex; gap: 4px; }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; color: var(--text-secondary); text-decoration: none; transition: all .2s; }
    .action-btn:hover { background: var(--bg-card); color: var(--accent); border-color: var(--accent); }
    .action-btn.danger:hover { color: #dc2626; border-color: #dc2626; }
    .action-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .table-footer { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted); }
    .pagination { display: flex; align-items: center; gap: 12px; }
    .pagination button { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; color: var(--text-secondary); }
    .pagination button:disabled { opacity: .4; cursor: not-allowed; }
    .loading-state, .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .empty-state a { color: var(--accent); text-decoration: none; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--bg-card); border-radius: 12px; padding: 28px; max-width: 420px; width: 90%; border: 1px solid var(--border); }
    .modal h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 8px; color: var(--text-primary); }
    .modal p { color: var(--text-secondary); font-size: 14px; margin: 0 0 20px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-ghost { padding: 8px 18px; border: 1px solid var(--border); border-radius: 8px; background: none; cursor: pointer; color: var(--text-secondary); }
    .btn-danger { padding: 8px 18px; border-radius: 8px; background: #dc2626; border: none; color: #fff; cursor: pointer; font-weight: 600; }
  `]
})
export class AdminContentPostsComponent implements OnInit {
  private api = inject(ContentApiService);

  posts = signal<ContentPostSummary[]>([]);
  loading = signal(true);
  page = signal(1);
  totalCount = signal(0);
  pageSize = 20;
  totalPages = signal(1);
  search = '';
  typeFilter = '';
  publishedFilter = '';
  deleteTarget = signal<ContentPostSummary | null>(null);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() { this.load(true); }

  onSearch() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(true), 350);
  }

  changePage(p: number) {
    this.page.set(p);
    this.load(false);
  }

  togglePublish(post: ContentPostSummary) {
    const call = post.isPublished ? this.api.unpublishPost(post.id) : this.api.publishPost(post.id);
    call.subscribe(() => this.load(false));
  }

  confirmDelete(post: ContentPostSummary) { this.deleteTarget.set(post); }

  doDelete() {
    const p = this.deleteTarget();
    if (!p) return;
    this.api.deletePost(p.id).subscribe(() => {
      this.deleteTarget.set(null);
      this.load(true);
    });
  }

  load(reset: boolean) {
    if (reset) this.page.set(1);
    this.loading.set(true);

    this.api.adminGetPosts({
      page: this.page(), pageSize: this.pageSize,
      type: this.typeFilter as ContentPostType || undefined,
      published: this.publishedFilter !== '' ? this.publishedFilter === 'true' : undefined,
    }).subscribe({
      next: r => {
        this.posts.set(r.data?.items ?? []);
        this.totalCount.set(r.data?.totalCount ?? 0);
        this.totalPages.set(Math.max(1, Math.ceil((r.data?.totalCount ?? 0) / this.pageSize)));
      },
      complete: () => this.loading.set(false)
    });
  }
}
