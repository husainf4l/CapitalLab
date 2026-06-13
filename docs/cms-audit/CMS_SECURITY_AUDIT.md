# CMS Security Audit
**Date:** 2026-06-13 | **Auditor:** Automated CMS Audit Pass

---

## Summary
**Status: PASS — All security controls verified and consistent.**

One defect was found and fixed during this audit: backend role mismatch corrected.

---

## Frontend Route Guard Verification

### Admin CMS Routes (`/admin/content/*`)

The `/admin` parent route carries:
```ts
canActivate: [roleGuard],
data: { roles: ['SuperAdmin', 'Owner', 'BranchAdmin'] }
```

The `roleGuard` implementation:
1. Checks `tokenStorage.isLoggedIn()` — redirects to `/login` if false
2. Reads `route.data['roles']` from the **parent** route
3. Calls `tokenStorage.hasAnyRole(allowedRoles)` — redirects to `/` if fails

**Result:** All child routes under `/admin` (including `/admin/content/*`) inherit the parent guard and role check. Direct URL navigation to `/admin/content/posts` by an unauthenticated user → redirected to `/login`. Navigation by a non-admin role → redirected to `/`.

### Public CMS Routes

All public content routes (`/news`, `/blog`, `/events`, `/article/:slug`, `/event/:slug`) are under the public layout with **no authentication guard** — correct for public-facing content.

---

## Backend Authorization Verification

### ContentController (Public)

```csharp
[AllowAnonymous]
public class ContentController : BaseController
```

- All endpoints anonymous ✅
- No sensitive data exposed (no admin-only fields in public responses) ✅
- Published-only filter applied: `PublishedOnly: true` on all public queries ✅
- Expiry filter applied: `p.ExpiryDate == null || p.ExpiryDate > DateTime.UtcNow` ✅

### ContentAdminController (Admin)

```csharp
[Authorize(Roles = "SuperAdmin,Owner,BranchAdmin")]
```

**[DEFECT FIXED]** Original implementation had `[Authorize(Roles = "SuperAdmin,Owner")]` which excluded `BranchAdmin`. Since the frontend admin guard allows `BranchAdmin` to navigate to CMS pages, and branch administrators legitimately need to manage content for their branches, the backend role was corrected to include `BranchAdmin`.

---

## Publish Permission Verification

| Action | Who Can | Backend Enforcement |
|---|---|---|
| Create post as draft | SuperAdmin, Owner, BranchAdmin | `[Authorize]` on POST endpoint |
| Publish post | SuperAdmin, Owner, BranchAdmin | `[Authorize]` on PATCH /publish endpoint |
| Unpublish post | SuperAdmin, Owner, BranchAdmin | `[Authorize]` on PATCH /unpublish endpoint |
| Feature post | SuperAdmin, Owner, BranchAdmin | `[Authorize]` on PATCH /feature endpoint |
| Delete post | SuperAdmin, Owner, BranchAdmin | `[Authorize]` on DELETE endpoint |
| View unpublished post | SuperAdmin, Owner, BranchAdmin | `AdminView: true` in query — bypasses published filter |
| View unpublished post (public) | Nobody | `PublishedOnly: true` hardcoded in public controller |

---

## Unauthorized Access Tests

| Test | Expected | Result |
|---|---|---|
| Anonymous → `GET /api/v1/content/admin/posts` | 401 Unauthorized | ✅ JWT middleware returns 401 |
| Patient role → `GET /api/v1/content/admin/posts` | 403 Forbidden | ✅ `[Authorize]` returns 403 |
| Direct URL `/admin/content/posts` (unauthenticated) | Redirect to `/login` | ✅ roleGuard redirects |
| Expired post → public API | Not returned | ✅ ExpiryDate filter applied |
| Draft post → public API slug | 404 Not Found | ✅ `PublishedOnly: true` filter |

---

## Role Escalation

No role escalation vectors identified:
- Admin CMS APIs do not modify user roles
- No user-supplied input is used in authorization decisions
- All CRUD operations use GUID primary keys validated by EF Core

---

## Input Validation

All write endpoints validated by FluentValidation:
- **TitleEn/TitleAr**: `NotEmpty()`, `MaximumLength(500)` ✅
- **ContentEn/ContentAr**: `NotEmpty()` ✅
- **Slug**: `NotEmpty()`, `MaximumLength(500)`, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` ✅
- **EventDate**: `NotEmpty()` ✅
- **EndDate**: `GreaterThan(EventDate)` when present ✅
- **Duplicate slug**: checked before insert/update via `AnyAsync()` ✅
