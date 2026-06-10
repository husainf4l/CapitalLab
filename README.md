# Capital Lab — Laboratory Management Platform

Production-grade multi-branch laboratory information system (LIS).

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core .NET 10 — Clean Architecture + CQRS |
| Frontend | Angular 20+ — NgRx, Angular Material, TailwindCSS |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Real-time | SignalR |
| Background Jobs | Hangfire |
| Auth | JWT (RS256) + Refresh Tokens + RBAC |

## Documentation

| Document | Description |
|----------|-------------|
| [01-system-architecture](docs/01-system-architecture.md) | Architecture overview, solution structure, services |
| [02-database-design](docs/02-database-design.md) | Complete PostgreSQL schema (all schemas + tables) |
| [03-domain-models](docs/03-domain-models.md) | Domain entities, value objects, DTOs, enums |
| [04-api-endpoints](docs/04-api-endpoints.md) | All REST endpoints + SignalR hubs |
| [05-angular-structure](docs/05-angular-structure.md) | Angular folder structure, routing, state management |
| [06-auth-flow](docs/06-auth-flow.md) | JWT auth flow, refresh, RBAC, audit logging |
| [07-role-permission-matrix](docs/07-role-permission-matrix.md) | Full permission matrix for all 8 roles |
| [08-development-roadmap](docs/08-development-roadmap.md) | 16-phase, 24-week delivery plan |
| [09-entity-relationships](docs/09-entity-relationships.md) | ER overview, aggregate boundaries, cardinalities |

## Modules

- Patient Management (profiles, family, insurance, medical history)
- Doctor Management (profiles, branches, signatures)
- Test Catalog (tests, categories, packages, reference ranges)
- Appointment Management (booking, calendar, home collection)
- Sample Tracking (barcodes, QR, chain of custody)
- Result Management (entry, review workflow, critical values)
- Reports (PDF generation, digital signatures, QR verification)
- Inventory (reagents, expiry, purchase orders)
- Billing (invoices, payments, insurance, refunds)
- Notifications (email, SMS, WhatsApp)
- Analytics (revenue, patients, tests, branch comparison)
- Patient Portal (self-service, family, results, reports)
- Doctor Portal (review queue, critical findings, sign-off)

## Roles

SuperAdmin → Owner → BranchManager → Doctor / LabTechnician / Receptionist / Phlebotomist → Patient

## Getting Started

Architecture and design documents are complete. Implementation starts with Phase 0 (Foundation) per the [development roadmap](docs/08-development-roadmap.md).
