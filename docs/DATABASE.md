# Database

PostgreSQL is the source of truth. EF Core migrations are stored under `backend/src/CapitalLab.Infrastructure/Persistence/Migrations`.

Operational principles:

- Apply migrations before each deployment.
- Keep demo seeding out of normal production startup.
- Use point-in-time backup tooling for production.
- Verify restore drills before go-live and after schema-heavy releases.

Demo seed command:

```sh
cd backend
dotnet run --project src/CapitalLab.Api -- --seed-demo-data
```

The seeder accepts `DEMO_*_COUNT` environment variables for branches, doctors, staff, patients, appointments, orders, samples, invoices, and payments.
