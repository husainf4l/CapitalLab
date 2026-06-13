# Capital Lab E2E

Playwright launch-readiness checks live in `tests/launch-readiness.spec.ts`.

Run locally:

```sh
npm install
npm test
```

Run against a live stack:

```sh
WEB_BASE_URL=https://app.example.com \
API_BASE_URL=https://api.example.com \
RUN_E2E_AGAINST_LIVE=true \
RUN_API_E2E=true \
npm test
```

The suite skips browser-flow checks when no local app is reachable, so CI can keep this harness installed before the production deployment URL is available. Set the `RUN_*` variables during staging and launch validation to make the checks mandatory.
