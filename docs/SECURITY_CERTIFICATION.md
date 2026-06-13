# Security Certification Report

| Field | Value |
|---|---|
| **Project** | CapitalLab — Laboratory Management Platform |
| **Document** | Security Certification |
| **Version** | 1.0 |
| **Date** | 2026-06-13 |
| **Status** | CERTIFIED |
| **Reviewed By** | Security Engineering |
| **Next Review** | 2026-12-13 |

---

## Executive Summary

CapitalLab has completed a full security review covering authentication, authorization, transport security, input handling, and infrastructure configuration. Two critical issues identified during the review phase were remediated before this certification was issued. The system demonstrates an enterprise-grade security posture appropriate for production deployment in a regulated healthcare environment.

**Overall Verdict: CERTIFIED**

---

## 1. Security Controls Summary

| Control Area | Implementation | Status |
|---|---|---|
| Authentication Algorithm | RS256 asymmetric JWT signing | PASS |
| Access Token Lifetime | 15 minutes | PASS |
| Refresh Token Lifetime | 7 days, SHA256-hashed, rotated on use | PASS |
| Refresh Token Storage | AspNetUserTokens table, hashed — never stored plaintext | PASS |
| Token Revocation | Rotation on every use; full cleanup on logout | PASS |
| Token Validation | ValidateIssuer, ValidateAudience, ValidateLifetime all enabled | PASS |
| Clock Skew Tolerance | 30 seconds | PASS |
| Password Minimum Length | 8 characters | PASS |
| Password Complexity | Requires digit, uppercase letter, lowercase letter | PASS |
| Account Lockout | 5 failed attempts → 15-minute lockout | PASS |
| Global Rate Limiting | Sliding window: 200 requests / 10 seconds per IP | PASS |
| Auth Endpoint Rate Limiting | Fixed window: 10 requests / 1 minute per IP (login, register, refresh) | PASS |
| Security Headers | X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, Content-Security-Policy | PASS |
| HSTS | Enabled in production (HTTPS only) | PASS |
| CORS | Production restricted to app.capitallab.io and portal.capitallab.io | PASS |
| CORS Development | localhost:4200 only | PASS |
| Transport Encryption | HTTPS enforced; response compression via Brotli + Gzip over HTTPS | PASS |
| SQL Injection | EF Core parameterized queries throughout; no raw SQL string interpolation | PASS |
| PDF Authorization | Patient role validated against report ownership before serving PDF | PASS |
| Audit Trail | Serilog structured logging + AuditMiddleware on all write operations | PASS |
| Soft Delete | Records preserved for audit trail; no hard deletes on sensitive entities | PASS |
| Background Job Admin | Hangfire dashboard restricted to SuperAdmin role in production | PASS |
| Cryptographic Token Generation | 64-byte cryptographically random refresh tokens (RNGCryptoServiceProvider) | PASS |

---

## 2. OWASP Top 10 (2021) Assessment

| # | Category | Result | Notes |
|---|---|---|---|
| A01 | Broken Access Control | PARTIAL PASS | PDF ownership check applied. 4 controllers with over-permissive role configuration remain and are documented in Remaining Risks. |
| A02 | Cryptographic Failures | PASS | RS256 asymmetric signing. SHA256 hashing of refresh tokens at rest. HTTPS enforced. No sensitive data stored in plaintext. |
| A03 | Injection | PASS | EF Core ORM with parameterized queries on all data access paths. No dynamic SQL construction found. |
| A04 | Insecure Design | PASS | Soft delete pattern preserves audit trail. Role-based access control enforced at controller and service layers. Principle of least privilege applied to token scopes. |
| A05 | Security Misconfiguration | PASS | Security headers middleware applied (remediated this phase). CORS restricted per environment. Hangfire admin protected in production. Development seeds do not leak into production configuration. |
| A06 | Vulnerable and Outdated Components | INFORMATIONAL | NuGet packages should be audited against known CVEs prior to each production release. No known high-severity vulnerabilities confirmed in current dependency set. |
| A07 | Identification and Authentication Failures | PASS | Rate limiting on auth endpoints. Account lockout enforced. Token rotation on every refresh use. Tokens hashed at rest. |
| A08 | Software and Data Integrity Failures | PASS | Docker images used for deployment. No dynamic code execution or unsafe deserialization identified. |
| A09 | Security Logging and Monitoring Failures | PASS | Serilog structured JSON logging. GlobalExceptionMiddleware captures all unhandled exceptions. AuditMiddleware tracks user actions with userId, path, and timestamp. |
| A10 | Server-Side Request Forgery (SSRF) | PASS | No server-side URL fetching from user-controlled input identified in the codebase. |

---

## 3. Authentication Flow

```
Client                          API                              Database
  |                              |                                   |
  |-- POST /auth/login --------->|                                   |
  |   { email, password }        |-- Validate credentials ---------->|
  |                              |   (ASP.NET Identity, bcrypt)      |
  |                              |<-- User record + roles -----------|
  |                              |                                   |
  |                              |-- Check lockout status ---------->|
  |                              |   (5 attempts / 15 min window)    |
  |                              |                                   |
  |                              |-- Generate Access Token           |
  |                              |   RS256, 15-min expiry            |
  |                              |   Claims: userId, email, roles    |
  |                              |                                   |
  |                              |-- Generate Refresh Token          |
  |                              |   64-byte random                  |
  |                              |   SHA256 hash → store in DB      |
  |                              |                                   |
  |<-- 200 { accessToken,        |                                   |
  |          refreshToken }      |                                   |
  |                              |                                   |
  |-- GET /api/protected ------->|                                   |
  |   Authorization: Bearer <AT> |-- Validate JWT signature          |
  |                              |   (RS256 public key)              |
  |                              |   ValidateIssuer ✓                |
  |                              |   ValidateAudience ✓              |
  |                              |   ValidateLifetime ✓              |
  |                              |   ClockSkew: 30s                  |
  |<-- 200 { data }             |                                   |
  |                              |                                   |
  |-- POST /auth/refresh ------->|                                   |
  |   { refreshToken }           |-- SHA256(token) → lookup in DB -->|
  |                              |<-- Token record ------------------|
  |                              |-- Validate expiry (7 days)        |
  |                              |-- Rotate: delete old, issue new   |
  |                              |   (prevents replay attacks)       |
  |<-- 200 { new accessToken,    |                                   |
  |          new refreshToken }  |                                   |
  |                              |                                   |
  |-- POST /auth/logout -------->|                                   |
  |                              |-- Delete all tokens for user ---->|
  |<-- 204 No Content           |                                   |
```

**Key security properties of this flow:**
- The private RS256 key never leaves the server. Token forgery requires private key compromise.
- Refresh token rotation means a stolen refresh token will be detected on the next legitimate use (the rotated token will not match).
- Logout is hard: all tokens are removed from storage, not merely expired.
- Rate limiting prevents brute-force against the login and refresh endpoints.

---

## 4. Security Headers Configuration

Applied globally via `SecurityHeadersMiddleware` registered in the ASP.NET Core pipeline.

| Header | Value | Purpose |
|---|---|---|
| `X-Frame-Options` | `DENY` | Prevents clickjacking via iframe embedding |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing attacks |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter for older browsers |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer information leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables unused browser APIs |
| `Content-Security-Policy` | `default-src 'self'; ...` | Restricts resource loading origins |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS (production only) |

---

## 5. Critical Findings Resolved This Phase

### Fix 1: Missing Security Headers (Previously FAIL → PASS)

**Severity Before Fix:** High  
**Category:** OWASP A05 — Security Misconfiguration

**Issue:** The application served responses without standard security headers, leaving clients vulnerable to clickjacking, MIME sniffing, and cross-site scripting attacks on older browsers. A missing Content-Security-Policy allowed unrestricted resource loading.

**Remediation:** `SecurityHeadersMiddleware` was implemented and registered early in the ASP.NET Core middleware pipeline. All seven headers are now applied to every HTTP response. HSTS is conditionally applied in production only to avoid breaking local development.

**Status:** RESOLVED — confirmed via code review.

---

### Fix 2: Missing PDF Report Ownership Validation (Previously FAIL → PASS)

**Severity Before Fix:** High  
**Category:** OWASP A01 — Broken Access Control

**Issue:** The PDF report download endpoint served files to any authenticated Patient without verifying that the requesting patient was the owner of the requested report. An authenticated patient could enumerate report IDs and download reports belonging to other patients.

**Remediation:** The `GetReportPdfQuery` handler and its corresponding controller action were patched to extract the `PatientId` claim from the authenticated user's JWT and validate it against the `PatientId` stored on the requested report record. Requests from non-owning patients now receive HTTP 403 Forbidden.

**Status:** RESOLVED — confirmed via code review.

---

## 6. Remaining Risks

| # | Risk | Severity | Category | Mitigation |
|---|---|---|---|---|
| 1 | 4 controllers have over-permissive role bindings — endpoints accessible to roles broader than required | Medium | A01 — Broken Access Control | Audit each affected controller. Apply `[Authorize(Roles = "...")]` with the minimum required role. Target: next sprint before public launch. |
| 2 | SignalR JWT passed via query string (`access_token` parameter) may appear in web server access logs | Low | A09 — Logging Exposure | Configure log filtering to exclude the `access_token` query parameter. Alternatively, restrict SignalR connection logging level in production. |
| 3 | No CSRF token enforcement | Low | A01 — Broken Access Control | The SPA architecture (Angular with JWT in Authorization header) provides natural CSRF mitigation since cookies are not used for auth. Risk is low. Document this assumption. If cookie-based auth is ever added, CSRF tokens must be introduced. |
| 4 | Hangfire dashboard (`/hangfire`) accessible without authentication in Development environment | Low | A05 — Security Misconfiguration | Restricted to SuperAdmin in production. Development exposure is accepted risk. Ensure development environments are not reachable from public networks. |

---

## 7. Dependency Security Note

NuGet package dependencies should be audited against the [National Vulnerability Database](https://nvd.nist.gov/) and [GitHub Advisory Database](https://github.com/advisories) prior to each production release. The recommended tooling is:

```bash
dotnet list package --vulnerable --include-transitive
```

This check should be incorporated into the CI/CD pipeline as a blocking step.

---

## 8. Certification Verdict

> **CERTIFIED**
>
> CapitalLab demonstrates an enterprise-grade security posture suitable for production deployment in a healthcare environment. The authentication system implements industry best practices including asymmetric JWT signing, token rotation, and defence-in-depth rate limiting. Two critical issues — missing security response headers and missing PDF report ownership validation — were identified and fully remediated during this review phase. Four low-to-medium residual risks are documented with clear remediation paths. The system is certified for production release subject to completion of the remaining risk mitigations prior to public launch.

---

*This document reflects the security state of the codebase as of 2026-06-13. Security certification requires periodic renewal. Next scheduled review: 2026-12-13.*
