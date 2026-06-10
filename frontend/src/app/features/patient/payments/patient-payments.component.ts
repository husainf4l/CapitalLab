import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppPageHeaderComponent } from '../../../shared/ui/app-page-header/app-page-header.component';
import { AppBadgeComponent } from '../../../shared/ui/app-badge/app-badge.component';


@Component({
  selector: 'app-patient-payments',
  standalone: true,
  imports: [CommonModule, MatIconModule, AppPageHeaderComponent, AppBadgeComponent],
  template: `
    <div class="payments-page">
      <app-page-header title="Payments" subtitle="View your payment history and invoices" />
      <div class="payments-list">
        @for (p of payments; track p.id) {
          <div class="payment-item">
            <div class="payment-icon">💳</div>
            <div class="payment-info">
              <p class="payment-desc">{{ p.description }}</p>
              <p class="payment-date">{{ p.date }}</p>
            </div>
            <div class="payment-right">
              <p class="payment-amount">SAR {{ p.amount | number:'1.2-2' }}</p>
              <app-badge [variant]="p.status === 'paid' ? 'success' : 'warning'">{{ p.status | titlecase }}</app-badge>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .payments-list { display: flex; flex-direction: column; gap: 8px; }
    .payment-item {
      background: white; border-radius: $border-radius; padding: 16px 20px;
      box-shadow: $shadow-sm; border: 1px solid $border-color;
      display: flex; align-items: center; gap: 12px;
    }
    .payment-icon { font-size: 1.5rem; }
    .payment-info { flex: 1; }
    .payment-desc { font-weight: 500; margin: 0 0 2px; font-size: 0.9rem; }
    .payment-date { margin: 0; font-size: 0.75rem; color: $text-secondary; }
    .payment-right { text-align: right; }
    .payment-amount { font-weight: 700; font-size: 1rem; margin: 0 0 4px; }
  `]
})
export class PatientPaymentsComponent {
  payments = [
    { id: '1', description: 'Complete Blood Count + Vitamin D', date: 'Dec 1, 2025', amount: 185, status: 'paid' },
    { id: '2', description: 'Diabetes Panel', date: 'Oct 15, 2025', amount: 240, status: 'paid' },
    { id: '3', description: 'Thyroid Function Tests', date: 'Sep 3, 2025', amount: 120, status: 'paid' },
  ];
}
