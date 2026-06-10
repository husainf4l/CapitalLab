import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OwnerOverviewStore } from '../stores/owner-stores';
import { OwnerKpiCardComponent } from '../shared/owner-kpi-card.component';
import { OwnerLineChartComponent } from '../shared/line-chart.component';
import { OwnerBarChartComponent } from '../shared/bar-chart.component';

@Component({
  selector: 'app-owner-overview',
  standalone: true,
  imports: [RouterLink, CommonModule, MatIconModule, MatButtonModule, OwnerKpiCardComponent, OwnerLineChartComponent, OwnerBarChartComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>Executive Overview</h2><p class="sub">{{ today | date:'EEEE, d MMMM yyyy' }}</p></div>
        <button mat-icon-button (click)="store.load()"><mat-icon>refresh</mat-icon></button>
      </div>

      <div class="kpi-grid">
        <owner-kpi-card label="Total Revenue" icon="trending_up" color="#16a34a" prefix="SAR " [value]="o().totalRevenue" [loading]="store.isLoading()" />
        <owner-kpi-card label="Net Revenue" icon="payments" color="#0d9488" prefix="SAR " [value]="o().netRevenue" [loading]="store.isLoading()" />
        <owner-kpi-card label="Outstanding" icon="account_balance" color="#dc2626" prefix="SAR " [value]="o().outstandingBalance" [loading]="store.isLoading()" />
        <owner-kpi-card label="Total Patients" icon="groups" color="#4f46e5" [value]="o().totalPatients" [sub]="o().newPatients + ' new this month'" [loading]="store.isLoading()" />
        <owner-kpi-card label="Total Tests" icon="science" color="#8b5cf6" [value]="o().totalTests" [loading]="store.isLoading()" />
        <owner-kpi-card label="Appointments" icon="event" color="#0891b2" [value]="o().totalAppointments" [loading]="store.isLoading()" />
        <owner-kpi-card label="Low Stock Items" icon="warning" color="#f59e0b" [value]="o().lowStockItems" [loading]="store.isLoading()" />
        <owner-kpi-card label="Pending Claims" icon="health_and_safety" color="#ef4444" [value]="o().pendingInsuranceClaims" [loading]="store.isLoading()" />
      </div>

      <div class="charts-row">
        <owner-line-chart title="Daily Revenue (30 days)" [points]="revenuePoints()" color="#16a34a" />
        <owner-bar-chart title="Revenue by Branch" [data]="branchData()" color="#4f46e5" prefix="SAR " />
      </div>

      <div class="actions-card">
        <h4>Pending Actions</h4>
        <div class="action-links">
          <a routerLink="/owner/insurance" class="alink"><mat-icon style="color:#ef4444">health_and_safety</mat-icon> {{ o().pendingInsuranceClaims }} insurance claims pending review</a>
          <a routerLink="/owner/inventory" class="alink"><mat-icon style="color:#f59e0b">warning</mat-icon> {{ o().lowStockItems }} items low on stock</a>
          <a routerLink="/owner/revenue" class="alink"><mat-icon style="color:#dc2626">account_balance</mat-icon> SAR {{ o().outstandingBalance | number:'1.0-0' }} outstanding balance</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1300px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; h2 { margin: 0 0 4px; font-size: 1.5rem; } .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; } }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; @media (max-width: 1100px) { grid-template-columns: repeat(2,1fr); } @media (max-width: 560px) { grid-template-columns: 1fr; } }
    .charts-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 18px; margin-bottom: 24px; @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .actions-card { background: white; border: 1px solid $border-color; border-radius: $border-radius-lg; padding: 20px; h4 { margin: 0 0 14px; } }
    .action-links { display: flex; flex-direction: column; gap: 8px; }
    .alink { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: $border-radius; background: $gray-50; text-decoration: none; color: $text-primary; font-size: 0.875rem; transition: background 0.15s; mat-icon { font-size: 20px; } &:hover { background: $gray-100; } }
  `]
})
export class OwnerOverviewComponent implements OnInit {
  store = inject(OwnerOverviewStore);
  today = new Date();

  o = computed(() => this.store.overview());
  revenuePoints = computed(() => (this.store.revenue()?.dailyRevenue ?? []).map(p => ({ label: p.label, value: p.value })));
  branchData = computed(() => this.store.branches().map(b => ({ label: b.branchName, value: b.revenue })));

  ngOnInit(): void { this.store.load(); }
}
