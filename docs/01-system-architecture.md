# Capital Lab — System Architecture

## Overview

Capital Lab is a multi-tenant, multi-branch laboratory information system (LIS) built on Clean Architecture principles. It handles the full lifecycle of laboratory operations: patient registration, appointment booking, sample collection, test processing, result management, billing, and analytics.

---

## Architectural Style

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│         CapitalLab.Api  (Controllers, Hubs, Filters)    │
├─────────────────────────────────────────────────────────┤
│                   Application Layer                      │
│    CapitalLab.Application  (CQRS, Services, Validators) │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                    │
│  CapitalLab.Infrastructure  (EF Core, Redis, Hangfire,  │
│            Serilog, Storage, Email, SMS)                 │
├─────────────────────────────────────────────────────────┤
│                     Domain Layer                         │
│       CapitalLab.Domain  (Entities, Value Objects,      │
│              Domain Events, Interfaces)                  │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rule
- Domain has **zero** external dependencies
- Application depends only on Domain
- Infrastructure depends on Application + Domain
- Presentation depends on Application (never Infrastructure directly)

---

## Solution Structure

```
capital-lab/
├── backend/
│   ├── CapitalLab.sln
│   ├── src/
│   │   ├── CapitalLab.Domain/
│   │   │   ├── Common/
│   │   │   │   ├── BaseEntity.cs
│   │   │   │   ├── AuditableEntity.cs
│   │   │   │   ├── ValueObject.cs
│   │   │   │   └── DomainEvent.cs
│   │   │   ├── Entities/
│   │   │   │   ├── Identity/
│   │   │   │   ├── Branches/
│   │   │   │   ├── Patients/
│   │   │   │   ├── Doctors/
│   │   │   │   ├── Tests/
│   │   │   │   ├── Appointments/
│   │   │   │   ├── Samples/
│   │   │   │   ├── Results/
│   │   │   │   ├── Inventory/
│   │   │   │   ├── Payments/
│   │   │   │   └── Notifications/
│   │   │   ├── Enums/
│   │   │   ├── Events/
│   │   │   ├── Exceptions/
│   │   │   └── Interfaces/
│   │   │       ├── Repositories/
│   │   │       └── Services/
│   │   │
│   │   ├── CapitalLab.Application/
│   │   │   ├── Common/
│   │   │   │   ├── Behaviors/
│   │   │   │   │   ├── ValidationBehavior.cs
│   │   │   │   │   ├── LoggingBehavior.cs
│   │   │   │   │   ├── CachingBehavior.cs
│   │   │   │   │   └── AuditBehavior.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── ICurrentUserService.cs
│   │   │   │   │   ├── IDateTimeService.cs
│   │   │   │   │   └── IStorageService.cs
│   │   │   │   └── Exceptions/
│   │   │   ├── Features/
│   │   │   │   ├── Auth/
│   │   │   │   ├── Branches/
│   │   │   │   ├── Patients/
│   │   │   │   ├── Doctors/
│   │   │   │   ├── Tests/
│   │   │   │   ├── Packages/
│   │   │   │   ├── Appointments/
│   │   │   │   ├── HomeCollection/
│   │   │   │   ├── Samples/
│   │   │   │   ├── Results/
│   │   │   │   ├── Reports/
│   │   │   │   ├── Inventory/
│   │   │   │   ├── Payments/
│   │   │   │   ├── Notifications/
│   │   │   │   └── Analytics/
│   │   │   └── Mappings/
│   │   │
│   │   ├── CapitalLab.Infrastructure/
│   │   │   ├── Persistence/
│   │   │   │   ├── ApplicationDbContext.cs
│   │   │   │   ├── Configurations/   (IEntityTypeConfiguration)
│   │   │   │   ├── Repositories/
│   │   │   │   ├── UnitOfWork.cs
│   │   │   │   └── Migrations/
│   │   │   ├── Identity/
│   │   │   │   ├── AppUser.cs
│   │   │   │   ├── AppRole.cs
│   │   │   │   └── TokenService.cs
│   │   │   ├── Caching/
│   │   │   │   └── RedisCacheService.cs
│   │   │   ├── Storage/
│   │   │   │   ├── IStorageProvider.cs
│   │   │   │   ├── LocalStorageProvider.cs
│   │   │   │   └── S3StorageProvider.cs  (future)
│   │   │   ├── Notifications/
│   │   │   │   ├── EmailService.cs
│   │   │   │   ├── SmsService.cs
│   │   │   │   └── WhatsAppService.cs
│   │   │   ├── BackgroundJobs/
│   │   │   │   └── HangfireJobService.cs
│   │   │   ├── Reporting/
│   │   │   │   └── PdfReportService.cs
│   │   │   └── Logging/
│   │   │       └── SerilogConfiguration.cs
│   │   │
│   │   ├── CapitalLab.Contracts/
│   │   │   ├── Requests/
│   │   │   └── Responses/
│   │   │
│   │   └── CapitalLab.Api/
│   │       ├── Controllers/
│   │       │   └── V1/
│   │       ├── Hubs/
│   │       │   └── NotificationHub.cs
│   │       ├── Filters/
│   │       │   ├── GlobalExceptionFilter.cs
│   │       │   └── ValidationFilter.cs
│   │       ├── Middleware/
│   │       │   ├── AuditMiddleware.cs
│   │       │   └── TenantMiddleware.cs
│   │       ├── Extensions/
│   │       └── Program.cs
│   │
│   └── tests/
│       └── CapitalLab.Tests/
│           ├── Unit/
│           ├── Integration/
│           └── Architecture/
│
├── frontend/
│   └── (Angular 20 application — see 05-angular-structure.md)
│
└── docs/
    ├── 01-system-architecture.md
    ├── 02-database-design.md
    ├── 03-domain-models.md
    ├── 04-api-endpoints.md
    ├── 05-angular-structure.md
    ├── 06-auth-flow.md
    ├── 07-role-permission-matrix.md
    └── 08-development-roadmap.md
```

---

## Cross-Cutting Concerns

### CQRS Pattern
Every feature follows Command/Query separation via MediatR:
```
Features/
  Patients/
    Commands/
      CreatePatient/
        CreatePatientCommand.cs
        CreatePatientCommandHandler.cs
        CreatePatientCommandValidator.cs
      UpdatePatient/
      DeletePatient/
    Queries/
      GetPatientById/
        GetPatientByIdQuery.cs
        GetPatientByIdQueryHandler.cs
      GetPatients/
        GetPatientsQuery.cs
        GetPatientsQueryHandler.cs
```

### Pipeline Behaviors (MediatR)
Order of execution per request:
1. `LoggingBehavior` — log request/response
2. `ValidationBehavior` — run FluentValidation
3. `CachingBehavior` — query-only cache check/set
4. `AuditBehavior` — write audit record

### Repository Pattern + Unit of Work
```
IRepository<T>
  GetByIdAsync(Guid id)
  GetAllAsync(Expression<Func<T, bool>> predicate)
  AddAsync(T entity)
  Update(T entity)
  Delete(T entity)

IUnitOfWork
  IPatientRepository Patients
  ISampleRepository Samples
  ... (per-aggregate repositories)
  CommitAsync()
  RollbackAsync()
```

### Domain Events
Dispatched via MediatR `INotification` after `CommitAsync()`:
- `PatientRegisteredEvent`
- `AppointmentBookedEvent`
- `SampleCollectedEvent`
- `ResultReleasedEvent`
- `PaymentReceivedEvent`
- `LowStockAlertEvent`

---

## Infrastructure Services

| Service | Technology | Purpose |
|---------|-----------|---------|
| Database | PostgreSQL 16 | Primary data store |
| Cache | Redis 7 | Session cache, query cache |
| Auth | ASP.NET Identity + JWT | Authentication |
| Background Jobs | Hangfire + PostgreSQL | Scheduled/queued tasks |
| Real-time | SignalR | Notifications, live updates |
| File Storage | Local → S3 abstraction | Reports, images |
| Email | SMTP / SendGrid | Notifications |
| SMS | Twilio / custom | Notifications |
| Logging | Serilog → Seq/file | Structured logging |
| PDF | QuestPDF or FastReport | Report generation |
| Barcode | ZXing.NET | Sample barcodes/QR codes |

---

## Multi-Branch Tenancy

Capital Lab uses **tenant-per-branch** at the data level (branch-scoped data, not schema-per-branch):

- All entities that are branch-scoped carry a `BranchId` foreign key
- `TenantMiddleware` resolves `BranchId` from JWT claims or request header
- `ICurrentUserService` exposes `UserId`, `BranchId`, `Roles`
- Global query filters on `IBranchScoped` enforce data isolation

```
IBranchScoped
  Guid BranchId { get; }

// EF Core global filter example
modelBuilder.Entity<Sample>()
  .HasQueryFilter(s => s.BranchId == _currentUserService.BranchId);
```

Super Admin and Owner bypass branch filters.

---

## API Design

- **Versioning**: URL segment `/api/v1/`, `/api/v2/`
- **Format**: JSON (camelCase)
- **Pagination**: Cursor-based for large sets; page-based for UI lists
- **Error Format**: RFC 7807 Problem Details
- **Rate Limiting**: ASP.NET Core `RateLimiter` — per-IP and per-user tiers
- **Compression**: Brotli + gzip response compression
- **Swagger**: Swashbuckle with XML docs, JWT bearer auth UI

---

## Security Architecture

```
Client → TLS 1.3 → API Gateway / Reverse Proxy (Nginx)
                        ↓
                  Rate Limiter
                        ↓
              JWT Validation Middleware
                        ↓
              RBAC Authorization Policies
                        ↓
                  Audit Middleware
                        ↓
                  Controller Action
```

- Passwords: bcrypt via ASP.NET Identity
- JWT: RS256 signed, 15-minute access token, 7-day refresh token
- Refresh tokens: stored in DB (hashed), single-use rotation
- Sensitive fields (national ID, passport): AES-256 encrypted at rest
- Audit log: append-only table, every mutation recorded

---

## Real-time Architecture (SignalR)

```
Hub: /hubs/notifications
Hub: /hubs/lab          (live sample/result status)

Groups:
  branch:{branchId}          — all staff in a branch
  patient:{patientId}        — patient-specific
  doctor:{doctorId}          — doctor queue updates
```

Events pushed:
- `SampleStatusChanged`
- `ResultReady`
- `AppointmentStatusChanged`
- `CriticalValueAlert`
- `LowStockAlert`

---

## Background Jobs (Hangfire)

| Job | Schedule | Description |
|-----|----------|-------------|
| `SendAppointmentReminders` | 15 min | Send reminders 24h/2h before appointment |
| `ProcessExpiryAlerts` | Daily 6am | Check inventory expiry |
| `GenerateDailyReports` | Daily midnight | Revenue/operational summaries |
| `CleanupExpiredTokens` | Daily 2am | Purge expired refresh tokens |
| `SyncAnalyticsDashboard` | Every 30 min | Aggregate KPI metrics |
| `SendResultNotifications` | On demand | Queue-based result release |
| `ProcessInsuranceClaims` | Daily 8am | Batch insurance submission |

---

## Internationalization

- Backend: resource files for validation/error messages (`Resources/en.resx`, `Resources/ar.resx`)
- Frontend: Angular `@angular/localize` + `ngx-translate` for RTL/LTR switching
- Database: test names, categories, instructions stored with `_En` / `_Ar` suffix columns
- PDF reports: generated in the patient's preferred language
