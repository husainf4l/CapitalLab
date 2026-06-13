# Performance

Launch SLO targets:

- Public pages: LCP under 2.5s on broadband staging.
- API read endpoints: P95 under 500ms.
- API write endpoints: P95 under 1000ms.
- Background report generation: P95 under 30s for normal reports.

Run k6 smoke:

```sh
k6 run performance/k6-smoke.js
```

Run frontend build budgets:

```sh
cd frontend
npm run build
```
