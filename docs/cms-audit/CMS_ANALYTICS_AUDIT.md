# CMS Analytics Audit
**Date:** 2026-06-13 | **Auditor:** Automated CMS Audit Pass

---

## Summary
**Status: PARTIAL — View count tracking is implemented. Full analytics dashboard is out of scope for Phase 1.**

---

## View Count Tracking

### Posts
- View count incremented on every public `GET /posts/{slug}` request
- Fire-and-forget: `_ = Mediator.Send(new IncrementPostViewCommand(...), CancellationToken.None)`
- Domain method: `public void IncrementView() => ViewCount++`
- View count returned in both `ContentPostSummaryResponse` and `ContentPostDetailResponse`
- View count displayed on article detail page ✅

### Events
- View count incremented on every public `GET /events/{slug}` request
- Same fire-and-forget pattern
- View count returned in `ContentEventSummaryResponse` and `ContentEventDetailResponse` ✅

---

## Analytics Response Contract

`ContentAnalyticsResponse` is defined in `Contracts`:
```csharp
public record ContentAnalyticsResponse(
    int TotalPosts,
    int PublishedPosts,
    int DraftPosts,
    int TotalEvents,
    int UpcomingEvents,
    int TotalViews,
    List<ContentPostSummaryResponse> TopPosts,
    List<ContentCategoryResponse> TopCategories);
```

However, **no handler or endpoint implements this contract**. The contract exists as a data shape but neither `GetContentAnalyticsQuery` nor a `/admin/analytics` endpoint has been built.

**Assessment:** This is a documented Phase 1 limitation. The `ContentAnalyticsResponse` contract serves as the specification for Phase 2 implementation.

---

## Available Analytics (From Existing Data)

The following analytics can be derived by querying the database directly:

| Metric | Source | Available |
|---|---|---|
| Total posts | `COUNT(content.posts)` | ✅ Data present |
| Published posts | `WHERE is_published = true` | ✅ |
| Draft posts | `WHERE is_published = false` | ✅ |
| Top posts by view | `ORDER BY view_count DESC` | ✅ |
| Total views | `SUM(view_count)` | ✅ |
| Posts per category | `GROUP BY category_id` | ✅ |
| Upcoming events | `WHERE event_date >= NOW()` | ✅ |
| Popular categories | `JOIN + GROUP BY + ORDER BY post_count` | ✅ |

---

## Performance Considerations

View count increment uses `ViewCount++` in-memory followed by an EF Core `UPDATE`. Under high traffic (> 1000 concurrent article views), this creates lock contention on the posts table.

**Production Recommendation:** Use `ExecuteUpdateAsync` or a Redis counter with periodic flush for high-traffic scenarios. For current scale (Phase 1 lab management platform), direct DB updates are acceptable.

---

## Popular Articles / Categories

Not surfaced in any public UI currently. The admin posts list is sortable by view count (backend orders by `PublishedAt` — view count sort is not implemented).

**Phase 2 Enhancement:** Add `sortBy=viewCount` parameter to `GetContentPostsQuery`.

---

## Analytics Audit: PARTIAL PASS

View counting: ✅ Implemented
Analytics dashboard: ❌ Out of scope for Phase 1 — contract defined, implementation deferred
