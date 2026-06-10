import { Injectable, inject, signal } from '@angular/core';
import { BillingApiService } from '../../../core/api/billing-api.service';
import { Invoice, InvoiceSummary, CreateInvoiceRequest } from '../../../core/models/billing.models';

@Injectable({ providedIn: 'root' })
export class BillingStore {
  private api = inject(BillingApiService);

  readonly invoices = signal<InvoiceSummary[]>([]);
  readonly selectedInvoice = signal<Invoice | null>(null);
  readonly isLoading = signal(false);
  readonly isActing = signal('');
  readonly filterStatus = signal('');
  readonly searchTerm = signal('');

  load(): void {
    this.isLoading.set(true);
    this.api.getInvoices({ status: this.filterStatus() || undefined, search: this.searchTerm() || undefined }).subscribe({
      next: res => { this.invoices.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  select(summary: InvoiceSummary): void {
    this.api.getInvoice(summary.id).subscribe({ next: res => this.selectedInvoice.set(res.data ?? null) });
  }

  clearSelection(): void { this.selectedInvoice.set(null); }

  create(data: CreateInvoiceRequest): Promise<boolean> {
    this.isActing.set('create');
    return new Promise(resolve => {
      this.api.createInvoice(data).subscribe({
        next: () => { this.isActing.set(''); this.load(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  createFromOrder(orderId: string): Promise<boolean> {
    this.isActing.set('create');
    return new Promise(resolve => {
      this.api.createFromOrder(orderId).subscribe({
        next: () => { this.isActing.set(''); this.load(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  cancel(id: string, reason?: string): Promise<boolean> { return this.act(id, () => this.api.cancelInvoice(id, reason)); }
  refund(id: string): Promise<boolean> { return this.act(id, () => this.api.refundInvoice(id)); }

  private act(id: string, call: () => { subscribe: (o: any) => void }): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      call().subscribe({
        next: () => { this.isActing.set(''); this.load(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }
}
