import { Injectable, inject, signal } from '@angular/core';
import { BillingApiService } from '../../../core/api/billing-api.service';
import { Payment, RecordPaymentRequest } from '../../../core/models/billing.models';

@Injectable({ providedIn: 'root' })
export class PaymentStore {
  private api = inject(BillingApiService);

  readonly payments = signal<Payment[]>([]);
  readonly isLoading = signal(false);
  readonly isActing = signal('');

  load(): void {
    this.isLoading.set(true);
    this.api.getPayments({ page: 1 }).subscribe({
      next: res => { this.payments.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  record(data: RecordPaymentRequest): Promise<boolean> {
    this.isActing.set('record');
    return new Promise(resolve => {
      this.api.recordPayment(data).subscribe({
        next: () => { this.isActing.set(''); this.load(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  refund(id: string): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      this.api.refundPayment(id).subscribe({
        next: () => { this.isActing.set(''); this.load(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }
}
