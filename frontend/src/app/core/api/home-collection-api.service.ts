import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HomeCollectionRequest, CreateHomeCollectionRequest } from '../models/home-collection.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class HomeCollectionApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/home-collections`;

  getMyRequests(): Observable<ApiResponse<PaginatedResponse<HomeCollectionRequest>>> {
    return this.http.get<ApiResponse<PaginatedResponse<HomeCollectionRequest>>>(`${this.url}/my`);
  }

  getById(id: string): Observable<ApiResponse<HomeCollectionRequest>> {
    return this.http.get<ApiResponse<HomeCollectionRequest>>(`${this.url}/${id}`);
  }

  create(request: CreateHomeCollectionRequest): Observable<ApiResponse<HomeCollectionRequest>> {
    return this.http.post<ApiResponse<HomeCollectionRequest>>(this.url, request);
  }

  cancel(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.url}/${id}/cancel`, {});
  }
}
