import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HealthPackage } from '../models/health-package.models';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PackageApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/packages`;

  getAll(params?: PaginationParams & { isActive?: boolean; isPopular?: boolean }): Observable<PaginatedResponse<HealthPackage>> {
    let httpParams = new HttpParams();
    if (params?.pageNumber) httpParams = httpParams.set('Page', params.pageNumber);
    if (params?.pageSize) httpParams = httpParams.set('PageSize', params.pageSize);
    if (params?.searchTerm) httpParams = httpParams.set('Search', params.searchTerm);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive);
    if (params?.isPopular !== undefined) httpParams = httpParams.set('isPopular', params.isPopular);
    return this.http.get<PaginatedResponse<HealthPackage>>(this.url, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<HealthPackage>> {
    return this.http.get<ApiResponse<HealthPackage>>(`${this.url}/${id}`);
  }

  getPopular(count = 6): Observable<ApiResponse<HealthPackage[]>> {
    return this.http.get<ApiResponse<HealthPackage[]>>(`${this.url}/popular?count=${count}`);
  }

  create(data: CreateHealthPackageRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.url, data);
  }

  update(id: string, data: UpdateHealthPackageRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  activate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/activate`, {});
  }

  deactivate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/deactivate`, {});
  }
}

export interface CreateHealthPackageRequest {
  code: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  price: number;
  currency: string;
  discountPercentage: number;
  isPopular: boolean;
  testIds: string[];
}

export interface UpdateHealthPackageRequest {
  name: string;
  nameAr?: string | null;
  description?: string | null;
  price: number;
  currency: string;
  discountPercentage: number;
  isPopular: boolean;
}
