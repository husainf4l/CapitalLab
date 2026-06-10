import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OwnerOverview, RevenueAnalytics, BranchPerformance, TestAnalytics,
  PatientAnalytics, InventoryAnalytics, InsuranceAnalytics,
} from '../models/owner-analytics.models';
import { ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class OwnerAnalyticsApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/analytics/owner`;

  getOverview(): Observable<ApiResponse<OwnerOverview>> {
    return this.http.get<ApiResponse<OwnerOverview>>(`${this.url}/overview`);
  }

  getRevenue(days = 30): Observable<ApiResponse<RevenueAnalytics>> {
    return this.http.get<ApiResponse<RevenueAnalytics>>(`${this.url}/revenue`, { params: new HttpParams().set('days', days) });
  }

  getBranches(): Observable<ApiResponse<BranchPerformance[]>> {
    return this.http.get<ApiResponse<BranchPerformance[]>>(`${this.url}/branches`);
  }

  getTests(): Observable<ApiResponse<TestAnalytics>> {
    return this.http.get<ApiResponse<TestAnalytics>>(`${this.url}/tests`);
  }

  getPatients(): Observable<ApiResponse<PatientAnalytics>> {
    return this.http.get<ApiResponse<PatientAnalytics>>(`${this.url}/patients`);
  }

  getInventory(): Observable<ApiResponse<InventoryAnalytics>> {
    return this.http.get<ApiResponse<InventoryAnalytics>>(`${this.url}/inventory`);
  }

  getInsurance(): Observable<ApiResponse<InsuranceAnalytics>> {
    return this.http.get<ApiResponse<InsuranceAnalytics>>(`${this.url}/insurance`);
  }
}
