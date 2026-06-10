import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { InventoryStore } from '../stores/inventory.store';
import { InventoryItem } from '../../../core/models/inventory.models';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>Inventory</h2><p class="sub">Stock management &amp; tracking</p></div>
        <button mat-raised-button color="primary" (click)="openCreate()"><mat-icon>add</mat-icon> Add Item</button>
      </div>

      <!-- KPI strip -->
      <div class="kpi-strip">
        <div class="kpi"><div class="kpi-ico" style="background:#ecfdf5;color:#059669"><mat-icon>account_balance_wallet</mat-icon></div>
          <div><div class="kpi-val">{{ store.totalValue() | currency:'SAR ':'symbol':'1.0-0' }}</div><div class="kpi-lbl">Inventory Value</div></div></div>
        <div class="kpi"><div class="kpi-ico" style="background:#fef2f2;color:#dc2626"><mat-icon>warning</mat-icon></div>
          <div><div class="kpi-val">{{ store.lowStockCount() }}</div><div class="kpi-lbl">Low Stock</div></div></div>
        <div class="kpi"><div class="kpi-ico" style="background:#fffbeb;color:#d97706"><mat-icon>schedule</mat-icon></div>
          <div><div class="kpi-val">{{ store.expiringCount() }}</div><div class="kpi-lbl">Expiring Soon</div></div></div>
        <div class="kpi"><div class="kpi-ico" style="background:#eff6ff;color:#2563eb"><mat-icon>inventory_2</mat-icon></div>
          <div><div class="kpi-val">{{ store.items().length }}</div><div class="kpi-lbl">Total Items</div></div></div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <mat-form-field appearance="outline" class="flex-field">
          <mat-label>Search</mat-label><mat-icon matPrefix>search</mat-icon>
          <input matInput [ngModel]="store.searchTerm()" (ngModelChange)="store.searchTerm.set($event); store.load()" />
        </mat-form-field>
        <button mat-stroked-button [class.active-filter]="store.filterLowStock()" (click)="toggleLowStock()">
          <mat-icon>warning</mat-icon> Low Stock Only
        </button>
      </div>

      @if (store.isLoading()) {
        <div class="loading">@for (i of [1,2,3,4,5]; track i) { <div class="skel"></div> }</div>
      } @else if (store.items().length === 0) {
        <div class="empty"><mat-icon>inventory_2</mat-icon><p>No inventory items</p></div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Item</th><th>Category</th><th>Stock</th><th>Cost</th><th>Value</th><th>Expiry</th><th>Actions</th></tr></thead>
            <tbody>
              @for (item of store.items(); track item.id) {
                <tr [class.low]="item.isLowStock">
                  <td><div class="item-name">{{ item.name }}</div><div class="item-code">{{ item.code }}</div></td>
                  <td>{{ item.category }}</td>
                  <td>
                    <span class="stock" [class.low-stock]="item.isLowStock">{{ item.currentStock }} {{ item.unit }}</span>
                    @if (item.isLowStock) { <span class="low-tag">LOW</span> }
                    <div class="min">min {{ item.minimumStock }}</div>
                  </td>
                  <td>{{ item.costPrice | currency:'SAR ':'symbol':'1.2-2' }}</td>
                  <td>{{ item.stockValue | currency:'SAR ':'symbol':'1.0-0' }}</td>
                  <td>{{ item.expiryDate ? (item.expiryDate | date:'dd MMM yyyy') : '—' }}</td>
                  <td>
                    <div class="actions">
                      <button mat-icon-button class="act-btn" title="Stock In" (click)="openMovement(item, 'in')"><mat-icon>add_box</mat-icon></button>
                      <button mat-icon-button class="act-btn" title="Stock Out" (click)="openMovement(item, 'out')"><mat-icon>indeterminate_check_box</mat-icon></button>
                      <button mat-icon-button class="act-btn" title="Adjust" (click)="openAdjust(item)"><mat-icon>tune</mat-icon></button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Create modal -->
      @if (showCreate()) {
        <div class="backdrop" (click)="showCreate.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Add Inventory Item</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline"><mat-label>Branch ID</mat-label><input matInput [(ngModel)]="form.branchId" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput [(ngModel)]="form.name" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Code</mat-label><input matInput [(ngModel)]="form.code" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Category</mat-label><input matInput [(ngModel)]="form.category" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Unit</mat-label><input matInput [(ngModel)]="form.unit" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Initial Stock</mat-label><input matInput type="number" [(ngModel)]="form.initialStock" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Minimum Stock</mat-label><input matInput type="number" [(ngModel)]="form.minimumStock" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Maximum Stock</mat-label><input matInput type="number" [(ngModel)]="form.maximumStock" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Cost Price</mat-label><input matInput type="number" [(ngModel)]="form.costPrice" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Supplier</mat-label><input matInput [(ngModel)]="form.supplierName" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Expiry Date</mat-label><input matInput type="date" [(ngModel)]="form.expiryDate" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Batch Number</mat-label><input matInput [(ngModel)]="form.batchNumber" /></mat-form-field>
            </div>
            <div class="modal-actions">
              <button mat-stroked-button (click)="showCreate.set(false)">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="store.isSaving()" (click)="save()">Save Item</button>
            </div>
          </div>
        </div>
      }

      <!-- Movement modal -->
      @if (movementItem()) {
        <div class="backdrop" (click)="movementItem.set(null)">
          <div class="modal sm" (click)="$event.stopPropagation()">
            <h3>{{ movementType() === 'in' ? 'Stock In' : 'Stock Out' }} — {{ movementItem()!.name }}</h3>
            <p class="cur">Current: {{ movementItem()!.currentStock }} {{ movementItem()!.unit }}</p>
            <mat-form-field appearance="outline" class="full"><mat-label>Quantity</mat-label><input matInput type="number" [(ngModel)]="mvQty" /></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Unit Cost</mat-label><input matInput type="number" [(ngModel)]="mvCost" /></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Reason / Reference</mat-label><input matInput [(ngModel)]="mvReason" /></mat-form-field>
            <div class="modal-actions">
              <button mat-stroked-button (click)="movementItem.set(null)">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="!mvQty || store.isSaving()" (click)="confirmMovement()">Confirm</button>
            </div>
          </div>
        </div>
      }

      <!-- Adjust modal -->
      @if (adjustItem()) {
        <div class="backdrop" (click)="adjustItem.set(null)">
          <div class="modal sm" (click)="$event.stopPropagation()">
            <h3>Adjust Stock — {{ adjustItem()!.name }}</h3>
            <p class="cur">Current: {{ adjustItem()!.currentStock }} {{ adjustItem()!.unit }}</p>
            <mat-form-field appearance="outline" class="full"><mat-label>New Quantity</mat-label><input matInput type="number" [(ngModel)]="adjQty" /></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Reason (required)</mat-label><input matInput [(ngModel)]="adjReason" /></mat-form-field>
            <div class="modal-actions">
              <button mat-stroked-button (click)="adjustItem.set(null)">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="!adjReason || store.isSaving()" (click)="confirmAdjust()">Adjust</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; h2 { margin: 0 0 2px; } .sub { margin: 0; color: $text-secondary; font-size: 0.85rem; } }
    .kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; @media (max-width: 800px) { grid-template-columns: repeat(2,1fr); } }
    .kpi { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: $shadow-sm; }
    .kpi-ico { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .kpi-val { font-size: 1.4rem; font-weight: 700; line-height: 1; } .kpi-lbl { font-size: 0.75rem; color: $text-secondary; margin-top: 2px; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; .flex-field { flex: 1; min-width: 220px; } }
    .active-filter { background: #fef2f2; color: $danger; border-color: #fca5a5; }
    .loading { display: flex; flex-direction: column; gap: 8px; } .skel { height: 56px; border-radius: $border-radius; background: linear-gradient(90deg,$gray-100 25%,$gray-200 50%,$gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: $text-secondary; mat-icon { font-size: 44px; opacity: 0.3; margin-bottom: 8px; } }
    .table-wrap { overflow-x: auto; background: white; border: 1px solid $border-color; border-radius: $border-radius; box-shadow: $shadow-sm; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem;
      th { background: $gray-50; padding: 10px 14px; text-align: left; font-size: 0.72rem; text-transform: uppercase; color: $text-secondary; border-bottom: 1px solid $border-color; }
      td { padding: 11px 14px; border-bottom: 1px solid $gray-100; } tr:last-child td { border-bottom: none; } tr.low td { background: #fffafa; }
    }
    .item-name { font-weight: 600; } .item-code { font-size: 0.75rem; color: $text-secondary; font-family: monospace; }
    .stock { font-weight: 600; } .low-stock { color: $danger; } .low-tag { background: #fee2e2; color: $danger; font-size: 0.62rem; font-weight: 700; padding: 1px 5px; border-radius: 4px; margin-left: 4px; } .min { font-size: 0.7rem; color: $text-secondary; }
    .actions { display: flex; gap: 2px; } .act-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; mat-icon { font-size: 18px; color: $text-secondary; } }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal { background: white; border-radius: $border-radius-lg; padding: 24px; width: 640px; max-width: 100%; max-height: 90vh; overflow-y: auto; h3 { margin: 0 0 16px; } &.sm { width: 400px; } }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .full { width: 100%; } .cur { margin: 0 0 12px; font-size: 0.85rem; color: $text-secondary; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
  `]
})
export class AdminInventoryComponent implements OnInit {
  store = inject(InventoryStore);
  showCreate = signal(false);
  movementItem = signal<InventoryItem | null>(null);
  movementType = signal<'in' | 'out'>('in');
  adjustItem = signal<InventoryItem | null>(null);

  form = this.emptyForm();
  mvQty = 0; mvCost = 0; mvReason = '';
  adjQty = 0; adjReason = '';

  ngOnInit(): void { this.store.loadDashboard(); }

  emptyForm() {
    return { branchId: '', name: '', code: '', category: '', unit: '', initialStock: 0, minimumStock: 0, maximumStock: 0, costPrice: 0, supplierName: '', expiryDate: '', batchNumber: '' };
  }

  toggleLowStock(): void { this.store.filterLowStock.set(!this.store.filterLowStock()); this.store.load(); }

  openCreate(): void { this.form = this.emptyForm(); this.showCreate.set(true); }

  async save(): Promise<void> {
    const ok = await this.store.create({
      ...this.form,
      expiryDate: this.form.expiryDate || undefined,
      supplierName: this.form.supplierName || undefined,
      batchNumber: this.form.batchNumber || undefined,
    });
    if (ok) this.showCreate.set(false);
  }

  openMovement(item: InventoryItem, type: 'in' | 'out'): void {
    this.movementItem.set(item); this.movementType.set(type);
    this.mvQty = 0; this.mvCost = item.costPrice; this.mvReason = '';
  }

  async confirmMovement(): Promise<void> {
    const item = this.movementItem(); if (!item) return;
    const data = { quantity: this.mvQty, unitCost: this.mvCost, reason: this.mvReason || undefined };
    const ok = this.movementType() === 'in' ? await this.store.stockIn(item.id, data) : await this.store.stockOut(item.id, data);
    if (ok) this.movementItem.set(null);
  }

  openAdjust(item: InventoryItem): void { this.adjustItem.set(item); this.adjQty = item.currentStock; this.adjReason = ''; }

  async confirmAdjust(): Promise<void> {
    const item = this.adjustItem(); if (!item) return;
    const ok = await this.store.adjust(item.id, this.adjQty, this.adjReason);
    if (ok) this.adjustItem.set(null);
  }
}
