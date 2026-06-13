import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LabTest, TestCategory } from '../models/lab-test.models';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class LabTestApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/lab-tests`;
  private categoryUrl = `${environment.apiUrl}/test-categories`;

  getTests(params?: PaginationParams & { categoryId?: string }): Observable<ApiResponse<PaginatedResponse<LabTest>>> {
    let httpParams = new HttpParams();
    if (params?.pageNumber) httpParams = httpParams.set('Page', params.pageNumber);
    if (params?.pageSize) httpParams = httpParams.set('PageSize', params.pageSize);
    if (params?.searchTerm) httpParams = httpParams.set('Search', params.searchTerm);
    if (params?.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    return this.http.get<ApiResponse<PaginatedResponse<LabTest>>>(this.url, { params: httpParams });
  }

  getTestById(id: string): Observable<ApiResponse<LabTest>> {
    return this.http.get<ApiResponse<LabTest>>(`${this.url}/${id}`);
  }

  getPopularTests(count = 8): Observable<ApiResponse<LabTest[]>> {
    return this.http.get<ApiResponse<LabTest[]>>(`${this.url}/popular?count=${count}`);
  }

  getCategories(): Observable<PaginatedResponse<TestCategory>> {
    const params = new HttpParams()
      .set('Page', 1)
      .set('PageSize', 100)
      .set('isActive', true);
    return this.http.get<PaginatedResponse<TestCategory>>(this.categoryUrl, { params });
  }

  searchTests(query: string): Observable<ApiResponse<LabTest[]>> {
    return this.http.get<ApiResponse<LabTest[]>>(`${this.url}/search?q=${query}`);
  }
}
