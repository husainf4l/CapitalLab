export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  roles: string[];
  languagePreference: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

// ASP.NET Identity serializes roles under the full URI claim key
const ASPNET_ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  [ASPNET_ROLE_CLAIM]?: string | string[];
  exp: number;
  iat: number;
  branchId?: string;
  labId?: string;
}

export type UserRole =
  | 'SuperAdmin'
  | 'Owner'
  | 'BranchAdmin'
  | 'LabManager'
  | 'Receptionist'
  | 'LabTechnician'
  | 'Phlebotomist'
  | 'Doctor'
  | 'Patient'
  | 'HomeCollector';
