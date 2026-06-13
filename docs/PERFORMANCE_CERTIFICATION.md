# Performance Certification Report

| Field | Value |
|---|---|
| **Project** | CapitalLab — Laboratory Management Platform |
| **Document** | Performance Certification |
| **Version** | 1.0 |
| **Date** | 2026-06-13 |
| **Status** | CERTIFIED WITH NOTES |
| **Reviewed By** | Backend Engineering |
| **Methodology** | Static architecture analysis (live load testing pending staging deployment) |
| **Next Review** | 2026-12-13 |

---

## Executive Summary

CapitalLab's backend architecture has been evaluated for production performance readiness through static analysis of database indexing strategy, query patterns, caching configuration, pagination enforcement, and infrastructure design. The system demonstrates sound architectural decisions for production-grade throughput. Four optimizations are recommended before high-scale load is anticipated.

**Overall Verdict: CERTIFIED WITH NOTES**

---

## 1. Pagination Coverage

All list-returning endpoints enforce server-side pagination to prevent unbounded result sets from reaching the database or the client.

| Entity / Endpoint | Pagination Enforced | Default Page Size | Maximum Page Size | Method |
|---|---|---|---|---|
| Audit Logs | Yes | 20 | 100 | `ToPagedResultAsync` |
| Inventory Items | Yes | 20 | 100 | `ToPagedResultAsync` |
| Insurance Records | Yes | 20 | 100 | `ToPagedResultAsync` |
| Notifications | Yes | 20 | 100 | `ToPagedResultAsync` |
| Payments | Yes | 20 | 100 | `ToPagedResultAsync` |
| Invoices | Yes | 20 | 100 | `ToPagedResultAsync` |
| Analytics / Dashboard | Hardcoded `Take(10)` | 10 | 10 | Intentional — dashboard widgets |

**Notes:**
- The page size cap of 100 is enforced at the `ToPagedResultAsync` extension level, meaning a client passing `pageSize=999` will receive at most 100 results. This prevents denial-of-service via oversized page requests.
- Analytics queries use hardcoded `Take(10)` which is acceptable for dashboard summary widgets. These queries are bounded by design and do not require configurable pagination.
- All paginated endpoints return total count metadata, enabling clients to implement correct paging UI without additional round trips.

---

## 2. Database Index Strategy

### 2.1 Index Coverage Summary

| Table | Index Type | Columns | Query Pattern Served |
|---|---|---|---|
| `test_results` | Composite | `(PatientId, LabTestId)` | Patient trend queries — filtered by patient, grouped by test |
| `orders` | Single column | `Status` | Order queue filtering by status (Pending, Processing, Complete) |
| `appointments` | Single column | `Status` | Appointment queue filtering |
| `lab_tests` | Single column | `Status` | Active/inactive test catalogue queries |
| `invoices` | Unique | `InvoiceNumber` | Invoice lookup by business key |
| `samples` | Unique | `SampleNumber` | Sample lookup by business identifier |
| `barcodes` | Unique | `BarcodeValue` | Barcode scan lookup — latency-critical |
| `notifications` | Single column | `UserId` | Per-user notification retrieval |
| `inventory_items` | Single column | `Status` | Low-stock and active inventory queries |
| `patients` | Single column | `NationalId` | Patient deduplication and lookup |

### 2.2 Index Design Principles Applied

- **Composite index on `(PatientId, LabTestId)`** — the most query-critical index in the system. Patient trend analysis requires filtering by patient then grouping by test; this composite index covers both predicates and eliminates a table scan on the `test_results` table, which is the highest-volume table in a lab system.
- **Status indexes on workflow entities** — queues (orders, appointments) are almost always filtered by status. Without these indexes, queue queries degrade to full table scans as row counts grow.
- **Unique indexes on business keys** — barcode scan, invoice lookup, and sample retrieval are latency-sensitive operations. Unique indexes enforce data integrity and guarantee O(log n) lookup regardless of table size.

### 2.3 Index Gaps to Monitor

As the dataset grows, the following additional indexes should be evaluated:

| Candidate Index | Rationale |
|---|---|
| `orders(PatientId, CreatedAt DESC)` | Patient order history queries — common in patient portal |
| `audit_logs(UserId, CreatedAt DESC)` | Per-user audit history — currently paginated but full scan on filter |
| `appointments(DoctorId, ScheduledAt)` | Doctor schedule queries for calendar views |

---

## 3. Query Pattern Analysis

### 3.1 N+1 Query Prevention

| Finding | Count | Risk |
|---|---|---|
| Explicit `.Include()` calls | 8 | Low — all explicit, no lazy loading |
| Lazy loading enabled | 0 | None — disabled |
| Navigation properties accessed outside Include | 0 | None detected |

The codebase uses explicit eager loading throughout. Navigation properties are never accessed on untracked entities without a corresponding `.Include()`. No lazy loading proxies are registered, making N+1 queries structurally impossible at the ORM level.

All `.Include()` calls load one level of child collections (e.g., `order.Items`). No deep include chains (`ThenInclude` more than 2 levels) were identified, which avoids Cartesian explosion on multi-collection joins.

### 3.2 Query Execution Approach

- **EF Core 9** with compiled query support available for high-frequency hot paths.
- All filtering is applied at the `IQueryable` level before `.ToListAsync()` — no in-memory filtering of large result sets.
- Sorting is applied at the database level via `OrderBy` before pagination, ensuring consistent cursor behavior.

---

## 4. Caching Architecture

### 4.1 Cache Stack

| Layer | Technology | Scope | Environment |
|---|---|---|---|
| Distributed cache | Redis 7 | Cross-instance, shared state | Production |
| In-process fallback | MemoryCache | Single instance | Development |
| HTTP response cache | Not configured | — | Not applicable |

### 4.2 Cache Service Implementation

`RedisCacheService` implements the `ICacheService` interface, providing a consistent abstraction over Redis. All cache reads follow a cache-aside pattern:

```
1. Check cache for key
2. If hit → return cached value (no DB round trip)
3. If miss → query database → write to cache with TTL → return value
```

The interface abstraction allows the caching layer to be swapped or mocked in tests without modifying business logic.

### 4.3 Cache Configuration

| Parameter | Value |
|---|---|
| Redis connection | Configured via `REDIS_CONNECTION_STRING` environment variable |
| Serialization | JSON (System.Text.Json) |
| Cache key namespace | Service-specific prefixes (implementation-defined) |
| Default TTL | Configured per cache call site |

### 4.4 Cache Coverage Gaps

Explicit cache coverage documentation per endpoint is not maintained. A cache hit rate measurement should be established after initial production deployment to identify cold paths that would benefit from caching. The analytics/dashboard aggregation queries are candidates for result caching given their cross-branch join cost.

---

## 5. Response Compression

| Format | Enabled | Condition | Notes |
|---|---|---|---|
| Brotli | Yes | HTTPS requests | Higher compression ratio, modern browsers |
| Gzip | Yes | HTTPS requests (fallback) | Broad client compatibility |
| Plain HTTP | No | — | `EnableForHttps = true` — no compression over unencrypted transport |

Compression is applied at the middleware level before responses reach the client. JSON API responses (typically 60–80% compressible) benefit most. Binary responses (PDF reports) are excluded from compression as they are already compressed.

---

## 6. Infrastructure Capacity

### 6.1 Configuration

| Component | Configuration | Notes |
|---|---|---|
| Database | PostgreSQL 16 | Connection pool: Min 5, Max 100 per API instance |
| Cache | Redis 7 | Single instance, no sentinel configured (HA gap — see risks) |
| API | .NET 10, stateless | Horizontally scalable — no shared in-process state |
| Background Jobs | Hangfire | Worker count: `ProcessorCount × 2` per instance |
| Job Storage | PostgreSQL | Shared job queue across instances |

### 6.2 Concurrent User Capacity Estimates

The following estimates are based on architectural analysis. Actual numbers must be validated with load testing (Apache JMeter or k6) against the staging environment before go-live.

| Concurrent Users | Single Instance Assessment | Notes |
|---|---|---|
| **100** | Comfortable | DB pool utilization ~10–20%. Redis cache absorbs repeated reads. All requests served within SLA. |
| **500** | Manageable | DB pool at ~50% utilization. Redis becomes critical for read-heavy paths. PDF generation and analytics queries may show latency spikes. Recommend monitoring P95 latency. |
| **1000** | Requires horizontal scaling | A single API instance will reach DB pool saturation. Recommend 2–3 API instances behind a load balancer. Redis sentinel or cluster recommended at this scale. Async PDF generation strongly recommended. |
| **5000+** | Requires architectural changes | Read replicas for PostgreSQL, Redis cluster, CDN for static assets, async report generation queue mandatory. |

### 6.3 Horizontal Scaling Readiness

| Concern | Status | Notes |
|---|---|---|
| Session state | Stateless — JWT | No server-side session. Any instance can serve any request. |
| Cache coherence | Redis (shared) | All instances share the same Redis instance. Cache invalidation is consistent. |
| Background jobs | Hangfire PostgreSQL | Job queue is in the shared database. Multiple instances compete for jobs safely via distributed locking. |
| File storage | Not assessed | If PDF reports are generated to local disk, horizontal scaling requires shared storage (NFS, S3, or equivalent). |
| WebSocket (SignalR) | Redis backplane required at scale | SignalR requires a Redis backplane to fan out messages across multiple API instances. Verify this is configured before multi-instance deployment. |

---

## 7. Performance Risks

| # | Risk | Severity | Impact | Recommended Mitigation |
|---|---|---|---|---|
| 1 | Report PDF generation is synchronous — request threads are blocked during PDF rendering | Medium | Under load, PDF requests accumulate in the thread pool, increasing latency for all concurrent requests | Move PDF generation to a Hangfire background job. Return HTTP 202 Accepted with a job ID. Client polls for completion or receives SignalR notification when ready. |
| 2 | Analytics/dashboard aggregation queries perform cross-branch joins without result caching | Medium | Dashboard load time increases linearly with data volume. Cross-branch aggregation is expensive at scale. | Cache dashboard aggregation results in Redis with a short TTL (e.g., 5 minutes). Stale-while-revalidate pattern acceptable for dashboard data. |
| 3 | No query timeout configuration found in the DbContext or connection string | Low | A pathological query (missing index, data skew, lock contention) can hold a connection indefinitely, exhausting the connection pool | Set `CommandTimeout` on the `DbContext` options (recommended: 30 seconds for API requests, 300 seconds for background jobs). |
| 4 | Audit log writes are synchronous in the request pipeline | Low | Every write operation incurs an additional synchronous DB round trip for audit logging, adding latency to all mutating requests | Move audit log writes to a fire-and-forget async operation or a dedicated audit queue processed by a Hangfire job. Use `Task.Run` with care to avoid swallowing exceptions. |

---

## 8. Load Testing Recommendation

Before processing real patient data in production, execute a structured load test against the staging environment using the following scenarios:

| Scenario | Target RPS | Duration | Pass Criteria |
|---|---|---|---|
| Login + token refresh | 50 RPS | 5 minutes | P95 < 200ms, 0 errors |
| Patient portal read (results, notifications) | 200 RPS | 10 minutes | P95 < 300ms, error rate < 0.1% |
| Order creation (write path) | 50 RPS | 5 minutes | P95 < 500ms, 0 data errors |
| PDF report download | 20 RPS | 3 minutes | P95 < 2s, 0 errors |
| Dashboard aggregation | 30 RPS | 5 minutes | P95 < 1s |

Recommended tooling: [k6](https://k6.io/) for scripted scenarios with threshold assertions.

---

## 9. Certification Verdict

> **CERTIFIED WITH NOTES**
>
> CapitalLab's backend architecture demonstrates production-ready performance foundations: comprehensive pagination enforcement preventing unbounded queries, strategic database indexing covering all primary query patterns, Redis-backed distributed caching, stateless API design enabling horizontal scaling, and response compression for reduced bandwidth consumption. The system is estimated to comfortably support 100–500 concurrent users on a single instance and up to 1000+ concurrent users with straightforward horizontal scaling.
>
> Four optimizations are recommended before high-scale load is anticipated: async PDF generation, analytics result caching, query timeout configuration, and async audit logging. These are not blocking issues at initial launch scale but should be prioritized in the first post-launch sprint. Live load testing against the staging environment is required before the system is exposed to anticipated peak production traffic.

---

*This document reflects the performance architecture state as of 2026-06-13. Metrics must be validated with live load testing. Next scheduled review: 2026-12-13.*
