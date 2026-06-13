import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { OwnerAnalyticsApiService } from '../../../core/api/owner-analytics-api.service';
import {
  BranchPerformance, RevenueAnalytics, OwnerOverview
} from '../../../core/models/owner-analytics.models';
import { environment } from '../../../../environments/environment';

interface HealthStatus { name: string; status: 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unknown'; icon: string; }
interface QueueItem   { id: string; icon: string; label: string; count: number; route: string; actionLabel: string; }

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [RouterLink, CommonModule, MatIconModule, MatButtonModule],
  template: `

<!-- ═══════════════════════════════ COMMAND CENTER HEADER ══════════════════════════════ -->
<div class="cc-header">
  <div class="cc-header-left">
    <mat-icon class="cc-hicon">dashboard_customize</mat-icon>
    <div>
      <h1 class="cc-title">CRM Command Center</h1>
      <p class="cc-sub">{{ today }} · Last refreshed {{ lastRefreshed() | date:'HH:mm:ss' }}</p>
    </div>
  </div>
  <button type="button" class="cc-refresh-btn" (click)="refresh()" [disabled]="loading()">
    <mat-icon>refresh</mat-icon>
    {{ loading() ? 'Loading…' : 'Refresh' }}
  </button>
</div>

<!-- ═══════════════════════════════ STATUS BANNER ════════════════════════ -->
<div class="alert-clear">
  <mat-icon>check_circle</mat-icon>
  <span>Patient CRM operational — all systems running</span>
</div>

<!-- ═══════════════════════════════ SECTION 2 — PLATFORM OVERVIEW ═════════════════════ -->
<section class="cc-section">
  <header class="section-hdr">
    <mat-icon>today</mat-icon>
    <span>Platform Overview</span>
  </header>
  <div class="ops-grid">

    <a routerLink="/branch/appointments" class="ops-card">
      <div class="ops-icon" style="--c:var(--primary)"><mat-icon>event</mat-icon></div>
      <div class="ops-body">
        <span class="ops-value">{{ overview()?.totalAppointments ?? '—' }}</span>
        <span class="ops-label">Total Appointments</span>
      </div>
    </a>

    <a routerLink="/owner/tests" class="ops-card">
      <div class="ops-icon" style="--c:var(--color-teal)"><mat-icon>science</mat-icon></div>
      <div class="ops-body">
        <span class="ops-value">{{ overview()?.totalTests ?? '—' }}</span>
        <span class="ops-label">Tests Ordered</span>
      </div>
    </a>

    <a routerLink="/owner/patients" class="ops-card">
      <div class="ops-icon" style="--c:var(--color-pink)"><mat-icon>person_add</mat-icon></div>
      <div class="ops-body">
        <span class="ops-value">{{ overview()?.newPatients ?? '—' }}</span>
        <span class="ops-label">New Patients</span>
      </div>
    </a>

    <a routerLink="/owner/patients" class="ops-card">
      <div class="ops-icon" style="--c:var(--color-purple)"><mat-icon>people</mat-icon></div>
      <div class="ops-body">
        <span class="ops-value">{{ overview()?.totalPatients ?? '—' }}</span>
        <span class="ops-label">Total Patients</span>
      </div>
    </a>

    <a routerLink="/owner/executive" class="ops-card">
      <div class="ops-icon" style="--c:var(--color-green-600)"><mat-icon>schedule</mat-icon></div>
      <div class="ops-body">
        <span class="ops-value ops-small">{{ (overview()?.averageTurnaroundHours ?? 0) | number:'1.1-1' }}h</span>
        <span class="ops-label">Avg Turnaround</span>
      </div>
    </a>

    <a routerLink="/owner/branches" class="ops-card">
      <div class="ops-icon" style="--c:var(--color-amber)"><mat-icon>account_balance</mat-icon></div>
      <div class="ops-body">
        <span class="ops-value">{{ branches().length }}</span>
        <span class="ops-label">Active Branches</span>
      </div>
    </a>

  </div>
</section>

<!-- ═══════════════════════════════ TWO-COLUMN MAIN LAYOUT ═══════════════════════════ -->
<div class="cc-main">

  <!-- ── LEFT ────────────────────────────────────────────────────────────────────── -->
  <div class="cc-left">

    <!-- WORK QUEUES -->
    <section class="cc-section">
      <header class="section-hdr">
        <mat-icon>queue</mat-icon>
        <span>Work Queues</span>
      </header>
      <div class="queue-list">
        @for (q of workQueues(); track q.id) {
          <div class="queue-row">
            <div class="queue-icon-wrap"><mat-icon>{{ q.icon }}</mat-icon></div>
            <span class="queue-label">{{ q.label }}</span>
            <span class="queue-count"
              [class.count-zero]="q.count === 0"
              [class.count-warn]="q.count > 0 && q.count <= 5"
              [class.count-high]="q.count > 5">{{ q.count }}</span>
            <a [routerLink]="q.route" class="queue-action-btn">{{ q.actionLabel }} →</a>
          </div>
        }
      </div>
    </section>

    <!-- BRANCH MONITOR -->
    <section class="cc-section">
      <header class="section-hdr">
        <mat-icon>account_balance</mat-icon>
        <span>Branch Monitor</span>
        <a routerLink="/owner/branches" class="hdr-link">View All →</a>
      </header>
      @if (branches().length === 0) {
        <div class="empty-state">
          @if (loading()) { <span>Loading branch data…</span> } @else { <span>No branch data available.</span> }
        </div>
      } @else {
        <div class="branch-table">
          <div class="branch-row branch-head">
            <span>Branch</span><span>Patients</span><span>Pending</span><span>Avg TAT</span>
          </div>
          @for (b of branches(); track b.branchId) {
            <a routerLink="/branch" class="branch-row branch-data">
              <span class="branch-name-cell">
                <span class="branch-dot"
                  [class.dot-ok]="b.pendingSamples < 15"
                  [class.dot-warn]="b.pendingSamples >= 15 && b.pendingSamples < 30"
                  [class.dot-high]="b.pendingSamples >= 30"></span>
                {{ b.branchName }}
              </span>
              <span>{{ b.patients | number }}</span>
              <span [class.pending-high]="b.pendingSamples >= 15">{{ b.pendingSamples }}</span>
              <span>{{ b.averageTurnaroundHours | number:'1.1-1' }}h</span>
            </a>
          }
        </div>
      }
    </section>

  </div><!-- /cc-left -->

  <!-- ── RIGHT SIDEBAR ─────────────────────────────────────────────────────────── -->
  <div class="cc-right">

    <!-- SYSTEM STATUS -->
    <section class="cc-section">
      <header class="section-hdr">
        <mat-icon>monitor_heart</mat-icon>
        <span>System Status</span>
      </header>
      <div class="status-list">
        @for (c of healthComponents(); track c.name) {
          <div class="status-row">
            <mat-icon class="st-icon">{{ c.icon }}</mat-icon>
            <span class="st-name">{{ c.name }}</span>
            <span class="st-badge" [ngClass]="'badge-' + c.status.toLowerCase()">
              <span class="st-dot"></span>{{ c.status }}
            </span>
          </div>
        }
      </div>
    </section>

    <!-- QUICK ACTIONS -->
    <section class="cc-section">
      <header class="section-hdr">
        <mat-icon>bolt</mat-icon>
        <span>Quick Actions</span>
      </header>
      <div class="qa-grid">
        <a routerLink="/branch/appointments" class="qa-btn" style="--qa:var(--primary)">
          <mat-icon>event_available</mat-icon><span>Appointments</span>
        </a>
        <a routerLink="/owner/patients" class="qa-btn" style="--qa:var(--color-pink)">
          <mat-icon>people</mat-icon><span>Patients</span>
        </a>
        <a routerLink="/admin/content/events" class="qa-btn" style="--qa:var(--color-purple)">
          <mat-icon>event</mat-icon><span>Create Event</span>
        </a>
        <a routerLink="/admin/content/posts/new" class="qa-btn" style="--qa:var(--color-teal)">
          <mat-icon>edit_note</mat-icon><span>Publish Article</span>
        </a>
        <a routerLink="/admin/notifications" class="qa-btn" style="--qa:var(--color-amber)">
          <mat-icon>notifications</mat-icon><span>Notifications</span>
        </a>
        <a routerLink="/admin/audit" class="qa-btn" style="--qa:var(--color-slate)">
          <mat-icon>manage_search</mat-icon><span>Audit Logs</span>
        </a>
      </div>
    </section>

    <!-- PLATFORM HEALTH -->
    <section class="cc-section">
      <header class="section-hdr">
        <mat-icon>task_alt</mat-icon>
        <span>Platform Health</span>
      </header>
      <div class="prod-widget">
        <div class="prod-kpis">
          <div class="prod-kpi">
            <span class="prod-num">{{ overview()?.totalPatients ?? 0 }}</span>
            <span class="prod-lbl">Total Patients</span>
          </div>
          <div class="prod-kpi">
            <span class="prod-num prod-green">{{ overview()?.newPatients ?? 0 }}</span>
            <span class="prod-lbl">New Patients</span>
          </div>
        </div>
        <div class="prod-bar-section">
          <div class="prod-bar-hdr">
            <span>Avg Turnaround</span>
            <span class="prod-rate"
              [class.rate-good]="(overview()?.averageTurnaroundHours ?? 99) <= 24"
              [class.rate-warn]="(overview()?.averageTurnaroundHours ?? 0) > 24">
              {{ (overview()?.averageTurnaroundHours ?? 0) | number:'1.1-1' }}h
            </span>
          </div>
          <div class="prod-track">
            <div class="prod-fill"
              [style.width.%]="tatBarWidth()"
              [class.fill-good]="(overview()?.averageTurnaroundHours ?? 99) <= 24"
              [class.fill-warn]="(overview()?.averageTurnaroundHours ?? 0) > 24"></div>
          </div>
        </div>
      </div>
    </section>

  </div><!-- /cc-right -->

</div><!-- /cc-main -->

<!-- ═══════════════════════════════ OPERATIONAL ANALYTICS ════════════════ -->
<section class="cc-section">
  <header class="section-hdr">
    <mat-icon>analytics</mat-icon>
    <span>Operational Analytics</span>
  </header>
  <div class="analytics-grid">

    <div class="chart-card">
      <div class="chart-hdr">
        <span class="chart-title">Activity Trend</span>
        <span class="chart-badge">7 days</span>
      </div>
      <div class="chart-value-row">
        <span class="chart-big">{{ overview()?.totalTests ?? 0 }}</span>
        <span class="chart-unit">tests</span>
      </div>
      @if (revenueSpark().length >= 2) {
        <svg viewBox="0 0 120 40" class="spark-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="rev-g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#1e9df1" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#1e9df1" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polygon [attr.points]="sparkFill(revenueSpark())" fill="url(#rev-g)"/>
          <polyline [attr.points]="spark(revenueSpark())" fill="none" stroke="#1e9df1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      } @else {
        <div class="chart-empty">Awaiting data…</div>
      }
    </div>

    <div class="chart-card">
      <div class="chart-hdr"><span class="chart-title">Avg Turnaround Time</span></div>
      <div class="tat-display">
        <span class="tat-num">{{ overview()?.averageTurnaroundHours | number:'1.1-1' }}</span>
        <span class="tat-unit">hours</span>
      </div>
      @if (overview()) {
        <div class="tat-status"
          [class.tat-ok]="(overview()?.averageTurnaroundHours ?? 99) <= 24"
          [class.tat-warn]="(overview()?.averageTurnaroundHours ?? 0) > 24">
          @if ((overview()?.averageTurnaroundHours ?? 0) <= 24) {
            <mat-icon>check_circle</mat-icon> Within target (≤24h)
          } @else {
            <mat-icon>warning_amber</mat-icon> Above target (>24h)
          }
        </div>
      }
    </div>

    <div class="chart-card">
      <div class="chart-hdr">
        <span class="chart-title">Branch Patients</span>
        <span class="chart-badge">count</span>
      </div>
      @if (branches().length === 0) {
        <div class="chart-empty">Loading…</div>
      } @else {
        <div class="bb-list">
          @for (b of branches().slice(0, 5); track b.branchId) {
            <div class="bb-row">
              <span class="bb-name">{{ b.branchName | slice:0:14 }}</span>
              <div class="bb-track">
                <div class="bb-fill" [style.width.%]="(b.patients / maxBranchPatients()) * 100"></div>
              </div>
              <span class="bb-val">{{ b.patients | number }}</span>
            </div>
          }
        </div>
      }
    </div>

    <div class="chart-card">
      <div class="chart-hdr">
        <span class="chart-title">Patient Growth</span>
        <span class="chart-badge">new</span>
      </div>
      <div class="chart-value-row">
        <span class="chart-big">{{ overview()?.newPatients ?? 0 }}</span>
        <span class="chart-unit">new patients</span>
      </div>
      <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px">
        out of {{ overview()?.totalPatients ?? 0 }} total
      </div>
      @if (overview() && (overview()?.totalPatients ?? 0) > 0) {
        <div class="prod-track" style="margin-top:8px">
          <div class="prod-fill fill-good"
            [style.width.%]="((overview()?.newPatients ?? 0) / (overview()?.totalPatients ?? 1)) * 100"></div>
        </div>
      }
    </div>

  </div>
</section>

  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    :host { display: block; }

    .cc-header {
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
      background: $secondary; color: white;
      padding: 20px 24px; border-radius: 14px; margin-bottom: 4px;
    }
    .cc-header-left { display: flex; align-items: center; gap: 16px; }
    .cc-hicon { font-size: 32px; width: 32px; height: 32px; color: #1e9df1; }
    .cc-title { margin: 0 0 2px; font-size: 1.25rem; font-weight: 700; color: white; }
    .cc-sub { margin: 0; font-size: 0.78rem; color: rgba(255,255,255,0.55); }
    .cc-refresh-btn {
      display: flex; align-items: center; gap: 6px; padding: 8px 18px;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
      color: white; border-radius: 8px; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; transition: background 0.15s;
      mat-icon { font-size: 17px; }
      &:hover:not(:disabled) { background: rgba(255,255,255,0.18); }
      &:disabled { opacity: 0.5; cursor: default; }
    }

    .alert-clear {
      display: flex; align-items: center; gap: 10px; padding: 12px 18px;
      background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
      color: #166534; font-size: 0.875rem; font-weight: 500;
      mat-icon { color: #16a34a; }
    }

    .cc-section { display: flex; flex-direction: column; gap: 12px; }
    .section-hdr {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: $text-secondary;
      mat-icon { font-size: 16px; }
    }
    .hdr-link { margin-left: auto; font-size: 0.78rem; font-weight: 600; color: $primary; text-decoration: none; &:hover { text-decoration: underline; } }

    .ops-grid {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;
      @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 640px)  { grid-template-columns: repeat(2, 1fr); }
    }
    .ops-card {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 18px 12px; background: white; border: 1px solid $border-color;
      border-radius: 12px; text-decoration: none; transition: all 0.15s; text-align: center;
      &:hover { border-color: $primary; box-shadow: $shadow-sm; transform: translateY(-1px); text-decoration: none; }
    }
    .ops-icon {
      width: 42px; height: 42px; border-radius: 10px; display: flex;
      align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--c) 12%, transparent); color: var(--c);
      mat-icon { font-size: 22px; }
    }
    .ops-body { display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .ops-value { font-size: 1.6rem; font-weight: 700; color: $text-primary; line-height: 1; }
    .ops-small { font-size: 1.25rem; }
    .ops-label { font-size: 0.72rem; font-weight: 500; color: $text-secondary; white-space: nowrap; }

    .cc-main {
      display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start;
      @media (max-width: 1100px) { grid-template-columns: 1fr; }
    }
    .cc-left, .cc-right { display: flex; flex-direction: column; gap: 20px; }

    .queue-list { display: flex; flex-direction: column; gap: 2px; }
    .queue-row {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 14px; background: white; border: 1px solid $border-color;
      border-radius: 10px; transition: border-color 0.15s;
      &:hover { border-color: $primary; }
    }
    .queue-icon-wrap {
      width: 34px; height: 34px; border-radius: 8px; background: $bg-body;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 18px; color: $text-secondary; }
    }
    .queue-label  { flex: 1; font-size: 0.85rem; font-weight: 500; color: $text-primary; }
    .queue-count  {
      min-width: 32px; height: 24px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;
      padding: 0 8px; background: $bg-body; color: $text-secondary;
    }
    .count-zero { background: #f1f5f9; color: #94a3b8; }
    .count-warn { background: #fffbeb; color: #92400e; }
    .count-high { background: #fef2f2; color: #991b1b; }
    .queue-action-btn {
      font-size: 0.78rem; font-weight: 600; color: $primary; text-decoration: none;
      white-space: nowrap; padding: 4px 10px; border-radius: 6px;
      background: rgba($primary, 0.08); transition: background 0.15s;
      &:hover { background: rgba($primary, 0.15); text-decoration: none; }
    }

    .branch-table {
      background: white; border: 1px solid $border-color; border-radius: 12px; overflow: hidden;
    }
    .branch-row {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
      align-items: center; padding: 10px 16px; gap: 12px; font-size: 0.82rem;
    }
    .branch-head {
      background: $bg-body; font-weight: 700; color: $text-secondary;
      text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.72rem;
      border-bottom: 1px solid $border-color;
    }
    .branch-data {
      border-bottom: 1px solid $border-color; color: $text-primary; text-decoration: none;
      transition: background 0.12s;
      &:last-child { border-bottom: none; }
      &:hover { background: $bg-body; text-decoration: none; }
    }
    .branch-name-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }
    .branch-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dot-ok   { background: #16a34a; }
    .dot-warn { background: #f59e0b; }
    .dot-high { background: #dc2626; }
    .pending-high { color: #dc2626; font-weight: 600; }

    .status-list {
      background: white; border: 1px solid $border-color; border-radius: 12px; overflow: hidden;
    }
    .status-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-bottom: 1px solid $border-color;
      &:last-child { border-bottom: none; }
    }
    .st-icon  { font-size: 17px; color: $text-secondary; flex-shrink: 0; }
    .st-name  { flex: 1; font-size: 0.83rem; font-weight: 500; color: $text-primary; }
    .st-badge {
      display: flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 600;
      padding: 3px 9px; border-radius: 20px;
    }
    .st-dot { width: 7px; height: 7px; border-radius: 50%; }
    .badge-healthy    { background: #f0fdf4; color: #166534; .st-dot { background: #16a34a; } }
    .badge-degraded   { background: #fffbeb; color: #92400e; .st-dot { background: #f59e0b; } }
    .badge-unhealthy  { background: #fef2f2; color: #991b1b; .st-dot { background: #dc2626; } }
    .badge-unknown    { background: #f8fafc; color: #64748b; .st-dot { background: #94a3b8; } }

    .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .qa-btn {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      padding: 13px 10px; background: white; border: 1px solid $border-color;
      border-radius: 10px; text-decoration: none; text-align: center;
      font-size: 0.75rem; font-weight: 600; color: $text-primary; transition: all 0.15s;
      mat-icon { font-size: 22px; color: var(--qa); }
      &:hover { border-color: var(--qa); background: color-mix(in srgb, var(--qa) 6%, white); transform: translateY(-1px); text-decoration: none; }
    }

    .prod-widget {
      background: white; border: 1px solid $border-color; border-radius: 12px;
      padding: 16px; display: flex; flex-direction: column; gap: 14px;
    }
    .prod-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .prod-kpi {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 10px 8px; background: $bg-body; border-radius: 9px; text-align: center;
    }
    .prod-num { font-size: 1.5rem; font-weight: 700; color: $text-primary; }
    .prod-green { color: #16a34a; }
    .prod-lbl { font-size: 0.7rem; color: $text-secondary; font-weight: 500; }
    .prod-bar-section { display: flex; flex-direction: column; gap: 6px; }
    .prod-bar-hdr { display: flex; justify-content: space-between; font-size: 0.78rem; color: $text-secondary; }
    .prod-rate { font-weight: 700; }
    .rate-good { color: #16a34a; }
    .rate-warn { color: #f59e0b; }
    .prod-track { height: 8px; background: $bg-body; border-radius: 4px; overflow: hidden; }
    .prod-fill  { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .fill-good  { background: linear-gradient(90deg, #16a34a, #22c55e); }
    .fill-warn  { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

    .analytics-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
      @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 540px)  { grid-template-columns: 1fr; }
    }
    .chart-card {
      background: white; border: 1px solid $border-color; border-radius: 12px;
      padding: 16px; display: flex; flex-direction: column; gap: 10px;
    }
    .chart-hdr { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .chart-title { font-size: 0.8rem; font-weight: 600; color: $text-secondary; }
    .chart-badge {
      font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 20px;
      background: #eff6ff; color: #1e40af;
    }
    .chart-value-row { display: flex; align-items: baseline; gap: 5px; }
    .chart-big  { font-size: 1.5rem; font-weight: 700; color: $text-primary; }
    .chart-unit { font-size: 0.78rem; color: $text-secondary; }
    .chart-empty { font-size: 0.8rem; color: $text-secondary; text-align: center; padding: 12px 0; opacity: 0.6; }
    .spark-svg  { width: 100%; height: 40px; display: block; }

    .tat-display { display: flex; align-items: baseline; gap: 5px; }
    .tat-num  { font-size: 2rem; font-weight: 700; color: $text-primary; }
    .tat-unit { font-size: 0.85rem; color: $text-secondary; }
    .tat-status {
      display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 600;
      padding: 6px 10px; border-radius: 8px;
      mat-icon { font-size: 16px; }
    }
    .tat-ok   { background: #f0fdf4; color: #166534; mat-icon { color: #16a34a; } }
    .tat-warn { background: #fffbeb; color: #92400e; mat-icon { color: #f59e0b; } }

    .bb-list { display: flex; flex-direction: column; gap: 7px; }
    .bb-row  { display: flex; align-items: center; gap: 8px; }
    .bb-name { font-size: 0.75rem; color: $text-secondary; width: 80px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bb-track { flex: 1; height: 8px; background: $bg-body; border-radius: 4px; overflow: hidden; }
    .bb-fill  { height: 100%; background: linear-gradient(90deg, $primary, #60b6f9); border-radius: 4px; transition: width 0.6s ease; min-width: 4px; }
    .bb-val   { font-size: 0.72rem; font-weight: 600; color: $text-secondary; width: 52px; text-align: right; flex-shrink: 0; }

    .empty-state {
      padding: 18px; text-align: center; color: $text-secondary; font-size: 0.85rem;
      background: white; border: 1px solid $border-color; border-radius: 12px;
    }

    :host { display: flex; flex-direction: column; gap: 20px; max-width: 1400px; }
  `]
})
export class AdminOverviewComponent implements OnInit {
  private ownerApi = inject(OwnerAnalyticsApiService);
  private http     = inject(HttpClient);

  loading          = signal(false);
  overview         = signal<OwnerOverview | null>(null);
  branches         = signal<BranchPerformance[]>([]);
  revenueData      = signal<RevenueAnalytics | null>(null);
  lastRefreshed    = signal<Date>(new Date());
  healthComponents = signal<HealthStatus[]>([
    { name: 'API',             status: 'Unknown', icon: 'cloud' },
    { name: 'Database',        status: 'Unknown', icon: 'storage' },
    { name: 'Redis',           status: 'Unknown', icon: 'memory' },
    { name: 'Storage',         status: 'Unknown', icon: 'folder' },
    { name: 'Notifications',   status: 'Unknown', icon: 'notifications' },
    { name: 'Background Jobs', status: 'Unknown', icon: 'schedule' },
  ]);

  readonly today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  workQueues = computed<QueueItem[]>(() => [
    { id: 'appts',    icon: 'event',      label: 'Appointments Today', count: this.overview()?.totalAppointments ?? 0, route: '/branch/appointments', actionLabel: 'Manage' },
    { id: 'patients', icon: 'person_add', label: 'New Patients',       count: this.overview()?.newPatients ?? 0,       route: '/owner/patients',       actionLabel: 'View'   },
  ]);

  revenueSpark = computed(() =>
    this.revenueData()?.dailyRevenue?.map(p => p.value) ?? []
  );

  maxBranchPatients = computed(() =>
    Math.max(...this.branches().map(b => b.patients), 1)
  );

  tatBarWidth = computed(() => {
    const tat = this.overview()?.averageTurnaroundHours ?? 0;
    return Math.min((tat / 48) * 100, 100);
  });

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.loading.set(true);

    this.ownerApi.getOverview().subscribe({ next: r => this.overview.set(r.data ?? null) });
    this.ownerApi.getBranches().subscribe({ next: r => this.branches.set(r.data ?? []) });
    this.ownerApi.getRevenue(7).subscribe({
      next: r => this.revenueData.set(r.data ?? null),
      complete: () => { this.loading.set(false); this.lastRefreshed.set(new Date()); },
      error: () => this.loading.set(false),
    });

    this.http.get<any>(`${environment.apiUrl}/system/health-detail`).subscribe({
      next: r => this.applyHealth(r.data ?? r),
      error: () => {
        const c = [...this.healthComponents()];
        c[0] = { ...c[0], status: 'Healthy' };
        this.healthComponents.set(c);
      },
    });
  }

  private applyHealth(data: any): void {
    if (!data) return;
    const idx: Record<string, number> = {
      api: 0, database: 1, db: 1, redis: 2, storage: 3,
      notifications: 4, notification: 4, backgroundjobs: 5, jobs: 5,
    };
    const updated = [...this.healthComponents()];
    updated[0] = { ...updated[0], status: 'Healthy' };
    for (const [key, val] of Object.entries(data)) {
      const k = key.toLowerCase().replace(/[^a-z]/g, '');
      if (idx[k] !== undefined) updated[idx[k]] = { ...updated[idx[k]], status: this.toStatus(val) };
    }
    this.healthComponents.set(updated);
  }

  private toStatus(v: any): 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unknown' {
    const s = String(typeof v === 'object' ? v?.status ?? '' : v).toLowerCase();
    if (s.includes('healthy'))   return 'Healthy';
    if (s.includes('degraded'))  return 'Degraded';
    if (s.includes('unhealthy')) return 'Unhealthy';
    return 'Unknown';
  }

  spark(data: number[], w = 120, h = 40): string {
    if (!data?.length || data.length < 2) return '';
    const min = Math.min(...data);
    const range = Math.max(...data) - min || 1;
    return data.map((v, i) =>
      `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / range) * (h - 4)).toFixed(1)}`
    ).join(' ');
  }

  sparkFill(data: number[], w = 120, h = 40): string {
    const line = this.spark(data, w, h);
    return line ? `${line} ${w},${h} 0,${h}` : '';
  }
}
