import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Branch } from '../models/branch.models';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BranchApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/branches`;

  getAll(params?: PaginationParams): Observable<ApiResponse<PaginatedResponse<Branch>>> {
    let httpParams = new HttpParams();
    if (params?.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.searchTerm) httpParams = httpParams.set('search', params.searchTerm);
    return this.http.get<ApiResponse<PaginatedResponse<Branch>>>(this.url, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Branch>> {
    return this.http.get<ApiResponse<Branch>>(`${this.url}/${id}`);
  }

  getActive(): Observable<ApiResponse<Branch[]>> {
    const params = new HttpParams()
      .set('isActive', true)
      .set('pageSize', 100);

    return this.http.get<ApiResponse<PaginatedResponse<Branch>>>(this.url, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data?.items ?? [],
      }))
    );
  }

  create(branch: Partial<Branch>): Observable<ApiResponse<Branch>> {
    return this.http.post<ApiResponse<Branch>>(this.url, branch);
  }

  update(id: string, branch: Partial<Branch>): Observable<ApiResponse<Branch>> {
    return this.http.put<ApiResponse<Branch>>(`${this.url}/${id}`, branch);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`);
  }
}
