import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OwnerRevenueStore } from '../stores/owner-stores';
import { OwnerKpiCardComponent } from '../shared/owner-kpi-card.component';
import { OwnerLineChartComponent } from '../shared/line-chart.component';
import { OwnerBarChartComponent } from '../shared/bar-chart.component';

@Component({
  selector: 'app-owner-revenue',
  standalone: true,
  imports: [CommonModule, MatIconModule, OwnerKpiCardComponent, OwnerLineChartComponent, OwnerBarChartComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>Revenue Analytics</h2><p class="sub">Income trends &amp; breakdowns</p></div>
        <div class="range">
          @for (r of ranges; track r.days) {
            <button class="range-btn" [class.active]="store.range() === r.days" (click)="store.setRange(r.days)">{{ r.label }}</button>
          }
        </div>
      </div>

      <div class="kpi-grid">
        <owner-kpi-card label="Total Refunds" icon="undo" color="#dc2626" prefix="SAR " [value]="d()?.totalRefunds ?? 0" [loading]="store.isLoading()" />
        <owner-kpi-card label="Payment Methods" icon="credit_card" color="#4f46e5" [value]="(d()?.paymentMethodBreakdown?.length ?? 0)" sub="distinct methods" [loading]="store.isLoading()" />
        <owner-kpi-card label="Active Branches" icon="store" color="#0d9488" [value]="(d()?.revenueByBranch?.length ?? 0)" [loading]="store.isLoading()" />
      </div>

      <owner-line-chart title="Daily Revenue Trend" [points]="dailyPoints()" color="#16a34a" />

      <div class="charts-row">
        <owner-bar-chart title="Payment Method Breakdown" [data]="methodData()" color="#8b5cf6" prefix="SAR " />
        <owner-bar-chart title="Revenue by Branch" [data]="branchData()" color="#4f46e5" prefix="SAR " />
      </div>

      <owner-bar-chart title="Monthly Revenue" [data]="monthlyData()" color="#0d9488" prefix="SAR " />
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1300px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; h2 { margin: 0 0 4px; } .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; } }
    .range { display: flex; gap: 2px; background: white; border: 1px solid $border-color; border-radius: 999px; padding: 3px; }
    .range-btn { border: none; background: none; padding: 6px 16px; border-radius: 999px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: $text-secondary; &.active { background: #4f46e5; color: white; } }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; @media (max-width: 700px) { grid-template-columns: 1fr; } }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 20px 0; @media (max-width: 900px) { grid-template-columns: 1fr; } }
  `]
})
export class OwnerRevenueComponent implements OnInit {
  store = inject(OwnerRevenueStore);
  ranges = [{ days: 7, label: '7D' }, { days: 30, label: '30D' }, { days: 90, label: '90D' }];

  d = computed(() => this.store.data());
  dailyPoints = computed(() => (this.d()?.dailyRevenue ?? []).map(p => ({ label: p.label, value: p.value })));
  monthlyData = computed(() => (this.d()?.monthlyRevenue ?? []).map(p => ({ label: p.label, value: p.value })));
  methodData = computed(() => (this.d()?.paymentMethodBreakdown ?? []).map(m => ({ label: m.name, value: m.amount })));
  branchData = computed(() => (this.d()?.revenueByBranch ?? []).map(b => ({ label: b.name, value: b.amount })));

  ngOnInit(): void { this.store.load(); }
}
