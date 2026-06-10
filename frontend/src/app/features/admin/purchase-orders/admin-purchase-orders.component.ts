import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PurchaseOrderStore } from '../stores/purchase-order.store';

@Component({
  selector: 'app-admin-purchase-orders',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>Purchase Orders</h2><p class="sub">Procurement &amp; receiving</p></div>
        <button mat-raised-button color="primary" (click)="openCreate()"><mat-icon>add</mat-icon> New Order</button>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [ngModel]="store.filterStatus()" (ngModelChange)="store.filterStatus.set($event); store.load()">
            <mat-option value="">All</mat-option>
            <mat-option value="Draft">Draft</mat-option><mat-option value="Submitted">Submitted</mat-option>
            <mat-option value="Approved">Approved</mat-option><mat-option value="Received">Received</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (store.isLoading()) {
        <div class="loading">@for (i of [1,2,3]; track i) { <div class="skel"></div> }</div>
      } @else if (store.orders().length === 0) {
        <div class="empty"><mat-icon>shopping_cart</mat-icon><p>No purchase orders</p></div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Order #</th><th>Supplier</th><th>Total</th><th>Status</th><th>Ordered</th><th>Actions</th></tr></thead>
            <tbody>
              @for (po of store.orders(); track po.id) {
                <tr>
                  <td class="mono">{{ po.orderNumber }}</td>
                  <td>{{ po.supplierName }}</td>
                  <td>{{ po.totalAmount | currency:'SAR ':'symbol':'1.0-0' }}</td>
                  <td><span class="badge" [class]="po.status.toLowerCase()">{{ po.status }}</span></td>
                  <td>{{ po.orderedAt ? (po.orderedAt | date:'dd MMM yyyy') : '—' }}</td>
                  <td>
                    <div class="actions">
                      @if (po.status === 'Draft') { <button mat-stroked-button class="btn-sm" [disabled]="store.isActing() === po.id" (click)="store.submit(po.id)">Submit</button> }
                      @if (po.status === 'Submitted') { <button mat-stroked-button class="btn-sm" color="primary" [disabled]="store.isActing() === po.id" (click)="store.approve(po.id)">Approve</button> }
                      @if (po.status === 'Approved') { <button mat-stroked-button class="btn-sm" color="accent" [disabled]="store.isActing() === po.id" (click)="store.receive(po.id)">Receive</button> }
                      @if (po.status !== 'Received' && po.status !== 'Cancelled') { <button mat-icon-button class="cancel" (click)="store.cancel(po.id)"><mat-icon>close</mat-icon></button> }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showCreate()) {
        <div class="backdrop" (click)="showCreate.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>New Purchase Order</h3>
            <div class="form-row">
              <mat-form-field appearance="outline"><mat-label>Branch ID</mat-label><input matInput [(ngModel)]="branchId" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Supplier</mat-label><input matInput [(ngModel)]="supplierName" /></mat-form-field>
            </div>
            <h4>Items</h4>
            @for (line of lines; track $index) {
              <div class="line-row">
                <mat-form-field appearance="outline"><mat-label>Item ID</mat-label><input matInput [(ngModel)]="line.inventoryItemId" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Qty</mat-label><input matInput type="number" [(ngModel)]="line.quantity" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Unit Cost</mat-label><input matInput type="number" [(ngModel)]="line.unitCost" /></mat-form-field>
                <button mat-icon-button (click)="removeLine($index)"><mat-icon>delete</mat-icon></button>
              </div>
            }
            <button mat-stroked-button class="add-line" (click)="addLine()"><mat-icon>add</mat-icon> Add Line</button>
            <div class="modal-actions">
              <button mat-stroked-button (click)="showCreate.set(false)">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="!canCreate() || store.isActing() === 'create'" (click)="create()">Create Draft</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; h2 { margin: 0 0 2px; } .sub { margin: 0; color: $text-secondary; font-size: 0.85rem; } }
    .filters { margin-bottom: 16px; }
    .loading { display: flex; flex-direction: column; gap: 8px; } .skel { height: 56px; border-radius: $border-radius; background: linear-gradient(90deg,$gray-100 25%,$gray-200 50%,$gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: $text-secondary; mat-icon { font-size: 44px; opacity: 0.3; margin-bottom: 8px; } }
    .table-wrap { overflow-x: auto; background: white; border: 1px solid $border-color; border-radius: $border-radius; box-shadow: $shadow-sm; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { background: $gray-50; padding: 10px 14px; text-align: left; font-size: 0.72rem; text-transform: uppercase; color: $text-secondary; border-bottom: 1px solid $border-color; } td { padding: 11px 14px; border-bottom: 1px solid $gray-100; } tr:last-child td { border-bottom: none; } }
    .mono { font-family: monospace; font-size: 0.8rem; }
    .badge { padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600;
      &.draft { background: $gray-100; color: $gray-700; } &.submitted { background: #fef3c7; color: #92400e; }
      &.approved { background: #dbeafe; color: #1e40af; } &.received { background: #dcfce7; color: #166534; } &.cancelled { background: #fee2e2; color: #991b1b; } }
    .actions { display: flex; align-items: center; gap: 4px; } .btn-sm { font-size: 0.75rem; padding: 2px 10px; line-height: 1.6; } .cancel mat-icon { font-size: 18px; color: $danger; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal { background: white; border-radius: $border-radius-lg; padding: 24px; width: 640px; max-width: 100%; max-height: 90vh; overflow-y: auto; h3 { margin: 0 0 16px; } h4 { margin: 8px 0; font-size: 0.85rem; color: $text-secondary; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .line-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 8px; align-items: center; }
    .add-line { margin-bottom: 12px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
  `]
})
export class AdminPurchaseOrdersComponent implements OnInit {
  store = inject(PurchaseOrderStore);
  showCreate = signal(false);
  branchId = '';
  supplierName = '';
  lines: { inventoryItemId: string; quantity: number; unitCost: number }[] = [];

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.branchId = ''; this.supplierName = ''; this.lines = [{ inventoryItemId: '', quantity: 1, unitCost: 0 }]; this.showCreate.set(true); }
  addLine(): void { this.lines.push({ inventoryItemId: '', quantity: 1, unitCost: 0 }); }
  removeLine(i: number): void { this.lines.splice(i, 1); }
  canCreate(): boolean { return !!this.branchId && !!this.supplierName && this.lines.length > 0 && this.lines.every(l => l.inventoryItemId && l.quantity > 0); }

  async create(): Promise<void> {
    const ok = await this.store.create({ branchId: this.branchId, supplierName: this.supplierName, currency: 'SAR', items: this.lines });
    if (ok) this.showCreate.set(false);
  }
}
