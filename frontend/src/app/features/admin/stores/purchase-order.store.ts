import { Injectable, inject, signal } from '@angular/core';
import { InventoryApiService } from '../../../core/api/inventory-api.service';
import { PurchaseOrder, CreatePurchaseOrderRequest } from '../../../core/models/inventory.models';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderStore {
  private api = inject(InventoryApiService);

  readonly orders = signal<PurchaseOrder[]>([]);
  readonly selectedOrder = signal<PurchaseOrder | null>(null);
  readonly isLoading = signal(false);
  readonly isActing = signal('');
  readonly filterStatus = signal('');

  load(): void {
    this.isLoading.set(true);
    this.api.getPurchaseOrders({ status: this.filterStatus() || undefined }).subscribe({
      next: res => { this.orders.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  select(order: PurchaseOrder): void {
    this.api.getPurchaseOrder(order.id).subscribe({ next: res => this.selectedOrder.set(res.data ?? order) });
  }

  clearSelection(): void { this.selectedOrder.set(null); }

  create(data: CreatePurchaseOrderRequest): Promise<boolean> {
    this.isActing.set('create');
    return new Promise(resolve => {
      this.api.createPurchaseOrder(data).subscribe({
        next: () => { this.isActing.set(''); this.load(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }

  submit(id: string): Promise<boolean> { return this.transition(id, () => this.api.submitPurchaseOrder(id)); }
  approve(id: string): Promise<boolean> { return this.transition(id, () => this.api.approvePurchaseOrder(id)); }
  receive(id: string): Promise<boolean> { return this.transition(id, () => this.api.receivePurchaseOrder(id)); }
  cancel(id: string): Promise<boolean> { return this.transition(id, () => this.api.cancelPurchaseOrder(id)); }

  private transition(id: string, call: () => { subscribe: (o: any) => void }): Promise<boolean> {
    this.isActing.set(id);
    return new Promise(resolve => {
      call().subscribe({
        next: () => { this.isActing.set(''); this.load(); resolve(true); },
        error: () => { this.isActing.set(''); resolve(false); },
      });
    });
  }
}
