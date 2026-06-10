import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OwnerTestsStore } from '../stores/owner-stores';
import { OwnerBarChartComponent } from '../shared/bar-chart.component';

@Component({
  selector: 'app-owner-tests',
  standalone: true,
  imports: [CommonModule, MatIconModule, OwnerBarChartComponent],
  template: `
    <div class="page">
      <div class="page-header"><div><h2>Test Analytics</h2><p class="sub">Demand &amp; profitability</p></div></div>

      @if (store.isLoading()) {
        <div class="skel-grid">@for (i of [1,2]; track i) { <div class="skel"></div> }</div>
      } @else {
        <div class="charts-row">
          <owner-bar-chart title="Most Requested Tests" [data]="requestedData()" color="#4f46e5" />
          <owner-bar-chart title="Most Profitable Tests" [data]="profitableData()" color="#16a34a" prefix="SAR " />
        </div>
        <owner-bar-chart title="Package Performance" [data]="packageData()" color="#8b5cf6" />
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1200px; }
    .page-header { margin-bottom: 24px; h2 { margin: 0 0 4px; } .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; } }
    .skel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; } .skel { height: 220px; border-radius: $border-radius-lg; background: linear-gradient(90deg,$gray-100 25%,$gray-200 50%,$gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; @media (max-width: 900px) { grid-template-columns: 1fr; } }
  `]
})
export class OwnerTestsComponent implements OnInit {
  store = inject(OwnerTestsStore);
  requestedData = computed(() => (this.store.data()?.mostRequested ?? []).map(t => ({ label: t.name, value: t.count })));
  profitableData = computed(() => (this.store.data()?.mostProfitable ?? []).map(t => ({ label: t.name, value: t.amount })));
  packageData = computed(() => (this.store.data()?.packagePerformance ?? []).map(t => ({ label: t.name, value: t.count })));
  ngOnInit(): void { this.store.load(); }
}
