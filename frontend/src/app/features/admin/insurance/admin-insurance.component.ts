import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { InsuranceStore } from '../stores/insurance.store';
import { InsuranceClaim } from '../../../core/models/insurance.models';

@Component({
  selector: 'app-admin-insurance',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h2>Insurance</h2><p class="sub">Providers &amp; claims</p></div>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="tab() === 'claims'" (click)="setTab('claims')">Claims</button>
        <button class="tab" [class.active]="tab() === 'providers'" (click)="setTab('providers')">Providers</button>
      </div>

      @if (tab() === 'claims') {
        <div class="toolbar">
          <mat-form-field appearance="outline"><mat-label>Status</mat-label>
            <mat-select [ngModel]="store.filterStatus()" (ngModelChange)="store.filterStatus.set($event); store.loadClaims()">
              <mat-option value="">All</mat-option><mat-option value="Submitted">Submitted</mat-option>
              <mat-option value="UnderReview">Under Review</mat-option><mat-option value="Approved">Approved</mat-option>
              <mat-option value="Rejected">Rejected</mat-option><mat-option value="Paid">Paid</mat-option>
            </mat-select></mat-form-field>
        </div>

        @if (store.isLoading()) {
          <div class="loading">@for (i of [1,2,3]; track i) { <div class="skel"></div> }</div>
        } @else if (store.claims().length === 0) {
          <div class="empty"><mat-icon>health_and_safety</mat-icon><p>No claims</p></div>
        } @else {
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Claim #</th><th>Claim Amount</th><th>Approved</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
              <tbody>
                @for (c of store.claims(); track c.id) {
                  <tr>
                    <td class="mono">{{ c.claimNumber }}</td>
                    <td>{{ c.claimAmount | currency:'SAR ':'symbol':'1.0-0' }}</td>
                    <td>{{ c.approvedAmount | currency:'SAR ':'symbol':'1.0-0' }}</td>
                    <td><span class="badge" [class]="c.status.toLowerCase()">{{ c.status }}</span></td>
                    <td>{{ c.submittedAt ? (c.submittedAt | date:'dd MMM yyyy') : '—' }}</td>
                    <td>
                      <div class="actions">
                        @if (c.status === 'Draft') { <button mat-stroked-button class="btn-sm" (click)="store.submitClaim(c.id)">Submit</button> }
                        @if (c.status === 'Submitted' || c.status === 'UnderReview') {
                          <button mat-stroked-button class="btn-sm" color="primary" (click)="openApprove(c)">Approve</button>
                          <button mat-stroked-button class="btn-sm" color="warn" (click)="openReject(c)">Reject</button>
                        }
                        @if (c.status === 'Approved' || c.status === 'PartiallyApproved') { <button mat-stroked-button class="btn-sm" (click)="store.markPaid(c.id)">Mark Paid</button> }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      } @else {
        <div class="toolbar end"><button mat-raised-button color="primary" (click)="openProvider()"><mat-icon>add</mat-icon> Add Provider</button></div>
        @if (store.isLoading()) {
          <div class="loading">@for (i of [1,2,3]; track i) { <div class="skel"></div> }</div>
        } @else if (store.providers().length === 0) {
          <div class="empty"><mat-icon>business</mat-icon><p>No providers</p></div>
        } @else {
          <div class="prov-grid">
            @for (p of store.providers(); track p.id) {
              <div class="prov-card">
                <div class="prov-head"><strong>{{ p.name }}</strong><span class="badge" [class]="p.isActive ? 'paid' : 'cancelled'">{{ p.isActive ? 'Active' : 'Inactive' }}</span></div>
                <div class="prov-code">{{ p.code }}</div>
                @if (p.contactPerson) { <div class="prov-meta"><mat-icon>person</mat-icon>{{ p.contactPerson }}</div> }
                @if (p.phone) { <div class="prov-meta"><mat-icon>phone</mat-icon>{{ p.phone }}</div> }
                @if (p.email) { <div class="prov-meta"><mat-icon>email</mat-icon>{{ p.email }}</div> }
                <button mat-stroked-button class="btn-sm toggle" (click)="store.updateProvider(p.id, { name: p.name, phone: p.phone, email: p.email, contactPerson: p.contactPerson, isActive: !p.isActive })">
                  {{ p.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            }
          </div>
        }
      }

      <!-- Approve modal -->
      @if (approveClaim()) {
        <div class="backdrop" (click)="approveClaim.set(null)">
          <div class="modal sm" (click)="$event.stopPropagation()">
            <h3>Approve Claim</h3>
            <p class="cur">Claim amount: {{ approveClaim()!.claimAmount | currency:'SAR ':'symbol':'1.2-2' }}</p>
            <mat-form-field appearance="outline" class="full"><mat-label>Approved Amount</mat-label><input matInput type="number" [(ngModel)]="approvedAmount" /></mat-form-field>
            <div class="modal-actions"><button mat-stroked-button (click)="approveClaim.set(null)">Cancel</button>
              <button mat-raised-button color="primary" (click)="confirmApprove()">Approve</button></div>
          </div>
        </div>
      }

      <!-- Reject modal -->
      @if (rejectClaim()) {
        <div class="backdrop" (click)="rejectClaim.set(null)">
          <div class="modal sm" (click)="$event.stopPropagation()">
            <h3>Reject Claim</h3>
            <mat-form-field appearance="outline" class="full"><mat-label>Reason</mat-label><textarea matInput [(ngModel)]="rejectReason" rows="3"></textarea></mat-form-field>
            <div class="modal-actions"><button mat-stroked-button (click)="rejectClaim.set(null)">Cancel</button>
              <button mat-raised-button color="warn" [disabled]="!rejectReason" (click)="confirmReject()">Reject</button></div>
          </div>
        </div>
      }

      <!-- Provider modal -->
      @if (showProvider()) {
        <div class="backdrop" (click)="showProvider.set(false)">
          <div class="modal sm" (click)="$event.stopPropagation()">
            <h3>Add Provider</h3>
            <mat-form-field appearance="outline" class="full"><mat-label>Name</mat-label><input matInput [(ngModel)]="pName" /></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Code</mat-label><input matInput [(ngModel)]="pCode" /></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Contact Person</mat-label><input matInput [(ngModel)]="pContact" /></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Phone</mat-label><input matInput [(ngModel)]="pPhone" /></mat-form-field>
            <mat-form-field appearance="outline" class="full"><mat-label>Email</mat-label><input matInput [(ngModel)]="pEmail" /></mat-form-field>
            <div class="modal-actions"><button mat-stroked-button (click)="showProvider.set(false)">Cancel</button>
              <button mat-raised-button color="primary" [disabled]="!pName || !pCode" (click)="saveProvider()">Save</button></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as *;
    .page { max-width: 1100px; }
    .page-header { margin-bottom: 16px; h2 { margin: 0 0 2px; } .sub { margin: 0; color: $text-secondary; font-size: 0.85rem; } }
    .tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid $border-color; }
    .tab { border: none; background: none; padding: 10px 18px; cursor: pointer; font-size: 0.875rem; font-weight: 600; color: $text-secondary; border-bottom: 2px solid transparent; &.active { color: #0f766e; border-bottom-color: #0f766e; } }
    .toolbar { margin-bottom: 12px; &.end { display: flex; justify-content: flex-end; } }
    .loading { display: flex; flex-direction: column; gap: 8px; } .skel { height: 52px; border-radius: $border-radius; background: linear-gradient(90deg,$gray-100 25%,$gray-200 50%,$gray-100 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0; color: $text-secondary; mat-icon { font-size: 44px; opacity: 0.3; margin-bottom: 8px; } }
    .table-wrap { overflow-x: auto; background: white; border: 1px solid $border-color; border-radius: $border-radius; box-shadow: $shadow-sm; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; th { background: $gray-50; padding: 10px 14px; text-align: left; font-size: 0.72rem; text-transform: uppercase; color: $text-secondary; border-bottom: 1px solid $border-color; } td { padding: 11px 14px; border-bottom: 1px solid $gray-100; } tr:last-child td { border-bottom: none; } }
    .mono { font-family: monospace; font-size: 0.8rem; }
    .badge { padding: 2px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 600;
      &.draft { background: $gray-100; color: $gray-700; } &.submitted { background: #fef3c7; color: #92400e; } &.underreview { background: #e0e7ff; color: #3730a3; }
      &.approved, &.paid { background: #dcfce7; color: #166534; } &.partiallyapproved { background: #dbeafe; color: #1e40af; } &.rejected, &.cancelled { background: #fee2e2; color: #991b1b; } }
    .actions { display: flex; gap: 4px; flex-wrap: wrap; } .btn-sm { font-size: 0.72rem; padding: 2px 8px; line-height: 1.6; }
    .prov-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; @media (max-width: 800px) { grid-template-columns: 1fr; } }
    .prov-card { background: white; border: 1px solid $border-color; border-radius: $border-radius; padding: 16px; }
    .prov-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .prov-code { font-family: monospace; font-size: 0.78rem; color: $text-secondary; margin-bottom: 10px; }
    .prov-meta { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: $text-secondary; margin-bottom: 4px; mat-icon { font-size: 14px; } }
    .toggle { margin-top: 10px; width: 100%; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal { background: white; border-radius: $border-radius-lg; padding: 24px; width: 420px; max-width: 100%; h3 { margin: 0 0 16px; } &.sm { width: 400px; } }
    .full { width: 100%; } .cur { margin: 0 0 12px; font-size: 0.85rem; color: $text-secondary; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
  `]
})
export class AdminInsuranceComponent implements OnInit {
  store = inject(InsuranceStore);
  tab = signal<'claims' | 'providers'>('claims');
  approveClaim = signal<InsuranceClaim | null>(null);
  rejectClaim = signal<InsuranceClaim | null>(null);
  showProvider = signal(false);

  approvedAmount = 0; rejectReason = '';
  pName = ''; pCode = ''; pContact = ''; pPhone = ''; pEmail = '';

  ngOnInit(): void { this.store.loadClaims(); }

  setTab(t: 'claims' | 'providers'): void {
    this.tab.set(t);
    if (t === 'providers') this.store.loadProviders(); else this.store.loadClaims();
  }

  openApprove(c: InsuranceClaim): void { this.approveClaim.set(c); this.approvedAmount = c.claimAmount; }
  async confirmApprove(): Promise<void> { const c = this.approveClaim(); if (!c) return; const ok = await this.store.approveClaim(c.id, this.approvedAmount); if (ok) this.approveClaim.set(null); }

  openReject(c: InsuranceClaim): void { this.rejectClaim.set(c); this.rejectReason = ''; }
  async confirmReject(): Promise<void> { const c = this.rejectClaim(); if (!c) return; const ok = await this.store.rejectClaim(c.id, this.rejectReason); if (ok) this.rejectClaim.set(null); }

  openProvider(): void { this.pName = ''; this.pCode = ''; this.pContact = ''; this.pPhone = ''; this.pEmail = ''; this.showProvider.set(true); }
  async saveProvider(): Promise<void> {
    const ok = await this.store.createProvider({ name: this.pName, code: this.pCode, contactPerson: this.pContact || undefined, phone: this.pPhone || undefined, email: this.pEmail || undefined });
    if (ok) this.showProvider.set(false);
  }
}
