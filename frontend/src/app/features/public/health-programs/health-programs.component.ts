import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-health-programs',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="programs-page">
      <div class="page-hero">
        <div class="container">
          <h1>Health Programs</h1>
          <p>Ongoing monitoring programs for chronic condition management</p>
        </div>
      </div>
      <div class="container page-body">
        <div class="programs-grid">
          @for (p of programs; track p.title) {
            <div class="program-card">
              <div class="program-icon">{{ p.icon }}</div>
              <h3>{{ p.title }}</h3>
              <p>{{ p.description }}</p>
              <ul>
                @for (test of p.tests; track test) { <li>{{ test }}</li> }
              </ul>
              <a mat-flat-button color="primary" routerLink="/login">Enroll Now</a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page-hero { background: linear-gradient(135deg, #1b5e20, #2e7d32); color: white; padding: 80px 0;
      h1 { color: white; } p { color: rgba(255,255,255,0.85); }
    }
    .page-body { padding: 64px 0; }
    .programs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .program-card { background: white; border-radius: $border-radius-lg; padding: 32px; box-shadow: $shadow-sm; border: 1px solid $border-color; }
    .program-icon { font-size: 3rem; margin-bottom: 16px; }
    .program-card h3 { color: $primary; margin-bottom: 8px; }
    .program-card p { color: $text-secondary; margin-bottom: 16px; }
    .program-card ul { padding-left: 20px; color: $text-secondary; margin-bottom: 20px; }
    .program-card li { margin-bottom: 4px; font-size: 0.875rem; }
  `]
})
export class HealthProgramsComponent {
  programs = [
    { icon: '🩸', title: 'Diabetes Management', description: 'Comprehensive monitoring for diabetic patients with quarterly check-ins.', tests: ['HbA1c', 'Fasting Glucose', 'Random Blood Sugar', 'Insulin Levels', 'Kidney Function'] },
    { icon: '❤️', title: 'Heart Health Program', description: 'Cardiac risk assessment and lipid management monitoring.', tests: ['Lipid Profile', 'CRP', 'Homocysteine', 'Troponin', 'BNP'] },
    { icon: '🦋', title: 'Thyroid Care', description: 'Thyroid function monitoring and hormone balance tracking.', tests: ['TSH', 'Free T3', 'Free T4', 'Thyroid Antibodies', 'Ultrasound Referral'] },
    { icon: '🦴', title: 'Bone & Vitamin Health', description: 'Deficiency screening and bone density risk assessment.', tests: ['Vitamin D', 'Calcium', 'PTH', 'Phosphorus', 'Bone Markers'] },
  ];
}
