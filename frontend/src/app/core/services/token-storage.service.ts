import { Injectable } from '@angular/core';
import { DecodedToken } from '../models/auth.models';

const ACCESS_TOKEN_KEY = 'cl_access_token';
const REFRESH_TOKEN_KEY = 'cl_refresh_token';
const ASPNET_ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    if (!decoded) return false;
    return decoded.exp * 1000 > Date.now();
  }

  decodeToken(token?: string): DecodedToken | null {
    try {
      const t = token ?? this.getAccessToken();
      if (!t) return null;
      const payload = t.split('.')[1];
      return JSON.parse(atob(payload)) as DecodedToken;
    } catch {
      return null;
    }
  }

  getCurrentUser(): DecodedToken | null {
    return this.decodeToken();
  }

  getRoles(): string[] {
    const decoded = this.getCurrentUser();
    if (!decoded) return [];
    const rawRoles = decoded[ASPNET_ROLE_CLAIM as keyof DecodedToken] as string | string[] | undefined;
    if (!rawRoles) return [];
    return Array.isArray(rawRoles) ? rawRoles : [rawRoles];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.getRoles().some(r => roles.includes(r));
  }
}
