import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface FaqItem { question: string; answer: string; open: boolean; }

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="faq-page">
      <div class="page-hero">
        <div class="container">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our services</p>
        </div>
      </div>
      <div class="container page-body">
        @for (item of faqs; track item.question; let i = $index) {
          <div class="faq-item" [class.open]="item.open">
            <button class="faq-question" (click)="toggle(i)">
              {{ item.question }}
              <mat-icon>{{ item.open ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
            @if (item.open) {
              <div class="faq-answer">{{ item.answer }}</div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page-hero { background: linear-gradient(135deg, #4a148c, #7b1fa2); color: white; padding: 80px 0;
      h1 { color: white; } p { color: rgba(255,255,255,0.85); }
    }
    .page-body { padding: 48px 0; max-width: 800px; margin: 0 auto; }
    .faq-item { border: 1px solid $border-color; border-radius: $border-radius; margin-bottom: 12px; overflow: hidden;
      &.open { border-color: $primary; }
    }
    .faq-question {
      width: 100%; display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; background: white; border: none; cursor: pointer;
      font-size: 1rem; font-weight: 500; text-align: left; color: $text-primary;
      &:hover { background: $gray-50; }
    }
    .faq-answer { padding: 0 24px 20px; color: $text-secondary; line-height: 1.7; }
  `]
})
export class FaqComponent {
  faqs: FaqItem[] = [
    { question: 'How do I book a test?', answer: 'You can book a test online through our website, call our hotline, or visit any branch directly. Log in to your patient portal to book with ease.', open: false },
    { question: 'How do I receive my results?', answer: 'Results are delivered digitally through your patient portal and via email/SMS. You can also download a PDF report directly.', open: false },
    { question: 'Is home collection available?', answer: 'Yes! We offer home sample collection services. You can request a technician to visit your address through the patient portal or call our hotline.', open: false },
    { question: 'How long does it take to get results?', answer: 'Most results are available within 24 hours. Some specialized tests may take 2–5 business days. Turnaround time is listed on each test page.', open: false },
    { question: 'Do I need a doctor\'s referral?', answer: 'Most tests can be booked without a referral. However, some specialized or controlled tests require a doctor\'s prescription.', open: false },
    { question: 'How do I add family members to my account?', answer: 'In your patient portal, go to Family Members section and add their details. You can then book tests and view results for each family member.', open: false },
  ];

  toggle(i: number): void {
    this.faqs[i].open = !this.faqs[i].open;
  }
}
