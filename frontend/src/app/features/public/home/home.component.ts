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

  <!-- Ambient bg blobs -->
  <div class="hbg hbg-1"></div>
  <div class="hbg hbg-2"></div>

  <!-- ── LEFT 40% ─────────────────────────────────────────── -->
  <div class="hero-left">

    <div class="hero-eyebrow">
      <span class="ew-pulse"></span>
      Advanced Diagnostics
    </div>

    <h1 class="hero-h1">
      Precision<br>
      Diagnostics for<br>
      a <span class="h1-hl">Healthier</span><br>
      Tomorrow
    </h1>

    <p class="hero-p">
      Capital Lab provides advanced laboratory testing, personalized health
      insights, digital reports, and home collection services designed around
      patient convenience and accuracy.
    </p>

    <div class="hero-actions">
      <a routerLink="/login" class="hbtn hbtn-dark">
        <mat-icon>calendar_today</mat-icon>
        Book Appointment
      </a>
      <a routerLink="/patient/results" class="hbtn hbtn-ghost">
        <mat-icon>description</mat-icon>
        View Test Results
      </a>
    </div>

    <div class="trust-grid">
      @for (t of trustFeatures; track t.title) {
        <div class="trust-item">
          <div class="ti-icon"><mat-icon>{{ t.icon }}</mat-icon></div>
          <div>
            <div class="ti-title">{{ t.title }}</div>
            <div class="ti-sub">{{ t.sub }}</div>
          </div>
        </div>
      }
    </div>

  </div>

  <!-- ── RIGHT 60% ─────────────────────────────────────────── -->
  <div class="hero-right">

    <!-- Dot grid texture -->
    <div class="hr-dots"></div>

    <!-- Lab visualization centerpiece -->
    <div class="lab-center">
      <div class="lp lp1"></div>
      <div class="lp lp2"></div>
      <div class="lp lp3"></div>

      <svg class="lab-lines" viewBox="0 0 560 560" fill="none">
        <line x1="280" y1="280" x2="100" y2="130" stroke="rgba(26,115,232,0.1)" stroke-width="1.5" stroke-dasharray="5 4"/>
        <line x1="280" y1="280" x2="460" y2="130" stroke="rgba(26,115,232,0.1)" stroke-width="1.5" stroke-dasharray="5 4"/>
        <line x1="280" y1="280" x2="70"  y2="400" stroke="rgba(13,148,136,0.1)" stroke-width="1.5" stroke-dasharray="5 4"/>
        <line x1="280" y1="280" x2="490" y2="400" stroke="rgba(13,148,136,0.1)" stroke-width="1.5" stroke-dasharray="5 4"/>
        <circle cx="280" cy="280" r="120" stroke="rgba(26,115,232,0.06)" stroke-width="1"/>
        <circle cx="280" cy="280" r="192" stroke="rgba(26,115,232,0.04)" stroke-width="1"/>
      </svg>

      <!-- Central orb -->
      <div class="lab-orb">
        <mat-icon class="orb-icon">biotech</mat-icon>
        <div class="orb-ring or1"></div>
      </div>

      <!-- Satellite nodes -->
      <div class="snode sn1"><mat-icon>science</mat-icon></div>
      <div class="snode sn2"><mat-icon>water_drop</mat-icon></div>
      <div class="snode sn3"><mat-icon>analytics</mat-icon></div>
      <div class="snode sn4"><mat-icon>favorite</mat-icon></div>

      <!-- Molecule dots -->
      <div class="mdot md1"></div>
      <div class="mdot md2"></div>
      <div class="mdot md3"></div>
      <div class="mdot md4"></div>
    </div>

    <!-- FLOATING CARD — Happy Patients (top-right) -->
    <div class="hfc hfc-patients">
      <div class="hfc-icon hfc-blue"><mat-icon>groups</mat-icon></div>
      <div class="hfc-body">
        <div class="hfc-label">Happy Patients</div>
        <div class="hfc-val">100,000+</div>
      </div>
      <div class="hfc-tag hfc-tag-green">
        <mat-icon>trending_up</mat-icon>+12%
      </div>
    </div>

    <!-- FLOATING CARD — Health Status (mid-left) -->
    <div class="hfc hfc-status">
      <div class="hfc-cert">
        <mat-icon>verified</mat-icon>
        <span>ISO 15189 Certified</span>
      </div>
      <div class="hfc-ring-row">
        <div class="hfc-ring">
          <svg viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="#e2e8f0" stroke-width="4"/>
            <circle cx="30" cy="30" r="24" fill="none" stroke="#1a73e8" stroke-width="4"
              stroke-dasharray="150.8" stroke-dashoffset="19.6"
              stroke-linecap="round" transform="rotate(-90 30 30)"/>
          </svg>
          <span class="hfc-ring-num">99%</span>
        </div>
        <div>
          <div class="hfc-ring-label">Accuracy Rate</div>
          <div class="hfc-ring-sub">Globally Certified</div>
        </div>
      </div>
    </div>

    <!-- FLOATING CARD — 24/7 Support (bottom-right) -->
    <div class="hfc hfc-support">
      <div class="hfc-icon hfc-green"><mat-icon>support_agent</mat-icon></div>
      <div class="hfc-body">
        <div class="hfc-label">24/7 Support</div>
        <div class="hfc-val">Always Available</div>
      </div>
      <span class="live-dot"></span>
    </div>

    <!-- Vertical social strip (far right) -->
    <div class="hero-socials">
      <a class="hs-btn" href="#" aria-label="Twitter">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a class="hs-btn" href="#" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </a>
      <a class="hs-btn" href="#" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </div>

  </div>
</section>

<!-- ══════════════════════════════════════════ HERO STATS BAR ══ -->
<div class="hero-stats-bar">
  <div class="container hsb-grid">
    @for (s of heroStats; track s.label; let i = $index) {
      <div class="hsb-card reveal" [style.transition-delay]="(i * 0.09) + 's'">
        <div class="hsb-icon" [style.background]="s.bg">
          <mat-icon [style.color]="s.color">{{ s.icon }}</mat-icon>
        </div>
        <div class="hsb-num" [attr.data-count]="s.value" [attr.data-suffix]="s.suffix">
          {{ s.value }}{{ s.suffix }}
        </div>
        <div class="hsb-label">{{ s.label }}</div>
        <div class="hsb-sub">{{ s.sub }}</div>
      </div>
    }
  </div>
</div>

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
    @keyframes fadeInL { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:translateX(0); } }
    @keyframes fadeInR { from { opacity:0; transform:translateX(28px);  } to { opacity:1; transform:translateX(0); } }
    @keyframes ewpulse { 0%,100% { box-shadow: 0 0 0 3px rgba(26,115,232,0.2); } 50% { box-shadow: 0 0 0 7px rgba(26,115,232,0.04); } }
    @keyframes livePulse { 0%,100% { box-shadow: 0 0 0 3px rgba(22,163,74,0.22); } 50% { box-shadow: 0 0 0 7px rgba(22,163,74,0.04); } }
    @keyframes lpulse { 0% { opacity:0.7; transform:translate(-50%,-50%) scale(0.88); } 100% { opacity:0; transform:translate(-50%,-50%) scale(1.08); } }

    .hero-section {
      position: relative;
      display: grid;
      grid-template-columns: 42% 58%;
      min-height: calc(100vh - 92px);
      overflow: hidden;
      background: white;
    }

    .hbg {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(70px);
      &.hbg-1 { width:600px; height:600px; background:radial-gradient(circle,rgba(26,115,232,0.07),transparent 65%); top:-150px; left:-100px; }
      &.hbg-2 { width:450px; height:450px; background:radial-gradient(circle,rgba(13,148,136,0.07),transparent 65%); bottom:-120px; left:35%; }
    }

    // Left column
    .hero-left {
      display: flex; flex-direction: column; justify-content: center;
      padding: 80px 52px 80px max(calc((100vw - 1400px)/2 + 40px), 28px);
      position: relative; z-index: 2;
      animation: fadeInL 0.75s ease both;
    }

    .hero-eyebrow {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.72rem; font-weight: 700; letter-spacing: 2.5px;
      text-transform: uppercase; color: #1a73e8; margin-bottom: 22px;
    }
    .ew-pulse {
      width: 8px; height: 8px;
      background: #1a73e8; border-radius: 50%;
      animation: ewpulse 2s ease-in-out infinite;
    }

    .hero-h1 {
      font-size: clamp(2.6rem, 3.8vw, 4rem);
      font-weight: 800; line-height: 1.1;
      letter-spacing: -2px; color: #0f172a;
      margin-bottom: 22px;
    }
    .h1-hl {
      background: linear-gradient(135deg, #1a73e8 0%, #06b6d4 55%, #0d9488 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .hero-p {
      font-size: 1.05rem; color: #64748b;
      line-height: 1.75; margin-bottom: 36px; max-width: 430px;
    }

    .hero-actions { display: flex; gap: 12px; margin-bottom: 44px; flex-wrap: wrap; }
    .hbtn {
      display: inline-flex; align-items: center; gap: 8px;
      border-radius: 14px; padding: 13px 26px;
      font-size: 0.93rem; font-weight: 600;
      text-decoration: none; border: none; cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
      &.hbtn-dark {
        background: #0f172a; color: white;
        box-shadow: 0 4px 16px rgba(15,23,42,0.18);
        &:hover { background:#1e293b; transform:translateY(-2px); box-shadow:0 8px 24px rgba(15,23,42,0.24); }
      }
      &.hbtn-ghost {
        background: white; color: #0f172a;
        border: 1.5px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        &:hover { border-color:#94a3b8; transform:translateY(-2px); box-shadow:0 4px 14px rgba(0,0,0,0.1); }
      }
    }

    .trust-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
    }
    .trust-item { display: flex; align-items: flex-start; gap: 12px; }
    .ti-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(26,115,232,0.08);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #1a73e8; }
    }
    .ti-title { font-size: 0.84rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .ti-sub   { font-size: 0.74rem; color: #94a3b8; }

    // Right column
    .hero-right {
      position: relative; overflow: hidden;
      background: linear-gradient(155deg, #f0f7ff 0%, #e8f3fb 40%, #f0fdf8 100%);
      display: flex; align-items: center; justify-content: center;
      animation: fadeInR 0.75s 0.15s ease both;
    }

    .hr-dots {
      position: absolute; inset: 0; pointer-events: none;
      background-image: radial-gradient(rgba(26,115,232,0.07) 1px, transparent 1px);
      background-size: 26px 26px;
    }

    // Lab centerpiece
    .lab-center {
      position: relative;
      width: 500px; height: 500px;
      display: flex; align-items: center; justify-content: center;
    }
    .lp {
      position: absolute; top: 50%; left: 50%;
      border-radius: 50%;
      border: 1.5px solid rgba(26,115,232,0.13);
      animation: lpulse 3.5s ease-out infinite;
      &.lp1 { width:240px; height:240px; margin:-120px 0 0 -120px; animation-delay:0s; }
      &.lp2 { width:340px; height:340px; margin:-170px 0 0 -170px; animation-delay:1.2s; }
      &.lp3 { width:440px; height:440px; margin:-220px 0 0 -220px; animation-delay:2.4s; }
    }
    .lab-lines { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:1; }
    .lab-orb {
      width: 190px; height: 190px; border-radius: 50%;
      background: linear-gradient(145deg, #ffffff 0%, #f0f7ff 50%, #e6f2fe 100%);
      box-shadow: 0 32px 80px rgba(26,115,232,0.14), 0 0 0 1.5px rgba(26,115,232,0.1), inset 0 0 50px rgba(26,115,232,0.05);
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 4;
      animation: float 5s ease-in-out infinite;
    }
    .orb-icon { font-size:76px !important; width:76px !important; height:76px !important; color:#1a73e8; opacity:0.75; }
    .orb-ring {
      position:absolute; border-radius:50%;
      border: 1px solid rgba(26,115,232,0.18);
      &.or1 { width:230px; height:230px; }
    }

    .snode {
      position: absolute; width: 50px; height: 50px;
      border-radius: 15px; background: white;
      box-shadow: 0 6px 28px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
      display: flex; align-items: center; justify-content: center; z-index: 3;
      animation: float 4s ease-in-out infinite;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
      &.sn1 { top:7%;  left:18%;  animation-delay:0.2s;  mat-icon{color:#7c3aed;} }
      &.sn2 { top:7%;  right:18%; animation-delay:1s;    mat-icon{color:#1a73e8;} }
      &.sn3 { bottom:7%; left:20%;  animation-delay:1.9s; mat-icon{color:#0d9488;} }
      &.sn4 { bottom:7%; right:20%; animation-delay:1.4s; mat-icon{color:#e11d48;} }
    }
    .mdot {
      position: absolute; border-radius: 50%;
      animation: float 4s ease-in-out infinite;
      &.md1 { width:12px;height:12px; background:rgba(26,115,232,0.32);  box-shadow:0 0 0 4px rgba(26,115,232,0.08); top:18%; left:8%;   animation-delay:0s; }
      &.md2 { width:10px;height:10px; background:rgba(13,148,136,0.35);  box-shadow:0 0 0 4px rgba(13,148,136,0.08); top:18%; right:8%;  animation-delay:0.9s; }
      &.md3 { width:14px;height:14px; background:rgba(124,58,237,0.28);  box-shadow:0 0 0 4px rgba(124,58,237,0.07); bottom:18%; left:10%; animation-delay:1.8s; }
      &.md4 { width:10px;height:10px; background:rgba(217,119,6,0.32);   box-shadow:0 0 0 4px rgba(217,119,6,0.07);  bottom:18%; right:10%; animation-delay:2.6s; }
    }

    // Floating hero cards
    .hfc {
      position: absolute;
      background: rgba(255,255,255,0.93);
      backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255,255,255,0.96);
      border-radius: 20px; padding: 15px 18px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.09), 0 0 0 0.5px rgba(0,0,0,0.04);
      display: flex; align-items: center; gap: 12px;
      z-index: 10; white-space: nowrap;
      &.hfc-patients { top:8%; right:5%; animation:float 4s ease-in-out infinite 0s; }
      &.hfc-status   { top:37%; left:2%; animation:float 4.5s ease-in-out infinite 0.8s; flex-direction:column; align-items:flex-start; min-width:200px; gap:10px; }
      &.hfc-support  { bottom:8%; right:5%; animation:float 4s ease-in-out infinite 1.6s; }
    }
    .hfc-icon {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
      &.hfc-blue  { background:rgba(26,115,232,0.1);  mat-icon{color:#1a73e8;} }
      &.hfc-green { background:rgba(13,148,136,0.1);  mat-icon{color:#0d9488;} }
    }
    .hfc-body  { }
    .hfc-label { font-size:0.71rem; color:#94a3b8; font-weight:500; margin-bottom:2px; }
    .hfc-val   { font-size:0.94rem; font-weight:800; color:#0f172a; }
    .hfc-tag {
      margin-left: auto; display: flex; align-items: center; gap: 2px;
      font-size: 0.7rem; font-weight: 700;
      border-radius: 8px; padding: 3px 8px;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
      &.hfc-tag-green { background:rgba(22,163,74,0.09); color:#16a34a; }
    }
    .hfc-cert {
      display:flex; align-items:center; gap:6px;
      font-size:0.73rem; font-weight:700; color:#1a73e8;
      background:rgba(26,115,232,0.07); border-radius:8px; padding:5px 10px;
      mat-icon { font-size:14px; width:14px; height:14px; }
    }
    .hfc-ring-row { display:flex; align-items:center; gap:12px; }
    .hfc-ring {
      position:relative; width:54px; height:54px; flex-shrink:0;
      svg { width:54px; height:54px; }
    }
    .hfc-ring-num {
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%);
      font-size:0.78rem; font-weight:800; color:#0f172a;
    }
    .hfc-ring-label { font-size:0.8rem; font-weight:700; color:#0f172a; }
    .hfc-ring-sub   { font-size:0.69rem; color:#94a3b8; margin-top:2px; }
    .live-dot {
      width:10px; height:10px; border-radius:50%;
      background:#16a34a; flex-shrink:0;
      animation: livePulse 2s ease-in-out infinite;
    }

    // Social strip
    .hero-socials {
      position:absolute; right:18px; top:50%; transform:translateY(-50%);
      display:flex; flex-direction:column; gap:8px; z-index:15;
    }
    .hs-btn {
      width:34px; height:34px;
      background:rgba(255,255,255,0.82); backdrop-filter:blur(8px);
      border:1px solid rgba(0,0,0,0.06); border-radius:10px;
      display:flex; align-items:center; justify-content:center;
      color:#64748b; text-decoration:none;
      transition: all 0.2s;
      &:hover { background:white; color:#0f172a; transform:scale(1.08); }
    }

    // ══════════════════════════════════════════════════════ HERO STATS BAR ══
    .hero-stats-bar {
      background: white;
      padding-bottom: 40px;
      position: relative; z-index: 5;
    }
    .hsb-grid {
      display: grid; grid-template-columns: repeat(4,1fr); gap: 20px;
      transform: translateY(-44px);
    }
    .hsb-card {
      background: white; border-radius: 24px; padding: 28px 22px;
      box-shadow: 0 8px 48px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
      text-align: center;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      &:hover { transform:translateY(-5px); box-shadow:0 16px 60px rgba(0,0,0,0.11); }
    }
    .hsb-icon {
      width:52px; height:52px; border-radius:14px;
      display:flex; align-items:center; justify-content:center;
      margin: 0 auto 16px;
      mat-icon { font-size:24px; width:24px; height:24px; }
    }
    .hsb-num { font-size:2.1rem; font-weight:800; color:#0f172a; line-height:1; margin-bottom:6px; letter-spacing:-1.5px; }
    .hsb-label { font-size:0.88rem; font-weight:700; color:#334155; margin-bottom:4px; }
    .hsb-sub   { font-size:0.76rem; color:#94a3b8; }

    // ══════════════════════════════════════════════════════════ FEATURES ═════════
    .features-section {
      background: white;
      padding: 8px 0 64px;
      position: relative;
      z-index: 1;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
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
    @media (max-width: 1100px) {
      .hero-section { grid-template-columns: 50% 50%; }
      .lab-center   { width: 400px; height: 400px; }
      .lab-orb      { width: 155px; height: 155px; }
      .orb-icon     { font-size:60px !important; width:60px !important; height:60px !important; }
    }
    @media (max-width: $breakpoint-lg) {
      .hero-section    { grid-template-columns: 1fr; min-height: auto; }
      .hero-right      { order: -1; min-height: 380px; }
      .hero-left       { padding: 52px 28px 48px; animation: none; opacity: 1; transform: none; }
      .hero-right      { animation: none; opacity: 1; transform: none; }
      .hfc-patients    { top: 6%; right: 4%; }
      .hfc-status      { top: 38%; left: 2%; }
      .hfc-support     { bottom: 6%; right: 4%; }
      .hero-socials    { display: none; }
      .hsb-grid        { grid-template-columns: repeat(2,1fr); }
      .features-grid   { grid-template-columns: 1fr; }
      .about-grid      { grid-template-columns: 1fr; }
      .about-image-wrap { display: none; }
      .services-grid   { grid-template-columns: repeat(2, 1fr); }
      .packages-grid   { grid-template-columns: repeat(2, 1fr); }
      .tracker-grid    { grid-template-columns: 1fr; }
      .programs-grid   { grid-template-columns: 1fr; }
      .collection-grid { grid-template-columns: 1fr; }
      .collection-art  { display: none; }
      .stats-grid      { grid-template-columns: repeat(2, 1fr); }
      .testimonials-grid { grid-template-columns: 1fr; }
      .app-grid        { grid-template-columns: 1fr; }
      .app-mockup      { display: none; }
    }
    @media (max-width: $breakpoint-md) {
      .hero-h1        { font-size: 2.2rem; letter-spacing: -1.2px; }
      .hero-actions   { flex-direction: column; }
      .hbtn           { justify-content: center; }
      .trust-grid     { grid-template-columns: 1fr; gap: 12px; }
      .lab-center     { width: 300px; height: 300px; }
      .lab-orb        { width: 120px; height: 120px; }
      .orb-icon       { font-size:48px !important; width:48px !important; height:48px !important; }
      .snode          { width: 40px; height: 40px; mat-icon { font-size:18px; width:18px; height:18px; } }
      .hfc-status     { display: none; }
      .hsb-grid       { grid-template-columns: repeat(2,1fr); gap: 14px; }
      .features-grid  { grid-template-columns: 1fr; }
      .services-grid  { grid-template-columns: 1fr; }
      .packages-grid  { grid-template-columns: 1fr; }
      .programs-grid  { grid-template-columns: 1fr; }
      .stats-grid     { grid-template-columns: 1fr; }
      .steps-flow     { gap: 4px; }
      .step-arrow     { display: none; }
    }
    @media (max-width: $breakpoint-sm) {
      .hero-right { min-height: 300px; }
      .hfc-patients, .hfc-support { display: none; }
      .hsb-grid   { grid-template-columns: 1fr 1fr; gap: 12px; transform: translateY(-28px); }
      .hsb-card   { padding: 20px 14px; }
      .hsb-num    { font-size: 1.6rem; }
    }
  `],
})
export class HomeComponent implements OnInit {
  private packageApi = inject(PackageApiService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  packages = signal<HealthPackage[]>([]);

  trustFeatures = [
    { icon: 'verified',    title: 'Certified Laboratory', sub: 'ISO 15189 Accredited' },
    { icon: 'speed',       title: 'Fast Turnaround',      sub: 'Results in 6–24 hours' },
    { icon: 'description', title: 'Digital Reports',      sub: 'Secure online access' },
    { icon: 'location_on', title: 'Multi-Branch Network', sub: '15+ locations' },
  ];

  heroStats = [
    { icon: 'biotech',     value: 500, suffix: 'K+', label: 'Tests Performed',  sub: 'Since 2012',           bg: 'rgba(26,115,232,0.08)',  color: '#1a73e8' },
    { icon: 'groups',      value: 100, suffix: 'K+', label: 'Happy Patients',   sub: 'Across the region',    bg: 'rgba(13,148,136,0.08)',  color: '#0d9488' },
    { icon: 'science',     value: 300, suffix: '+',  label: 'Available Tests',  sub: 'All categories',       bg: 'rgba(124,58,237,0.08)', color: '#7c3aed' },
    { icon: 'location_on', value: 15,  suffix: '+',  label: 'Branch Locations', sub: 'Major cities covered', bg: 'rgba(217,119,6,0.08)',  color: '#d97706' },
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
    const statNums = document.querySelectorAll('[data-count]');

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
