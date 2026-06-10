import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DoctorNote, CreateDoctorNoteRequest, UpdateDoctorNoteRequest } from '../models/doctor-note.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DoctorNotesApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/doctor-notes`;

  getAll(params?: { patientId?: string; type?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<DoctorNote>>> {
    let httpParams = new HttpParams();
    if (params?.patientId) httpParams = httpParams.set('patientId', params.patientId);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<DoctorNote>>>(this.url, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<DoctorNote>> {
    return this.http.get<ApiResponse<DoctorNote>>(`${this.url}/${id}`);
  }

  create(data: CreateDoctorNoteRequest): Observable<ApiResponse<DoctorNote>> {
    return this.http.post<ApiResponse<DoctorNote>>(this.url, data);
  }

  update(id: string, data: UpdateDoctorNoteRequest): Observable<ApiResponse<DoctorNote>> {
    return this.http.put<ApiResponse<DoctorNote>>(`${this.url}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`);
  }
}
