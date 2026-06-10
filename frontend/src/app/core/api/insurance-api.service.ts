import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InsuranceProvider, InsuranceClaim, CreateInsuranceProviderRequest } from '../models/insurance.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class InsuranceApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/insurance`;

  getProviders(activeOnly?: boolean): Observable<ApiResponse<InsuranceProvider[]>> {
    let p = new HttpParams();
    if (activeOnly) p = p.set('activeOnly', 'true');
    return this.http.get<ApiResponse<InsuranceProvider[]>>(`${this.url}/providers`, { params: p });
  }

  createProvider(data: CreateInsuranceProviderRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.url}/providers`, data);
  }

  updateProvider(id: string, data: { name: string; phone?: string; email?: string; contactPerson?: string; isActive: boolean }): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.url}/providers/${id}`, data);
  }

  getClaims(params?: { providerId?: string; patientId?: string; status?: string; search?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<InsuranceClaim>>> {
    let p = new HttpParams();
    if (params?.providerId) p = p.set('providerId', params.providerId);
    if (params?.patientId) p = p.set('patientId', params.patientId);
    if (params?.status) p = p.set('status', params.status);
    if (params?.search) p = p.set('search', params.search);
    if (params?.page) p = p.set('page', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<InsuranceClaim>>>(`${this.url}/claims`, { params: p });
  }

  getClaim(id: string): Observable<ApiResponse<InsuranceClaim>> {
    return this.http.get<ApiResponse<InsuranceClaim>>(`${this.url}/claims/${id}`);
  }

  createClaim(invoiceId: string, providerId: string, claimAmount: number): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.url}/claims/from-invoice/${invoiceId}`, { providerId, claimAmount });
  }

  submitClaim(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.url}/claims/${id}/submit`, {});
  }

  approveClaim(id: string, approvedAmount: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.url}/claims/${id}/approve`, { approvedAmount });
  }

  rejectClaim(id: string, reason: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.url}/claims/${id}/reject`, { reason });
  }

  markPaid(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.url}/claims/${id}/mark-paid`, {});
  }
}
