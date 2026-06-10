import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient, FamilyMember } from '../models/patient.models';
import { ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PatientApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/patients`;

  getProfile(): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.url}/profile`);
  }

  updateProfile(data: Partial<Patient>): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(`${this.url}/profile`, data);
  }

  getFamilyMembers(): Observable<ApiResponse<FamilyMember[]>> {
    return this.http.get<ApiResponse<FamilyMember[]>>(`${this.url}/family-members`);
  }

  addFamilyMember(member: Partial<FamilyMember>): Observable<ApiResponse<FamilyMember>> {
    return this.http.post<ApiResponse<FamilyMember>>(`${this.url}/family-members`, member);
  }

  updateFamilyMember(id: string, member: Partial<FamilyMember>): Observable<ApiResponse<FamilyMember>> {
    return this.http.put<ApiResponse<FamilyMember>>(`${this.url}/family-members/${id}`, member);
  }

  deleteFamilyMember(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/family-members/${id}`);
  }
}
