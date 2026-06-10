import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { LabOrdersStore } from '../stores/lab-orders.store';
import { LabStatusBadgeComponent } from '../shared/lab-status-badge.component';
import { TestOrder } from '../../../core/models/order.models';

@Component({
  selector: 'app-lab-orders',
  standalone: true,
  imports: [
    FormsModule, CommonModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatInputModule, LabStatusBadgeComponent
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Test Orders</h2>
        <button mat-icon-button (click)="store.load()"><mat-icon>refresh</mat-icon></button>
      </div>

      <div class="layout">
        <!-- Left: orders list -->
        <div class="orders-panel">
          <div class="filters-bar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [ngModel]="store.searchTerm()" (ngModelChange)="store.searchTerm.set($event); store.load()" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [ngModel]="store.filterStatus()" (ngModelChange)="store.filterStatus.set($event); store.load()">
                <mat-option value="">All</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="processing">Processing</mat-option>
                <mat-option value="sample_collected">Collected</mat-option>
                <mat-option value="completed">Completed</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (store.isLoading()) {
            <div class="loading-rows">
              @for (i of [1,2,3,4,5]; track i) { <div class="skel-row"></div> }
            </div>
          } @else if (store.orders().length === 0) {
            <div class="empty-state"><mat-icon>assignment_late</mat-icon><p>No orders found</p></div>
          } @else {
            <div class="order-list">
              @for (order of store.orders(); track order.id) {
                <div class="order-item" [class.selected]="store.selectedOrder()?.id === order.id" (click)="store.selectOrder(order)">
                  <div class="order-id">#{{ order.orderNumber || order.id.slice(0, 8) }}</div>
                  <div class="order-patient">{{ order.patientName || '—' }}</div>
                  <div class="order-meta">
                    <span>{{ order.createdAt | date:'dd MMM' }}</span>
                    <lab-status-badge [status]="order.status" />
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Right: order detail -->
        <div class="detail-panel">
          @if (!store.selectedOrder()) {
            <div class="no-selection">
              <mat-icon>touch_app</mat-icon>
              <p>Select an order to view details</p>
            </div>
          } @else {
            <div class="order-detail">
              <div class="detail-header">
                <div>
                  <h3>Order #{{ store.selectedOrder()!.orderNumber || store.selectedOrder()!.id.slice(0, 8) }}</h3>
                  <div class="detail-sub">{{ store.selectedOrder()!.createdAt | date:'fullDate' }}</div>
                </div>
                <div class="detail-status"><lab-status-badge [status]="store.selectedOrder()!.status" /></div>
              </div>

              <div class="info-grid">
                <div class="info-item"><label>Patient</label><span>{{ store.selectedOrder()!.patientName || '—' }}</span></div>
                <div class="info-item"><label>Branch</label><span>{{ store.selectedOrder()!.branchName || '—' }}</span></div>
                <div class="info-item"><label>Tests</label><span>{{ store.selectedOrder()!.tests?.length ?? 0 }} test(s)</span></div>
                <div class="info-item"><label>Total</label><span>{{ store.selectedOrder()!.totalAmount | currency:'SAR ':'symbol':'1.0-0' }}</span></div>
              </div>

              <!-- Tests list with create sample -->
              <h4>Tests</h4>
              @if (store.selectedOrder()!.tests?.length) {
                <div class="tests-list">
                  @for (test of store.selectedOrder()!.tests; track test.testId) {
                    <div class="test-row">
                      <div class="test-info">
                        <strong>{{ test.testName }}</strong>
                        <span>{{ test.testCode }}</span>
                      </div>
                      <button mat-stroked-button class="btn-sm" [disabled]="store.isCreatingSample()" (click)="createSample(store.selectedOrder()!, test.testId)">
                        <mat-icon>add</mat-icon> Create Sample
                      </button>
                    </div>
                  }
                </div>
              }

              <!-- Existing samples -->
              @if (store.orderSamples().length > 0) {
                <h4>Samples</h4>
                <div class="samples-list">
                  @for (sample of store.orderSamples(); track sample.id) {
                    <div class="sample-row">
                      <mat-icon class="s-icon">science</mat-icon>
                      <div class="s-info">
                        <strong>{{ sample.sampleNumber || sample.id.slice(0, 8) }}</strong>
                        <span>{{ sample.sampleType }}</span>
                      </div>
                      <lab-status-badge [status]="sample.status" />
                    </div>
                  }
                </div>
              }

              @if (createSuccess()) {
                <div class="success-banner"><mat-icon>check_circle</mat-icon> Sample created successfully</div>
              }
              @if (createError()) {
                <div class="error-banner"><mat-icon>error</mat-icon> Failed to create sample</div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;

    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h2 { margin: 0; } }

    .layout { display: grid; grid-template-columns: 380px 1fr; gap: 20px;
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .filters-bar { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;
      .search-field { flex: 1; min-width: 160px; }
      mat-form-field { min-width: 120px; }
    }

    .loading-rows { display: flex; flex-direction: column; gap: 8px; }
    .skel-row { height: 64px; border-radius: $border-radius; background: linear-gradient(90deg, $gray-100 25%, $gray-200 50%, $gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 40px 0; color: $text-secondary;
      mat-icon { font-size: 40px; opacity: 0.4; margin-bottom: 8px; }
    }

    .order-list { display: flex; flex-direction: column; gap: 6px; }
    .order-item { padding: 12px 14px; border-radius: $border-radius; border: 1px solid $border-color; cursor: pointer; background: white; transition: all 0.15s;
      &:hover { border-color: $primary; }
      &.selected { border-color: $primary; background: #eff6ff; }
    }
    .order-id { font-size: 0.78rem; color: $text-secondary; font-family: monospace; }
    .order-patient { font-weight: 600; font-size: 0.875rem; margin: 2px 0; }
    .order-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 0.78rem; color: $text-secondary; }

    .detail-panel { background: white; border-radius: $border-radius; border: 1px solid $border-color; padding: 24px; min-height: 300px; }
    .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: $text-secondary;
      mat-icon { font-size: 48px; opacity: 0.3; margin-bottom: 8px; }
    }
    .order-detail { }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
      h3 { margin: 0 0 4px; }
      .detail-sub { font-size: 0.8rem; color: $text-secondary; }
    }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
    .info-item { label { display: block; font-size: 0.75rem; color: $text-secondary; margin-bottom: 2px; } span { font-weight: 500; } }

    h4 { font-size: 0.875rem; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 10px; }

    .tests-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .test-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid $border-color; border-radius: $border-radius; }
    .test-info { strong { display: block; font-size: 0.875rem; } span { font-size: 0.78rem; color: $text-secondary; } }
    .btn-sm { font-size: 0.78rem; padding: 2px 10px; }

    .samples-list { display: flex; flex-direction: column; gap: 6px; }
    .sample-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: $gray-50; border-radius: $border-radius; }
    .s-icon { color: $text-secondary; font-size: 18px; }
    .s-info { flex: 1; strong { display: block; font-size: 0.875rem; } span { font-size: 0.78rem; color: $text-secondary; } }

    .success-banner { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #dcfce7; color: #166534; border-radius: $border-radius; margin-top: 12px; font-size: 0.875rem; }
    .error-banner { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: #fee2e2; color: #991b1b; border-radius: $border-radius; margin-top: 12px; font-size: 0.875rem; }
  `]
})
export class LabOrdersComponent implements OnInit {
  store = inject(LabOrdersStore);
  createSuccess = signal(false);
  createError = signal(false);

  ngOnInit(): void {
    this.store.load();
  }

  async createSample(order: TestOrder, testId: string): Promise<void> {
    const result = await this.store.createSample(order.id, testId, order.patientId, 'blood');
    if (result) {
      this.createSuccess.set(true);
      setTimeout(() => this.createSuccess.set(false), 3000);
    } else {
      this.createError.set(true);
      setTimeout(() => this.createError.set(false), 3000);
    }
  }
}
