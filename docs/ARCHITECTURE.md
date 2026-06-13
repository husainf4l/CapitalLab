# Architecture

Capital Lab is split into an Angular frontend and a .NET API using Clean Architecture boundaries:

- `CapitalLab.Domain`: entities, enums, domain events, core business invariants.
- `CapitalLab.Application`: use cases, DTO contracts, interfaces, validation.
- `CapitalLab.Infrastructure`: EF Core, Identity, background jobs, integrations, persistence.
- `CapitalLab.Api`: HTTP controllers, middleware, hubs, versioning, health checks.

Runtime dependencies are PostgreSQL, Redis, Hangfire, SignalR, and local/object storage for generated files.
