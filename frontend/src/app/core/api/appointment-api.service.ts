import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, CreateAppointmentRequest } from '../models/appointment.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/appointments`;

  // ─── Patient-facing ───────────────────────────────────────────────────────
  getMyAppointments(params?: { status?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<Appointment>>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<Appointment>>>(`${this.url}/my`, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.url}/${id}`);
  }

  create(request: CreateAppointmentRequest): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(this.url, request);
  }

  cancel(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.url}/${id}/cancel`, {});
  }

  reschedule(id: string, date: string, time: string): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(`${this.url}/${id}/reschedule`, { date, time });
  }

  // ─── Lab-staff-facing ─────────────────────────────────────────────────────
  getAllForLab(params?: { status?: string; branchId?: string; date?: string; search?: string; page?: number }): Observable<ApiResponse<PaginatedResponse<Appointment>>> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.branchId) httpParams = httpParams.set('branchId', params.branchId);
    if (params?.date) httpParams = httpParams.set('date', params.date);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('pageNumber', params.page);
    return this.http.get<ApiResponse<PaginatedResponse<Appointment>>>(this.url, { params: httpParams });
  }

  getTodayForLab(params?: { branchId?: string; status?: string }): Observable<ApiResponse<PaginatedResponse<Appointment>>> {
    let httpParams = new HttpParams();
    if (params?.branchId) httpParams = httpParams.set('branchId', params.branchId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<ApiResponse<PaginatedResponse<Appointment>>>(`${this.url}/today`, { params: httpParams });
  }

  confirm(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${this.url}/${id}/confirm`, {});
  }

  start(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${this.url}/${id}/start`, {});
  }

  completeAppointment(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${this.url}/${id}/complete`, {});
  }

  cancelAppointment(id: string, reason?: string): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${this.url}/${id}/cancel`, { reason });
  }
}
