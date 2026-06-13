import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="about-page">
      <div class="page-hero">
        <div class="container">
          <h1>About Capital Lab</h1>
          <p>Diagnostic laboratory services for accurate, timely health insights</p>
        </div>
      </div>
      <div class="container page-body">
        <div class="about-grid">
          <div class="about-text">
            <h2>Our Mission</h2>
            <p>Capital Lab is committed to providing accurate, timely, and affordable diagnostic services that empower patients to take control of their health.</p>
            <h2>Our Vision</h2>
            <p>To be the most trusted and accessible diagnostic laboratory network in the region, delivering world-class results with compassion and precision.</p>
            <div class="stats-row">
              <div class="about-stat"><strong>0</strong><span>Tests Available</span></div>
              <div class="about-stat"><strong>0</strong><span>Patients Served</span></div>
              <div class="about-stat"><strong>0</strong><span>Branches</span></div>
              <div class="about-stat"><strong>0</strong><span>Production Metrics</span></div>
            </div>
          </div>
          <div class="about-image">
            <div class="image-placeholder"><mat-icon>biotech</mat-icon></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page-hero { background: linear-gradient(135deg, $primary, $primary-dark); color: white; padding: 80px 0;
      h1 { color: white; font-size: 3rem; } p { color: rgba(255,255,255,0.85); }
    }
    .page-body { padding: 64px 0; }
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .about-text h2 { color: $primary; margin-bottom: 12px; }
    .about-text p { color: $text-secondary; margin-bottom: 32px; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 32px; }
    .about-stat { text-align: center; background: $primary-light; border-radius: $border-radius; padding: 16px;
      strong { display: block; font-size: 1.75rem; font-weight: 700; color: $primary; }
      span { font-size: 0.8rem; color: $text-secondary; }
    }
    .image-placeholder { font-size: 8rem; text-align: center; background: $gray-100; border-radius: $border-radius-xl; padding: 64px; }
  `]
})
export class AboutComponent {}
