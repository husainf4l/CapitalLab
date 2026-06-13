import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { NewsletterSubscriber } from '../../../../core/models/content.models';
import { PaginatedResponse } from '../../../../core/models/api.models';
import { A11yModule } from '@angular/cdk/a11y';

type FilterTab = 'all' | 'active' | 'unsubscribed';

@Component({
  selector: 'app-admin-content-newsletter',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule, A11yModule],
  template: `
    <div class="page-wrapper">
      <!-- Page header -->
      <div class="page-header">
        <div>
          <h1>Newsletter Subscribers</h1>
          <p>Manage your newsletter mailing list</p>
        </div>
        <div class="header-actions">
          <button class="btn-export" (click)="exportCsv()" [disabled]="exporting()">
            <mat-icon>download</mat-icon>
            {{ exporting() ? 'Exporting...' : 'Export CSV' }}
          </button>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat-chip">
          <span class="chip-value">{{ totalCount() }}</span>
          <span class="chip-label">Total</span>
        </div>
        <div class="stat-chip active-chip">
          <span class="chip-value">{{ activeCount() }}</span>
          <span class="chip-label">Active</span>
        </div>
        <div class="stat-chip unsub-chip">
          <span class="chip-value">{{ unsubCount() }}</span>
          <span class="chip-label">Unsubscribed</span>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        <button [class.active]="activeTab() === 'all'" (click)="setTab('all')">All</button>
        <button [class.active]="activeTab() === 'active'" (click)="setTab('active')">Subscribed</button>
        <button [class.active]="activeTab() === 'unsubscribed'" (click)="setTab('unsubscribed')">Unsubscribed</button>
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="loading-state">
          <mat-icon class="spin">autorenew</mat-icon>
          <span>Loading subscribers...</span>
        </div>
      } @else if (filteredSubscribers().length === 0) {
        <div class="empty-state">
          <mat-icon>mail_outline</mat-icon>
          <p>No subscribers in this filter.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Language</th>
                <th>Status</th>
                <th>Subscribed</th>
                <th class="col-action"></th>
              </tr>
            </thead>
            <tbody>
              @for (sub of filteredSubscribers(); track sub.id) {
                <tr>
                  <td class="email-cell">{{ sub.email }}</td>
                  <td>
                    <span class="lang-badge">{{ sub.language | uppercase }}</span>
                  </td>
                  <td>
                    @if (sub.isUnsubscribed) {
                      <span class="status-badge unsub">Unsubscribed</span>
                    } @else if (sub.isConfirmed) {
                      <span class="status-badge active">Active</span>
                    } @else {
                      <span class="status-badge pending">Pending</span>
                    }
                  </td>
                  <td class="date-cell">{{ sub.createdAt | date:'mediumDate' }}</td>
                  <td class="col-action">
                    <button class="action-btn danger" (click)="confirmDelete(sub)" title="Delete subscriber">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Load more -->
        @if (hasMore()) {
          <div class="load-more">
            <button class="btn-load" (click)="loadMore()" [disabled]="loadingMore()">
              {{ loadingMore() ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        }
      }

      <!-- Delete confirmation modal -->
      @if (deleteTarget()) {
        <div class="modal-backdrop" (click)="deleteTarget.set(null)">
          <div class="modal" (click)="$event.stopPropagation()" (keydown.escape)="deleteTarget.set(null)" cdkTrapFocus cdkTrapFocusAutoCapture role="dialog" aria-modal="true" aria-labelledby="nl-del-title">
            <div class="modal-icon">
              <mat-icon>warning</mat-icon>
            </div>
            <h3 id="nl-del-title">Delete Subscriber?</h3>
            <p>Remove <strong>{{ deleteTarget()!.email }}</strong> from the list? This action cannot be undone.</p>
            <div class="modal-actions">
              <button class="btn-ghost" (click)="deleteTarget.set(null)">Cancel</button>
              <button class="btn-danger" (click)="doDelete()" [disabled]="deleting()">
                {{ deleting() ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../../styles/variables' as *;

    .page-wrapper { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; color: var(--text-primary); }
    .page-header p { color: var(--text-muted); font-size: 14px; margin: 0; }
    .header-actions { display: flex; gap: 10px; }
    .btn-export { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--text-primary); transition: background .2s; }
    .btn-export:hover:not(:disabled) { background: var(--bg-surface); }
    .btn-export:disabled { opacity: .6; cursor: not-allowed; }
    .btn-export mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Stats bar */
    .stats-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-chip { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; }
    .chip-value { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); }
    .chip-label { font-size: 12px; color: var(--text-muted); }
    .active-chip .chip-value { color: #065f46; }
    .unsub-chip .chip-value { color: #dc2626; }

    /* Filter tabs */
    .filter-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: var(--bg-surface); border-radius: 10px; padding: 4px; width: fit-content; }
    .filter-tabs button { padding: 7px 18px; border: none; border-radius: 7px; background: none; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text-muted); transition: all .2s; }
    .filter-tabs button.active { background: var(--bg-card); color: var(--text-primary); font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.1); }

    /* Loading / empty */
    .loading-state { display: flex; align-items: center; gap: 10px; padding: 60px; color: var(--text-muted); justify-content: center; font-size: 15px; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 60px; color: var(--text-muted); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .empty-state p { font-size: 15px; margin: 0; }

    /* Table */
    .table-wrap { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    thead th { padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); background: var(--bg-surface); text-align: left; border-bottom: 1px solid var(--border); }
    tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: var(--bg-surface); }
    tbody td { padding: 13px 16px; font-size: 14px; color: var(--text-secondary); vertical-align: middle; }
    .email-cell { font-weight: 500; color: var(--text-primary); }
    .date-cell { color: var(--text-muted); font-size: 13px; }
    .lang-badge { padding: 2px 8px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; font-size: 11px; font-weight: 700; color: var(--text-muted); }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .status-badge.active { background: #d1fae5; color: #065f46; }
    .status-badge.unsub { background: #fee2e2; color: #dc2626; }
    .status-badge.pending { background: #fef9c3; color: #854d0e; }
    .col-action { width: 48px; text-align: center; }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; color: var(--text-muted); transition: all .2s; }
    .action-btn.danger:hover { color: #dc2626; border-color: #dc2626; background: #fee2e2; }
    .action-btn mat-icon { font-size: 17px; width: 17px; height: 17px; }

    /* Load more */
    .load-more { text-align: center; margin-top: 24px; }
    .btn-load { padding: 10px 32px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); color: var(--text-secondary); cursor: pointer; font-size: 14px; transition: all .2s; }
    .btn-load:hover:not(:disabled) { border-color: #7b1fa2; color: #7b1fa2; }
    .btn-load:disabled { opacity: .6; cursor: not-allowed; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: var(--bg-card); border-radius: 16px; padding: 32px; max-width: 420px; width: 90%; border: 1px solid var(--border); text-align: center; }
    .modal-icon { width: 52px; height: 52px; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .modal-icon mat-icon { color: #dc2626; font-size: 26px; width: 26px; height: 26px; }
    .modal h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 10px; color: var(--text-primary); }
    .modal p { color: var(--text-secondary); font-size: 14px; margin: 0 0 24px; line-height: 1.6; }
    .modal-actions { display: flex; gap: 10px; justify-content: center; }
    .btn-ghost { padding: 9px 22px; border: 1px solid var(--border); border-radius: 8px; background: none; cursor: pointer; color: var(--text-secondary); font-size: 14px; }
    .btn-danger { padding: 9px 22px; border-radius: 8px; background: #dc2626; border: none; color: #fff; cursor: pointer; font-weight: 600; font-size: 14px; transition: background .2s; }
    .btn-danger:hover:not(:disabled) { background: #b91c1c; }
    .btn-danger:disabled { opacity: .6; cursor: not-allowed; }
  `]
})
export class AdminContentNewsletterComponent implements OnInit {
  private api = inject(ContentApiService);

  subscribers = signal<NewsletterSubscriber[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  exporting = signal(false);
  deleting = signal(false);
  activeTab = signal<FilterTab>('all');
  deleteTarget = signal<NewsletterSubscriber | null>(null);

  private page = 1;
  private pageSize = 25;
  hasMore = signal(false);

  totalCount = signal(0);
  activeCount = computed(() => this.subscribers().filter(s => !s.isUnsubscribed && s.isConfirmed).length);
  unsubCount = computed(() => this.subscribers().filter(s => s.isUnsubscribed).length);

  filteredSubscribers = computed(() => {
    const tab = this.activeTab();
    const all = this.subscribers();
    if (tab === 'active') return all.filter(s => !s.isUnsubscribed);
    if (tab === 'unsubscribed') return all.filter(s => s.isUnsubscribed);
    return all;
  });

  ngOnInit(): void {
    this.load(true);
  }

  setTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  loadMore(): void {
    this.page++;
    this.load(false);
  }

  exportCsv(): void {
    this.exporting.set(true);
    this.api.exportSubscribersCsv().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subscribers.csv';
        a.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => this.exporting.set(false),
    });
  }

  confirmDelete(sub: NewsletterSubscriber): void {
    this.deleteTarget.set(sub);
  }

  doDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.api.deleteSubscriber(target.id).subscribe({
      next: () => {
        this.subscribers.update(list => list.filter(s => s.id !== target.id));
        this.totalCount.update(n => n - 1);
        this.deleteTarget.set(null);
        this.deleting.set(false);
      },
      error: () => this.deleting.set(false),
    });
  }

  private load(reset: boolean): void {
    if (reset) { this.page = 1; this.loading.set(true); }
    else this.loadingMore.set(true);

    this.api.adminGetSubscribers({ page: this.page, pageSize: this.pageSize }).subscribe({
      next: r => {
        const data = r.data;
        if (data) {
          this.subscribers.update(list => reset ? data.items : [...list, ...data.items]);
          this.totalCount.set(data.totalCount);
          this.hasMore.set(data.hasNextPage);
        }
      },
      complete: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }
}
