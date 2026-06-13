# Deployment

Production stack:

```sh
cp .env.example .env.production
docker compose -f docker-compose.production.yml --env-file .env.production build
docker compose -f docker-compose.production.yml --env-file .env.production up -d
```

Pre-deployment:

- Replace all `CHANGE_ME` values.
- Validate JWT RSA key pair and encryption key.
- Run backend tests and frontend build.
- Confirm `/health/live` and `/health/ready`.
- Run Playwright against staging with `RUN_E2E_AGAINST_LIVE=true`.

Rollback:

- Keep the previous image tag available.
- Stop the web/API services.
- Restore the previous image tag.
- Restore the database only when the migration is not backward compatible.
