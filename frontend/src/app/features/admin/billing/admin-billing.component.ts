import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BillingStore } from '../stores/billing.store';
import { InvoiceSummary } from '../../../core/models/billing.models';

@Component({
  selector: 'app-admin-billing',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>Invoices</h2><p class="sub">Billing &amp; invoicing</p></div>
        <button mat-raised-button color="primary" (click)="openCreate()"><mat-icon>add</mat-icon> New Invoice</button>
      </div>

      <div class="layout">
        <div class="list-col">
          <div class="filters">
            <mat-form-field appearance="outline" class="flex-field"><mat-label>Search</mat-label><mat-icon matPrefix>search</mat-icon>
              <input matInput [ngModel]="store.searchTerm()" (ngModelChange)="store.searchTerm.set($event); store.load()" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Status</mat-label>
              <mat-select [ngModel]="store.filterStatus()" (ngModelChange)="store.filterStatus.set($event); store.load()">
                <mat-option value="">All</mat-option><mat-option value="Issued">Issued</mat-option>
                <mat-option value="PartiallyPaid">Partial</mat-option><mat-option value="Paid">Paid</mat-option>
                <mat-option value="Overdue">Overdue</mat-option><mat-option value="Cancelled">Cancelled</mat-option>
              </mat-select></mat-form-field>
          </div>

          @if (store.isLoading()) {
            <div class="loading">@for (i of [1,2,3,4]; track i) { <div class="skel"></div> }</div>
          } @else if (store.invoices().length === 0) {
            <div class="empty"><mat-icon>receipt_long</mat-icon><p>No invoices</p></div>
          } @else {
            <div class="inv-list">
              @for (inv of store.invoices(); track inv.id) {
                <div class="inv-item" [class.selected]="store.selectedInvoice()?.id === inv.id" (click)="store.select(inv)">
                  <div class="inv-top"><span class="mono">{{ inv.invoiceNumber }}</span><span class="badge" [class]="inv.status.toLowerCase()">{{ inv.status }}</span></div>
                  <div class="inv-amt">{{ inv.totalAmount | currency:'SAR ':'symbol':'1.0-0' }}</div>
                  <div class="inv-bal">Balance: {{ inv.balanceAmount | currency:'SAR ':'symbol':'1.0-0' }}</div>
                </div>
              }
            </div>
          }
        </div>

        <div class="detail-col">
          @if (!store.selectedInvoice()) {
            <div class="no-sel"><mat-icon>receipt_long</mat-icon><p>Select an invoice</p></div>
          } @else {
            <div class="detail">
              <div class="detail-head">
                <div><h3>{{ store.selectedInvoice()!.invoiceNumber }}</h3><span class="badge" [class]="store.selectedInvoice()!.status.toLowerCase()">{{ store.selectedInvoice()!.status }}</span></div>
                <button mat-icon-button (click)="store.clearSelection()"><mat-icon>close</mat-icon></button>
              </div>
              <table class="items-table">
                <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
                <tbody>
                  @for (it of store.selectedInvoice()!.items; track it.id) {
                    <tr><td>{{ it.description }}</td><td>{{ it.quantity }}</td><td>{{ it.unitPrice | currency:'SAR ':'symbol':'1.2-2' }}</td><td>{{ it.totalPrice | currency:'SAR ':'symbol':'1.2-2' }}</td></tr>
                  }
                </tbody>
              </table>
              <div class="totals">
                <div><span>Subtotal</span><span>{{ store.selectedInvoice()!.subtotalAmount | currency:'SAR ':'symbol':'1.2-2' }}</span></div>
                <div><span>Discount</span><span>−{{ store.selectedInvoice()!.discountAmount | currency:'SAR ':'symbol':'1.2-2' }}</span></div>
                <div><span>Tax</span><span>{{ store.selectedInvoice()!.taxAmount | currency:'SAR ':'symbol':'1.2-2' }}</span></div>
                <div class="grand"><span>Total</span><span>{{ store.selectedInvoice()!.totalAmount | currency:'SAR ':'symbol':'1.2-2' }}</span></div>
                <div class="paid"><span>Paid</span><span>{{ store.selectedInvoice()!.paidAmount | currency:'SAR ':'symbol':'1.2-2' }}</span></div>
                <div class="bal"><span>Balance</span><span>{{ store.selectedInvoice()!.balanceAmount | currency:'SAR ':'symbol':'1.2-2' }}</span></div>
              </div>
              <div class="detail-actions">
                @if (store.selectedInvoice()!.status !== 'Cancelled' && store.selectedInvoice()!.status !== 'Paid') {
                  <button mat-stroked-button color="warn" (click)="store.cancel(store.selectedInvoice()!.id)"><mat-icon>block</mat-icon> Cancel</button>
                }
                @if (store.selectedInvoice()!.status === 'Paid' || store.selectedInvoice()!.status === 'PartiallyPaid') {
                  <button mat-stroked-button (click)="store.refund(store.selectedInvoice()!.id)"><mat-icon>undo</mat-icon> Refund</button>
                }
              </div>
            </div>
          }
        </div>
      </div>

      @if (showCreate()) {
        <div class="backdrop" (click)="showCreate.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>New Invoice</h3>
            <div class="form-row">
              <mat-form-field appearance="outline"><mat-label>Patient ID</mat-label><input matInput [(ngModel)]="patientId" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Branch ID</mat-label><input matInput [(ngModel)]="branchId" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Tax</mat-label><input matInput type="number" [(ngModel)]="tax" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Discount</mat-label><input matInput type="number" [(ngModel)]="discount" /></mat-form-field>
            </div>
            <h4>Line Items</h4>
            @for (line of lines; track $index) {
              <div class="line-row">
                <mat-form-field appearance="outline"><mat-label>Description</mat-label><input matInput [(ngModel)]="line.description" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Qty</mat-label><input matInput type="number" [(ngModel)]="line.quantity" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Price</mat-label><input matInput type="number" [(ngModel)]="line.unitPrice" /></mat-form-field>
                <button mat-icon-button (click)="removeLine($index)"><mat-icon>delete</mat-icon></button>
              </div>
            }
            <button mat-stroked-button class="add-line" (click)="addLine()"><mat-icon>add</mat-icon> Add Line</button>
            <div class="modal-actions">
              <button mat-stroked-button (click)="showCreate.set(false)">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="!canCreate() || store.isActing() === 'create'" (click)="create()">Create &amp; Issue</button>
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
    .layout { display: grid; grid-template-columns: 360px 1fr; gap: 20px; @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .filters { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; .flex-field { flex: 1; min-width: 140px; } }
    .loading { display: flex; flex-direction: column; gap: 8px; } .skel { height: 64px; border-radius: $border-radius; background: linear-gradient(90deg,$gray-100 25%,$gray-200 50%,$gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty, .no-sel { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: $text-secondary; mat-icon { font-size: 44px; opacity: 0.3; margin-bottom: 8px; } }
    .inv-list { display: flex; flex-direction: column; gap: 6px; }
    .inv-item { padding: 12px 14px; background: white; border: 1px solid $border-color; border-radius: $border-radius; cursor: pointer; &:hover { border-color: #0f766e; } &.selected { border-color: #0f766e; background: #f0fdfa; } }
    .inv-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; } .mono { font-family: monospace; font-size: 0.78rem; color: $text-secondary; }
    .inv-amt { font-weight: 700; } .inv-bal { font-size: 0.75rem; color: $text-secondary; }
    .badge { padding: 2px 8px; border-radius: 999px; font-size: 0.68rem; font-weight: 600;
      &.issued { background: #dbeafe; color: #1e40af; } &.partiallypaid { background: #fef3c7; color: #92400e; } &.paid { background: #dcfce7; color: #166534; }
      &.overdue { background: #fee2e2; color: #991b1b; } &.cancelled { background: $gray-100; color: $gray-600; } &.refunded { background: #f3e8ff; color: #6b21a8; } &.draft { background: $gray-100; color: $gray-700; } }
    .detail-col { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 20px; }
    .detail-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; h3 { margin: 0 0 6px; } }
    .items-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 16px; th { text-align: left; padding: 6px 8px; font-size: 0.7rem; text-transform: uppercase; color: $text-secondary; border-bottom: 1px solid $border-color; } td { padding: 8px; border-bottom: 1px solid $gray-100; } }
    .totals { font-size: 0.85rem; div { display: flex; justify-content: space-between; padding: 3px 0; } .grand { font-weight: 700; border-top: 1px solid $border-color; padding-top: 8px; margin-top: 4px; } .paid { color: $success; } .bal { font-weight: 700; color: $danger; } }
    .detail-actions { display: flex; gap: 10px; margin-top: 16px; padding-top: 16px; border-top: 1px solid $border-color; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal { background: white; border-radius: $border-radius-lg; padding: 24px; width: 660px; max-width: 100%; max-height: 90vh; overflow-y: auto; h3 { margin: 0 0 16px; } h4 { margin: 8px 0; font-size: 0.85rem; color: $text-secondary; } }
    .form-row { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
    .line-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 8px; align-items: center; }
    .add-line { margin-bottom: 12px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
  `]
})
export class AdminBillingComponent implements OnInit {
  store = inject(BillingStore);
  showCreate = signal(false);
  patientId = ''; branchId = ''; tax = 0; discount = 0;
  lines: { description: string; quantity: number; unitPrice: number }[] = [];

  ngOnInit(): void { this.store.load(); }

  openCreate(): void { this.patientId = ''; this.branchId = ''; this.tax = 0; this.discount = 0; this.lines = [{ description: '', quantity: 1, unitPrice: 0 }]; this.showCreate.set(true); }
  addLine(): void { this.lines.push({ description: '', quantity: 1, unitPrice: 0 }); }
  removeLine(i: number): void { this.lines.splice(i, 1); }
  canCreate(): boolean { return !!this.patientId && !!this.branchId && this.lines.length > 0 && this.lines.every(l => l.description && l.quantity > 0); }

  async create(): Promise<void> {
    const ok = await this.store.create({
      patientId: this.patientId, branchId: this.branchId, currency: 'SAR', taxAmount: this.tax, discountAmount: this.discount,
      items: this.lines.map(l => ({ description: l.description, itemType: 'Service' as const, quantity: l.quantity, unitPrice: l.unitPrice, discountAmount: 0 })),
    });
    if (ok) this.showCreate.set(false);
  }
}
