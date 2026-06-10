import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatButtonModule, MatIconModule,
    CommonModule, FormsModule,
  ],
  template: `
    <div class="public-layout">

      <!-- ── HEADER ── -->
      <header class="public-header" [class.scrolled]="isScrolled()">
        <div class="container header-inner">

          <!-- Logo -->
          <a routerLink="/" class="logo">
            <div class="logo-icon-wrap">
              <mat-icon>biotech</mat-icon>
            </div>
            <span class="logo-text">Capital<span class="logo-accent">Lab</span></span>
          </a>

          <!-- Desktop nav -->
          <nav class="main-nav desktop-nav">
            <a routerLink="/"               routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
            <a routerLink="/tests"          routerLinkActive="active">Tests</a>
            <a routerLink="/packages"       routerLinkActive="active">Packages</a>
            <a routerLink="/health-programs" routerLinkActive="active">Health Programs</a>
            <a routerLink="/branches"       routerLinkActive="active">Branches</a>
            <a routerLink="/about"          routerLinkActive="active">About</a>
            <a routerLink="/contact"        routerLinkActive="active">Contact</a>
          </nav>

          <!-- Header actions -->
          <div class="header-actions">
            <button class="lang-toggle" (click)="langService.toggle()">
              {{ langService.isArabic() ? 'EN' : 'عر' }}
            </button>

            @if (authService.isAuthenticated()) {
              <a mat-flat-button routerLink="/patient" color="primary" class="btn-portal">
                <mat-icon>person</mat-icon> Patient Portal
              </a>
            } @else {
              <a mat-stroked-button routerLink="/login" class="btn-portal-outline">
                Patient Portal
              </a>
              <a mat-flat-button routerLink="/login" color="primary" class="btn-book">
                <mat-icon>calendar_today</mat-icon> Book Appointment
              </a>
            }

            <button class="mobile-hamburger" (click)="mobileMenuOpen.set(!mobileMenuOpen())">
              <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
            </button>
          </div>
        </div>

        <!-- Mobile nav drawer -->
        @if (mobileMenuOpen()) {
          <nav class="mobile-nav">
            <a routerLink="/"                (click)="mobileMenuOpen.set(false)">Home</a>
            <a routerLink="/tests"           (click)="mobileMenuOpen.set(false)">Tests</a>
            <a routerLink="/packages"        (click)="mobileMenuOpen.set(false)">Packages</a>
            <a routerLink="/health-programs" (click)="mobileMenuOpen.set(false)">Health Programs</a>
            <a routerLink="/branches"        (click)="mobileMenuOpen.set(false)">Branches</a>
            <a routerLink="/about"           (click)="mobileMenuOpen.set(false)">About</a>
            <a routerLink="/contact"         (click)="mobileMenuOpen.set(false)">Contact</a>
            <div class="mobile-nav-divider"></div>
            <a routerLink="/login" class="mobile-cta" (click)="mobileMenuOpen.set(false)">
              <mat-icon>calendar_today</mat-icon> Book Appointment
            </a>
          </nav>
        }
      </header>

      <!-- ── CONTENT ── -->
      <main class="public-content">
        <router-outlet />
      </main>

      <!-- ── FOOTER ── -->
      <footer class="public-footer">
        <div class="footer-glow"></div>
        <div class="container footer-body">

          <!-- Brand column -->
          <div class="footer-brand">
            <a routerLink="/" class="footer-logo">
              <div class="footer-logo-icon">
                <mat-icon>biotech</mat-icon>
              </div>
              <span>Capital<span>Lab</span></span>
            </a>
            <p class="footer-tagline">
              Advanced medical diagnostics trusted by over 100,000 patients across the region.
            </p>
            <div class="social-row">
              <a class="social-btn" href="#" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a class="social-btn" href="#" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a class="social-btn" href="#" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>

            <!-- Newsletter -->
            <div class="newsletter-form">
              <p class="newsletter-label">Get health tips & updates</p>
              <div class="newsletter-input-row">
                <input type="email" [(ngModel)]="newsletterEmail" placeholder="Your email address" />
                <button (click)="subscribeNewsletter()">Subscribe</button>
              </div>
            </div>
          </div>

          <!-- Company -->
          <div class="footer-col">
            <h6>Company</h6>
            <a routerLink="/about">About Us</a>
            <a routerLink="/contact">Contact</a>
            <a routerLink="/branches">Our Branches</a>
            <a routerLink="/about">Careers</a>
            <a routerLink="/about">Press Room</a>
          </div>

          <!-- Services -->
          <div class="footer-col">
            <h6>Services</h6>
            <a routerLink="/tests">Lab Tests</a>
            <a routerLink="/packages">Health Packages</a>
            <a routerLink="/health-programs">Health Programs</a>
            <a routerLink="/patient/home-collection">Home Collection</a>
            <a routerLink="/tests">Corporate Testing</a>
          </div>

          <!-- Patient Portal -->
          <div class="footer-col">
            <h6>Patient Portal</h6>
            <a routerLink="/patient/results">My Results</a>
            <a routerLink="/patient/appointments">Appointments</a>
            <a routerLink="/patient/health-tracker">Health Tracker</a>
            <a routerLink="/patient/home-collection">Book Collection</a>
            <a routerLink="/faq">FAQ</a>
          </div>

          <!-- Contact -->
          <div class="footer-col footer-contact">
            <h6>Contact Us</h6>
            <div class="contact-item">
              <mat-icon>phone</mat-icon>
              <span>+966 11 XXX XXXX</span>
            </div>
            <div class="contact-item">
              <mat-icon>email</mat-icon>
              <span>info&#64;capitallab.com</span>
            </div>
            <div class="contact-item">
              <mat-icon>location_on</mat-icon>
              <span>Riyadh, Saudi Arabia</span>
            </div>
            <div class="contact-item">
              <mat-icon>schedule</mat-icon>
              <span>Sun – Thu: 7am – 10pm</span>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="container footer-bottom-inner">
            <p>&copy; 2025 Capital Lab. All rights reserved.</p>
            <div class="legal-links">
              <a routerLink="/faq">Privacy Policy</a>
              <a routerLink="/faq">Terms of Service</a>
              <a routerLink="/faq">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;

    // ─── Layout shell ───────────────────────────────────────────────────────────
    .public-layout { display: flex; flex-direction: column; min-height: 100vh; }
    .public-content { flex: 1; }

    // ─── Header ─────────────────────────────────────────────────────────────────
    .public-header {
      position: sticky;
      top: 0;
      z-index: 200;
      background: rgba(255,255,255,0);
      transition: background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
      border-bottom: 1px solid transparent;

      &.scrolled {
        background: rgba(255,255,255,0.92);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 1px solid rgba(0,0,0,0.05);
        box-shadow: 0 4px 32px rgba(0,0,0,0.06);
      }
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
      gap: 16px;
    }

    // Logo
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon-wrap {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, $primary, #4f8ef7);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba($primary, 0.35);
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .logo-text {
      font-size: 1.3rem;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: -0.3px;
    }
    .logo-accent { color: $primary; }

    // Desktop nav
    .main-nav {
      display: flex;
      align-items: center;
      gap: 2px;

      a {
        padding: 8px 13px;
        border-radius: 10px;
        color: $text-secondary;
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 500;
        transition: all $transition-fast;
        white-space: nowrap;

        &:hover { color: $primary; background: $primary-light; }
        &.active { color: $primary; background: $primary-light; font-weight: 600; }
      }
    }

    // Actions
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .lang-toggle {
      background: transparent;
      border: 1.5px solid $border-color;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.8rem;
      font-weight: 700;
      color: $text-secondary;
      cursor: pointer;
      transition: all $transition-fast;
      &:hover { border-color: $primary; color: $primary; }
    }

    .btn-portal-outline {
      font-size: 0.875rem !important;
      white-space: nowrap;
    }
    .btn-portal, .btn-book {
      font-size: 0.875rem !important;
      white-space: nowrap;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .mobile-hamburger {
      display: none;
      background: transparent;
      border: none;
      cursor: pointer;
      color: $text-primary;
      padding: 4px;
      border-radius: 8px;
      &:hover { background: $gray-100; }
    }

    // Mobile nav
    .mobile-nav {
      background: white;
      border-top: 1px solid $border-color;
      padding: 12px 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);

      a {
        padding: 12px 16px;
        border-radius: 10px;
        color: $text-primary;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all $transition-fast;
        &:hover { background: $gray-50; color: $primary; }
      }

      .mobile-nav-divider {
        height: 1px;
        background: $border-color;
        margin: 8px 0;
      }

      .mobile-cta {
        background: $primary;
        color: white;
        text-align: center;
        justify-content: center;
        border-radius: 12px;
        margin-top: 4px;
        &:hover { background: $primary-dark; color: white; }
        mat-icon { font-size: 16px; width: 16px; height: 16px; }
      }
    }

    // ─── Footer ─────────────────────────────────────────────────────────────────
    .public-footer {
      background: #0f172a;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .footer-glow {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 300px;
      background: radial-gradient(ellipse, rgba($primary, 0.12) 0%, transparent 70%);
      pointer-events: none;
    }

    .footer-body {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.2fr;
      gap: 40px;
      padding: 72px 0 56px;
      position: relative;
    }

    // Brand
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      margin-bottom: 16px;

      .footer-logo-icon {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, $primary, #4f8ef7);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        mat-icon { font-size: 20px; width: 20px; height: 20px; color: white; }
      }

      span {
        font-size: 1.2rem;
        font-weight: 700;
        color: white;
        span { color: #60a5fa; }
      }
    }

    .footer-tagline {
      color: #94a3b8;
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .social-row {
      display: flex;
      gap: 8px;
      margin-bottom: 28px;
    }

    .social-btn {
      width: 36px;
      height: 36px;
      background: rgba(255,255,255,0.06);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      text-decoration: none;
      transition: all $transition-fast;
      &:hover { background: $primary; color: white; transform: translateY(-2px); }
    }

    .newsletter-label {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .newsletter-input-row {
      display: flex;
      gap: 0;

      input {
        flex: 1;
        background: rgba(255,255,255,0.07);
        border: 1.5px solid rgba(255,255,255,0.1);
        border-right: none;
        border-radius: 10px 0 0 10px;
        padding: 10px 14px;
        color: white;
        font-size: 0.875rem;
        outline: none;
        transition: border-color $transition-fast;
        &::placeholder { color: #64748b; }
        &:focus { border-color: $primary; }
      }

      button {
        background: $primary;
        color: white;
        border: none;
        border-radius: 0 10px 10px 0;
        padding: 10px 18px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: background $transition-fast;
        white-space: nowrap;
        &:hover { background: $primary-dark; }
      }
    }

    // Footer columns
    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 4px;

      h6 {
        color: white;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      a {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.875rem;
        padding: 5px 0;
        transition: color $transition-fast;
        &:hover { color: white; }
      }
    }

    .footer-contact {
      .contact-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        color: #94a3b8;
        font-size: 0.875rem;
        padding: 5px 0;
        mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; color: #60a5fa; }
      }
    }

    // Footer bottom bar
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 20px 0;
    }

    .footer-bottom-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;

      p { color: #475569; font-size: 0.875rem; margin: 0; }
    }

    .legal-links {
      display: flex;
      gap: 20px;
      a { color: #475569; text-decoration: none; font-size: 0.8rem; &:hover { color: #94a3b8; } }
    }

    // ─── Responsive ─────────────────────────────────────────────────────────────
    @media (max-width: 1100px) {
      .footer-body { grid-template-columns: 1.5fr 1fr 1fr; }
      .footer-col:nth-child(5) { display: none; }
    }

    @media (max-width: $breakpoint-lg) {
      .desktop-nav { display: none; }
      .btn-portal-outline, .btn-book { display: none !important; }
      .mobile-hamburger { display: flex !important; }
    }

    @media (max-width: $breakpoint-md) {
      .footer-body { grid-template-columns: 1fr 1fr; gap: 32px; padding: 48px 0 40px; }
      .footer-brand { grid-column: 1 / -1; }
      .legal-links { display: none; }
    }

    @media (max-width: $breakpoint-sm) {
      .footer-body { grid-template-columns: 1fr; }
      .footer-bottom-inner { flex-direction: column; gap: 8px; text-align: center; }
    }
  `],
})
export class PublicLayoutComponent {
  langService = inject(LanguageService);
  authService = inject(AuthService);
  mobileMenuOpen = signal(false);
  isScrolled = signal(false);
  newsletterEmail = '';

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 40);
  }

  subscribeNewsletter(): void {
    if (this.newsletterEmail.trim()) {
      this.newsletterEmail = '';
    }
  }
}
