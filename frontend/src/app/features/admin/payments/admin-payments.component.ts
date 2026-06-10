import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PaymentStore } from '../stores/payment.store';
import { PaymentMethod } from '../../../core/models/billing.models';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>Payments</h2><p class="sub">Payment records &amp; history</p></div>
        <button mat-raised-button color="primary" (click)="openRecord()"><mat-icon>add</mat-icon> Record Payment</button>
      </div>

      @if (store.isLoading()) {
        <div class="loading">@for (i of [1,2,3,4]; track i) { <div class="skel"></div> }</div>
      } @else if (store.payments().length === 0) {
        <div class="empty"><mat-icon>payments</mat-icon><p>No payments recorded</p></div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th><th></th></tr></thead>
            <tbody>
              @for (p of store.payments(); track p.id) {
                <tr>
                  <td>{{ p.paidAt ? (p.paidAt | date:'dd MMM yyyy HH:mm') : '—' }}</td>
                  <td class="mono">{{ p.invoiceId.slice(0, 8) }}</td>
                  <td class="amt">{{ p.amount | currency:'SAR ':'symbol':'1.2-2' }}</td>
                  <td><span class="method">{{ p.method }}</span></td>
                  <td><span class="badge" [class]="p.status.toLowerCase()">{{ p.status }}</span></td>
                  <td>{{ p.transactionReference || '—' }}</td>
                  <td>@if (p.status === 'Completed') { <button mat-stroked-button class="btn-sm" [disabled]="store.isActing() === p.id" (click)="store.refund(p.id)">Refund</button> }</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showRecord()) {
        <div class="backdrop" (click)="showRecord.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Record Payment</h3>
            <mat-form-field appearance="outline" class="full"><mat-label>Invoice ID</mat-label><input matInput [(ngModel)]="invoiceId" /></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Amount</mat-label><input matInput type="number" [(ngModel)]="amount" /></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Method</mat-label>
              <mat-select [(ngModel)]="method">
                <mat-option value="Cash">Cash</mat-option><mat-option value="Card">Card</mat-option>
                <mat-option value="BankTransfer">Bank Transfer</mat-option><mat-option value="CliQ">CliQ</mat-option>
                <mat-option value="Insurance">Insurance</mat-option><mat-option value="Online">Online</mat-option>
              </mat-select></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Reference</mat-label><input matInput [(ngModel)]="reference" /></mat-form-field>
            <div class="modal-actions">
              <button mat-stroked-button (click)="showRecord.set(false)">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="!invoiceId || !amount || store.isActing() === 'record'" (click)="record()">Record</button>
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
    .loading { display: flex; flex-direction: column; gap: 8px; } .skel { height: 52px; border-radius: $border-radius; background: linear-gradient(90deg,$gray-100 25%,$gray-200 50%,$gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: $text-secondary; mat-icon { font-size: 44px; opacity: 0.3; margin-bottom: 8px; } }
    .table-wrap { overflow-x: auto; background: white; border: 1px solid $border-color; border-radius: $border-radius; box-shadow: $shadow-sm; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { background: $gray-50; padding: 10px 14px; text-align: left; font-size: 0.72rem; text-transform: uppercase; color: $text-secondary; border-bottom: 1px solid $border-color; } td { padding: 11px 14px; border-bottom: 1px solid $gray-100; } tr:last-child td { border-bottom: none; } }
    .mono { font-family: monospace; font-size: 0.8rem; } .amt { font-weight: 700; } .method { background: $gray-100; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; }
    .badge { padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; &.completed { background: #dcfce7; color: #166534; } &.refunded { background: #f3e8ff; color: #6b21a8; } &.pending { background: #fef3c7; color: #92400e; } &.failed { background: #fee2e2; color: #991b1b; } &.cancelled { background: $gray-100; color: $gray-600; } }
    .btn-sm { font-size: 0.75rem; padding: 2px 10px; line-height: 1.6; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal { background: white; border-radius: $border-radius-lg; padding: 24px; width: 420px; max-width: 100%; h3 { margin: 0 0 16px; } }
    .full { width: 100%; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
  `]
})
export class AdminPaymentsComponent implements OnInit {
  store = inject(PaymentStore);
  showRecord = signal(false);
  invoiceId = ''; amount = 0; method: PaymentMethod = 'Cash'; reference = '';

  ngOnInit(): void { this.store.load(); }

  openRecord(): void { this.invoiceId = ''; this.amount = 0; this.method = 'Cash'; this.reference = ''; this.showRecord.set(true); }

  async record(): Promise<void> {
    const ok = await this.store.record({ invoiceId: this.invoiceId, amount: this.amount, method: this.method, transactionReference: this.reference || undefined });
    if (ok) this.showRecord.set(false);
  }
}
