import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FollowUp, CreateFollowUpRequest } from '../models/follow-up.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class FollowUpsApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/follow-ups`;

  getAll(params?: {
    status?: string;
    patientId?: string;
    from?: string;
    to?: string;
    page?: number;
  }): Observable<ApiResponse<PaginatedResponse<FollowUp>>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.patientId) httpParams = httpParams.set('patientId', params.patientId);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<FollowUp>>>(this.url, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<FollowUp>> {
    return this.http.get<ApiResponse<FollowUp>>(`${this.url}/${id}`);
  }

  create(data: CreateFollowUpRequest): Observable<ApiResponse<FollowUp>> {
    return this.http.post<ApiResponse<FollowUp>>(this.url, data);
  }

  complete(id: string, notes?: string): Observable<ApiResponse<FollowUp>> {
    return this.http.post<ApiResponse<FollowUp>>(`${this.url}/${id}/complete`, { notes });
  }

  cancel(id: string, notes?: string): Observable<ApiResponse<FollowUp>> {
    return this.http.post<ApiResponse<FollowUp>>(`${this.url}/${id}/cancel`, { notes });
  }
}
