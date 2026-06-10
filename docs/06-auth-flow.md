# Capital Lab — Authentication & Authorization Flow

## Token Strategy

| Token | Algorithm | Lifetime | Storage |
|-------|-----------|----------|---------|
| Access Token | RS256 JWT | 15 minutes | Memory (Angular store) |
| Refresh Token | Opaque (UUID v4) | 7 days | HttpOnly Cookie OR localStorage |

- Access tokens are **not stored in localStorage** (XSS risk) — held in NgRx state (memory)
- Refresh tokens: stored hashed in DB, single-use rotation (each refresh invalidates old token and issues new one)
- On page reload, Angular calls `/auth/refresh` silently to get new access token

---

## JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "John Smith",
  "roles": ["BranchManager"],
  "permissions": ["patients.read", "appointments.write", "results.read"],
  "branchId": "branch-uuid",
  "labId": "lab-uuid",
  "jti": "unique-token-id",
  "iat": 1700000000,
  "exp": 1700000900
}
```

---

## Login Flow

```
User submits email + password
       ↓
POST /api/v1/auth/login
       ↓
  Validate credentials (ASP.NET Identity)
       ↓
  Check IsActive flag
       ↓
  Load roles + permissions for user (+ branch context)
       ↓
  Generate Access Token (RS256, 15 min)
  Generate Refresh Token (UUID, 7 days)
  Save hashed Refresh Token + device info to DB
       ↓
Return { accessToken, refreshToken, expiresAt, userProfile }
       ↓
Angular stores accessToken in NgRx store
Angular stores refreshToken in HttpOnly cookie
       ↓
All subsequent requests: Authorization: Bearer {accessToken}
```

---

## Token Refresh Flow

```
Access token expires (or 401 received)
       ↓
Angular interceptor catches 401
       ↓
POST /api/v1/auth/refresh { accessToken, refreshToken }
       ↓
  Validate access token signature (expired OK)
  Look up refresh token hash in DB
  Check: not used, not revoked, not expired
       ↓
  Mark old refresh token as used
  Generate new Access Token
  Generate new Refresh Token (rotation)
  Save new hashed refresh token
       ↓
Return new { accessToken, refreshToken }
       ↓
Angular updates store with new tokens
Retry original failed request
```

---

## Logout Flow

```
User clicks Logout
       ↓
POST /api/v1/auth/logout { refreshToken }
       ↓
  Mark refresh token as revoked in DB
       ↓
Angular clears NgRx auth store
Redirect to /auth/login
```

---

## Password Reset Flow

```
POST /api/v1/auth/forgot-password { email }
       ↓
  Generate time-limited reset token (1 hour)
  Hash + store in DB
  Send email with link: /reset-password?token=...
       ↓
POST /api/v1/auth/reset-password { token, newPassword, confirmPassword }
       ↓
  Validate token (exists, not used, not expired)
  Hash new password via ASP.NET Identity
  Mark token as used
  Revoke all refresh tokens for user (force re-login)
       ↓
Return success
```

---

## Role-Based Access Control (RBAC)

### Permission Model

```
Role → has many → Permissions
Permission = Module.Action

Examples:
  patients.read
  patients.write
  patients.delete
  results.enter
  results.review
  results.release
  reports.sign
  inventory.manage
  billing.manage
  analytics.view
```

### Backend Enforcement

```csharp
// Policy-based authorization
[Authorize(Policy = "results.release")]
public async Task<IActionResult> ReleaseResult(Guid id) { ... }

// Policy registered in Program.cs
builder.Services.AddAuthorization(options =>
{
    foreach (var permission in Permissions.All)
    {
        options.AddPolicy(permission, policy =>
            policy.Requirements.Add(new PermissionRequirement(permission)));
    }
});

// IAuthorizationHandler reads permissions from JWT claims
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(...)
    {
        var permissions = context.User.FindAll("permissions").Select(c => c.Value);
        if (permissions.Contains(requirement.Permission))
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
```

### Frontend Enforcement

```typescript
// Route-level guard
canActivate: [RoleGuard(['Doctor', 'BranchManager'])]

// Template-level directive
<button *hasPermission="'results.release'">Release Result</button>
<div *hasRole="['Owner', 'SuperAdmin']">Admin Section</div>

// Programmatic check
if (this.authStore.hasPermission('inventory.manage')) { ... }
```

---

## Multi-Factor Authentication (Future)

Planned support for:
- TOTP (Google Authenticator)
- Email OTP for sensitive actions (result release, refund approval)

---

## Audit Logging

Every authenticated request writes to `audit.audit_logs`:

```
AuditMiddleware
  ↓
On each mutating request (POST, PUT, DELETE, PATCH):
  entity_type  = controller resource name
  entity_id    = id from route or body
  action       = Create | Update | Delete
  user_id      = from JWT claims
  branch_id    = from JWT claims
  ip_address   = from request
  old_values   = snapshot before change (EF Core shadow copy)
  new_values   = snapshot after change
  occurred_at  = UTC now
```

For sensitive reads (download report, view patient PII):
```
action = Read
entity_type = "PatientProfile" | "LabReport"
```
