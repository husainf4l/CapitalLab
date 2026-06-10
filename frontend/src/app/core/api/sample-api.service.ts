import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sample, CreateSampleRequest, QualityCheckRequest, BarcodeResponse } from '../models/sample.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SampleApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/samples`;

  getAll(params?: { status?: string; sampleType?: string; search?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<Sample>>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.sampleType) httpParams = httpParams.set('sampleType', params.sampleType);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<Sample>>>(this.url, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Sample>> {
    return this.http.get<ApiResponse<Sample>>(`${this.url}/${id}`);
  }

  getByBarcode(barcode: string): Observable<ApiResponse<Sample>> {
    return this.http.get<ApiResponse<Sample>>(`${this.url}/barcode/${barcode}`);
  }

  getByOrderId(orderId: string): Observable<ApiResponse<Sample[]>> {
    return this.http.get<ApiResponse<Sample[]>>(`${this.url}/order/${orderId}`);
  }

  create(request: CreateSampleRequest): Observable<ApiResponse<Sample>> {
    return this.http.post<ApiResponse<Sample>>(this.url, request);
  }

  collect(id: string, notes?: string): Observable<ApiResponse<Sample>> {
    return this.http.post<ApiResponse<Sample>>(`${this.url}/${id}/collect`, { notes });
  }

  receive(id: string): Observable<ApiResponse<Sample>> {
    return this.http.post<ApiResponse<Sample>>(`${this.url}/${id}/receive`, {});
  }

  startProcessing(id: string): Observable<ApiResponse<Sample>> {
    return this.http.post<ApiResponse<Sample>>(`${this.url}/${id}/processing-start`, {});
  }

  completeProcessing(id: string): Observable<ApiResponse<Sample>> {
    return this.http.post<ApiResponse<Sample>>(`${this.url}/${id}/processing-complete`, {});
  }

  qualityCheck(id: string, request: QualityCheckRequest): Observable<ApiResponse<Sample>> {
    return this.http.post<ApiResponse<Sample>>(`${this.url}/${id}/quality-check`, request);
  }

  completeSample(id: string): Observable<ApiResponse<Sample>> {
    return this.http.post<ApiResponse<Sample>>(`${this.url}/${id}/complete`, {});
  }

  generateBarcode(id: string): Observable<ApiResponse<BarcodeResponse>> {
    return this.http.post<ApiResponse<BarcodeResponse>>(`${this.url}/${id}/generate-barcode`, {});
  }

  updateStatus(id: string, status: string): Observable<ApiResponse<Sample>> {
    return this.http.patch<ApiResponse<Sample>>(`${this.url}/${id}/status`, { status });
  }
}
