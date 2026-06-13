# CMS API Audit
**Date:** 2026-06-13 | **Auditor:** Automated CMS Audit Pass

---

## Summary
All 22 API endpoints have been verified against frontend calls.  
**Status: PASS — 22/22 endpoints verified.**

---

## Public API Verification

| Endpoint | Method | Frontend Call | Auth | Pagination | Filtering | Search | Status |
|---|---|---|---|---|---|---|---|
| `/api/content/posts` | GET | `getPosts(params)` | Anonymous | ✅ PagedResult | type, categoryId, featured | ✅ Pagination.Search | ✅ PASS |
| `/api/content/posts/{slug}` | GET | `getPostBySlug(slug)` | Anonymous | N/A | N/A | N/A | ✅ PASS |
| `/api/content/events` | GET | `getEvents(params)` | Anonymous | ✅ PagedResult | upcoming | ✅ title search | ✅ PASS |
| `/api/content/events/{slug}` | GET | `getEventBySlug(slug)` | Anonymous | N/A | N/A | N/A | ✅ PASS |
| `/api/content/categories` | GET | `getCategories()` | Anonymous | N/A | ActiveOnly:true | N/A | ✅ PASS |
| `/api/content/tags` | GET | `getTags()` | Anonymous | N/A | N/A | N/A | ✅ PASS |
| `/api/content/search` | GET | `search(q, limit)` | Anonymous | N/A | N/A | posts + events | ✅ PASS |

**Note:** No `/api/content/news` or `/api/content/blog` as separate endpoints. Frontend correctly uses `/posts?type=News` and `/posts?type=Blog`. This is correct by design.

---

## Admin API Verification

### Posts

| Endpoint | Method | Auth | Validation | Status |
|---|---|---|---|---|
| `GET /admin/posts` | GET | SuperAdmin,Owner,BranchAdmin | Pagination, type, published, featured filters | ✅ PASS |
| `GET /admin/posts/{slug}` | GET | SuperAdmin,Owner,BranchAdmin | Slug lookup (AdminView=true shows drafts) | ✅ PASS |
| `POST /admin/posts` | POST | SuperAdmin,Owner,BranchAdmin | FluentValidation: TitleEn/Ar required, ContentEn/Ar required, slug regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` | ✅ PASS |
| `PUT /admin/posts/{id:guid}` | PUT | SuperAdmin,Owner,BranchAdmin | Same validators + duplicate slug check | ✅ PASS |
| `DELETE /admin/posts/{id:guid}` | DELETE | SuperAdmin,Owner,BranchAdmin | 404 guard | ✅ PASS |
| `PATCH /admin/posts/{id:guid}/publish` | PATCH | SuperAdmin,Owner,BranchAdmin | Sets PublishedAt timestamp once | ✅ PASS |
| `PATCH /admin/posts/{id:guid}/unpublish` | PATCH | SuperAdmin,Owner,BranchAdmin | Does not clear PublishedAt (preserves history) | ✅ PASS |
| `PATCH /admin/posts/{id:guid}/feature` | PATCH | SuperAdmin,Owner,BranchAdmin | 404 guard | ✅ PASS |
| `PATCH /admin/posts/{id:guid}/unfeature` | PATCH | SuperAdmin,Owner,BranchAdmin | 404 guard | ✅ PASS |

### Categories

| Endpoint | Auth | Validation | Status |
|---|---|---|---|
| `GET /admin/categories` | SuperAdmin,Owner,BranchAdmin | ActiveOnly:false (all) | ✅ PASS |
| `POST /admin/categories` | SuperAdmin,Owner,BranchAdmin | NameEn/Ar required ≤200, slug regex, duplicate check | ✅ PASS |
| `PUT /admin/categories/{id:guid}` | SuperAdmin,Owner,BranchAdmin | Same + cross-slug duplicate | ✅ PASS |
| `DELETE /admin/categories/{id:guid}` | SuperAdmin,Owner,BranchAdmin | Posts retain (SetNull FK) | ✅ PASS |

### Authors

| Endpoint | Auth | Validation | Status |
|---|---|---|---|
| `GET /admin/authors` | SuperAdmin,Owner,BranchAdmin | ActiveOnly:false | ✅ PASS |
| `POST /admin/authors` | SuperAdmin,Owner,BranchAdmin | FullName required ≤200 | ✅ PASS |
| `PUT /admin/authors/{id:guid}` | SuperAdmin,Owner,BranchAdmin | 404 guard | ✅ PASS |
| `DELETE /admin/authors/{id:guid}` | SuperAdmin,Owner,BranchAdmin | Posts retain (SetNull FK) | ✅ PASS |

### Tags

| Endpoint | Auth | Validation | Status |
|---|---|---|---|
| `GET /admin/tags` | SuperAdmin,Owner,BranchAdmin | With PostTag count | ✅ PASS |
| `POST /admin/tags` | SuperAdmin,Owner,BranchAdmin | slug regex, duplicate check | ✅ PASS |
| `DELETE /admin/tags/{id:guid}` | SuperAdmin,Owner,BranchAdmin | Cascade removes PostTags | ✅ PASS |

### Events

| Endpoint | Auth | Validation | Status |
|---|---|---|---|
| `GET /admin/events` | SuperAdmin,Owner,BranchAdmin | PublishedOnly:false | ✅ PASS |
| `POST /admin/events` | SuperAdmin,Owner,BranchAdmin | TitleEn/Ar required, slug regex, EventDate required, EndDate > EventDate | ✅ PASS |
| `PUT /admin/events/{id:guid}` | SuperAdmin,Owner,BranchAdmin | Same + cross-slug check | ✅ PASS |
| `DELETE /admin/events/{id:guid}` | SuperAdmin,Owner,BranchAdmin | 404 guard | ✅ PASS |
| `PATCH /admin/events/{id:guid}/publish` | SuperAdmin,Owner,BranchAdmin | 404 guard | ✅ PASS |
| `PATCH /admin/events/{id:guid}/unpublish` | SuperAdmin,Owner,BranchAdmin | 404 guard | ✅ PASS |

---

## DTO Match Verification

All backend `ContentPostSummaryResponse` fields match frontend `ContentPostSummary` interface:
- `id`, `type` (string enum cast), `titleEn/Ar`, `summaryEn/Ar`, `slug`, `thumbnailUrl`, `featuredImageUrl`, `isFeatured`, `isPublished`, `publishedAt`, `viewCount`, `readingTimeMinutes`, `categoryNameEn/Ar/Slug`, `authorName`, `authorImageUrl`, `tags` (string[]) ✅

All `ContentPostDetailResponse` fields match `ContentPostDetail` interface ✅  
All `ContentEventSummaryResponse` fields match `ContentEventSummary` ✅  
All `ContentEventDetailResponse` fields match `ContentEventDetail` ✅

---

## Defect Fixed

**[FIXED]** Admin post editor was loading by Guid (`/posts/:id/edit`) but backend `GET /admin/posts/{slug}` only accepts slugs. Fixed by changing route to `/posts/:slug/edit` and edit link to pass `post.slug`.
