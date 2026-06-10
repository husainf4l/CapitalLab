import { Component, inject, signal, OnInit, afterNextRender, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PackageApiService } from '../../../core/api/package-api.service';
import { HealthPackage } from '../../../core/models/health-package.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, CommonModule, FormsModule],
  template: `

<!-- ══════════════════════════════════════════════════════════ HERO ══ -->
<section class="hero-section">
  <div class="hero-blob blob-a"></div>
  <div class="hero-blob blob-b"></div>
  <div class="hero-blob blob-c"></div>

  <div class="container hero-grid">

    <!-- Left: Content -->
    <div class="hero-content">
      <div class="hero-badge">
        <span class="badge-pulse"></span>
        <mat-icon>verified</mat-icon>
        <span>ISO 15189 Certified Laboratory</span>
      </div>

      <h1 class="hero-headline">
        Precision Diagnostics<br>
        for a <span class="headline-gradient">Healthier</span><br>
        Tomorrow
      </h1>

      <p class="hero-desc">
        Capital Lab provides advanced laboratory diagnostics, personalized health
        insights, home sample collection, and fast digital reporting.
      </p>

      <div class="hero-ctas">
        <a mat-flat-button color="primary" class="cta-primary" routerLink="/login">
          <mat-icon>calendar_today</mat-icon>
          Book Appointment
        </a>
        <a mat-stroked-button class="cta-secondary" routerLink="/patient/results">
          <mat-icon>description</mat-icon>
          View Test Results
        </a>
      </div>

      <div class="hero-trust">
        @for (t of trustItems; track t.label) {
          <div class="trust-chip">
            <mat-icon>{{ t.icon }}</mat-icon>
            <span>{{ t.label }}</span>
          </div>
        }
      </div>
    </div>

    <!-- Right: Visual -->
    <div class="hero-visual">
      <div class="visual-wrap">
        <!-- Pulse rings -->
        <div class="pulse-ring pr-1"></div>
        <div class="pulse-ring pr-2"></div>
        <div class="pulse-ring pr-3"></div>

        <!-- Medical sphere -->
        <div class="med-sphere">
          <div class="cell c1"></div>
          <div class="cell c2"></div>
          <div class="cell c3"></div>
          <div class="cell c4"></div>
          <div class="cell c5"></div>
        </div>
        <!-- Sphere center icon (outside sphere to avoid clip) -->
        <div class="sphere-icon">
          <mat-icon>biotech</mat-icon>
        </div>

        <!-- Floating cards -->
        <div class="fc-card fc-doctor">
          <div class="fc-avatar">👨‍⚕️</div>
          <div>
            <div class="fc-title">Dr. Al-Rashid</div>
            <div class="fc-sub">Chief Pathologist</div>
          </div>
          <div class="fc-online"></div>
        </div>

        <div class="fc-card fc-result">
          <div class="fc-icon-wrap"><mat-icon>science</mat-icon></div>
          <div>
            <div class="fc-title">HbA1c Results</div>
            <div class="fc-sub">5.4% — Normal</div>
          </div>
          <span class="fc-badge-good">Normal</span>
        </div>

        <div class="fc-card fc-stat">
          <div class="fc-big">98.7%</div>
          <div class="fc-sub-center">Accuracy Rate</div>
        </div>

        <div class="fc-card fc-home">
          <div class="fc-icon-wrap fc-home-icon"><mat-icon>home</mat-icon></div>
          <div>
            <div class="fc-title">Home Collection</div>
            <div class="fc-sub">Available Today</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- ══════════════════════════════════════════════════════ FEATURES ══ -->
<section class="features-section">
  <div class="container features-grid">
    @for (f of featureCards; track f.title; let i = $index) {
      <div class="feature-card reveal" [style.transition-delay]="(i * 0.1) + 's'">
        <div class="feature-icon-wrap" [style.background]="f.bg">
          <mat-icon [style.color]="f.color">{{ f.icon }}</mat-icon>
        </div>
        <h3 class="feature-title">{{ f.title }}</h3>
        <p class="feature-desc">{{ f.desc }}</p>
      </div>
    }
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════ ABOUT ══ -->
<section class="about-section page-section">
  <div class="container about-grid">

    <!-- Image side -->
    <div class="about-image-wrap reveal-left">
      <div class="about-art">
        <div class="art-ring art-ring-1"></div>
        <div class="art-ring art-ring-2"></div>
        <div class="art-core">
          <mat-icon>biotech</mat-icon>
        </div>
        <div class="art-orb orb-1"></div>
        <div class="art-orb orb-2"></div>
        <div class="art-orb orb-3"></div>
        <div class="art-badge about-badge-1">
          <mat-icon>verified</mat-icon><span>ISO Certified</span>
        </div>
        <div class="art-badge about-badge-2">
          <strong>100K+</strong><span>Patients</span>
        </div>
      </div>
    </div>

    <!-- Content side -->
    <div class="about-content reveal-right">
      <p class="section-label">About Capital Lab</p>
      <h2 class="section-title">Trusted Laboratory Services<br>Built Around Patients</h2>
      <p class="about-desc">
        For over a decade, Capital Lab has been the region's most trusted medical
        diagnostics provider. Our state-of-the-art facilities combine advanced
        technology with compassionate care to deliver results you can rely on.
      </p>
      <ul class="about-features">
        @for (f of aboutFeatures; track f) {
          <li>
            <mat-icon>check_circle</mat-icon>
            <span>{{ f }}</span>
          </li>
        }
      </ul>
      <a mat-flat-button color="primary" routerLink="/about" class="about-cta">
        Learn About Us <mat-icon>arrow_forward</mat-icon>
      </a>
    </div>

  </div>
</section>

<!-- ══════════════════════════════════════════════════════ SERVICES ══ -->
<section class="services-section page-section">
  <div class="container">
    <div class="section-header reveal">
      <div>
        <p class="section-label">Our Services</p>
        <h2 class="section-title">Comprehensive Laboratory Testing</h2>
      </div>
      <a mat-stroked-button routerLink="/tests" color="primary">View All Tests</a>
    </div>
    <div class="services-grid">
      @for (s of services; track s.title; let i = $index) {
        <div class="service-card reveal" [style.transition-delay]="(i * 0.08) + 's'"
             routerLink="/tests">
          <div class="service-icon-wrap" [style.background]="s.bg">
            <mat-icon [style.color]="s.color">{{ s.icon }}</mat-icon>
          </div>
          <h4 class="service-title">{{ s.title }}</h4>
          <p class="service-desc">{{ s.desc }}</p>
          <div class="service-learn">
            <span>Learn More</span>
            <mat-icon>arrow_forward</mat-icon>
          </div>
        </div>
      }
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════ PACKAGES ══ -->
<section class="packages-section page-section">
  <div class="container">
    <div class="section-header reveal">
      <div>
        <p class="section-label">Featured Packages</p>
        <h2 class="section-title">Complete Health Checkup Packages</h2>
      </div>
      <a mat-stroked-button routerLink="/packages" color="primary">All Packages</a>
    </div>

    <div class="packages-grid">
      @if (packages().length > 0) {
        @for (pkg of packages(); track pkg.id; let i = $index) {
          <div class="pkg-card reveal" [style.transition-delay]="(i * 0.1) + 's'">
            @if (pkg.isPopular) {
              <div class="pkg-badge">⭐ Popular</div>
            }
            <div class="pkg-header" [style.background]="packageGradients[i % packageGradients.length]">
              <mat-icon class="pkg-hero-icon">medical_services</mat-icon>
            </div>
            <div class="pkg-body">
              <h4 class="pkg-name">{{ pkg.name }}</h4>
              <p class="pkg-tests">{{ pkg.testsCount }} Tests Included</p>
              @if (pkg.originalPrice && pkg.originalPrice > pkg.price) {
                <div class="pkg-savings">
                  Save SAR {{ (pkg.originalPrice - pkg.price) | number:'1.0-0' }}
                </div>
              }
              <div class="pkg-price-row">
                @if (pkg.originalPrice && pkg.originalPrice > pkg.price) {
                  <span class="pkg-original">SAR {{ pkg.originalPrice | number }}</span>
                }
                <span class="pkg-price">SAR {{ pkg.price | number }}</span>
              </div>
              <a mat-flat-button color="primary" class="pkg-cta"
                 [routerLink]="['/packages', pkg.id]">
                Book Package
              </a>
            </div>
          </div>
        }
      } @else {
        @for (s of [1,2,3]; track s) {
          <div class="pkg-card skeleton-card">
            <div class="sk-header"></div>
            <div class="pkg-body">
              <div class="sk-line sk-w70"></div>
              <div class="sk-line sk-w50"></div>
              <div class="sk-price-line"></div>
            </div>
          </div>
        }
      }
    </div>
  </div>
</section>

<!-- ══════════════════════════════════════════════ HEALTH TRACKER ══ -->
<section class="tracker-section page-section">
  <div class="container tracker-grid">

    <!-- Left: Visual -->
    <div class="tracker-visual reveal-left">

      <!-- Chart card -->
      <div class="chart-card">
        <div class="chart-top">
          <div>
            <div class="chart-label">Vitamin D Trend</div>
            <div class="chart-unit">nmol/L · Last 6 months</div>
          </div>
          <span class="trend-badge trend-up">
            <mat-icon>trending_up</mat-icon> +12%
          </span>
        </div>
        <div class="chart-bars">
          @for (bar of vitaminTrend; track bar.month) {
            <div class="bar-col">
              <div class="bar-fill" [style.height]="bar.pct + '%'"
                   [class.bar-active]="bar.active"></div>
              <span class="bar-month">{{ bar.month }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Health score -->
      <div class="score-card">
        <div class="score-ring-wrap">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e8f4fd" stroke-width="8"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1a73e8" stroke-width="8"
              stroke-dasharray="264" stroke-dashoffset="34"
              stroke-linecap="round" transform="rotate(-90 50 50)"/>
          </svg>
          <div class="score-num">87</div>
        </div>
        <div>
          <div class="score-label">Health Score</div>
          <div class="score-status">Excellent</div>
        </div>
      </div>

      <!-- Metrics list -->
      <div class="metrics-card">
        @for (m of trackerMetrics; track m.label) {
          <div class="metric-row">
            <div class="metric-dot" [class.dot-good]="m.status === 'good'"
                 [class.dot-warn]="m.status === 'warning'"></div>
            <span class="metric-label">{{ m.label }}</span>
            <span class="metric-value">{{ m.value }} {{ m.unit }}</span>
            <span class="metric-trend" [class.trend-pos]="m.trend.startsWith('-') || m.trend === 'Stable'"
                  [class.trend-neg]="m.trend.startsWith('+')">
              {{ m.trend }}
            </span>
          </div>
        }
      </div>

    </div>

    <!-- Right: Content -->
    <div class="tracker-content reveal-right">
      <p class="section-label-light">Personal Health Tracker</p>
      <h2 class="section-title-light">Monitor Your Health<br>Over Time</h2>
      <p class="tracker-desc">
        Track your biomarkers over time, receive trend analysis, and stay ahead of
        health risks with Capital Lab's digital health tracker.
      </p>
      <ul class="tracker-benefits">
        @for (b of trackerBenefits; track b) {
          <li>
            <div class="benefit-check"><mat-icon>check</mat-icon></div>
            <span>{{ b }}</span>
          </li>
        }
      </ul>
      <a mat-flat-button class="tracker-cta" routerLink="/login">
        Start Tracking <mat-icon>arrow_forward</mat-icon>
      </a>
    </div>

  </div>
</section>

<!-- ══════════════════════════════════════════════════ PROGRAMS ══ -->
<section class="programs-section page-section">
  <div class="container">
    <div class="section-header reveal">
      <div>
        <p class="section-label">Health Programs</p>
        <h2 class="section-title">Long-Term Wellness Programs</h2>
      </div>
      <a mat-stroked-button routerLink="/health-programs" color="primary">All Programs</a>
    </div>
    <div class="programs-grid">
      @for (p of programs; track p.title; let i = $index) {
        <div class="program-banner reveal" [style.transition-delay]="(i * 0.1) + 's'"
             [style.background]="p.gradient">
          <div class="program-icon-wrap">
            <mat-icon>{{ p.icon }}</mat-icon>
          </div>
          <div class="program-body">
            <h4 class="program-title">{{ p.title }}</h4>
            <p class="program-desc">{{ p.desc }}</p>
            <a class="program-link" [routerLink]="p.route">
              Learn More <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>
      }
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════ HOME SAMPLE COLLECTION ══ -->
<section class="collection-section page-section">
  <div class="container collection-grid">

    <!-- Illustration -->
    <div class="collection-art reveal-left">
      <div class="collection-art-card">
        <div class="collection-house-icon">
          <mat-icon>home</mat-icon>
        </div>
        <div class="collection-orbs">
          <div class="c-orb c-orb-1">🩸</div>
          <div class="c-orb c-orb-2">🔬</div>
          <div class="c-orb c-orb-3">📋</div>
        </div>
        <div class="collection-info-badge">
          <mat-icon>schedule</mat-icon>
          <div>
            <strong>Same Day</strong>
            <span>Collection Available</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="collection-content reveal-right">
      <p class="section-label">Home Collection</p>
      <h2 class="section-title">Book Home Sample<br>Collection</h2>
      <p class="collection-desc">
        No need to visit the lab. Our certified phlebotomists come to your doorstep,
        collect samples, and you receive digital results within hours.
      </p>
      <div class="steps-flow">
        @for (step of collectionSteps; track step.num; let last = $last) {
          <div class="step-item">
            <div class="step-num">{{ step.num }}</div>
            <div class="step-info">
              <div class="step-icon-wrap"><mat-icon>{{ step.icon }}</mat-icon></div>
              <span class="step-label">{{ step.label }}</span>
            </div>
          </div>
          @if (!last) {
            <div class="step-arrow"><mat-icon>arrow_forward</mat-icon></div>
          }
        }
      </div>
      <a mat-flat-button color="primary" class="collection-cta" routerLink="/login">
        <mat-icon>calendar_today</mat-icon> Book Now
      </a>
    </div>

  </div>
</section>

<!-- ═══════════════════════════════════════════════════════ STATS ══ -->
<section class="stats-section page-section">
  <div class="container">
    <div class="section-header-center reveal">
      <p class="section-label-light">Why Capital Lab</p>
      <h2 class="section-title-light">Trusted by Patients Across the Region</h2>
    </div>
    <div class="stats-grid">
      @for (s of stats; track s.label; let i = $index) {
        <div class="stat-card reveal" [style.transition-delay]="(i * 0.1) + 's'">
          <div class="stat-icon-wrap">
            <mat-icon>{{ s.icon }}</mat-icon>
          </div>
          <div class="stat-num" [attr.data-count]="s.value" [attr.data-suffix]="s.suffix">
            {{ s.value }}{{ s.suffix }}
          </div>
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-sub">{{ s.sub }}</div>
        </div>
      }
    </div>
  </div>
</section>

<!-- ══════════════════════════════════════════════ TESTIMONIALS ══ -->
<section class="testimonials-section page-section">
  <div class="container">
    <div class="section-header-center reveal">
      <p class="section-label">Patient Stories</p>
      <h2 class="section-title">What Our Patients Say</h2>
    </div>
    <div class="testimonials-grid">
      @for (t of testimonials; track t.name; let i = $index) {
        <div class="testimonial-card reveal" [style.transition-delay]="(i * 0.1) + 's'">
          <div class="stars">
            @for (s of [1,2,3,4,5]; track s) {
              <mat-icon class="star-icon">star</mat-icon>
            }
          </div>
          <p class="review-text">"{{ t.text }}"</p>
          <div class="reviewer-row">
            <div class="reviewer-avatar" [style.background]="t.color">{{ t.initials }}</div>
            <div>
              <div class="reviewer-name">{{ t.name }}</div>
              <div class="reviewer-role">{{ t.role }}</div>
            </div>
          </div>
        </div>
      }
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════ FAQ ══ -->
<section class="faq-section page-section">
  <div class="container faq-container">
    <div class="section-header-center reveal">
      <p class="section-label">FAQ</p>
      <h2 class="section-title">Frequently Asked Questions</h2>
    </div>
    <div class="faq-list">
      @for (item of faqItems; track item.question; let i = $index) {
        <div class="faq-item reveal" [class.faq-open]="faqOpen()[i]"
             [style.transition-delay]="(i * 0.05) + 's'">
          <button class="faq-question" (click)="toggleFaq(i)">
            <span>{{ item.question }}</span>
            <mat-icon>{{ faqOpen()[i] ? 'expand_less' : 'expand_more' }}</mat-icon>
          </button>
          <div class="faq-body">
            <div class="faq-body-inner">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  </div>
</section>

<!-- ══════════════════════════════════════════════ MOBILE APP ══ -->
<section class="app-section page-section">
  <div class="container app-grid">

    <!-- Content -->
    <div class="app-content reveal-left">
      <p class="section-label-light">Mobile App</p>
      <h2 class="section-title-light">Your Health in<br>Your Hands</h2>
      <p class="app-desc">
        Access lab results, book appointments, manage your family's health, and
        track biomarkers — all from the Capital Lab mobile app.
      </p>
      <ul class="app-features">
        @for (f of appFeatures; track f) {
          <li><mat-icon>check_circle</mat-icon><span>{{ f }}</span></li>
        }
      </ul>
      <div class="store-buttons">
        <div class="store-btn">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <div>
            <span class="store-line1">Download on the</span>
            <strong class="store-line2">App Store</strong>
          </div>
        </div>
        <div class="store-btn">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M3.18 23.76c.3.17.64.22.99.14l12.12-6.99-2.54-2.54-10.57 9.39zm-.99-20.3v17.08c0 .42.12.78.33 1.05L12 12 2.52 2.34c-.21.27-.33.63-.33 1.12zM19.65 8.4l-2.69-1.55-2.85 2.85 2.85 2.85 2.72-1.57c.78-.45.78-1.58-.03-2.58zM4.17.1c-.35-.08-.69-.03-.99.14L13.73 10.6l-2.54 2.54L3.51.99c-.2-.27-.33-.63-.33-1.05z"/>
          </svg>
          <div>
            <span class="store-line1">Get it on</span>
            <strong class="store-line2">Google Play</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Phone mockup -->
    <div class="app-mockup reveal-right">
      <div class="phone-outer">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="phone-header">
            <span class="phone-app-name">Capital Lab</span>
            <mat-icon class="phone-notif-icon">notifications_none</mat-icon>
          </div>
          <div class="phone-score-area">
            <svg class="phone-ring-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="7"/>
              <circle cx="50" cy="50" r="38" fill="none" stroke="white" stroke-width="7"
                stroke-dasharray="239" stroke-dashoffset="31"
                stroke-linecap="round" transform="rotate(-90 50 50)"/>
            </svg>
            <div class="phone-score-num">87</div>
          </div>
          <p class="phone-score-label">Health Score · Excellent</p>
          <div class="phone-metrics">
            <div class="pm-row"><span class="pm-dot pm-green"></span><span>Vitamin D</span><strong>52</strong></div>
            <div class="pm-row"><span class="pm-dot pm-blue"></span><span>HbA1c</span><strong>5.4%</strong></div>
            <div class="pm-row"><span class="pm-dot pm-amber"></span><span>Cholesterol</span><strong>4.8</strong></div>
          </div>
          <div class="phone-bottom-nav">
            <mat-icon>home</mat-icon>
            <mat-icon>science</mat-icon>
            <mat-icon>calendar_today</mat-icon>
            <mat-icon>person</mat-icon>
          </div>
        </div>
      </div>
      <!-- Decorative glow -->
      <div class="phone-glow"></div>
    </div>

  </div>
</section>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    // ── Keyframes ────────────────────────────────────────────────────────────────
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-14px); }
    }
    @keyframes pulse-ring-anim {
      0%       { transform: translate(-50%,-50%) scale(0.85); opacity: 0.7; }
      100%     { transform: translate(-50%,-50%) scale(1.25); opacity: 0; }
    }
    @keyframes badge-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba($success, 0.5); }
      50%       { box-shadow: 0 0 0 6px rgba($success, 0); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }

    // ── Scroll reveal ─────────────────────────────────────────────────────────────
    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.7s ease, transform 0.7s ease;
      &.visible { opacity: 1; transform: translateY(0); }
    }
    .reveal-left {
      opacity: 0;
      transform: translateX(-48px);
      transition: opacity 0.7s ease, transform 0.7s ease;
      &.visible { opacity: 1; transform: translateX(0); }
    }
    .reveal-right {
      opacity: 0;
      transform: translateX(48px);
      transition: opacity 0.7s ease, transform 0.7s ease;
      &.visible { opacity: 1; transform: translateX(0); }
    }

    // ── Shared typography ────────────────────────────────────────────────────────
    .section-label {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: $primary;
      margin-bottom: 12px;
    }
    .section-label-light {
      @extend .section-label;
      color: rgba(255,255,255,0.7);
    }
    .section-title {
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.5px;
      color: $text-primary;
      margin-bottom: 12px;
    }
    .section-title-light {
      @extend .section-title;
      color: white;
    }
    .section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 40px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .section-header-center {
      text-align: center;
      margin-bottom: 48px;
      .section-label, .section-title { display: block; }
    }

    // ══════════════════════════════════════════════════════════════ HERO ══════════
    .hero-section {
      position: relative;
      overflow: hidden;
      background: linear-gradient(145deg, #f0f9ff 0%, #eef2ff 40%, #faf0fe 80%, #f0fdfa 100%);
      padding: 80px 0 96px;
    }
    .hero-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
      &.blob-a {
        width: 700px; height: 700px;
        background: radial-gradient(circle, rgba($primary, 0.1), transparent 60%);
        bottom: -250px; right: -150px;
      }
      &.blob-b {
        width: 450px; height: 450px;
        background: radial-gradient(circle, rgba(139,92,246,0.1), transparent 60%);
        top: -120px; left: -100px;
      }
      &.blob-c {
        width: 300px; height: 300px;
        background: radial-gradient(circle, rgba($secondary,0.12), transparent 60%);
        top: 35%; right: 28%;
      }
    }

    .hero-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: center;
    }

    // Hero content
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba($primary, 0.07);
      border: 1.5px solid rgba($primary, 0.15);
      border-radius: $border-radius-full;
      padding: 7px 16px;
      margin-bottom: 28px;
      .badge-pulse {
        width: 8px; height: 8px;
        background: $success;
        border-radius: 50%;
        animation: badge-pulse 2s ease-in-out infinite;
      }
      mat-icon { font-size: 15px; width: 15px; height: 15px; color: $primary; }
      span { font-size: 0.8rem; font-weight: 600; color: $primary; }
    }

    .hero-headline {
      font-size: clamp(2.4rem, 4.5vw, 3.75rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -1.5px;
      color: $text-primary;
      margin-bottom: 20px;
    }
    .headline-gradient {
      background: linear-gradient(135deg, $primary 0%, #4f8ef7 50%, $secondary 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-desc {
      font-size: 1.1rem;
      color: $text-secondary;
      line-height: 1.7;
      margin-bottom: 36px;
      max-width: 480px;
    }
    .hero-ctas {
      display: flex;
      gap: 12px;
      margin-bottom: 36px;
      flex-wrap: wrap;
    }
    .cta-primary {
      padding: 14px 28px !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      border-radius: 14px !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      box-shadow: 0 6px 24px rgba($primary, 0.35) !important;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .cta-secondary {
      padding: 14px 24px !important;
      font-size: 1rem !important;
      border-radius: 14px !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .hero-trust {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .trust-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: white;
      border: 1px solid $border-color;
      border-radius: $border-radius-full;
      padding: 6px 14px;
      font-size: 0.8rem;
      font-weight: 500;
      color: $text-secondary;
      box-shadow: $shadow-xs;
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: $success; }
    }

    // Hero visual
    .hero-visual {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .visual-wrap {
      position: relative;
      width: 500px;
      height: 500px;
    }
    .pulse-ring {
      position: absolute;
      top: 50%; left: 50%;
      border-radius: 50%;
      border: 1.5px solid rgba($primary, 0.18);
      animation: pulse-ring-anim 3.5s ease-out infinite;
      &.pr-1 { width: 360px; height: 360px; animation-delay: 0s; }
      &.pr-2 { width: 420px; height: 420px; animation-delay: 1s; }
      &.pr-3 { width: 480px; height: 480px; animation-delay: 2s; }
    }
    .med-sphere {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 340px; height: 340px;
      border-radius: 50%;
      background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #d1fae5 100%);
      box-shadow:
        0 32px 80px rgba($primary, 0.18),
        0 0 0 1px rgba($primary, 0.08),
        inset 0 0 100px rgba(139,92,246,0.12);
      overflow: hidden;
    }
    .cell {
      position: absolute;
      border-radius: 50%;
      &.c1 { width: 100px; height: 100px; background: rgba($primary,0.18); top: 5%; left: 10%; animation: float 4s ease-in-out infinite 0s; }
      &.c2 { width: 70px;  height: 70px;  background: rgba(139,92,246,0.18); top: 15%; right: 8%; animation: float 4.5s ease-in-out infinite 0.6s; }
      &.c3 { width: 55px;  height: 55px;  background: rgba($success,0.18); bottom: 18%; left: 6%; animation: float 3.8s ease-in-out infinite 1s; }
      &.c4 { width: 85px;  height: 85px;  background: rgba($secondary,0.15); bottom: 5%; right: 12%; animation: float 5s ease-in-out infinite 0.3s; }
      &.c5 { width: 42px;  height: 42px;  background: rgba($accent,0.2); top: 48%; right: 4%; animation: float 3.6s ease-in-out infinite 1.3s; }
    }
    .sphere-icon {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 84px; height: 84px;
      background: white;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 40px rgba($primary, 0.2);
      z-index: 5;
      mat-icon { font-size: 44px; width: 44px; height: 44px; color: $primary; }
    }

    // Floating cards
    .fc-card {
      position: absolute;
      background: white;
      border-radius: 18px;
      padding: 14px 18px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.11), 0 0 0 1px rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      gap: 12px;
      white-space: nowrap;
      z-index: 10;
      &.fc-doctor { top: 5%; left: -10%; animation: float 4.2s ease-in-out infinite 0s; }
      &.fc-result { bottom: 22%; left: -5%; animation: float 4.5s ease-in-out infinite 1s; }
      &.fc-stat   { top: 14%; right: -8%; animation: float 4s ease-in-out infinite 0.5s; flex-direction: column; text-align: center; padding: 16px 24px; }
      &.fc-home   { bottom: 6%; right: -6%; animation: float 4.8s ease-in-out infinite 1.5s; }
    }
    .fc-avatar {
      width: 42px; height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, $primary-light, #c7e3f8);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem;
    }
    .fc-online {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: $success;
      border: 2px solid white;
      position: absolute;
      top: 12px; right: 12px;
    }
    .fc-icon-wrap {
      width: 34px; height: 34px;
      border-radius: 10px;
      background: $primary-light;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: $primary; }
      &.fc-home-icon { background: rgba($success, 0.1); mat-icon { color: $success; } }
    }
    .fc-title { font-size: 0.8rem; font-weight: 700; color: $text-primary; }
    .fc-sub   { font-size: 0.7rem; color: $text-secondary; }
    .fc-big   { font-size: 1.7rem; font-weight: 800; color: $primary; line-height: 1; }
    .fc-sub-center { font-size: 0.72rem; color: $text-secondary; text-align: center; }
    .fc-badge-good {
      background: rgba($success,0.1); color: $success;
      border-radius: 8px; padding: 3px 8px;
      font-size: 0.68rem; font-weight: 700;
    }

    // ══════════════════════════════════════════════════════════ FEATURES ═════════
    .features-section {
      background: white;
      padding: 0 0 24px;
      position: relative;
      z-index: 1;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: -56px;
    }
    .feature-card {
      background: white;
      border-radius: $border-radius-xl;
      padding: 36px 28px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
      transition: transform $transition-normal, box-shadow $transition-normal;
      &:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
    }
    .feature-icon-wrap {
      width: 56px; height: 56px;
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }
    .feature-title { font-size: 1.1rem; font-weight: 700; color: $text-primary; margin-bottom: 10px; }
    .feature-desc  { font-size: 0.9rem; color: $text-secondary; line-height: 1.6; margin: 0; }

    // ══════════════════════════════════════════════════════════ ABOUT ════════════
    .about-section { background: #f8fafc; }
    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }
    .about-image-wrap { position: relative; }
    .about-art {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      max-width: 420px;
      margin: 0 auto;
    }
    .art-ring {
      position: absolute;
      border-radius: 50%;
      border: 2px dashed rgba($primary, 0.18);
      top: 50%; left: 50%;
      &.art-ring-1 { width: 80%; height: 80%; margin: -40% 0 0 -40%; }
      &.art-ring-2 { width: 100%; height: 100%; margin: -50% 0 0 -50%; }
    }
    .art-core {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 120px; height: 120px;
      background: linear-gradient(135deg, $primary, #4f8ef7);
      border-radius: 32px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 20px 60px rgba($primary, 0.35);
      mat-icon { font-size: 56px; width: 56px; height: 56px; color: white; }
    }
    .art-orb {
      position: absolute;
      border-radius: 50%;
      &.orb-1 { width: 60px; height: 60px; background: linear-gradient(135deg,#dbeafe,#bfdbfe); top: 8%; right: 12%; }
      &.orb-2 { width: 44px; height: 44px; background: linear-gradient(135deg,#ede9fe,#ddd6fe); bottom: 12%; left: 8%; }
      &.orb-3 { width: 32px; height: 32px; background: linear-gradient(135deg,#d1fae5,#a7f3d0); bottom: 24%; right: 4%; }
    }
    .art-badge {
      position: absolute;
      background: white;
      border-radius: 14px;
      padding: 10px 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      display: flex; align-items: center; gap: 8px;
      font-size: 0.8rem; font-weight: 600;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: $primary; }
      &.about-badge-1 { top: 6%; left: -4%; }
      &.about-badge-2 {
        bottom: 8%; right: 0%;
        strong { font-size: 1rem; color: $primary; }
        span { color: $text-secondary; }
        flex-direction: column; align-items: flex-start;
      }
    }

    .about-content {
      padding-left: 16px;
    }
    .about-desc {
      font-size: 1rem;
      color: $text-secondary;
      line-height: 1.75;
      margin-bottom: 28px;
    }
    .about-features {
      list-style: none;
      padding: 0;
      margin: 0 0 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      li {
        display: flex; align-items: center; gap: 10px;
        font-size: 0.95rem; color: $text-primary;
        mat-icon { font-size: 20px; width: 20px; height: 20px; color: $success; flex-shrink: 0; }
      }
    }
    .about-cta {
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
      border-radius: 12px !important;
      padding: 12px 24px !important;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    // ══════════════════════════════════════════════════════ SERVICES ══════════
    .services-section { background: white; }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .service-card {
      background: white;
      border: 1.5px solid $border-color;
      border-radius: $border-radius-xl;
      padding: 28px 24px;
      cursor: pointer;
      transition: transform $transition-normal, box-shadow $transition-normal, border-color $transition-normal;
      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        border-color: transparent;
      }
    }
    .service-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
      mat-icon { font-size: 26px; width: 26px; height: 26px; }
    }
    .service-title { font-size: 1rem; font-weight: 700; color: $text-primary; margin-bottom: 8px; }
    .service-desc  { font-size: 0.875rem; color: $text-secondary; line-height: 1.6; margin: 0 0 16px; }
    .service-learn {
      display: flex; align-items: center; gap: 4px;
      color: $primary; font-size: 0.875rem; font-weight: 600;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    // ══════════════════════════════════════════════════════ PACKAGES ═════════
    .packages-section { background: #f0f7ff; }
    .packages-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .pkg-card {
      background: white;
      border-radius: $border-radius-xl;
      overflow: hidden;
      box-shadow: $shadow-md;
      position: relative;
      transition: transform $transition-normal, box-shadow $transition-normal;
      &:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
    }
    .pkg-badge {
      position: absolute;
      top: 0; right: 20px;
      background: $accent;
      color: white;
      padding: 5px 14px;
      border-radius: 0 0 12px 12px;
      font-size: 0.75rem;
      font-weight: 700;
      z-index: 2;
    }
    .pkg-header {
      height: 120px;
      display: flex; align-items: center; justify-content: center;
    }
    .pkg-hero-icon {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
      color: white;
      opacity: 0.9;
    }
    .pkg-body { padding: 20px 24px 24px; }
    .pkg-name  { font-size: 1.05rem; font-weight: 700; color: $text-primary; margin-bottom: 6px; }
    .pkg-tests { font-size: 0.875rem; color: $text-secondary; margin-bottom: 8px; }
    .pkg-savings {
      display: inline-block;
      background: rgba($success, 0.1);
      color: $success;
      border-radius: 8px;
      padding: 3px 10px;
      font-size: 0.78rem;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .pkg-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 16px; }
    .pkg-original { text-decoration: line-through; color: $text-disabled; font-size: 0.875rem; }
    .pkg-price    { font-size: 1.5rem; font-weight: 800; color: $primary; }
    .pkg-cta { width: 100% !important; border-radius: 12px !important; }

    // Skeleton
    .skeleton-card {
      pointer-events: none;
      .sk-header { height: 120px; background: $gray-200; }
      .sk-line {
        height: 14px; background: $gray-200; border-radius: 6px;
        margin-bottom: 10px;
        animation: shimmer 1.5s infinite linear;
        background: linear-gradient(90deg,$gray-200 25%,$gray-100 50%,$gray-200 75%);
        background-size: 400px 100%;
        &.sk-w70 { width: 70%; }
        &.sk-w50 { width: 50%; }
      }
      .sk-price-line { height: 36px; background: $gray-200; border-radius: 10px; margin-top: 14px; }
    }

    // ══════════════════════════════════════════════════ HEALTH TRACKER ════════
    .tracker-section {
      background: #0f172a;
      position: relative;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        top: -200px; right: -200px;
        width: 600px; height: 600px;
        background: radial-gradient(circle, rgba($primary, 0.12), transparent 60%);
        border-radius: 50%;
        pointer-events: none;
      }
    }
    .tracker-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 72px;
      align-items: center;
      position: relative;
      z-index: 1;
    }
    .tracker-visual { display: flex; flex-direction: column; gap: 16px; }

    .chart-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 22px;
    }
    .chart-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
    .chart-label { font-weight: 700; color: white; font-size: 0.95rem; }
    .chart-unit  { font-size: 0.75rem; color: rgba(255,255,255,0.45); margin-top: 2px; }
    .trend-badge {
      display: flex; align-items: center; gap: 4px;
      border-radius: 8px; padding: 4px 10px;
      font-size: 0.78rem; font-weight: 700;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &.trend-up { background: rgba($success,0.18); color: #4ade80; }
    }
    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 80px;
    }
    .bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      height: 100%;
      justify-content: flex-end;
    }
    .bar-fill {
      width: 100%;
      border-radius: 6px 6px 0 0;
      background: rgba($primary, 0.35);
      min-height: 4px;
      transition: height $transition-normal;
      &.bar-active { background: $primary; box-shadow: 0 0 16px rgba($primary, 0.5); }
    }
    .bar-month { font-size: 0.65rem; color: rgba(255,255,255,0.4); }

    .score-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 20px 22px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .score-ring-wrap {
      position: relative;
      width: 72px; height: 72px;
      flex-shrink: 0;
      svg { width: 72px; height: 72px; }
    }
    .score-num {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.2rem;
      font-weight: 800;
      color: white;
    }
    .score-label  { font-weight: 700; color: white; font-size: 0.9rem; }
    .score-status { font-size: 0.78rem; color: #4ade80; margin-top: 2px; }

    .metrics-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 16px 22px;
    }
    .metric-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      &:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.06); }
    }
    .metric-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      &.dot-good { background: #4ade80; }
      &.dot-warn { background: #fbbf24; }
    }
    .metric-label { font-size: 0.82rem; color: rgba(255,255,255,0.65); flex: 1; }
    .metric-value { font-size: 0.85rem; font-weight: 700; color: white; }
    .metric-trend {
      font-size: 0.75rem; font-weight: 600; min-width: 50px; text-align: right;
      &.trend-pos { color: #4ade80; }
      &.trend-neg { color: #fbbf24; }
    }

    // Tracker content
    .tracker-desc {
      color: rgba(255,255,255,0.65);
      font-size: 1rem;
      line-height: 1.75;
      margin-bottom: 28px;
    }
    .tracker-benefits {
      list-style: none; padding: 0; margin: 0 0 36px;
      display: flex; flex-direction: column; gap: 14px;
      li {
        display: flex; align-items: center; gap: 12px;
        font-size: 0.95rem; color: rgba(255,255,255,0.8);
      }
    }
    .benefit-check {
      width: 28px; height: 28px;
      border-radius: 8px;
      background: rgba($primary, 0.25);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #60a5fa; }
    }
    .tracker-cta {
      background: $primary !important;
      color: white !important;
      border-radius: 14px !important;
      padding: 14px 28px !important;
      font-size: 1rem !important;
      font-weight: 600 !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
      box-shadow: 0 6px 24px rgba($primary, 0.4) !important;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    // ══════════════════════════════════════════════════════ PROGRAMS ════════
    .programs-section { background: white; }
    .programs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .program-banner {
      border-radius: $border-radius-xl;
      padding: 32px 28px;
      display: flex;
      align-items: flex-start;
      gap: 20px;
      cursor: pointer;
      transition: transform $transition-normal, box-shadow $transition-normal;
      &:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    }
    .program-icon-wrap {
      width: 56px; height: 56px;
      border-radius: 16px;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    }
    .program-title { font-size: 1.1rem; font-weight: 700; color: white; margin-bottom: 8px; }
    .program-desc  { font-size: 0.875rem; color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 16px; }
    .program-link {
      display: inline-flex; align-items: center; gap: 4px;
      color: white; font-size: 0.875rem; font-weight: 600;
      text-decoration: none;
      opacity: 0.9;
      &:hover { opacity: 1; }
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    // ══════════════════════════════════════════════ HOME COLLECTION ══════════
    .collection-section { background: #f0fdfa; }
    .collection-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 72px;
      align-items: center;
    }
    .collection-art-card {
      background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%);
      border-radius: 32px;
      height: 360px;
      position: relative;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 24px 80px rgba(13,148,136,0.3);
    }
    .collection-house-icon {
      mat-icon {
        font-size: 96px; width: 96px; height: 96px;
        color: rgba(255,255,255,0.35);
      }
    }
    .collection-orbs {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
    }
    .c-orb {
      position: absolute;
      width: 52px; height: 52px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      animation: float 4s ease-in-out infinite;
      &.c-orb-1 { top: 14%; left: 14%; animation-delay: 0s; }
      &.c-orb-2 { top: 20%; right: 14%; animation-delay: 1s; }
      &.c-orb-3 { bottom: 18%; left: 20%; animation-delay: 0.5s; }
    }
    .collection-info-badge {
      position: absolute;
      bottom: 24px; right: 24px;
      background: white;
      border-radius: 14px;
      padding: 12px 16px;
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      mat-icon { color: $primary; font-size: 20px; width: 20px; height: 20px; }
      strong { display: block; font-size: 0.85rem; color: $text-primary; }
      span   { display: block; font-size: 0.72rem; color: $text-secondary; }
    }

    .collection-desc {
      font-size: 1rem; color: $text-secondary; line-height: 1.75; margin-bottom: 32px;
    }
    .steps-flow {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 36px;
    }
    .step-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .step-num {
      width: 28px; height: 28px;
      background: $primary;
      color: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700;
    }
    .step-info { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .step-icon-wrap {
      width: 48px; height: 48px;
      border-radius: 14px;
      background: white;
      box-shadow: $shadow-md;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; width: 22px; height: 22px; color: $primary; }
    }
    .step-label { font-size: 0.72rem; font-weight: 600; color: $text-secondary; text-align: center; max-width: 64px; }
    .step-arrow { mat-icon { font-size: 18px; width: 18px; height: 18px; color: $text-disabled; } }
    .collection-cta {
      display: inline-flex !important; align-items: center !important; gap: 6px !important;
      border-radius: 12px !important; padding: 12px 24px !important;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    // ══════════════════════════════════════════════════════════ STATS ════════
    .stats-section {
      background: linear-gradient(135deg, #1e3a5f 0%, #1a73e8 50%, #0f2d54 100%);
      position: relative;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 60%);
      }
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      position: relative;
      z-index: 1;
    }
    .stat-card {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: $border-radius-xl;
      padding: 32px 24px;
      text-align: center;
      transition: transform $transition-normal, background $transition-normal;
      backdrop-filter: blur(8px);
      &:hover { transform: translateY(-4px); background: rgba(255,255,255,0.13); }
    }
    .stat-icon-wrap {
      width: 56px; height: 56px;
      border-radius: 16px;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    }
    .stat-num {
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      line-height: 1;
      margin-bottom: 8px;
    }
    .stat-label { font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.9); margin-bottom: 6px; }
    .stat-sub   { font-size: 0.8rem; color: rgba(255,255,255,0.55); }

    // ══════════════════════════════════════════════════ TESTIMONIALS ════════
    .testimonials-section { background: white; }
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .testimonial-card {
      background: $gray-50;
      border: 1.5px solid $border-color;
      border-radius: $border-radius-xl;
      padding: 28px 24px;
      transition: transform $transition-normal, box-shadow $transition-normal;
      &:hover { transform: translateY(-4px); box-shadow: $shadow-lg; background: white; }
    }
    .stars { display: flex; gap: 2px; margin-bottom: 14px; }
    .star-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; color: $accent; }
    .review-text {
      font-size: 0.92rem;
      color: $text-secondary;
      line-height: 1.7;
      margin-bottom: 20px;
      font-style: italic;
    }
    .reviewer-row { display: flex; align-items: center; gap: 12px; }
    .reviewer-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 700; color: white;
      flex-shrink: 0;
    }
    .reviewer-name { font-size: 0.9rem; font-weight: 700; color: $text-primary; }
    .reviewer-role { font-size: 0.78rem; color: $text-secondary; }

    // ══════════════════════════════════════════════════════════ FAQ ═════════
    .faq-section { background: #f8fafc; }
    .faq-container { max-width: 780px; }
    .faq-list { display: flex; flex-direction: column; gap: 12px; }
    .faq-item {
      background: white;
      border: 1.5px solid $border-color;
      border-radius: 16px;
      overflow: hidden;
      transition: border-color $transition-fast;
      &.faq-open { border-color: rgba($primary, 0.3); }
    }
    .faq-question {
      width: 100%;
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1rem; font-weight: 600; color: $text-primary;
      text-align: left;
      gap: 16px;
      mat-icon { color: $text-secondary; transition: transform $transition-normal; flex-shrink: 0; }
    }
    .faq-open .faq-question mat-icon { transform: rotate(180deg); color: $primary; }
    .faq-body {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.35s ease;
    }
    .faq-open .faq-body { grid-template-rows: 1fr; }
    .faq-body-inner {
      overflow: hidden;
      p { padding: 0 24px 20px; color: $text-secondary; line-height: 1.75; margin: 0; font-size: 0.95rem; }
    }

    // ══════════════════════════════════════════════════ MOBILE APP ══════════
    .app-section {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a8a 80%, #0f172a 100%);
    }
    .app-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 72px;
      align-items: center;
    }
    .app-desc {
      color: rgba(255,255,255,0.65);
      font-size: 1rem; line-height: 1.75;
      margin-bottom: 28px;
    }
    .app-features {
      list-style: none; padding: 0; margin: 0 0 36px;
      display: flex; flex-direction: column; gap: 12px;
      li {
        display: flex; align-items: center; gap: 10px;
        font-size: 0.95rem; color: rgba(255,255,255,0.8);
        mat-icon { font-size: 18px; width: 18px; height: 18px; color: #818cf8; }
      }
    }
    .store-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
    .store-btn {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 14px;
      padding: 12px 20px;
      cursor: pointer;
      transition: background $transition-fast, transform $transition-fast;
      &:hover { background: rgba(255,255,255,0.17); transform: translateY(-2px); }
    }
    .store-line1 { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.6); }
    .store-line2 { display: block; font-size: 0.95rem; font-weight: 700; color: white; }

    // Phone mockup
    .app-mockup { display: flex; justify-content: center; position: relative; }
    .phone-outer {
      width: 220px;
      background: #1e293b;
      border-radius: 40px;
      padding: 14px;
      border: 8px solid #0f172a;
      box-shadow: 0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
      position: relative;
      z-index: 2;
    }
    .phone-notch {
      position: absolute;
      top: 18px; left: 50%;
      transform: translateX(-50%);
      width: 64px; height: 18px;
      background: #0f172a;
      border-radius: 0 0 14px 14px;
      z-index: 3;
    }
    .phone-screen {
      background: linear-gradient(160deg, #1a73e8 0%, #0f2d54 100%);
      border-radius: 28px;
      height: 380px;
      overflow: hidden;
      position: relative;
    }
    .phone-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 36px 16px 12px;
      .phone-app-name { font-size: 0.85rem; font-weight: 700; color: white; }
      .phone-notif-icon { font-size: 20px; width: 20px; height: 20px; color: rgba(255,255,255,0.7); }
    }
    .phone-score-area {
      position: relative;
      width: 80px; height: 80px;
      margin: 8px auto 4px;
      .phone-ring-svg { width: 80px; height: 80px; }
    }
    .phone-score-num {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.2rem; font-weight: 800; color: white;
    }
    .phone-score-label {
      text-align: center;
      font-size: 0.65rem;
      color: rgba(255,255,255,0.6);
      margin-bottom: 12px;
    }
    .phone-metrics {
      background: rgba(255,255,255,0.08);
      border-radius: 14px;
      margin: 0 12px;
      padding: 8px 12px;
    }
    .pm-row {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 0;
      &:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.07); }
      span { font-size: 0.7rem; color: rgba(255,255,255,0.6); flex: 1; }
      strong { font-size: 0.72rem; color: white; font-weight: 700; }
    }
    .pm-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .pm-green { background: #4ade80; }
    .pm-blue  { background: #60a5fa; }
    .pm-amber { background: #fbbf24; }
    .phone-bottom-nav {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      display: flex; justify-content: space-around;
      background: rgba(0,0,0,0.3);
      padding: 10px 0 12px;
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: rgba(255,255,255,0.5); }
      mat-icon:first-child { color: white; }
    }
    .phone-glow {
      position: absolute;
      top: 20%; left: 50%;
      transform: translateX(-50%);
      width: 300px; height: 400px;
      background: radial-gradient(ellipse, rgba($primary, 0.25), transparent 60%);
      filter: blur(40px);
      pointer-events: none;
    }

    // ══════════════════════════════════════════════════════ RESPONSIVE ═══════
    @media (max-width: 1200px) {
      .visual-wrap { width: 420px; height: 420px; }
      .med-sphere  { width: 280px; height: 280px; }
    }
    @media (max-width: $breakpoint-lg) {
      .hero-grid      { grid-template-columns: 1fr; }
      .hero-visual    { display: none; }
      .hero-headline  { font-size: 2.5rem; }
      .features-grid  { grid-template-columns: 1fr; margin-top: 32px; }
      .about-grid     { grid-template-columns: 1fr; }
      .about-image-wrap { display: none; }
      .services-grid  { grid-template-columns: repeat(2, 1fr); }
      .packages-grid  { grid-template-columns: repeat(2, 1fr); }
      .tracker-grid   { grid-template-columns: 1fr; }
      .programs-grid  { grid-template-columns: 1fr; }
      .collection-grid { grid-template-columns: 1fr; }
      .collection-art  { display: none; }
      .stats-grid     { grid-template-columns: repeat(2, 1fr); }
      .testimonials-grid { grid-template-columns: 1fr; }
      .app-grid       { grid-template-columns: 1fr; }
      .app-mockup     { display: none; }
    }
    @media (max-width: $breakpoint-md) {
      .hero-section   { padding: 56px 0 72px; }
      .hero-headline  { font-size: 2rem; }
      .hero-ctas      { flex-direction: column; }
      .cta-primary, .cta-secondary { width: 100%; justify-content: center; }
      .features-grid  { grid-template-columns: 1fr; }
      .services-grid  { grid-template-columns: 1fr; }
      .packages-grid  { grid-template-columns: 1fr; }
      .programs-grid  { grid-template-columns: 1fr; }
      .stats-grid     { grid-template-columns: 1fr; }
      .steps-flow     { gap: 4px; }
      .step-arrow     { display: none; }
    }
  `],
})
export class HomeComponent implements OnInit {
  private packageApi = inject(PackageApiService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  packages = signal<HealthPackage[]>([]);

  trustItems = [
    { icon: 'verified', label: 'Certified Laboratory' },
    { icon: 'speed', label: 'Fast Turnaround' },
    { icon: 'description', label: 'Digital Reports' },
    { icon: 'location_on', label: 'Multi-Branch Network' },
  ];

  featureCards = [
    { icon: 'groups', title: 'Professional Medical Team', desc: 'Board-certified pathologists and specialists review every result for accuracy.', color: '#1a73e8', bg: '#e8f0fe' },
    { icon: 'biotech', title: 'Highly Accurate Results', desc: 'State-of-the-art analyzers with 99.9% precision, calibrated to international standards.', color: '#0d9488', bg: '#f0fdfa' },
    { icon: 'insights', title: 'Personalized Health Insights', desc: 'AI-powered analysis translates your results into actionable health guidance.', color: '#7c3aed', bg: '#ede9fe' },
  ];

  aboutFeatures = [
    'Accredited by the Saudi Food & Drug Authority (SFDA)',
    'ISO 15189 international quality certification',
    '24-hour digital result delivery via secure portal',
    'Dedicated patient support team available 7 days',
    'Home sample collection across all major cities',
  ];

  services = [
    { icon: 'water_drop', title: 'Blood Tests', desc: 'Complete blood count, blood chemistry, and specialized hematology panels.', color: '#dc2626', bg: '#fef2f2' },
    { icon: 'science', title: 'Hormone Tests', desc: 'Thyroid, reproductive, adrenal, and growth hormone profiling.', color: '#7c3aed', bg: '#ede9fe' },
    { icon: 'analytics', title: 'Diabetes Monitoring', desc: 'HbA1c, fasting glucose, insulin resistance, and diabetic risk panels.', color: '#0284c7', bg: '#e0f2fe' },
    { icon: 'medication', title: 'Vitamin Screening', desc: 'Vitamin D, B12, folate, and micronutrient deficiency assessment.', color: '#d97706', bg: '#fffbeb' },
    { icon: 'favorite', title: 'Cardiac Diagnostics', desc: 'Lipid profiles, troponin, BNP, and advanced cardiovascular risk markers.', color: '#e11d48', bg: '#fff1f2' },
    { icon: 'spa', title: 'Wellness Packages', desc: 'Comprehensive annual checkup bundles tailored to your age and lifestyle.', color: '#059669', bg: '#ecfdf5' },
  ];

  packageGradients = [
    'linear-gradient(135deg, #1a73e8, #4f8ef7)',
    'linear-gradient(135deg, #0d9488, #14b8a6)',
    'linear-gradient(135deg, #7c3aed, #a78bfa)',
    'linear-gradient(135deg, #d97706, #fbbf24)',
  ];

  vitaminTrend = [
    { month: 'Jan', pct: 32, active: false },
    { month: 'Feb', pct: 45, active: false },
    { month: 'Mar', pct: 38, active: false },
    { month: 'Apr', pct: 55, active: false },
    { month: 'May', pct: 62, active: false },
    { month: 'Jun', pct: 75, active: true },
  ];

  trackerMetrics = [
    { label: 'Vitamin D', unit: 'nmol/L', value: '52', status: 'warning' as const, trend: '+12%' },
    { label: 'HbA1c', unit: '%', value: '5.4', status: 'good' as const, trend: '-0.2%' },
    { label: 'Cholesterol', unit: 'mmol/L', value: '4.8', status: 'good' as const, trend: 'Stable' },
    { label: 'Thyroid (TSH)', unit: 'mIU/L', value: '2.1', status: 'good' as const, trend: 'Stable' },
  ];

  trackerBenefits = [
    'Track 40+ biomarkers over time with trend analysis',
    'Receive intelligent alerts when values change',
    'Share reports securely with your physician',
    'Set personal health goals and monitor progress',
  ];

  programs = [
    { icon: 'monitor_weight', title: 'Weight Management Program', desc: 'Metabolic panel, hormones, and nutrition markers to support your weight journey.', gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)', route: '/health-programs' },
    { icon: 'analytics', title: 'Diabetes Management Program', desc: 'Quarterly HbA1c, lipids, kidney function, and diabetic complication screening.', gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', route: '/health-programs' },
    { icon: 'favorite', title: 'Heart Health Program', desc: 'Complete cardiovascular risk profiling including advanced lipid and inflammatory markers.', gradient: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)', route: '/health-programs' },
    { icon: 'spa', title: "Women's Wellness Program", desc: "Hormonal balance, thyroid, iron, bone health — a complete panel designed for women.", gradient: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)', route: '/health-programs' },
  ];

  collectionSteps = [
    { num: 1, icon: 'list_alt', label: 'Select Tests' },
    { num: 2, icon: 'schedule', label: 'Choose Time' },
    { num: 3, icon: 'home', label: 'Collection' },
    { num: 4, icon: 'description', label: 'Get Results' },
  ];

  stats = [
    { icon: 'groups', value: 50, suffix: '+', label: 'Specialists', sub: 'Board-certified pathologists & doctors' },
    { icon: 'biotech', value: 100, suffix: '+', label: 'Lab Tests', sub: 'Covering all major diagnostic categories' },
    { icon: 'schedule', value: 24, suffix: 'h', label: 'Reporting', sub: 'Average result turnaround time' },
    { icon: 'location_on', value: 15, suffix: '+', label: 'Branches', sub: 'Across major cities and districts' },
  ];

  testimonials = [
    { name: 'Sarah Al-Mane', role: 'Riyadh', initials: 'SA', color: '#1a73e8', text: 'The home collection service is incredibly convenient. Results were ready in under 6 hours and the digital report was very detailed. Highly recommend.' },
    { name: 'Mohammed Khalid', role: 'Jeddah', initials: 'MK', color: '#0d9488', text: 'After visiting 3 labs, Capital Lab is by far the most professional. The staff are knowledgeable and the online portal makes accessing results effortless.' },
    { name: 'Nora Al-Rashidi', role: 'Dammam', initials: 'NR', color: '#7c3aed', text: 'The Diabetes Management Program changed how I monitor my health. My doctor loves the detailed trend reports. Worth every riyal.' },
  ];

  faqItems = [
    { question: 'How do I book an appointment?', answer: 'You can book online through our website or mobile app in under 2 minutes. Simply select your tests or package, choose a branch or home collection, pick your preferred time slot, and confirm. You will receive an instant confirmation via SMS and email.' },
    { question: 'How quickly are results available?', answer: 'Most routine tests are ready within 6–24 hours. Specialized tests may take 2–3 business days. You will receive a notification as soon as your results are ready. Urgent results are flagged and communicated immediately.' },
    { question: 'Can I request home sample collection?', answer: 'Yes. Home collection is available 7 days a week from 7 AM to 9 PM. Our certified phlebotomists serve all major residential areas. Simply select home collection when booking and enter your address.' },
    { question: 'How do I access my reports?', answer: 'Reports are accessible through your secure patient portal on our website or mobile app. You can download, share, or print your results at any time. Reports include trend comparisons from previous tests.' },
    { question: 'Do you accept insurance?', answer: 'We accept all major Saudi insurance providers including Bupa, Tawuniya, Medgulf, AXA, and over 30 others. Simply present your insurance card at the branch or enter your insurance details when booking online.' },
  ];

  faqOpen = signal<boolean[]>(new Array(5).fill(false));

  appFeatures = [
    'Instant results with detailed reference ranges',
    'Book appointments in 60 seconds',
    'Family member profiles under one account',
    'Health tracker with trend analytics',
  ];

  toggleFaq(i: number): void {
    const arr = [...this.faqOpen()];
    arr[i] = !arr[i];
    this.faqOpen.set(arr);
  }

  constructor() {
    afterNextRender(() => {
      this.setupScrollReveal();
      this.setupCounterAnimation();
    });
  }

  ngOnInit(): void {
    this.packageApi.getPopular(3).subscribe({
      next: res => this.packages.set(res.data ?? []),
      error: () => this.packages.set([]),
    });
  }

  private setupScrollReveal(): void {
    const selectors = ['.reveal', '.reveal-left', '.reveal-right'];
    const elements = document.querySelectorAll(selectors.join(','));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    elements.forEach(el => observer.observe(el));
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private setupCounterAnimation(): void {
    const statNums = document.querySelectorAll('.stat-num[data-count]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset['count'] ?? '0');
            const suffix = el.dataset['suffix'] ?? '';
            this.animateCounter(el, target, suffix);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNums.forEach(el => observer.observe(el));
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private animateCounter(el: HTMLElement, target: number, suffix: string): void {
    const duration = 1800;
    const start = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOut(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}
