import { Injectable, inject, signal, computed } from '@angular/core';
import { InventoryApiService } from '../../../core/api/inventory-api.service';
import { InventoryItem, InventoryTransaction, CreateInventoryItemRequest, StockMovementRequest } from '../../../core/models/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryStore {
  private api = inject(InventoryApiService);

  readonly items = signal<InventoryItem[]>([]);
  readonly lowStock = signal<InventoryItem[]>([]);
  readonly expiring = signal<InventoryItem[]>([]);
  readonly transactions = signal<InventoryTransaction[]>([]);
  readonly selectedItem = signal<InventoryItem | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly filterCategory = signal('');
  readonly filterLowStock = signal(false);
  readonly searchTerm = signal('');

  readonly totalValue = computed(() => this.items().reduce((s, i) => s + i.stockValue, 0));
  readonly lowStockCount = computed(() => this.lowStock().length);
  readonly expiringCount = computed(() => this.expiring().length);

  load(): void {
    this.isLoading.set(true);
    this.api.getItems({
      category: this.filterCategory() || undefined,
      lowStockOnly: this.filterLowStock() || undefined,
      search: this.searchTerm() || undefined,
    }).subscribe({
      next: res => { this.items.set(res.data?.items ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  loadDashboard(): void {
    this.load();
    this.api.getLowStock().subscribe({ next: res => this.lowStock.set(res.data ?? []) });
    this.api.getExpiring(30).subscribe({ next: res => this.expiring.set(res.data ?? []) });
    this.api.getTransactions({ page: 1 }).subscribe({ next: res => this.transactions.set(res.data?.items ?? []) });
  }

  select(item: InventoryItem): void { this.selectedItem.set(item); }
  clearSelection(): void { this.selectedItem.set(null); }

  create(data: CreateInventoryItemRequest): Promise<boolean> {
    this.isSaving.set(true);
    return new Promise(resolve => {
      this.api.createItem(data).subscribe({
        next: () => { this.isSaving.set(false); this.load(); resolve(true); },
        error: () => { this.isSaving.set(false); resolve(false); },
      });
    });
  }

  update(id: string, data: Partial<CreateInventoryItemRequest>): Promise<boolean> {
    this.isSaving.set(true);
    return new Promise(resolve => {
      this.api.updateItem(id, data).subscribe({
        next: () => { this.isSaving.set(false); this.load(); resolve(true); },
        error: () => { this.isSaving.set(false); resolve(false); },
      });
    });
  }

  stockIn(id: string, data: StockMovementRequest): Promise<boolean> {
    return this.movement(() => this.api.stockIn(id, data));
  }

  stockOut(id: string, data: StockMovementRequest): Promise<boolean> {
    return this.movement(() => this.api.stockOut(id, data));
  }

  adjust(id: string, newQuantity: number, reason: string): Promise<boolean> {
    return this.movement(() => this.api.adjust(id, newQuantity, reason));
  }

  private movement(call: () => { subscribe: (o: any) => void }): Promise<boolean> {
    this.isSaving.set(true);
    return new Promise(resolve => {
      call().subscribe({
        next: () => { this.isSaving.set(false); this.loadDashboard(); resolve(true); },
        error: () => { this.isSaving.set(false); resolve(false); },
      });
    });
  }
}
