import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface BranchRank { branchId: string; branchName: string; revenue: number; samples: number; }
interface DailyPoint { date: string; value: number; }
interface Executive {
  totalRevenue: number; revenueGrowthPct: number; activeBranches: number; totalPatients: number;
  topBranches: BranchRank[]; revenueForecast: DailyPoint[];
}
interface ExecSummary {
  revenueToday: number; revenueThisMonth: number; revenueYtd: number;
  activePatients: number; testsThisMonth: number;
  topBranchName: string; topBranchRevenue: number;
}

@Component({
  selector: 'app-owner-executive',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>Executive Center</h2><p class="sub">Cross-branch performance &amp; revenue intelligence</p></div>
        <div class="period-tabs">
          @for (d of [7, 30, 90]; track d) {
            <button [class.active]="days() === d" (click)="setDays(d)">{{ d }}d</button>
          }
        </div>
      </div>

      <!-- Executive Summary Strip -->
      @if (summary()) {
        <div class="exec-strip">
          <div class="strip-item">
            <div class="strip-icon today"><mat-icon>today</mat-icon></div>
            <div class="strip-body">
              <div class="strip-val">{{ summary()!.revenueToday | currency:'SAR ':'symbol':'1.0-0' }}</div>
              <div class="strip-lbl">Revenue Today</div>
            </div>
          </div>
          <div class="strip-item">
            <div class="strip-icon month"><mat-icon>date_range</mat-icon></div>
            <div class="strip-body">
              <div class="strip-val">{{ summary()!.revenueThisMonth | currency:'SAR ':'symbol':'1.0-0' }}</div>
              <div class="strip-lbl">Revenue This Month</div>
            </div>
          </div>
          <div class="strip-item">
            <div class="strip-icon ytd"><mat-icon>calendar_today</mat-icon></div>
            <div class="strip-body">
              <div class="strip-val">{{ summary()!.revenueYtd | currency:'SAR ':'symbol':'1.0-0' }}</div>
              <div class="strip-lbl">Revenue YTD</div>
            </div>
          </div>
          <div class="strip-divider"></div>
          <div class="strip-item">
            <div class="strip-icon patients"><mat-icon>people</mat-icon></div>
            <div class="strip-body">
              <div class="strip-val">{{ summary()!.activePatients | number }}</div>
              <div class="strip-lbl">Active Patients</div>
            </div>
          </div>
          <div class="strip-item">
            <div class="strip-icon tests"><mat-icon>science</mat-icon></div>
            <div class="strip-body">
              <div class="strip-val">{{ summary()!.testsThisMonth | number }}</div>
              <div class="strip-lbl">Tests This Month</div>
            </div>
          </div>
          @if (summary()!.topBranchName) {
            <div class="strip-item">
              <div class="strip-icon top"><mat-icon>emoji_events</mat-icon></div>
              <div class="strip-body">
                <div class="strip-val top-branch-name">{{ summary()!.topBranchName }}</div>
                <div class="strip-lbl">#1 Branch · {{ summary()!.topBranchRevenue | currency:'SAR ':'symbol':'1.0-0' }}</div>
              </div>
            </div>
          }
        </div>
      }

      @if (loading()) {
        <div class="loading-grid">@for (i of [1,2,3,4]; track i) { <div class="skel-kpi"></div> }</div>
      } @else if (data()) {
        <div class="kpi-row">
          <div class="kpi-card primary">
            <div class="kpi-icon"><mat-icon>payments</mat-icon></div>
            <div class="kpi-body">
              <div class="kpi-val">{{ data()!.totalRevenue | currency:'SAR ':'symbol':'1.0-0' }}</div>
              <div class="kpi-lbl">Total Revenue ({{ days() }}d)</div>
              <div class="kpi-growth" [class.pos]="data()!.revenueGrowthPct >= 0" [class.neg]="data()!.revenueGrowthPct < 0">
                <mat-icon>{{ data()!.revenueGrowthPct >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                {{ data()!.revenueGrowthPct | number:'1.1-1' }}% vs prev period
              </div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon green"><mat-icon>business</mat-icon></div>
            <div class="kpi-body"><div class="kpi-val">{{ data()!.activeBranches }}</div><div class="kpi-lbl">Active Branches</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon blue"><mat-icon>people</mat-icon></div>
            <div class="kpi-body"><div class="kpi-val">{{ data()!.totalPatients }}</div><div class="kpi-lbl">Total Patients</div></div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon purple"><mat-icon>bar_chart</mat-icon></div>
            <div class="kpi-body"><div class="kpi-val">{{ data()!.topBranches.length }}</div><div class="kpi-lbl">Ranked Branches</div></div>
          </div>
        </div>

        <div class="content-grid">
          <div class="card">
            <h3><mat-icon>leaderboard</mat-icon> Branch Rankings</h3>
            @if (data()!.topBranches.length === 0) {
              <div class="empty-section">No branch data yet</div>
            } @else {
              @for (b of data()!.topBranches; track b.branchId; let i = $index) {
                <div class="branch-row">
                  <div class="rank-badge" [class.gold]="i===0" [class.silver]="i===1" [class.bronze]="i===2">{{ i + 1 }}</div>
                  <div class="branch-info">
                    <div class="branch-name">{{ b.branchName }}</div>
                    <div class="branch-meta">{{ b.samples }} samples</div>
                  </div>
                  <div class="branch-rev">{{ b.revenue | currency:'SAR ':'symbol':'1.0-0' }}</div>
                </div>
              }
            }
          </div>

          <div class="card">
            <h3><mat-icon>timeline</mat-icon> Revenue Trend ({{ days() }}d)</h3>
            @if (data()!.revenueForecast.length === 0) {
              <div class="empty-section">No revenue data for this period</div>
            } @else {
              <div class="forecast-chart">
                @for (pt of data()!.revenueForecast; track pt.date) {
                  <div class="chart-bar-wrap">
                    <div class="chart-bar" [style.height.%]="barHeight(pt.value)" [title]="pt.date + ': ' + (pt.value | currency:'SAR ')"></div>
                    <div class="chart-date">{{ pt.date | date:'dd' }}</div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .page-header h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .sub { color: #64748b; font-size: .875rem; }
    .period-tabs { display: flex; background: #f1f5f9; border-radius: 8px; padding: 3px; gap: 2px; }
    .period-tabs button { background: none; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: .875rem; color: #64748b; font-weight: 500; transition: all .15s; }
    .period-tabs button.active { background: #fff; color: #1e293b; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,.1); }

    /* Executive summary strip */
    .exec-strip {
      display: flex; align-items: center; gap: 0;
      background: white; border-radius: 12px; border: 1px solid #e2e8f0;
      box-shadow: 0 1px 4px rgba(0,0,0,.06); margin-bottom: 20px;
      overflow: hidden; flex-wrap: wrap;
    }
    .strip-item {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 20px; flex: 1; min-width: 140px;
      border-right: 1px solid #f1f5f9;
      &:last-child { border-right: none; }
    }
    .strip-divider { width: 1px; height: 40px; background: #e2e8f0; margin: 0 4px; align-self: center; flex-shrink: 0; }
    .strip-icon {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 18px; }
      &.today   { background: #fef3c7; color: #d97706; }
      &.month   { background: #dbeafe; color: #2563eb; }
      &.ytd     { background: #dcfce7; color: #16a34a; }
      &.patients{ background: #f3e8ff; color: #9333ea; }
      &.tests   { background: #ffedd5; color: #ea580c; }
      &.top     { background: #fef9c3; color: #ca8a04; }
    }
    .strip-val { font-size: .95rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
    .strip-lbl { font-size: .72rem; color: #94a3b8; margin-top: 2px; white-space: nowrap; }
    .top-branch-name { font-size: .85rem; }

    .kpi-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px;
      @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
      @media (max-width: 560px) { grid-template-columns: 1fr; }
    }
    .kpi-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.08); display: flex; align-items: center; gap: 16px; }
    .kpi-card.primary { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: white; }
    .kpi-card.primary .kpi-val, .kpi-card.primary .kpi-lbl { color: white; }
    .kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.2); color: white; flex-shrink: 0; }
    .kpi-icon.green { background: #ecfdf5; color: #059669; }
    .kpi-icon.blue { background: #eff6ff; color: #2563eb; }
    .kpi-icon.purple { background: #f5f3ff; color: #7c3aed; }
    .kpi-val { font-size: 1.4rem; font-weight: 700; color: #1e293b; }
    .kpi-lbl { font-size: .8rem; color: #64748b; margin-top: 2px; }
    .kpi-growth { display: flex; align-items: center; gap: 4px; font-size: .8rem; margin-top: 6px; opacity: .9; }
    .kpi-growth mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .kpi-growth.pos { color: #86efac; }
    .kpi-growth.neg { color: #fca5a5; }
    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
    .card h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 20px; }
    .branch-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .branch-row:last-child { border-bottom: none; }
    .rank-badge {
      width: 28px; height: 28px; background: #eff6ff; color: #2563eb;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: .8rem; font-weight: 700; flex-shrink: 0;
      &.gold   { background: #fef9c3; color: #ca8a04; }
      &.silver { background: #f1f5f9; color: #64748b; }
      &.bronze { background: #ffedd5; color: #c2410c; }
    }
    .branch-name { font-weight: 600; color: #1e293b; font-size: .9rem; }
    .branch-meta { font-size: .8rem; color: #64748b; }
    .branch-rev { margin-left: auto; font-weight: 700; color: #059669; font-size: .9rem; }
    .forecast-chart { display: flex; align-items: flex-end; gap: 4px; height: 140px; padding-bottom: 24px; position: relative; }
    .chart-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .chart-bar { width: 100%; background: linear-gradient(180deg, #3b82f6, #1d4ed8); border-radius: 3px 3px 0 0; min-height: 2px; transition: height .3s; }
    .chart-date { font-size: .65rem; color: #94a3b8; position: absolute; bottom: 0; }
    .empty-section { color: #94a3b8; font-size: .875rem; text-align: center; padding: 24px; }
    .loading-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .skel-kpi { height: 100px; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); border-radius: 12px; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  `]
})
export class OwnerExecutiveComponent implements OnInit {
  private http = inject(HttpClient);
  data    = signal<Executive | null>(null);
  summary = signal<ExecSummary | null>(null);
  loading = signal(false);
  days    = signal(30);

  ngOnInit() { this.loadSummary(); this.load(); }

  setDays(d: number) { this.days.set(d); this.load(); }

  loadSummary() {
    this.http.get<any>(`${environment.apiUrl}/executive/summary`).subscribe({
      next: r => this.summary.set(r.data),
      error: () => {},
    });
  }

  load() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/executive/overview?daysBack=${this.days()}`).subscribe({
      next: r => { this.data.set(r.data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  maxRevenue = () => Math.max(...(this.data()?.revenueForecast.map(p => p.value) ?? [1]), 1);
  barHeight = (v: number) => Math.round((v / this.maxRevenue()) * 100);
}
