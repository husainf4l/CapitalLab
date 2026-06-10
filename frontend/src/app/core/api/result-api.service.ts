import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Report, TestResult } from '../models/result.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

export interface CreateResultRequest {
  sampleId: string;
  testId: string;
  orderId: string;
  patientId: string;
  value?: string;
  resultText?: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: 'normal' | 'high' | 'low' | 'critical';
  notes?: string;
}

export interface UpdateResultRequest {
  value?: string;
  resultText?: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: 'normal' | 'high' | 'low' | 'critical';
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class ResultApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/results`;
  private reportUrl = `${environment.apiUrl}/reports`;

  // ─── Patient-facing ───────────────────────────────────────────────────────
  getMyResults(params?: { familyMemberId?: string; from?: string; to?: string }): Observable<ApiResponse<PaginatedResponse<TestResult>>> {
    let httpParams = new HttpParams();
    if (params?.familyMemberId) httpParams = httpParams.set('familyMemberId', params.familyMemberId);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    return this.http.get<ApiResponse<PaginatedResponse<TestResult>>>(`${this.url}/my`, { params: httpParams });
  }

  getMyReports(params?: { familyMemberId?: string }): Observable<ApiResponse<PaginatedResponse<Report>>> {
    let httpParams = new HttpParams();
    if (params?.familyMemberId) httpParams = httpParams.set('familyMemberId', params.familyMemberId);
    return this.http.get<ApiResponse<PaginatedResponse<Report>>>(`${this.reportUrl}/my`, { params: httpParams });
  }

  getReportById(id: string): Observable<ApiResponse<Report>> {
    return this.http.get<ApiResponse<Report>>(`${this.reportUrl}/${id}`);
  }

  downloadReport(id: string): Observable<Blob> {
    return this.http.get(`${this.reportUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  // ─── Lab-staff-facing ─────────────────────────────────────────────────────
  getAllResults(params?: { sampleId?: string; status?: string; search?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<TestResult>>> {
    let httpParams = new HttpParams();
    if (params?.sampleId) httpParams = httpParams.set('sampleId', params.sampleId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<TestResult>>>(this.url, { params: httpParams });
  }

  createResult(data: CreateResultRequest): Observable<ApiResponse<TestResult>> {
    return this.http.post<ApiResponse<TestResult>>(this.url, data);
  }

  updateResult(id: string, data: UpdateResultRequest): Observable<ApiResponse<TestResult>> {
    return this.http.put<ApiResponse<TestResult>>(`${this.url}/${id}`, data);
  }

  submitForReview(id: string): Observable<ApiResponse<TestResult>> {
    return this.http.post<ApiResponse<TestResult>>(`${this.url}/${id}/submit-review`, {});
  }

  approveResult(id: string): Observable<ApiResponse<TestResult>> {
    return this.http.post<ApiResponse<TestResult>>(`${this.url}/${id}/approve`, {});
  }

  releaseResult(id: string): Observable<ApiResponse<TestResult>> {
    return this.http.post<ApiResponse<TestResult>>(`${this.url}/${id}/release`, {});
  }

  getAllReports(params?: { status?: string; search?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<Report>>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<Report>>>(this.reportUrl, { params: httpParams });
  }

  generateReport(sampleId: string): Observable<ApiResponse<Report>> {
    return this.http.post<ApiResponse<Report>>(`${this.reportUrl}/generate/${sampleId}`, {});
  }

  releaseReport(id: string): Observable<ApiResponse<Report>> {
    return this.http.post<ApiResponse<Report>>(`${this.reportUrl}/${id}/release`, {});
  }
}
