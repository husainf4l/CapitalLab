import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DoctorReview, CreateReviewRequest, ReviewDecisionRequest } from '../models/review.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ReviewApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/reviews`;

  getAll(params?: { status?: string; search?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<DoctorReview>>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<DoctorReview>>>(this.url, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<DoctorReview>> {
    return this.http.get<ApiResponse<DoctorReview>>(`${this.url}/${id}`);
  }

  create(request: CreateReviewRequest): Observable<ApiResponse<DoctorReview>> {
    return this.http.post<ApiResponse<DoctorReview>>(this.url, request);
  }

  approve(id: string, request?: ReviewDecisionRequest): Observable<ApiResponse<DoctorReview>> {
    return this.http.post<ApiResponse<DoctorReview>>(`${this.url}/${id}/approve`, request ?? {});
  }

  requestRetest(id: string, request?: ReviewDecisionRequest): Observable<ApiResponse<DoctorReview>> {
    return this.http.post<ApiResponse<DoctorReview>>(`${this.url}/${id}/retest`, request ?? {});
  }
}
