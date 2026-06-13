import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'card' | 'table' | 'list' | 'dashboard';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant()) {
      @case ('card') {
        <div class="skel-grid">
          @for (i of rows(); track i) {
            <div class="skel-card">
              <div class="skel skel-icon"></div>
              <div class="skel-body">
                <div class="skel skel-title"></div>
                <div class="skel skel-sub"></div>
              </div>
            </div>
          }
        </div>
      }
      @case ('table') {
        <div class="skel-table">
          <div class="skel skel-header"></div>
          @for (i of rows(); track i) {
            <div class="skel skel-row"></div>
          }
        </div>
      }
      @case ('list') {
        <div class="skel-list">
          @for (i of rows(); track i) {
            <div class="skel skel-list-item"></div>
          }
        </div>
      }
      @case ('dashboard') {
        <div class="skel-dashboard">
          <div class="skel-kpi-row">
            @for (i of [1,2,3,4]; track i) { <div class="skel skel-kpi"></div> }
          </div>
          <div class="skel-content-row">
            <div class="skel skel-chart"></div>
            <div class="skel skel-panel"></div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }

    .skel {
      background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: $border-radius;
    }

    /* Card variant */
    .skel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .skel-card { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 20px; display: flex; align-items: center; gap: 14px; }
    .skel-icon { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; }
    .skel-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .skel-title { height: 14px; width: 60%; }
    .skel-sub   { height: 11px; width: 40%; }

    /* Table variant */
    .skel-table { display: flex; flex-direction: column; gap: 2px; background: white; border: 1px solid $border-color; border-radius: $border-radius; overflow: hidden; padding: 0; }
    .skel-header { height: 40px; border-radius: 0; background: $gray-50; border-bottom: 1px solid $border-color; }
    .skel-row { height: 52px; border-radius: 0; border-bottom: 1px solid $gray-50; }

    /* List variant */
    .skel-list { display: flex; flex-direction: column; gap: 10px; }
    .skel-list-item { height: 64px; }

    /* Dashboard variant */
    .skel-dashboard { display: flex; flex-direction: column; gap: 20px; }
    .skel-kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; @media (max-width: 700px) { grid-template-columns: repeat(2,1fr); } }
    .skel-kpi { height: 88px; }
    .skel-content-row { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .skel-chart { height: 260px; }
    .skel-panel { height: 260px; }
  `]
})
export class AppSkeletonComponent {
  variant = input<SkeletonVariant>('list');
  count   = input<number>(5);
  rows    = () => Array.from({ length: this.count() }, (_, i) => i + 1);
}
