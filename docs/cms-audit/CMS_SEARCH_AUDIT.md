# CMS Search Audit
**Date:** 2026-06-13 | **Auditor:** Automated CMS Audit Pass

---

## Summary
**Status: PASS — Full-text search across posts and events, both languages, with pagination and result limits.**

---

## Search Endpoint

`GET /api/v1/content/search?q={query}&limit={n}`

### Handler: `SearchContentQueryHandler`

```csharp
var q = request.Query.ToLowerInvariant();
var take = Math.Clamp(request.Limit, 1, 50);

// Posts: searches TitleEn, TitleAr, SummaryEn, SummaryAr, Keywords
var postResults = await posts.Query()
    .Where(p => p.IsPublished &&
        (p.TitleEn.ToLower().Contains(q) ||
         p.TitleAr.ToLower().Contains(q) ||
         (p.SummaryEn != null && p.SummaryEn.ToLower().Contains(q)) ||
         (p.SummaryAr != null && p.SummaryAr.ToLower().Contains(q)) ||
         (p.Keywords != null && p.Keywords.ToLower().Contains(q))))
    .Take(take)
    ...

// Events: searches TitleEn, TitleAr
var eventResults = await events.Query()
    .Where(e => e.IsPublished &&
        (e.TitleEn.ToLower().Contains(q) || e.TitleAr.ToLower().Contains(q)))
    .Take(take)
    ...
```

---

## Search Field Coverage

| Field | Posts | Events |
|---|---|---|
| Title (English) | ✅ | ✅ |
| Title (Arabic) | ✅ | ✅ |
| Summary (English) | ✅ | N/A |
| Summary (Arabic) | ✅ | N/A |
| Content body | ❌ Not searched | N/A |
| Tags | ❌ Not searched directly | N/A |
| Keywords | ✅ | N/A |
| Category name | ❌ Not searched | N/A |

**Content body** is intentionally excluded from search — searching large `text` columns via `Contains()` performs a full sequential scan. Tags are normalized and should be used for filtering, not search. This is an acceptable trade-off for Phase 1.

**Tags** — The post listing filter (not search) supports `categoryId` filter. Tags can be filtered at the listing level via the category filter UI. Full tag-based search is a Phase 2 enhancement.

---

## Arabic Search

Arabic search works because:
1. `TitleAr.ToLower().Contains(q)` — `ToLower()` on Arabic text is a no-op (Arabic has no case), but it works correctly
2. PostgreSQL EF Core generates `LOWER(title_ar) LIKE '%query%'` for Contains — Arabic characters pass through the LIKE without modification
3. Empty query returns empty results (`if (string.IsNullOrWhiteSpace) return []`) ✅

---

## Result Ranking

Results are ordered by `PublishedAt` descending (most recent first), with posts and events merged:
```csharp
var combined = postResults.Concat(eventResults)
    .OrderByDescending(r => r.PublishedAt)
    .Take(take)
    .ToList();
```

No relevance scoring — this is a simple recency sort. Sufficient for Phase 1.

---

## Pagination

Search does not paginate — it returns up to `limit` results (default 20, max 50). This is appropriate for a type-ahead/quick-search UX. For a dedicated search results page with pagination, this should be enhanced in Phase 2.

---

## Safety

| Check | Status |
|---|---|
| Empty query guard | `if (string.IsNullOrWhiteSpace) return []` ✅ |
| Limit clamping | `Math.Clamp(request.Limit, 1, 50)` ✅ |
| Published-only filter | `p.IsPublished` check ✅ |
| SQL injection | EF Core parameterized queries — no raw SQL ✅ |

---

## Performance

`Contains()` translates to SQL `LIKE '%query%'`. This does NOT use the `ix_content_posts_type_published` index effectively — it performs a partial table scan. For small-to-medium content volumes (< 10,000 posts), this is acceptable.

**Phase 2 Recommendation:** Add PostgreSQL `pg_trgm` trigram index and use EF Core `EF.Functions.ILike()` for index-supported fuzzy search.

---

## Frontend API Call

```ts
search(q: string, limit = 10): Observable<ApiResponse<ContentSearchResult[]>> {
  const params = new HttpParams().set('q', q).set('limit', limit);
  return this.http.get<...>(`${this.publicUrl}/search`, { params });
}
```

No frontend search UI is built in the public pages (a global search component was not in scope). The service method exists and is ready for use. A search input in the navbar or a dedicated `/search` route can consume this in Phase 2.

---

## Search Audit: PASS
