import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.models';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

export interface DoctorDashboardStats {
  pendingReviews: number;
  criticalResults: number;
  reportsToday: number;
  followUpsToday: number;
  patientsReviewed: number;
  avgReviewTimeMinutes: number;
}

export interface PatientTimelineEvent {
  id: string;
  type: 'appointment' | 'sample' | 'result' | 'report' | 'review' | 'note' | 'follow_up';
  title: string;
  description?: string;
  date: string;
  status?: string;
  data?: Record<string, unknown>;
}

export interface DoctorAnalytics {
  patientsReviewed: number;
  criticalCases: number;
  avgReviewTime: number;
  reportsReleased: number;
  reviewsByDay: { date: string; count: number }[];
  criticalByDay: { date: string; count: number }[];
  topTests: { name: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class DoctorApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getDashboardStats(): Observable<ApiResponse<DoctorDashboardStats>> {
    return this.http.get<ApiResponse<DoctorDashboardStats>>(`${this.base}/doctors/dashboard`);
  }

  searchPatients(query: string): Observable<ApiResponse<Patient[]>> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<Patient[]>>(`${this.base}/patients/search`, { params });
  }

  getPatientTimeline(patientId: string): Observable<ApiResponse<PatientTimelineEvent[]>> {
    return this.http.get<ApiResponse<PatientTimelineEvent[]>>(
      `${this.base}/patients/${patientId}/timeline`
    );
  }

  getPatientById(patientId: string): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.base}/patients/${patientId}`);
  }

  getAnalytics(range?: '7d' | '30d' | '90d'): Observable<ApiResponse<DoctorAnalytics>> {
    const params = range ? new HttpParams().set('range', range) : undefined;
    return this.http.get<ApiResponse<DoctorAnalytics>>(`${this.base}/doctors/analytics`, { params });
  }
}
