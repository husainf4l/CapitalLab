import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OwnerPatientsStore } from '../stores/owner-stores';
import { OwnerKpiCardComponent } from '../shared/owner-kpi-card.component';
import { OwnerLineChartComponent } from '../shared/line-chart.component';

@Component({
  selector: 'app-owner-patients',
  standalone: true,
  imports: [CommonModule, MatIconModule, OwnerKpiCardComponent, OwnerLineChartComponent],
  template: `
    <div class="page">
      <div class="page-header"><div><h2>Patient Analytics</h2><p class="sub">Growth &amp; retention</p></div></div>

      <div class="kpi-grid">
        <owner-kpi-card label="New Patients" icon="person_add" color="#16a34a" [value]="d()?.newPatients ?? 0" sub="this month" [loading]="store.isLoading()" />
        <owner-kpi-card label="Returning Patients" icon="repeat" color="#4f46e5" [value]="d()?.returningPatients ?? 0" [loading]="store.isLoading()" />
        <owner-kpi-card label="Family Accounts" icon="family_restroom" color="#8b5cf6" [value]="d()?.familyAccounts ?? 0" [loading]="store.isLoading()" />
      </div>

      <owner-line-chart title="Patient Growth (6 months)" [points]="growthPoints()" color="#4f46e5" />
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1200px; }
    .page-header { margin-bottom: 24px; h2 { margin: 0 0 4px; } .sub { margin: 0; color: $text-secondary; font-size: 0.875rem; } }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; @media (max-width: 700px) { grid-template-columns: 1fr; } }
  `]
})
export class OwnerPatientsComponent implements OnInit {
  store = inject(OwnerPatientsStore);
  d = computed(() => this.store.data());
  growthPoints = computed(() => (this.d()?.growthTrend ?? []).map(p => ({ label: p.label, value: p.value })));
  ngOnInit(): void { this.store.load(); }
}
