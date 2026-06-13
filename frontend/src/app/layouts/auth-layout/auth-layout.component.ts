import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <div class="form-col">
          <router-outlet />
        </div>

        <div class="hero-col">
          <div class="hero-inner">
            <img src="/images/hero/hero.webp" alt="" aria-hidden="true" />
            <div class="hero-overlay"></div>
            <div class="hero-text">
              <h2>Precision diagnostics<br>you can trust</h2>
              <p>Advanced testing. Clear results. Better health.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      padding: 32px 16px;
    }

    .auth-card {
      width: 100%;
      max-width: 1150px;
      background: #ffffff;
      border-radius: 40px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      display: flex;
      min-height: 660px;
    }

    .form-col {
      width: 45%;
      padding: 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hero-col {
      width: 55%;
      padding: 28px;
      display: flex;
    }

    .hero-inner {
      flex: 1;
      border-radius: 24px;
      overflow: hidden;
      position: relative;
    }

    .hero-inner img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.18) 48%, transparent 100%);
    }

    .hero-text {
      position: absolute;
      bottom: 44px;
      left: 44px;
      right: 44px;
      color: #fff;
      z-index: 10;
    }

    .hero-text h2 {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1.22;
      margin: 0 0 10px;
    }

    .hero-text p {
      font-size: 1.05rem;
      opacity: 0.88;
      line-height: 1.5;
      margin: 0;
    }

    @media (max-width: 900px) {
      .form-col {
        width: 100%;
        padding: 48px;
      }
      .hero-col {
        display: none;
      }
    }

    @media (max-width: 520px) {
      .auth-page {
        padding: 0;
        align-items: flex-start;
      }
      .auth-card {
        border-radius: 0;
        min-height: 100vh;
        box-shadow: none;
      }
      .form-col {
        padding: 36px 24px;
        justify-content: flex-start;
        padding-top: 52px;
      }
    }
  `]
})
export class AuthLayoutComponent {}
