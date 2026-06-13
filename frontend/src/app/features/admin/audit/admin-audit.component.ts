import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state/app-empty-state.component';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userEmail: string | null;
  ipAddress: string | null;
  oldValues: string | null;
  newValues: string | null;
  occurredAt: string;
}

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, AppEmptyStateComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>Audit Center</h2><p class="sub">Enterprise-grade activity tracking &amp; compliance</p></div>
        <div class="header-actions">
          <button mat-stroked-button (click)="exportCsv()" [disabled]="items().length === 0" aria-label="Export as CSV">
            <mat-icon>download</mat-icon> CSV
          </button>
          <button mat-stroked-button (click)="exportExcel()" [disabled]="items().length === 0" aria-label="Export as Excel">
            <mat-icon>table_view</mat-icon> Excel
          </button>
          <button mat-stroked-button (click)="load()" aria-label="Refresh audit log"><mat-icon>refresh</mat-icon></button>
        </div>
      </div>

      <div class="filters">
        <input type="text" [(ngModel)]="filterEntity" placeholder="Entity type..." (input)="load()" />
        <input type="text" [(ngModel)]="filterUser" placeholder="User email..." (input)="load()" />
        <input type="text" [(ngModel)]="filterAction" placeholder="Action..." (input)="load()" />
        <input type="date" [(ngModel)]="filterFrom" (change)="load()" />
        <input type="date" [(ngModel)]="filterTo" (change)="load()" />
        <button class="clear-btn" (click)="clearFilters()">Clear</button>
      </div>
      <div class="result-meta">
        @if (!loading()) { <span>{{ items().length }} entries · page {{ page() }}</span> }
        <div class="pagination">
          <button [disabled]="page() <= 1" (click)="prevPage()">‹ Prev</button>
          <span>Page {{ page() }}</span>
          <button [disabled]="items().length < pageSize" (click)="nextPage()">Next ›</button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">@for (i of [1,2,3,4,5,6]; track i) { <div class="skel"></div> }</div>
      } @else if (items().length === 0) {
        <app-empty-state icon="history" title="No audit entries found" description="Audit logs will appear as staff perform actions in the system." />
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>IP Address</th></tr></thead>
            <tbody>
              @for (e of items(); track e.id) {
                <tr (click)="selected.set(e)" class="clickable">
                  <td>{{ e.occurredAt | date:'dd MMM, HH:mm:ss' }}</td>
                  <td>{{ e.userEmail ?? '—' }}</td>
                  <td><span class="action-badge" [class]="'action-' + e.action.toLowerCase()">{{ e.action }}</span></td>
                  <td><span class="entity">{{ e.entityType }}</span> <span class="entity-id">{{ e.entityId.slice(0,8) }}…</span></td>
                  <td>{{ e.ipAddress ?? '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (selected()) {
          <div class="detail-panel">
            <div class="detail-header">
              <h3>Audit Detail</h3>
              <button mat-icon-button (click)="selected.set(null)"><mat-icon>close</mat-icon></button>
            </div>
            <div class="detail-grid">
              <div class="detail-section">
                <p class="detail-label">Old Values</p>
                <pre class="detail-json">{{ formatJson(selected()!.oldValues) }}</pre>
              </div>
              <div class="detail-section">
                <p class="detail-label">New Values</p>
                <pre class="detail-json">{{ formatJson(selected()!.newValues) }}</pre>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .header-actions { display: flex; gap: 8px; align-items: center; }
    .page-header h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .sub { color: #64748b; font-size: .875rem; margin: 2px 0 0; }
    .filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .filters input { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: .875rem; min-width: 160px; }
    .clear-btn { padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; font-size: .875rem; color: #6b7280; &:hover { background: #f9fafb; } }
    .result-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: .8rem; color: #6b7280; }
    .pagination { display: flex; align-items: center; gap: 8px; button { padding: 5px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; font-size: .8rem; &:hover:not(:disabled) { background: #f3f4f6; } &:disabled { opacity: .4; cursor: not-allowed; } } }
    .table-wrap { background: #fff; border-radius: 12px; overflow-x: auto; box-shadow: 0 1px 4px rgba(0,0,0,.08); margin-bottom: 20px; }
    .data-table { width: 100%; min-width: 640px; border-collapse: collapse; }
    .data-table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: .8rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: .875rem; }
    .clickable { cursor: pointer; transition: background .15s; }
    .clickable:hover { background: #f8fafc; }
    .action-badge { font-size: .75rem; padding: 3px 8px; border-radius: 20px; font-weight: 600; }
    .action-create { background: #ecfdf5; color: #059669; }
    .action-update { background: #fffbeb; color: #d97706; }
    .action-delete { background: #fef2f2; color: #dc2626; }
    .action-login, .action-logout { background: #eff6ff; color: #2563eb; }
    .entity { font-weight: 600; color: #1e293b; }
    .entity-id { font-size: .8rem; color: #94a3b8; margin-left: 4px; }
    .detail-panel { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .detail-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .detail-label { font-size: .8rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
    .detail-json { background: #f8fafc; border-radius: 8px; padding: 12px; font-size: .8rem; overflow: auto; max-height: 200px; color: #374151; white-space: pre-wrap; word-break: break-all; }
    .empty { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #94a3b8; gap: 12px; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .loading { display: flex; flex-direction: column; gap: 8px; }
    .skel { height: 48px; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); border-radius: 8px; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  `]
})
export class AdminAuditComponent implements OnInit {
  private http = inject(HttpClient);
  items = signal<AuditEntry[]>([]);
  selected = signal<AuditEntry | null>(null);
  loading = signal(false);
  page = signal(1);
  readonly pageSize = 50;

  filterEntity = '';
  filterUser = '';
  filterAction = '';
  filterFrom = '';
  filterTo = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.selected.set(null);
    let url = `${environment.apiUrl}/audit?pageSize=${this.pageSize}&page=${this.page()}`;
    if (this.filterEntity) url += `&entityType=${encodeURIComponent(this.filterEntity)}`;
    if (this.filterUser)   url += `&userEmail=${encodeURIComponent(this.filterUser)}`;
    if (this.filterAction) url += `&action=${encodeURIComponent(this.filterAction)}`;
    if (this.filterFrom)   url += `&from=${this.filterFrom}`;
    if (this.filterTo)     url += `&to=${this.filterTo}`;
    this.http.get<any>(url).subscribe({
      next: r => { this.items.set(r.data?.items ?? []); this.loading.set(false); },
      error: () => { this.items.set([]); this.loading.set(false); }
    });
  }

  prevPage(): void { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage(): void { this.page.update(p => p + 1); this.load(); }

  clearFilters(): void {
    this.filterEntity = ''; this.filterUser = ''; this.filterAction = '';
    this.filterFrom = ''; this.filterTo = ''; this.page.set(1); this.load();
  }

  exportCsv(): void {
    const header = ['Time', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = this.items().map(e => [
      e.occurredAt, e.userEmail ?? '', e.action,
      e.entityType, e.entityId, e.ipAddress ?? '',
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    this.downloadFile(csv, 'audit-log.csv', 'text/csv');
  }

  exportExcel(): void {
    const header = ['Time', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = this.items().map(e => [
      e.occurredAt, e.userEmail ?? '', e.action,
      e.entityType, e.entityId, e.ipAddress ?? '',
    ]);
    const tsv = [header, ...rows].map(r => r.join('\t')).join('\n');
    this.downloadFile('﻿' + tsv, 'audit-log.xls', 'application/vnd.ms-excel');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  formatJson(raw: string | null): string {
    if (!raw) return '—';
    try { return JSON.stringify(JSON.parse(raw), null, 2); }
    catch { return raw; }
  }
}
