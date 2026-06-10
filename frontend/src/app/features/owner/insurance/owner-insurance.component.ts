import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OwnerInsuranceStore } from '../stores/owner-stores';
import { OwnerKpiCardComponent } from '../shared/owner-kpi-card.component';

@Component({
  selector: 'app-owner-insurance',
  standalone: true,
  imports: [CommonModule, MatIconModule, OwnerKpiCardComponent],
  template: `
    <div class="page">
      <div class="page-header"><div><h2>Insurance Analytics</h2><p class="sub">Claims status &amp; recovery</p></div></div>

      <div class="kpi-grid">
        <owner-kpi-card label="Submitted Claims" icon="send" color="#4f46e5" [value]="d()?.submittedClaims ?? 0" [loading]="store.isLoading()" />
        <owner-kpi-card label="Approved Claims" icon="check_circle" color="#16a34a" [value]="d()?.approvedClaims ?? 0" [loading]="store.isLoading()" />
        <owner-kpi-card label="Rejected Claims" icon="cancel" color="#dc2626" [value]="d()?.rejectedClaims ?? 0" [loading]="store.isLoading()" />
        <owner-kpi-card label="Pending Amount" icon="schedule" color="#f59e0b" prefix="SAR " [value]="d()?.pendingAmount ?? 0" [loading]="store.isLoading()" />
        <owner-kpi-card label="Approved Amount" icon="payments" color="#0d9488" prefix="SAR " [value]="d()?.approvedAmount ?? 0" [loading]="store.isLoading()" />
        <owner-kpi-card label="Paid Amount" icon="account_balance_wallet" color="#16a34a" prefix="SAR " [value]="d()?.paidAmount ?? 0" [loading]="store.isLoading()" />
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1200px; }
    .page-header { margin-bottom: 24px; h2 { margin: 0 0 4px; } .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; } }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; @media (max-width: 800px) { grid-template-columns: repeat(2,1fr); } @media (max-width: 560px) { grid-template-columns: 1fr; } }
  `]
})
export class OwnerInsuranceComponent implements OnInit {
  store = inject(OwnerInsuranceStore);
  d = computed(() => this.store.data());
  ngOnInit(): void { this.store.load(); }
}
