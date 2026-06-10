import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OwnerInventoryStore } from '../stores/owner-stores';
import { OwnerKpiCardComponent } from '../shared/owner-kpi-card.component';
import { OwnerLineChartComponent } from '../shared/line-chart.component';

@Component({
  selector: 'app-owner-inventory',
  standalone: true,
  imports: [CommonModule, MatIconModule, OwnerKpiCardComponent, OwnerLineChartComponent],
  template: `
    <div class="page">
      <div class="page-header"><div><h2>Inventory Analytics</h2><p class="sub">Stock health &amp; movement</p></div></div>

      <div class="kpi-grid">
        <owner-kpi-card label="Inventory Value" icon="inventory_2" color="#4f46e5" prefix="SAR " [value]="d()?.inventoryValue ?? 0" [loading]="store.isLoading()" />
        <owner-kpi-card label="Low Stock Items" icon="warning" color="#f59e0b" [value]="d()?.lowStockCount ?? 0" sub="need reordering" [loading]="store.isLoading()" />
        <owner-kpi-card label="Expiring Soon" icon="schedule" color="#dc2626" [value]="d()?.expiringSoonCount ?? 0" sub="within 30 days" [loading]="store.isLoading()" />
      </div>

      <owner-line-chart title="Stock Movement (30 days)" [points]="movementPoints()" color="#4f46e5" />
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1200px; }
    .page-header { margin-bottom: 24px; h2 { margin: 0 0 4px; } .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; } }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; @media (max-width: 700px) { grid-template-columns: 1fr; } }
  `]
})
export class OwnerInventoryComponent implements OnInit {
  store = inject(OwnerInventoryStore);
  d = computed(() => this.store.data());
  movementPoints = computed(() => (this.d()?.stockMovement ?? []).map(p => ({ label: p.label, value: p.value })));
  ngOnInit(): void { this.store.load(); }
}
