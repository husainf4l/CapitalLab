import { Injectable, inject, signal, computed } from '@angular/core';
import { ResultApiService } from '../../../core/api/result-api.service';
import { TestResult } from '../../../core/models/result.models';

export interface TrackerMetric {
  id: string;
  name: string;
  icon: string;
  unit: string;
  normalRange: string;
  color: string;
  codes: string[];
}

export const TRACKER_METRICS: TrackerMetric[] = [
  { id: 'vit-d', name: 'Vitamin D', icon: '☀️', unit: 'ng/mL', normalRange: '30–100', color: '#f59e0b', codes: ['VITD', 'VIT-D', 'VITAMIN_D'] },
  { id: 'hba1c', name: 'HbA1c', icon: '🩸', unit: '%', normalRange: '< 5.7', color: '#ef4444', codes: ['HBA1C', 'HB_A1C', 'GLYCATED_HGB'] },
  { id: 'chol', name: 'Cholesterol', icon: '❤️', unit: 'mg/dL', normalRange: '< 200', color: '#3b82f6', codes: ['CHOL', 'CHOLESTEROL', 'TOTAL_CHOL'] },
  { id: 'tsh', name: 'TSH', icon: '🦋', unit: 'µIU/mL', normalRange: '0.5–4.5', color: '#8b5cf6', codes: ['TSH', 'THYROID_TSH'] },
  { id: 'fbs', name: 'Fasting Glucose', icon: '💉', unit: 'mg/dL', normalRange: '70–100', color: '#10b981', codes: ['FBS', 'GLU', 'GLUCOSE', 'FASTING_BLOOD_SUGAR'] },
  { id: 'cbc', name: 'Hemoglobin', icon: '🔬', unit: 'g/dL', normalRange: '12–17', color: '#06b6d4', codes: ['HGB', 'HB', 'HEMOGLOBIN'] },
];

@Injectable({ providedIn: 'root' })
export class HealthTrackerStore {
  private resultApi = inject(ResultApiService);

  readonly results = signal<TestResult[]>([]);
  readonly isLoading = signal(false);
  readonly selectedMetricId = signal(TRACKER_METRICS[0].id);

  readonly metrics = TRACKER_METRICS;

  readonly selectedMetric = computed(() =>
    TRACKER_METRICS.find(m => m.id === this.selectedMetricId()) ?? TRACKER_METRICS[0]
  );

  readonly resultsForSelected = computed(() => {
    const metric = this.selectedMetric();
    return this.results()
      .filter(r => {
        const code = (r.testCode ?? '').toUpperCase();
        const name = (r.testName ?? '').toLowerCase();
        return metric.codes.some(c => code === c) || name.includes(metric.name.toLowerCase());
      })
      .sort((a, b) =>
        new Date(a.performedAt ?? '').getTime() - new Date(b.performedAt ?? '').getTime()
      );
  });

  readonly latestResult = computed(() => {
    const list = this.resultsForSelected();
    return list.length > 0 ? list[list.length - 1] : null;
  });

  readonly chartPoints = computed(() => {
    const list = this.resultsForSelected();
    if (list.length === 0) return [];
    const values = list.map(r => parseFloat(r.value ?? '0')).filter(v => !isNaN(v));
    const max = Math.max(...values, 1);
    return list.map((r, i) => ({
      x: (i / Math.max(list.length - 1, 1)) * 100,
      y: 100 - ((parseFloat(r.value ?? '0') / max) * 80 + 10),
      value: r.value,
      date: r.performedAt,
    }));
  });

  loadResults(): void {
    this.isLoading.set(true);
    this.resultApi.getMyResults().subscribe({
      next: res => {
        this.results.set(res.data?.items ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectMetric(id: string): void {
    this.selectedMetricId.set(id);
  }
}
