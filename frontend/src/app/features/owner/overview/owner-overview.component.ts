import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { OwnerOverviewStore } from '../stores/owner-stores';
import { OwnerKpiCardComponent } from '../shared/owner-kpi-card.component';
import { OwnerLineChartComponent } from '../shared/line-chart.component';
import { OwnerBarChartComponent } from '../shared/bar-chart.component';
import { BranchPerformance } from '../../../core/models/owner-analytics.models';

@Component({
  selector: 'app-owner-overview',
  standalone: true,
  imports: [RouterLink, CommonModule, DatePipe, DecimalPipe, MatIconModule,
            MatButtonModule, MatMenuModule, OwnerKpiCardComponent,
            OwnerLineChartComponent, OwnerBarChartComponent],
  template: `
    <div class="overview">

      <!-- ── Page Header ──────────────────────────────────────────── -->
      <div class="page-hdr">
        <div class="page-hdr-left">
          <h1 class="page-title">Executive Overview</h1>
          <p class="page-date">{{ today | date:'EEEE, d MMMM yyyy' }} · Real-time dashboard</p>
        </div>
        <div class="page-hdr-right">
          <div class="status-pill" [class.loading]="store.isLoading()">
            <span class="status-dot"></span>
            {{ store.isLoading() ? 'Refreshing…' : 'Live' }}
          </div>
          <button mat-flat-button class="refresh-btn" (click)="store.load()" [disabled]="store.isLoading()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- ── KPI Cards ────────────────────────────────────────────── -->
      <div class="kpi-grid">
        <owner-kpi-card
          label="Total Revenue"
          icon="trending_up"
          slot="2"
          prefix="SAR "
          [value]="o().totalRevenue"
          [loading]="store.isLoading()" />

        <owner-kpi-card
          label="Net Revenue"
          icon="account_balance_wallet"
          slot="1"
          prefix="SAR "
          [value]="o().netRevenue"
          [loading]="store.isLoading()" />

        <owner-kpi-card
          label="Total Patients"
          icon="people_alt"
          slot="4"
          [value]="o().totalPatients"
          [sub]="o().newPatients + ' new this month'"
          [loading]="store.isLoading()" />

        <owner-kpi-card
          label="Total Tests Run"
          icon="science"
          slot="3"
          [value]="o().totalTests"
          [loading]="store.isLoading()" />
      </div>

      <!-- ── Secondary KPIs ───────────────────────────────────────── -->
      <div class="secondary-kpis">
        <div class="sec-kpi">
          <mat-icon class="sec-icon c1">event</mat-icon>
          <div><span class="sec-val">{{ o().totalAppointments | number }}</span><span class="sec-lbl">Appointments</span></div>
        </div>
        <div class="sec-kpi">
          <mat-icon class="sec-icon c2">timer</mat-icon>
          <div><span class="sec-val">{{ o().averageTurnaroundHours | number:'1.1-1' }}h</span><span class="sec-lbl">Avg Turnaround</span></div>
        </div>
        <div class="sec-kpi">
          <mat-icon class="sec-icon c3">warning_amber</mat-icon>
          <div><span class="sec-val">{{ o().lowStockItems }}</span><span class="sec-lbl">Low Stock Items</span></div>
        </div>
        <div class="sec-kpi">
          <mat-icon class="sec-icon c5">health_and_safety</mat-icon>
          <div><span class="sec-val">{{ o().pendingInsuranceClaims }}</span><span class="sec-lbl">Pending Claims</span></div>
        </div>
        <div class="sec-kpi">
          <mat-icon class="sec-icon c2">account_balance</mat-icon>
          <div><span class="sec-val">SAR {{ o().outstandingBalance | number:'1.0-0' }}</span><span class="sec-lbl">Outstanding</span></div>
        </div>
      </div>

      <!-- ── Charts Row ────────────────────────────────────────────── -->
      <div class="charts-row">
        <owner-line-chart
          title="Daily Revenue — Last 30 Days"
          [points]="revenuePoints()"
          color="var(--chart-1)" />

        <owner-bar-chart
          title="Revenue by Branch"
          [data]="branchChartData()"
          color="var(--chart-2)"
          prefix="SAR " />
      </div>

      <!-- ── Branch Table ──────────────────────────────────────────── -->
      <div class="table-card">
        <div class="table-hdr">
          <div>
            <h3 class="table-title">Branch Performance</h3>
            <p class="table-sub">{{ store.branches().length }} branches · sorted by revenue</p>
          </div>
          <div class="table-actions">
            <a routerLink="/owner/branches" class="table-link-btn">
              View all <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>

        @if (store.isLoading()) {
          <div class="table-loading">
            @for (_ of [1,2,3]; track $index) {
              <div class="row-skeleton"></div>
            }
          </div>
        } @else if (store.branches().length === 0) {
          <div class="table-empty">
            <mat-icon>store</mat-icon>
            <span>No branch data available</span>
          </div>
        } @else {
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th class="num-col">Revenue</th>
                  <th class="num-col">Patients</th>
                  <th class="num-col">Tests</th>
                  <th class="num-col">Pending</th>
                  <th class="num-col">Turnaround</th>
                </tr>
              </thead>
              <tbody>
                @for (b of sortedBranches(); track b.branchId; let i = $index) {
                  <tr>
                    <td>
                      <div class="branch-cell">
                        <div class="branch-avatar" [class]="'slot-' + ((i % 5) + 1)">
                          {{ b.branchName.charAt(0) }}
                        </div>
                        <div>
                          <span class="branch-name">{{ b.branchName }}</span>
                          <span class="branch-sub">Branch {{ i + 1 }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="num-col">
                      <span class="rev-val">SAR {{ b.revenue | number:'1.0-0' }}</span>
                    </td>
                    <td class="num-col">{{ b.patients | number }}</td>
                    <td class="num-col">{{ b.tests | number }}</td>
                    <td class="num-col">
                      <span class="pending-pill" [class.warn]="b.pendingSamples > 10">
                        {{ b.pendingSamples }}
                      </span>
                    </td>
                    <td class="num-col">
                      <span class="turnaround" [class.good]="b.averageTurnaroundHours < 4">
                        {{ b.averageTurnaroundHours | number:'1.1-1' }}h
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- ── Action Alerts ─────────────────────────────────────────── -->
      @if (hasAlerts()) {
        <div class="alerts-row">
          @if (o().pendingInsuranceClaims > 0) {
            <a routerLink="/owner/insurance" class="alert-chip c5">
              <mat-icon>health_and_safety</mat-icon>
              {{ o().pendingInsuranceClaims }} insurance claims pending
            </a>
          }
          @if (o().lowStockItems > 0) {
            <a routerLink="/owner/inventory" class="alert-chip c3">
              <mat-icon>warning_amber</mat-icon>
              {{ o().lowStockItems }} items low on stock
            </a>
          }
          @if (o().outstandingBalance > 0) {
            <a routerLink="/owner/revenue" class="alert-chip c5">
              <mat-icon>account_balance</mat-icon>
              SAR {{ o().outstandingBalance | number:'1.0-0' }} outstanding
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .overview { max-width: 1300px; display: flex; flex-direction: column; gap: $spacing-xl; }

    /* ── Page Header ───────────────────────────────────────────────── */
    .page-hdr {
      display: flex; align-items: flex-start; justify-content: space-between; gap: $spacing-lg;
      flex-wrap: wrap;
    }
    .page-title { margin: 0 0 4px; font-size: $font-size-3xl; font-weight: $font-weight-bold; color: var(--foreground); letter-spacing: -0.02em; }
    .page-date { margin: 0; font-size: $font-size-sm; color: var(--muted-foreground); }
    .page-hdr-right { display: flex; align-items: center; gap: $spacing-sm; flex-shrink: 0; }

    .status-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border-radius: $border-radius-full;
      background: color-mix(in srgb, var(--chart-2) 10%, var(--background));
      color: var(--chart-2); font-size: $font-size-xs; font-weight: $font-weight-semibold;
      border: 1px solid color-mix(in srgb, var(--chart-2) 20%, transparent);
      &.loading { background: color-mix(in srgb, var(--chart-3) 10%, var(--background)); color: var(--chart-3); }
    }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%; background: currentColor;
      animation: pulse 2s infinite;
    }
    .refresh-btn {
      border-radius: $border-radius-full !important;
      mat-icon { font-size: 18px; margin-right: 4px; }
    }

    /* ── KPI Grid ──────────────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: $spacing-lg;
      @media (max-width: $breakpoint-xl) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: $breakpoint-sm) { grid-template-columns: 1fr; }
    }

    /* ── Secondary KPIs ────────────────────────────────────────────── */
    .secondary-kpis {
      display: flex; gap: $spacing-md; flex-wrap: wrap;
      background: var(--background); border: 1px solid var(--border);
      border-radius: $border-radius-xl; padding: $spacing-lg $spacing-xl;
      box-shadow: $shadow-sm;
    }
    .sec-kpi {
      display: flex; align-items: center; gap: $spacing-sm;
      flex: 1; min-width: 120px;
      & + & { padding-left: $spacing-md; border-left: 1px solid var(--border);
        @media (max-width: $breakpoint-sm) { border-left: none; padding-left: 0; } }
    }
    .sec-icon {
      font-size: 22px; width: 22px; height: 22px;
      &.c1 { color: var(--chart-1); }
      &.c2 { color: var(--chart-2); }
      &.c3 { color: var(--chart-3); }
      &.c4 { color: var(--chart-4); }
      &.c5 { color: var(--chart-5); }
    }
    .sec-val { display: block; font-size: $font-size-lg; font-weight: $font-weight-bold; color: var(--foreground); line-height: 1.2; }
    .sec-lbl { display: block; font-size: $font-size-xs; color: var(--muted-foreground); }

    /* ── Charts ────────────────────────────────────────────────────── */
    .charts-row {
      display: grid; grid-template-columns: 1.5fr 1fr; gap: $spacing-lg;
      @media (max-width: $breakpoint-lg) { grid-template-columns: 1fr; }
    }

    /* ── Table Card ─────────────────────────────────────────────────── */
    .table-card {
      background: var(--background); border: 1px solid var(--border);
      border-radius: $border-radius-xl; box-shadow: $shadow-md; overflow: hidden;
    }
    .table-hdr {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: $spacing-xl $spacing-xl $spacing-md; gap: $spacing-md; flex-wrap: wrap;
    }
    .table-title { margin: 0 0 4px; font-size: $font-size-lg; font-weight: $font-weight-semibold; color: var(--foreground); }
    .table-sub { margin: 0; font-size: $font-size-xs; color: var(--muted-foreground); }
    .table-actions { display: flex; gap: $spacing-sm; align-items: center; }
    .table-link-btn {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 8px 16px; border-radius: $border-radius-full;
      background: color-mix(in srgb, var(--primary) 8%, var(--background));
      color: var(--primary); font-size: $font-size-sm; font-weight: $font-weight-medium;
      text-decoration: none; border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
      transition: background $transition-fast;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover { background: color-mix(in srgb, var(--primary) 14%, var(--background)); text-decoration: none; }
    }

    .table-loading { padding: $spacing-lg $spacing-xl; display: flex; flex-direction: column; gap: $spacing-md; }
    .row-skeleton {
      height: 52px; border-radius: $border-radius-lg;
      background: linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%);
      background-size: 200% 100%; animation: shimmer 1.4s infinite;
    }
    .table-empty {
      display: flex; flex-direction: column; align-items: center; gap: $spacing-sm;
      padding: $spacing-2xl; color: var(--muted-foreground);
      mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; opacity: 0.4; }
    }

    .table-wrap { overflow-x: auto; }
    .data-table {
      width: 100%; border-collapse: collapse;
      th {
        padding: 10px 20px; text-align: left; font-size: $font-size-xs;
        font-weight: $font-weight-semibold; color: var(--muted-foreground);
        text-transform: uppercase; letter-spacing: 0.06em;
        background: var(--card); border-bottom: 1px solid var(--border);
        &.num-col { text-align: right; }
      }
      td {
        padding: 16px 20px; border-bottom: 1px solid var(--border);
        font-size: $font-size-sm; color: var(--foreground);
        &.num-col { text-align: right; color: var(--muted-foreground); }
      }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: var(--card); }
    }

    .branch-cell { display: flex; align-items: center; gap: $spacing-sm; }
    .branch-avatar {
      width: 36px; height: 36px; border-radius: $border-radius-sm;
      display: flex; align-items: center; justify-content: center;
      font-size: $font-size-sm; font-weight: $font-weight-bold; flex-shrink: 0;
      &.slot-1 { background: color-mix(in srgb, var(--chart-1) 15%, var(--background)); color: var(--chart-1); }
      &.slot-2 { background: color-mix(in srgb, var(--chart-2) 15%, var(--background)); color: var(--chart-2); }
      &.slot-3 { background: color-mix(in srgb, var(--chart-3) 15%, var(--background)); color: var(--chart-3); }
      &.slot-4 { background: color-mix(in srgb, var(--chart-4) 15%, var(--background)); color: var(--chart-4); }
      &.slot-5 { background: color-mix(in srgb, var(--chart-5) 15%, var(--background)); color: var(--chart-5); }
    }
    .branch-name { display: block; font-weight: $font-weight-medium; color: var(--foreground); }
    .branch-sub { display: block; font-size: $font-size-xs; color: var(--muted-foreground); }
    .rev-val { font-weight: $font-weight-semibold; color: var(--foreground); }

    .pending-pill {
      display: inline-block; padding: 2px 10px; border-radius: $border-radius-full;
      font-size: $font-size-xs; font-weight: $font-weight-semibold;
      background: color-mix(in srgb, var(--chart-2) 10%, var(--background));
      color: var(--chart-2);
      &.warn {
        background: color-mix(in srgb, var(--chart-3) 15%, var(--background));
        color: var(--chart-3);
      }
    }
    .turnaround {
      font-weight: $font-weight-semibold; color: var(--muted-foreground);
      &.good { color: var(--chart-2); }
    }

    /* ── Alert chips ────────────────────────────────────────────────── */
    .alerts-row { display: flex; gap: $spacing-sm; flex-wrap: wrap; }
    .alert-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: $border-radius-full;
      font-size: $font-size-sm; font-weight: $font-weight-medium;
      text-decoration: none; transition: opacity $transition-fast;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { opacity: 0.8; text-decoration: none; }
      &.c3 {
        background: color-mix(in srgb, var(--chart-3) 12%, var(--background));
        color: var(--chart-3); border: 1px solid color-mix(in srgb, var(--chart-3) 25%, transparent);
      }
      &.c5 {
        background: color-mix(in srgb, var(--chart-5) 10%, var(--background));
        color: var(--chart-5); border: 1px solid color-mix(in srgb, var(--chart-5) 20%, transparent);
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class OwnerOverviewComponent implements OnInit {
  store = inject(OwnerOverviewStore);
  today = new Date();

  o = computed(() => this.store.overview());

  revenuePoints = computed(() =>
    (this.store.revenue()?.dailyRevenue ?? []).map(p => ({ label: p.label, value: p.value }))
  );

  branchChartData = computed(() =>
    this.store.branches().map(b => ({ label: b.branchName, value: b.revenue }))
  );

  sortedBranches = computed(() =>
    [...this.store.branches()].sort((a, b) => b.revenue - a.revenue)
  );

  hasAlerts = computed(() =>
    this.o().pendingInsuranceClaims > 0 || this.o().lowStockItems > 0 || this.o().outstandingBalance > 0
  );

  ngOnInit(): void { this.store.load(); }
}
