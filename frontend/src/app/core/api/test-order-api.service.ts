import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestOrder } from '../models/order.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class TestOrderApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/test-orders`;

  // Patient-facing
  getMyOrders(): Observable<ApiResponse<PaginatedResponse<TestOrder>>> {
    return this.http.get<ApiResponse<PaginatedResponse<TestOrder>>>(`${this.url}/my`);
  }

  getById(id: string): Observable<ApiResponse<TestOrder>> {
    return this.http.get<ApiResponse<TestOrder>>(`${this.url}/${id}`);
  }

  create(order: Partial<TestOrder>): Observable<ApiResponse<TestOrder>> {
    return this.http.post<ApiResponse<TestOrder>>(this.url, order);
  }

  // Lab-staff-facing
  getAllForLab(params?: { status?: string; search?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<TestOrder>>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<TestOrder>>>(this.url, { params: httpParams });
  }
}
