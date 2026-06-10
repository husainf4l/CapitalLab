import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HealthPackage } from '../models/health-package.models';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PackageApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/health-packages`;

  getAll(params?: PaginationParams): Observable<ApiResponse<PaginatedResponse<HealthPackage>>> {
    let httpParams = new HttpParams();
    if (params?.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.searchTerm) httpParams = httpParams.set('search', params.searchTerm);
    return this.http.get<ApiResponse<PaginatedResponse<HealthPackage>>>(this.url, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<HealthPackage>> {
    return this.http.get<ApiResponse<HealthPackage>>(`${this.url}/${id}`);
  }

  getPopular(count = 6): Observable<ApiResponse<HealthPackage[]>> {
    return this.http.get<ApiResponse<HealthPackage[]>>(`${this.url}/popular?count=${count}`);
  }
}
