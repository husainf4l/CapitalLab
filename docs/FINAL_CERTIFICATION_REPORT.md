# Final Certification Report

## Phase H - Production Hardening

Phase H completed the final hardening and validation pass without adding new business modules.

### Completed

- Updated vulnerable/transitive package surfaces:
  - `Microsoft.IdentityModel.Tokens` and `System.IdentityModel.Tokens.Jwt` upgraded to `8.14.0`.
  - Explicit `Newtonsoft.Json` `13.0.3` floor added for infrastructure transitive consumers.
  - Removed redundant framework health check package reference.
- Fixed the local solution build stall path:
  - Stale local API/build-server locks were isolated.
  - API startup now uses an explicit empty web builder configuration to avoid recursive default host bootstrap.
  - Local/e2e startup can disable migrations and Hangfire server cleanly.
- Cleaned Angular production build diagnostics and added accessibility labels to icon-only controls.
- Added production environment validation for required secrets, storage, CORS, SMTP, notification provider keys, PDF storage, Redis, and JWT configuration.
- Added production validation tooling:
  - `scripts/validate-production-stack.sh`
  - `scripts/validate-migrations.sh`
- Hardened production Docker Compose environment wiring and API port exposure.
- Added local E2E orchestration:
  - `cd e2e && npm run e2e:local`
  - Seeds compact demo data, starts API and Angular, validates public/protected routes and API health.
- Exported current API contract to `docs/openapi.json`.
- Fixed public home mobile horizontal overflow found by live E2E.

### Verification

All required backend commands pass:

```sh
cd backend && dotnet restore
cd backend && dotnet build CapitalLab.sln --no-restore -v:minimal /m:1 /nr:false /p:UseSharedCompilation=false
cd backend && dotnet test CapitalLab.sln --no-build -v:minimal /m:1 /nr:false
```

Results:

- `dotnet restore`: passed, all projects up to date.
- `dotnet build ...`: passed with `0 Warning(s)` and `0 Error(s)`.
- `dotnet test ...`: passed with `123` tests, `0` failures, `0` skipped.
- `cd frontend && npm run build`: passed with no Angular warnings.
- `cd e2e && npm test`: passed in default wiring mode with live tests skipped when no app is configured.
- `cd e2e && npm run e2e:local`: passed with `18` live Playwright tests.
- `./scripts/validate-migrations.sh`: passed against fresh `capitallab_migration_validation` database with migrations, baseline seed, compact demo seed, and schema/row-count checks.

### Operational Notes

- Production startup intentionally fails fast when required production configuration is missing or contains placeholders.
- `.env.production` and `.env.staging` still require real deployment secrets before `scripts/validate-production-stack.sh` can be expected to pass.
- EF Core still reports existing model warnings for required relationships that target soft-deleted entities. They do not fail the current build/test certification, but should be reviewed in a future data-model cleanup pass.
