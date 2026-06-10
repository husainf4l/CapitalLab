import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OwnerBranchesStore } from '../stores/owner-stores';
import { OwnerBarChartComponent } from '../shared/bar-chart.component';

@Component({
  selector: 'app-owner-branches',
  standalone: true,
  imports: [CommonModule, MatIconModule, OwnerBarChartComponent],
  template: `
    <div class="page">
      <div class="page-header"><div><h2>Branch Performance</h2><p class="sub">Compare operations across branches</p></div></div>

      @if (store.isLoading()) {
        <div class="skel-grid">@for (i of [1,2,3]; track i) { <div class="skel"></div> }</div>
      } @else if (store.branches().length === 0) {
        <div class="empty"><mat-icon>store</mat-icon><p>No branch data</p></div>
      } @else {
        <owner-bar-chart title="Revenue by Branch" [data]="revenueData()" color="#4f46e5" prefix="SAR " />

        <div class="cards">
          @for (b of store.branches(); track b.branchId) {
            <div class="branch-card">
              <div class="bc-head"><mat-icon>store</mat-icon><strong>{{ b.branchName }}</strong></div>
              <div class="bc-revenue">SAR {{ b.revenue | number:'1.0-0' }}</div>
              <div class="bc-stats">
                <div><span class="v">{{ b.patients }}</span><span class="l">Patients</span></div>
                <div><span class="v">{{ b.tests }}</span><span class="l">Tests</span></div>
                <div><span class="v" [class.warn]="b.pendingSamples > 0">{{ b.pendingSamples }}</span><span class="l">Pending</span></div>
              </div>
            </div>
          }
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Branch</th><th>Revenue</th><th>Patients</th><th>Tests</th><th>Pending Samples</th></tr></thead>
            <tbody>
              @for (b of store.branches(); track b.branchId) {
                <tr><td><strong>{{ b.branchName }}</strong></td><td>SAR {{ b.revenue | number:'1.0-0' }}</td><td>{{ b.patients }}</td><td>{{ b.tests }}</td><td>{{ b.pendingSamples }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1200px; }
    .page-header { margin-bottom: 24px; h2 { margin: 0 0 4px; } .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; } }
    .skel-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; } .skel { height: 140px; border-radius: $border-radius-lg; background: linear-gradient(90deg,$gray-100 25%,$gray-200 50%,$gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: $text-secondary; mat-icon { font-size: 44px; opacity: 0.3; margin-bottom: 8px; } }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; @media (max-width: 800px) { grid-template-columns: 1fr; } }
    .branch-card { background: white; border: 1px solid $border-color; border-radius: $border-radius-lg; padding: 18px; box-shadow: $shadow-sm; }
    .bc-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; mat-icon { color: #4f46e5; } strong { font-size: 0.95rem; } }
    .bc-revenue { font-size: 1.5rem; font-weight: 800; color: #16a34a; margin-bottom: 14px; }
    .bc-stats { display: flex; justify-content: space-between; div { display: flex; flex-direction: column; align-items: center; } .v { font-size: 1.1rem; font-weight: 700; &.warn { color: $danger; } } .l { font-size: 0.72rem; color: $text-secondary; } }
    .table-wrap { overflow-x: auto; background: white; border: 1px solid $border-color; border-radius: $border-radius; box-shadow: $shadow-sm; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { background: $gray-50; padding: 10px 14px; text-align: left; font-size: 0.72rem; text-transform: uppercase; color: $text-secondary; border-bottom: 1px solid $border-color; } td { padding: 11px 14px; border-bottom: 1px solid $gray-100; } tr:last-child td { border-bottom: none; } }
  `]
})
export class OwnerBranchesComponent implements OnInit {
  store = inject(OwnerBranchesStore);
  revenueData = computed(() => this.store.branches().map(b => ({ label: b.branchName, value: b.revenue })));
  ngOnInit(): void { this.store.load(); }
}
