# Capital Lab API

The API is versioned under `/api/v1` and exposes Swagger in Development at `/swagger`.

Core areas:

- Auth and current user: login, role claims, profile, permissions.
- Catalog: lab tests, packages, categories.
- Operations: appointments, home collections, test orders.
- Laboratory: samples, barcodes, analyzer imports, results, doctor review, reports.
- Commercial: invoices, payments, insurance claims.
- Admin: branches, users, roles, settings, audit, notifications.

OpenAPI export:

```sh
cd backend
dotnet run --project src/CapitalLab.Api --urls http://localhost:5001
curl http://localhost:5001/swagger/v1/swagger.json > ../docs/openapi-v1.json
```
