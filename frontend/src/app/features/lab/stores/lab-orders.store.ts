import { Injectable, inject, signal } from '@angular/core';
import { TestOrderApiService } from '../../../core/api/test-order-api.service';
import { SampleApiService } from '../../../core/api/sample-api.service';
import { TestOrder } from '../../../core/models/order.models';
import { Sample } from '../../../core/models/sample.models';

@Injectable({ providedIn: 'root' })
export class LabOrdersStore {
  private orderApi = inject(TestOrderApiService);
  private sampleApi = inject(SampleApiService);

  readonly orders = signal<TestOrder[]>([]);
  readonly selectedOrder = signal<TestOrder | null>(null);
  readonly orderSamples = signal<Sample[]>([]);
  readonly isLoading = signal(false);
  readonly isCreatingSample = signal(false);

  readonly filterStatus = signal('');
  readonly searchTerm = signal('');

  load(): void {
    this.isLoading.set(true);
    this.orderApi.getAllForLab({
      status: this.filterStatus() || undefined,
      search: this.searchTerm() || undefined,
    }).subscribe({
      next: res => { this.orders.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  selectOrder(order: TestOrder): void {
    this.selectedOrder.set(order);
    this.sampleApi.getByOrderId(order.id).subscribe({
      next: res => this.orderSamples.set(res.data ?? []),
      error: () => this.orderSamples.set([]),
    });
  }

  clearSelection(): void {
    this.selectedOrder.set(null);
    this.orderSamples.set([]);
  }

  createSample(orderId: string, testId: string, patientId: string, sampleType: string): Promise<Sample | null> {
    this.isCreatingSample.set(true);
    return new Promise(resolve => {
      this.sampleApi.create({ orderId, testId, patientId, sampleType }).subscribe({
        next: res => {
          if (res.data) this.orderSamples.update(list => [...list, res.data!]);
          this.isCreatingSample.set(false);
          resolve(res.data ?? null);
        },
        error: () => { this.isCreatingSample.set(false); resolve(null); },
      });
    });
  }
}
