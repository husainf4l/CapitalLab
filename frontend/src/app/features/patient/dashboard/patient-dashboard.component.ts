import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PatientDashboardStore } from '../stores/patient-dashboard.store';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule, CommonModule, FormsModule],
  template: `
    <div class="dashboard">

      <!-- ── Hero Banner ─────────────────────────────────────────────── -->
      <div class="hero">
        <div class="hero-content">
          <div class="hero-left">
            <p class="hero-greeting">{{ greeting() }},</p>
            <h1 class="hero-name">{{ firstName() }}</h1>
            <p class="hero-sub">{{ today | date:'EEEE, d MMMM yyyy' }}</p>
            <div class="hero-pills">
              <span class="hero-pill">
                <mat-icon>science</mat-icon>
                {{ store.stats().totalResults }} total results
              </span>
              <span class="hero-pill">
                <mat-icon>calendar_today</mat-icon>
                {{ store.stats().upcomingAppointments }} upcoming
              </span>
            </div>
          </div>
          <div class="hero-right">
            <div class="hero-cta-card">
              <mat-icon class="cta-icon">add_circle</mat-icon>
              <div>
                <p class="cta-label">Ready for your next test?</p>
                <p class="cta-sub">Book in under 2 minutes</p>
              </div>
              <a routerLink="/patient/book" mat-flat-button class="cta-btn">Book Now</a>
            </div>
          </div>
        </div>
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
      </div>

      <!-- ── Journey Tracker ────────────────────────────────────────── -->
      @if (store.upcomingAppointment() || store.recentReports().length > 0) {
        <div class="journey-card">
          <div class="journey-header">
            <span class="journey-title">Your Health Journey</span>
            <span class="journey-badge" [class.badge-done]="currentTestStep() === 3">
              {{ currentTestStep() === 3 ? 'Complete' : 'In Progress' }}
            </span>
          </div>
          <div class="journey-track">
            @for (step of journeySteps; track step.label; let i = $index) {
              <div class="journey-step" [class.done]="i < currentTestStep()" [class.active]="i === currentTestStep()">
                <div class="step-circle">
                  @if (i < currentTestStep()) {
                    <mat-icon>check</mat-icon>
                  } @else {
                    <span>{{ i + 1 }}</span>
                  }
                </div>
                @if (i < journeySteps.length - 1) {
                  <div class="step-connector" [class.filled]="i < currentTestStep()"></div>
                }
                <p class="step-label">{{ step.label }}</p>
                <p class="step-sub">{{ step.sub }}</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- ── Stat Tiles ─────────────────────────────────────────────── -->
      <div class="stats-row">
        <div class="stat-tile" style="--accent:#1e9df1;--accent-bg:#e8f4fd">
          <div class="stat-icon-wrap"><mat-icon>assignment_turned_in</mat-icon></div>
          <div class="stat-body">
            <span class="stat-num">{{ store.stats().resultsReady }}</span>
            <span class="stat-lbl">Results Ready</span>
          </div>
          <a routerLink="/patient/results" class="stat-arrow"><mat-icon>arrow_forward</mat-icon></a>
        </div>
        <div class="stat-tile" style="--accent:#10b981;--accent-bg:#d1fae5">
          <div class="stat-icon-wrap"><mat-icon>science</mat-icon></div>
          <div class="stat-body">
            <span class="stat-num">{{ store.stats().totalResults }}</span>
            <span class="stat-lbl">Total Tests</span>
          </div>
          <a routerLink="/patient/results" class="stat-arrow"><mat-icon>arrow_forward</mat-icon></a>
        </div>
        <div class="stat-tile" style="--accent:#f59e0b;--accent-bg:#fef3c7">
          <div class="stat-icon-wrap"><mat-icon>event</mat-icon></div>
          <div class="stat-body">
            <span class="stat-num">{{ store.stats().upcomingAppointments }}</span>
            <span class="stat-lbl">Appointments</span>
          </div>
          <a routerLink="/patient/appointments" class="stat-arrow"><mat-icon>arrow_forward</mat-icon></a>
        </div>
        <div class="stat-tile" style="--accent:#8b5cf6;--accent-bg:#ede9fe">
          <div class="stat-icon-wrap"><mat-icon>group</mat-icon></div>
          <div class="stat-body">
            <span class="stat-num">{{ store.stats().familyMembers }}</span>
            <span class="stat-lbl">Family Members</span>
          </div>
          <a routerLink="/patient/family-members" class="stat-arrow"><mat-icon>arrow_forward</mat-icon></a>
        </div>
      </div>

      <!-- ── Main Grid ──────────────────────────────────────────────── -->
      <div class="main-grid">

        <!-- Left column -->
        <div class="col-left">

          <!-- Upcoming Appointment -->
          <div class="card">
            <div class="card-head">
              <span class="card-title">Upcoming Appointment</span>
              <a routerLink="/patient/appointments" class="card-link">View all <mat-icon>chevron_right</mat-icon></a>
            </div>

            @if (store.isLoading()) {
              <div class="skel-block"></div>
            } @else if (store.upcomingAppointment()) {
              <div class="appt-block">
                <div class="appt-date-box">
                  <span class="appt-day">{{ store.upcomingAppointment()?.appointmentDate | date:'d' }}</span>
                  <span class="appt-month">{{ store.upcomingAppointment()?.appointmentDate | date:'MMM' }}</span>
                </div>
                <div class="appt-details">
                  <p class="appt-time">{{ store.upcomingAppointment()?.appointmentTime || '—' }}</p>
                  <p class="appt-branch">{{ store.upcomingAppointment()?.branchName || 'Home Collection' }}</p>
                  <p class="appt-type">{{ store.upcomingAppointment()?.type === 'home_collection' ? 'Home Collection' : 'Branch Visit' }}</p>
                </div>
                <div class="appt-status-col">
                  <span class="status-chip" [class]="'chip-' + (store.upcomingAppointment()?.status || 'pending')">
                    {{ store.upcomingAppointment()?.status | titlecase }}
                  </span>
                  <a routerLink="/patient/appointments" mat-stroked-button class="mini-btn">Details</a>
                </div>
              </div>
            } @else {
              <div class="empty-state">
                <div class="empty-icon-wrap" style="--c:#e8f4fd;--ci:#1e9df1">
                  <mat-icon>event</mat-icon>
                </div>
                <p class="empty-title">No upcoming appointments</p>
                <p class="empty-sub">Schedule a visit at your nearest branch</p>
                <a routerLink="/patient/book" mat-flat-button class="empty-cta">Book Appointment</a>
              </div>
            }
          </div>

          <!-- Recent Results -->
          <div class="card">
            <div class="card-head">
              <span class="card-title">Recent Results</span>
              <a routerLink="/patient/results" class="card-link">View all <mat-icon>chevron_right</mat-icon></a>
            </div>

            @if (store.isLoading()) {
              <div class="skel-block"></div><div class="skel-block mt-8"></div>
            } @else if (store.recentReports().length > 0) {
              <div class="results-list">
                @for (report of store.recentReports(); track report.id) {
                  <a [routerLink]="['/patient/results', report.id]" class="result-item">
                    <div class="result-accent" [class]="'accent-' + (report.status || 'pending')"></div>
                    <div class="result-icon-wrap">
                      <mat-icon>description</mat-icon>
                    </div>
                    <div class="result-info">
                      <p class="result-num">{{ report.reportNumber }}</p>
                      <p class="result-date">{{ report.generatedAt | date:'d MMM yyyy' }}</p>
                    </div>
                    <span class="status-chip" [class]="'chip-' + (report.status || 'pending')">
                      {{ report.status | titlecase }}
                    </span>
                    <mat-icon class="result-chevron">chevron_right</mat-icon>
                  </a>
                }
              </div>
            } @else {
              <div class="empty-state">
                <div class="empty-icon-wrap" style="--c:#d1fae5;--ci:#10b981">
                  <mat-icon>science</mat-icon>
                </div>
                <p class="empty-title">No results yet</p>
                <p class="empty-sub">Your lab reports will appear here once ready</p>
              </div>
            }
          </div>

        </div>

        <!-- Right column -->
        <div class="col-right">

          <!-- Quick Book Form -->
          <div class="card form-card">
            <div class="card-head">
              <span class="card-title">Quick Book</span>
              <span class="form-badge">2 min</span>
            </div>
            <form class="quick-form" (ngSubmit)="submitQuickBook()">
              <div class="form-group">
                <label class="form-label">Test Type</label>
                <select class="form-select" [(ngModel)]="quickBook.testType" name="testType">
                  <option value="">Select a test…</option>
                  <option value="cbc">Complete Blood Count (CBC)</option>
                  <option value="lipid">Lipid Panel</option>
                  <option value="thyroid">Thyroid Function (TSH)</option>
                  <option value="hba1c">HbA1c (Diabetes)</option>
                  <option value="vitamin_d">Vitamin D</option>
                  <option value="liver">Liver Function</option>
                  <option value="kidney">Kidney Function</option>
                  <option value="other">Other / Browse all</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Preferred Date</label>
                  <input class="form-input" type="date" [(ngModel)]="quickBook.date" name="date"
                    [min]="minDate" />
                </div>
                <div class="form-group">
                  <label class="form-label">Collection</label>
                  <select class="form-select" [(ngModel)]="quickBook.type" name="type">
                    <option value="branch">Branch Visit</option>
                    <option value="home">Home Collection</option>
                  </select>
                </div>
              </div>
              @if (quickBook.type === 'home') {
                <div class="form-group">
                  <label class="form-label">Your Address</label>
                  <input class="form-input" type="text" [(ngModel)]="quickBook.address" name="address"
                    placeholder="Street, building, area…" />
                </div>
              }
              @if (quickBookMsg()) {
                <div class="form-success">
                  <mat-icon>check_circle</mat-icon> {{ quickBookMsg() }}
                </div>
              }
              <button type="submit" mat-flat-button class="form-submit"
                [disabled]="!quickBook.testType || !quickBook.date">
                <mat-icon>arrow_forward</mat-icon>
                Proceed to Booking
              </button>
            </form>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <div class="card-head">
              <span class="card-title">Quick Actions</span>
            </div>
            <div class="actions-grid">
              @for (action of quickActions; track action.label) {
                <a [routerLink]="action.route" class="action-tile" matRipple>
                  <div class="action-icon" [style.background]="action.bg" [style.color]="action.color">
                    <mat-icon>{{ action.icon }}</mat-icon>
                  </div>
                  <span class="action-label">{{ action.label }}</span>
                </a>
              }
            </div>
          </div>

          <!-- Health Markers -->
          <div class="card">
            <div class="card-head">
              <span class="card-title">Health Markers</span>
              <a routerLink="/patient/health-tracker" class="card-link">Track <mat-icon>chevron_right</mat-icon></a>
            </div>
            <div class="markers-list">
              @for (marker of healthMarkers; track marker.name) {
                <div class="marker-row">
                  <div class="marker-ring" [style.--pct]="marker.pct + '%'" [style.--c]="marker.color">
                    <svg viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" stroke-width="3"/>
                      <circle cx="18" cy="18" r="15.9" fill="none" [attr.stroke]="marker.color"
                        stroke-width="3" stroke-linecap="round"
                        [attr.stroke-dasharray]="(marker.pct * 0.999) + ' 100'"
                        stroke-dashoffset="25" transform="rotate(-90 18 18)"/>
                    </svg>
                  </div>
                  <div class="marker-info">
                    <span class="marker-name">{{ marker.name }}</span>
                    <span class="marker-val">{{ marker.value }}</span>
                  </div>
                  <span class="marker-status" [style.color]="marker.color" [style.background]="marker.bg">
                    {{ marker.label }}
                  </span>
                </div>
              }
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    /* ── Layout ────────────────────────────────────────────────────── */
    .dashboard { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; }

    /* ── Hero ──────────────────────────────────────────────────────── */
    .hero {
      position: relative; overflow: hidden;
      background: linear-gradient(135deg, #1e9df1 0%, #1474c4 55%, #1565c0 100%);
      border-radius: $border-radius-lg; padding: 32px 36px; color: white;
    }
    .hero-orb {
      position: absolute; border-radius: 50%; pointer-events: none;
      &-1 { width: 300px; height: 300px; background: rgba(255,255,255,0.12); top: -80px; right: -60px; }
      &-2 { width: 180px; height: 180px; background: rgba(255,255,255,0.08); bottom: -60px; left: 30%; }
    }
    .hero-content { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
    .hero-greeting { margin: 0 0 4px; font-size: 0.9rem; opacity: 0.75; letter-spacing: 0.04em; text-transform: uppercase; }
    .hero-name { margin: 0 0 6px; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; }
    .hero-sub { margin: 0 0 16px; font-size: 0.85rem; opacity: 0.6; }
    .hero-pills { display: flex; gap: 10px; flex-wrap: wrap; }
    .hero-pill {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(8px); padding: 4px 12px; border-radius: 999px;
      font-size: 0.78rem; font-weight: 500;
      mat-icon { font-size: 14px; }
    }
    .hero-cta-card {
      display: flex; align-items: center; gap: 14px;
      background: rgba(255,255,255,0.1); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.18); border-radius: $border-radius;
      padding: 16px 20px; min-width: 280px;
      @media (max-width: 700px) { min-width: unset; width: 100%; }
    }
    .cta-icon { font-size: 28px; color: rgba(255,255,255,0.7); flex-shrink: 0; }
    .cta-label { margin: 0 0 2px; font-weight: 700; font-size: 0.9rem; }
    .cta-sub { margin: 0; font-size: 0.75rem; opacity: 0.65; }
    .cta-btn {
      margin-left: auto; background: white !important; color: #0f1f3d !important;
      font-weight: 700; font-size: 0.8rem; border-radius: 999px !important; flex-shrink: 0;
    }

    /* ── Journey ───────────────────────────────────────────────────── */
    .journey-card {
      background: white; border: 1px solid $border-color;
      border-radius: $border-radius-lg; padding: 22px 28px;
    }
    .journey-header { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; }
    .journey-title { font-weight: 700; font-size: 0.95rem; }
    .journey-badge {
      margin-left: auto; font-size: 0.7rem; font-weight: 700; padding: 3px 12px;
      border-radius: 999px; background: #dbeafe; color: #1d4ed8;
      text-transform: uppercase; letter-spacing: 0.05em;
      &.badge-done { background: #dcfce7; color: #15803d; }
    }
    .journey-track { display: flex; align-items: flex-start; }
    .journey-step {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      position: relative; gap: 8px;
    }
    .step-circle {
      width: 36px; height: 36px; border-radius: 50%; border: 2px solid $gray-300;
      display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
      font-weight: 700; color: $gray-500; background: white; z-index: 1; flex-shrink: 0;
      transition: all 0.3s;
      mat-icon { font-size: 18px; }
    }
    .journey-step.done .step-circle {
      background: #10b981; border-color: #10b981; color: white;
      box-shadow: 0 0 0 4px rgba(16,185,129,0.15);
    }
    .journey-step.active .step-circle {
      background: #1e9df1; border-color: #1e9df1; color: white;
      box-shadow: 0 0 0 4px rgba(30,157,241,0.2);
      animation: stepPulse 2s ease-in-out infinite;
    }
    @keyframes stepPulse { 0%,100% { box-shadow: 0 0 0 4px rgba(30,157,241,0.2); } 50% { box-shadow: 0 0 0 8px rgba(30,157,241,0.08); } }
    .step-connector {
      position: absolute; top: 17px; left: calc(50% + 18px); right: calc(-50% + 18px);
      height: 2px; background: $gray-200; z-index: 0; transition: background 0.3s;
      &.filled { background: #10b981; }
    }
    .step-label { margin: 0; font-size: 0.72rem; font-weight: 600; color: $text-secondary; text-align: center; line-height: 1.3; }
    .step-sub { margin: 0; font-size: 0.65rem; color: $gray-500; text-align: center; }
    .journey-step.done .step-label, .journey-step.done .step-sub { color: #15803d; }
    .journey-step.active .step-label { color: #1e9df1; font-weight: 700; }
    @media (max-width: 560px) {
      .journey-track { flex-direction: column; gap: 12px; }
      .journey-step { flex-direction: row; flex: none; width: 100%; align-items: center; }
      .step-connector { display: none; }
      .step-label, .step-sub { text-align: left; }
    }

    /* ── Stat Tiles ────────────────────────────────────────────────── */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { grid-template-columns: 1fr 1fr; gap: 10px; }
    }
    .stat-tile {
      background: white; border: 1px solid $border-color; border-radius: $border-radius;
      padding: 18px 16px; display: flex; align-items: center; gap: 14px;
      transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: $shadow-md; }
    }
    .stat-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: var(--accent-bg); color: var(--accent);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; }
    }
    .stat-body { flex: 1; min-width: 0; }
    .stat-num { display: block; font-size: 1.6rem; font-weight: 800; color: $text-primary; line-height: 1; }
    .stat-lbl { display: block; font-size: 0.72rem; color: $text-secondary; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .stat-arrow { display: flex; color: $gray-400; text-decoration: none;
      mat-icon { font-size: 18px; transition: color 0.2s; }
      &:hover mat-icon { color: var(--accent); }
    }

    /* ── Main Grid ─────────────────────────────────────────────────── */
    .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .col-left, .col-right { display: flex; flex-direction: column; gap: 20px; }

    /* ── Cards ─────────────────────────────────────────────────────── */
    .card {
      background: white; border: 1px solid $border-color;
      border-radius: $border-radius-lg; padding: 22px;
    }
    .card-head {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;
    }
    .card-title { font-size: 0.95rem; font-weight: 700; color: $text-primary; }
    .card-link {
      display: inline-flex; align-items: center; gap: 2px;
      font-size: 0.8rem; color: #1e9df1; text-decoration: none; font-weight: 600;
      mat-icon { font-size: 16px; }
      &:hover { text-decoration: underline; }
    }

    /* ── Appointment ───────────────────────────────────────────────── */
    .appt-block {
      display: flex; align-items: center; gap: 16px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd; border-radius: $border-radius; padding: 16px;
    }
    .appt-date-box {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: #1e9df1; color: white; border-radius: 10px;
      width: 56px; height: 60px; flex-shrink: 0;
    }
    .appt-day { font-size: 1.6rem; font-weight: 800; line-height: 1; }
    .appt-month { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; opacity: 0.85; }
    .appt-details { flex: 1; }
    .appt-time { margin: 0 0 3px; font-size: 1rem; font-weight: 700; color: $text-primary; }
    .appt-branch { margin: 0 0 2px; font-size: 0.82rem; color: $text-secondary; }
    .appt-type { margin: 0; font-size: 0.75rem; color: #0ea5e9; font-weight: 500; }
    .appt-status-col { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .mini-btn { font-size: 0.75rem !important; padding: 4px 12px !important; height: auto !important; line-height: 1.6 !important; border-radius: 999px !important; }

    /* ── Status Chips ──────────────────────────────────────────────── */
    .status-chip {
      font-size: 0.7rem; font-weight: 700; padding: 3px 10px;
      border-radius: 999px; text-transform: capitalize; letter-spacing: 0.02em;
    }
    .chip-confirmed, .chip-released  { background: #dcfce7; color: #15803d; }
    .chip-pending   { background: #fef3c7; color: #92400e; }
    .chip-completed { background: #dbeafe; color: #1e40af; }
    .chip-cancelled { background: #fee2e2; color: #991b1b; }

    /* ── Results ───────────────────────────────────────────────────── */
    .results-list { display: flex; flex-direction: column; gap: 8px; }
    .result-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 14px;
      border: 1px solid $border-color; border-radius: $border-radius;
      text-decoration: none; color: inherit; transition: all 0.15s; position: relative; overflow: hidden;
      &:hover { border-color: #1e9df1; background: #f0f9ff; }
    }
    .result-accent {
      position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 3px 0 0 3px;
      &.accent-released { background: #10b981; }
      &.accent-pending  { background: #f59e0b; }
      &.accent-completed { background: #3b82f6; }
    }
    .result-icon-wrap {
      width: 36px; height: 36px; border-radius: 10px; background: #f0f9ff; color: #1e9df1;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 20px; }
    }
    .result-info { flex: 1; }
    .result-num { margin: 0 0 2px; font-size: 0.875rem; font-weight: 600; }
    .result-date { margin: 0; font-size: 0.75rem; color: $text-secondary; }
    .result-chevron { color: $gray-400; font-size: 18px; }

    /* ── Form Card ─────────────────────────────────────────────────── */
    .form-card { border: none; background: linear-gradient(135deg, #fafafa 0%, #f0f9ff 100%); border: 1px solid #bae6fd; }
    .form-badge {
      background: #dbeafe; color: #1d4ed8; font-size: 0.7rem; font-weight: 700;
      padding: 2px 10px; border-radius: 999px;
    }
    .quick-form { display: flex; flex-direction: column; gap: 14px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-label { font-size: 0.75rem; font-weight: 600; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.05em; }
    .form-input, .form-select {
      padding: 10px 13px; border: 1.5px solid $gray-300; border-radius: $border-radius-sm;
      font-size: 0.875rem; color: $text-primary; background: white; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s; appearance: none; width: 100%; box-sizing: border-box;
      &:focus { border-color: #1e9df1; box-shadow: 0 0 0 3px rgba(30,157,241,0.12); }
    }
    .form-select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2372767a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; cursor: pointer; }
    .form-success { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #dcfce7; color: #15803d; border-radius: $border-radius-sm; font-size: 0.82rem; font-weight: 500; mat-icon { font-size: 18px; } }
    .form-submit {
      background: linear-gradient(135deg, #1e9df1, #1681c4) !important; color: white !important;
      border-radius: $border-radius-sm !important; font-weight: 700 !important; height: 44px !important;
      font-size: 0.875rem !important; display: flex; align-items: center; gap: 6px;
      &:disabled { opacity: 0.5; }
      mat-icon { font-size: 18px; }
    }

    /* ── Actions Grid ──────────────────────────────────────────────── */
    .actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
      @media (max-width: 500px) { grid-template-columns: repeat(2, 1fr); }
    }
    .action-tile {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 14px 8px; border-radius: $border-radius; border: 1px solid $border-color;
      text-decoration: none; color: $text-primary; cursor: pointer;
      transition: all 0.2s; background: white;
      &:hover { border-color: transparent; box-shadow: $shadow-md; transform: translateY(-2px); }
    }
    .action-icon {
      width: 46px; height: 46px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; }
    }
    .action-label { font-size: 0.7rem; font-weight: 600; text-align: center; line-height: 1.3; color: $text-secondary; }

    /* ── Health Markers ────────────────────────────────────────────── */
    .markers-list { display: flex; flex-direction: column; gap: 12px; }
    .marker-row { display: flex; align-items: center; gap: 12px; }
    .marker-ring { width: 44px; height: 44px; flex-shrink: 0; svg { width: 100%; height: 100%; } }
    .marker-info { flex: 1; }
    .marker-name { display: block; font-size: 0.82rem; font-weight: 600; color: $text-primary; margin-bottom: 1px; }
    .marker-val  { display: block; font-size: 0.72rem; color: $text-secondary; }
    .marker-status { font-size: 0.68rem; font-weight: 700; padding: 2px 9px; border-radius: 999px; white-space: nowrap; }

    /* ── Empty States ──────────────────────────────────────────────── */
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 16px; text-align: center; }
    .empty-icon-wrap { width: 56px; height: 56px; border-radius: 50%; background: var(--c); color: var(--ci); display: flex; align-items: center; justify-content: center; mat-icon { font-size: 26px; } }
    .empty-title { margin: 0; font-size: 0.9rem; font-weight: 600; color: $text-primary; }
    .empty-sub { margin: 0; font-size: 0.8rem; color: $text-secondary; }
    .empty-cta { background: #1e9df1 !important; color: white !important; border-radius: 999px !important; font-size: 0.8rem !important; }

    /* ── Skeleton ──────────────────────────────────────────────────── */
    .skel-block { height: 72px; border-radius: $border-radius; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
    .mt-8 { margin-top: 8px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  store = inject(PatientDashboardStore);

  today = new Date();
  minDate = new Date().toISOString().split('T')[0];
  quickBookMsg = signal('');

  quickBook = {
    testType: '',
    date: '',
    type: 'branch',
    address: '',
  };

  firstName(): string {
    const full = this.authService.currentUser()?.fullName ?? '';
    return full.split(' ')[0] || 'Patient';
  }

  greeting(): string {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }

  readonly journeySteps = [
    { label: 'Appointment Booked', sub: 'Scheduled' },
    { label: 'Visit Complete',     sub: 'Checked in' },
    { label: 'Results Uploaded',   sub: 'Processing' },
    { label: 'Report Ready',       sub: 'Available' },
  ];

  currentTestStep = computed(() => {
    const appt = this.store.upcomingAppointment();
    const report = this.store.recentReports()[0];
    if (report?.status === 'released') return 3;
    if (report?.status === 'pending') return 2;
    if (appt?.status === 'completed' || appt?.status === 'in_progress') return 1;
    return 0;
  });

  readonly quickActions = [
    { icon: 'biotech',      label: 'Book a Test',        route: '/patient/book',             bg: '#ede9fe', color: '#7c3aed' },
    { icon: 'home',         label: 'Home Collection',    route: '/patient/home-collection',  bg: '#e0f2fe', color: '#0891b2' },
    { icon: 'description',  label: 'My Results',         route: '/patient/results',          bg: '#dcfce7', color: '#16a34a' },
    { icon: 'group',        label: 'Family',             route: '/patient/family-members',   bg: '#fce7f3', color: '#be185d' },
  ];

  readonly healthMarkers = [
    { name: 'Vitamin D',   value: '— ng/mL',  pct: 0,  color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
    { name: 'HbA1c',       value: '— %',      pct: 0,  color: '#10b981', bg: '#d1fae5', label: 'Pending' },
    { name: 'Cholesterol', value: '— mg/dL',  pct: 0,  color: '#3b82f6', bg: '#dbeafe', label: 'Pending' },
    { name: 'TSH',         value: '— µIU/mL', pct: 0,  color: '#8b5cf6', bg: '#ede9fe', label: 'Pending' },
  ];

  submitQuickBook(): void {
    if (!this.quickBook.testType || !this.quickBook.date) return;
    this.quickBookMsg.set('Redirecting to full booking form…');
    setTimeout(() => this.quickBookMsg.set(''), 3000);
  }

  ngOnInit(): void {
    this.store.load();
    this.store.connectRealtime();
  }

  ngOnDestroy(): void {
    this.store.disconnectRealtime();
  }
}
