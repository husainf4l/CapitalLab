import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TestResult } from '../../../core/models/result.models';

@Component({
  selector: 'result-review-table',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="table-wrap">
      <table class="results-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Reference Range</th>
            <th>Status</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          @for (result of results(); track result.id) {
            <tr [class.critical]="result.interpretation === 'critical'"
                [class.abnormal]="result.interpretation === 'high' || result.interpretation === 'low'">
              <td><strong>{{ result.testName }}</strong></td>
              <td class="value-cell">{{ result.value || '—' }}</td>
              <td class="unit-cell">{{ result.unit || '—' }}</td>
              <td class="ref-cell">{{ result.referenceRange || '—' }}</td>
              <td>
                @if (result.interpretation) {
                  <span class="interp-badge" [class]="result.interpretation">
                    {{ result.interpretation | titlecase }}
                  </span>
                } @else {
                  <span class="na">—</span>
                }
              </td>
              <td>
                @if (result.interpretation === 'high') {
                  <mat-icon class="trend-up">trending_up</mat-icon>
                } @else if (result.interpretation === 'low') {
                  <mat-icon class="trend-down">trending_down</mat-icon>
                } @else if (result.interpretation === 'critical') {
                  <mat-icon class="trend-critical">priority_high</mat-icon>
                } @else {
                  <mat-icon class="trend-normal">trending_flat</mat-icon>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .table-wrap { overflow-x: auto; border-radius: $border-radius; border: 1px solid $border-color; }
    .results-table { width: 100%; border-collapse: collapse; font-size: 0.875rem;
      th { background: $gray-50; padding: 10px 14px; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: $text-secondary; border-bottom: 1px solid $border-color; }
      td { padding: 11px 14px; border-bottom: 1px solid $gray-100; vertical-align: middle; }
      tr:last-child td { border-bottom: none; }
      tr.critical td { background: #fff5f5; }
      tr.abnormal td { background: #fffbeb; }
      tr:hover td { background: $gray-50; }
    }
    .value-cell { font-weight: 700; font-size: 1rem; }
    .unit-cell, .ref-cell { font-size: 0.8rem; color: $text-secondary; }
    .na { color: $gray-400; }
    .interp-badge { padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600;
      &.normal   { background: #dcfce7; color: #166534; }
      &.high     { background: #fef3c7; color: #92400e; }
      &.low      { background: #dbeafe; color: #1e40af; }
      &.critical { background: #7f1d1d; color: white; }
    }
    .trend-up       { color: #dc2626; font-size: 20px; }
    .trend-down     { color: #2563eb; font-size: 20px; }
    .trend-critical { color: #7f1d1d; font-size: 20px; }
    .trend-normal   { color: #16a34a; font-size: 20px; }
  `]
})
export class ResultReviewTableComponent {
  results = input.required<TestResult[]>();
}
