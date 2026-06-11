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

      <!-- ── NAVBAR ── -->
      <header class="nav-wrapper">
        <div class="nav-pill">

          <!-- Logo -->
          <a routerLink="/" class="logo">
            <div class="logo-icon">
              <mat-icon>biotech</mat-icon>
            </div>
            <span class="logo-text">Capital<span class="logo-accent">Lab</span></span>
          </a>

          <!-- Desktop links — centered -->
          <nav class="desktop-nav">
            <a routerLink="/"        routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
            <a routerLink="/branches" routerLinkActive="active">Branches</a>
            <a routerLink="/about"   routerLinkActive="active">About</a>
            <a routerLink="/contact" routerLinkActive="active">Contact</a>
          </nav>

          <!-- Right actions -->
          <div class="nav-right">
            @if (authService.isAuthenticated()) {
              <a routerLink="/patient" class="btn-cta">
                <mat-icon>person</mat-icon>
                Portal
              </a>
            } @else {
              <a routerLink="/login" class="btn-cta">
                Book Now
              </a>
            }

            <button class="hamburger" (click)="mobileMenuOpen.set(!mobileMenuOpen())" aria-label="Menu">
              <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
            </button>
          </div>
        </div>

        <!-- Mobile drawer -->
        @if (mobileMenuOpen()) {
          <nav class="mobile-drawer">
            <a routerLink="/"         routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="mobileMenuOpen.set(false)">Home</a>
            <a routerLink="/branches" routerLinkActive="active" (click)="mobileMenuOpen.set(false)">Branches</a>
            <a routerLink="/about"    routerLinkActive="active" (click)="mobileMenuOpen.set(false)">About</a>
            <a routerLink="/contact"  routerLinkActive="active" (click)="mobileMenuOpen.set(false)">Contact</a>
            <div class="drawer-footer">
              <a routerLink="/login" class="drawer-cta" (click)="mobileMenuOpen.set(false)">Book Now</a>
            </div>
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
              <p class="newsletter-label">Get health tips &amp; updates</p>
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
    .public-content { flex: 1; padding-top: 92px; }

    // ─── Navbar wrapper — fixed transparent overlay ──────────────────────────
    .nav-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 200;
      padding: 16px 20px;
      pointer-events: none;
    }

    // ─── The floating pill ────────────────────────────────────────────────────
    .nav-pill {
      pointer-events: all;
      max-width: 920px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 22px;
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.04),
        0 8px 32px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      padding: 8px 8px 8px 18px;
      gap: 4px;
      transition: box-shadow 0.3s ease, background 0.3s ease;

      &:hover {
        box-shadow:
          0 4px 12px rgba(0, 0, 0, 0.06),
          0 12px 40px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
      }
    }

    // ─── Logo ─────────────────────────────────────────────────────────────────
    .logo {
      display: flex;
      align-items: center;
      gap: 9px;
      text-decoration: none;
      flex-shrink: 0;
      margin-right: 4px;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, $primary 0%, #4f8ef7 100%);
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 3px 10px rgba($primary, 0.28);
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .logo-text {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.4px;
    }

    .logo-accent { color: $primary; }

    // ─── Desktop nav — centered ───────────────────────────────────────────────
    .desktop-nav {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;

      a {
        padding: 7px 15px;
        border-radius: 13px;
        color: #64748b;
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        letter-spacing: -0.1px;
        transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
        white-space: nowrap;

        &:hover {
          background: #f1f5f9;
          color: #0f172a;
          transform: translateY(-0.5px);
        }

        &.active {
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 600;
        }
      }
    }

    // ─── Right side ───────────────────────────────────────────────────────────
    .nav-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .btn-cta {
      display: flex;
      align-items: center;
      gap: 5px;
      background: #0f172a;
      color: white;
      text-decoration: none;
      border: none;
      border-radius: 14px;
      padding: 9px 20px;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: -0.1px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: #1e293b;
        transform: translateY(-1px);
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.22);
      }

      &:active { transform: translateY(0); }
    }

    // ─── Hamburger ────────────────────────────────────────────────────────────
    .hamburger {
      display: none;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: #f8fafc;
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 12px;
      cursor: pointer;
      color: #0f172a;
      transition: background 0.18s, transform 0.18s;

      mat-icon { font-size: 20px; width: 20px; height: 20px; }

      &:hover { background: #f1f5f9; transform: scale(1.04); }
    }

    // ─── Mobile drawer ────────────────────────────────────────────────────────
    .mobile-drawer {
      pointer-events: all;
      max-width: 920px;
      margin: 8px auto 0;
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 18px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      animation: slideDown 0.2s ease;

      a:not(.drawer-cta) {
        display: block;
        padding: 14px 22px;
        color: #334155;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 500;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        transition: background 0.15s, color 0.15s;

        &:last-of-type { border-bottom: none; }
        &:hover { background: #f8fafc; color: #0f172a; }
        &.active { color: $primary; background: rgba($primary, 0.04); font-weight: 600; }
      }

      .drawer-footer {
        padding: 14px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }

      .drawer-cta {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0f172a;
        color: white;
        text-decoration: none;
        border-radius: 14px;
        padding: 13px;
        font-size: 0.9rem;
        font-weight: 600;
        transition: background 0.18s;
        &:hover { background: #1e293b; }
      }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
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
      .hamburger { display: flex !important; }
      .btn-cta { display: none; }
    }

    @media (max-width: $breakpoint-md) {
      .footer-body { grid-template-columns: 1fr 1fr; gap: 32px; padding: 48px 0 40px; }
      .footer-brand { grid-column: 1 / -1; }
      .legal-links { display: none; }
    }

    @media (max-width: $breakpoint-sm) {
      .nav-wrapper { padding: 12px 14px; }
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
