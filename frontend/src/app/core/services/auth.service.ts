import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import {
  LoginRequest,
  LoginResponse,
  AuthUser,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  RegisterPatientRequest,
} from '../models/auth.models';
import { ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenStorage = inject(TokenStorageService);
  private baseUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    if (this.tokenStorage.isLoggedIn()) {
      const decoded = this.tokenStorage.getCurrentUser();
      if (decoded) {
        this.currentUser.set({
          id: decoded.sub,
          email: decoded.email,
          fullName: decoded.name,
          roles: this.tokenStorage.getRoles(),
          languagePreference: 'en',
        });
        this.isAuthenticated.set(true);
      }
    }
  }

  register(request: RegisterPatientRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/register`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
          this.currentUser.set(response.data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
          this.currentUser.set(response.data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout(): void {
    this.http.post<ApiResponse<void>>(`${this.baseUrl}/logout`, {}).subscribe({
      next: () => this.logoutLocally(),
      error: () => this.logoutLocally(),
    });
  }

  refresh(request: RefreshTokenRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/refresh`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
          this.currentUser.set(response.data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  me(): Observable<ApiResponse<AuthUser>> {
    return this.http.get<ApiResponse<AuthUser>>(`${this.baseUrl}/me`);
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/change-password`, request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/reset-password`, request);
  }

  hasRole(role: string): boolean {
    return this.tokenStorage.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.tokenStorage.hasAnyRole(roles);
  }

  getRedirectUrl(): string {
    const roles = this.currentUser()?.roles ?? [];
    if (roles.includes('Patient')) return '/patient';
    if (roles.includes('Doctor')) return '/doctor';
    if (roles.includes('LabTechnician') || roles.includes('LabManager')) return '/lab';
    if (roles.includes('SuperAdmin') || roles.includes('Owner') || roles.includes('BranchAdmin')) return '/admin';
    return '/';
  }

  logoutLocally(): void {
    this.tokenStorage.clearTokens();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
