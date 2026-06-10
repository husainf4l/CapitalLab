import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CriticalResult, AcknowledgeCriticalRequest } from '../models/critical-result.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CriticalResultsApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/critical-results`;

  getAll(params?: {
    status?: string;
    patientId?: string;
    from?: string;
    to?: string;
    page?: number;
  }): Observable<ApiResponse<PaginatedResponse<CriticalResult>>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.patientId) httpParams = httpParams.set('patientId', params.patientId);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<CriticalResult>>>(this.url, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<CriticalResult>> {
    return this.http.get<ApiResponse<CriticalResult>>(`${this.url}/${id}`);
  }

  acknowledge(id: string, body?: AcknowledgeCriticalRequest): Observable<ApiResponse<CriticalResult>> {
    return this.http.post<ApiResponse<CriticalResult>>(`${this.url}/${id}/acknowledge`, body ?? {});
  }

  addNote(id: string, notes: string): Observable<ApiResponse<CriticalResult>> {
    return this.http.post<ApiResponse<CriticalResult>>(`${this.url}/${id}/notes`, { notes });
  }

  requestRetest(id: string, notes?: string): Observable<ApiResponse<CriticalResult>> {
    return this.http.post<ApiResponse<CriticalResult>>(`${this.url}/${id}/request-retest`, { notes });
  }
}
