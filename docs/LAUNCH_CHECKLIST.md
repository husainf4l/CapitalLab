# Launch Checklist

- Backend builds and tests pass.
- Frontend production build passes.
- Playwright launch suite passes against staging.
- Docker production stack builds.
- Migrations apply cleanly on staging backup.
- Demo seed completes in staging if demo mode is required.
- Secrets are present in secret manager, not committed files.
- CORS, JWT issuer, and audience match deployed URLs.
- Backups and restore drill are verified.
- Health checks and monitoring alerts are active.
- DNS, TLS, and CDN settings are verified.
- Demo accounts are disabled or rotated for production.
- Final stakeholder walkthrough is signed off.
