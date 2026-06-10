import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InventoryItem, InventoryTransaction, PurchaseOrder,
  CreateInventoryItemRequest, StockMovementRequest, CreatePurchaseOrderRequest,
} from '../models/inventory.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/inventory`;
  private poUrl = `${environment.apiUrl}/purchase-orders`;

  getItems(params?: { branchId?: string; category?: string; lowStockOnly?: boolean; search?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<InventoryItem>>> {
    let p = new HttpParams();
    if (params?.branchId) p = p.set('branchId', params.branchId);
    if (params?.category) p = p.set('category', params.category);
    if (params?.lowStockOnly) p = p.set('lowStockOnly', 'true');
    if (params?.search) p = p.set('search', params.search);
    if (params?.page) p = p.set('page', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<InventoryItem>>>(`${this.url}/items`, { params: p });
  }

  getItem(id: string): Observable<ApiResponse<InventoryItem>> {
    return this.http.get<ApiResponse<InventoryItem>>(`${this.url}/items/${id}`);
  }

  createItem(data: CreateInventoryItemRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.url}/items`, data);
  }

  updateItem(id: string, data: Partial<CreateInventoryItemRequest>): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.url}/items/${id}`, data);
  }

  stockIn(id: string, data: StockMovementRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.url}/items/${id}/stock-in`, data);
  }

  stockOut(id: string, data: StockMovementRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.url}/items/${id}/stock-out`, data);
  }

  adjust(id: string, newQuantity: number, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.url}/items/${id}/adjust`, { newQuantity, reason });
  }

  getLowStock(branchId?: string): Observable<ApiResponse<InventoryItem[]>> {
    let p = new HttpParams();
    if (branchId) p = p.set('branchId', branchId);
    return this.http.get<ApiResponse<InventoryItem[]>>(`${this.url}/low-stock`, { params: p });
  }

  getExpiring(days = 30, branchId?: string): Observable<ApiResponse<InventoryItem[]>> {
    let p = new HttpParams().set('days', days);
    if (branchId) p = p.set('branchId', branchId);
    return this.http.get<ApiResponse<InventoryItem[]>>(`${this.url}/expiring`, { params: p });
  }

  getTransactions(params?: { itemId?: string; branchId?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<InventoryTransaction>>> {
    let p = new HttpParams();
    if (params?.itemId) p = p.set('itemId', params.itemId);
    if (params?.branchId) p = p.set('branchId', params.branchId);
    if (params?.page) p = p.set('page', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<InventoryTransaction>>>(`${this.url}/transactions`, { params: p });
  }

  // ── Purchase Orders ──────────────────────────────────────────────────────
  getPurchaseOrders(params?: { branchId?: string; status?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<PurchaseOrder>>> {
    let p = new HttpParams();
    if (params?.branchId) p = p.set('branchId', params.branchId);
    if (params?.status) p = p.set('status', params.status);
    if (params?.page) p = p.set('page', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<PurchaseOrder>>>(this.poUrl, { params: p });
  }

  getPurchaseOrder(id: string): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.get<ApiResponse<PurchaseOrder>>(`${this.poUrl}/${id}`);
  }

  createPurchaseOrder(data: CreatePurchaseOrderRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.poUrl, data);
  }

  submitPurchaseOrder(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.poUrl}/${id}/submit`, {});
  }

  approvePurchaseOrder(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.poUrl}/${id}/approve`, {});
  }

  receivePurchaseOrder(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.poUrl}/${id}/receive`, {});
  }

  cancelPurchaseOrder(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.poUrl}/${id}/cancel`, {});
  }
}
