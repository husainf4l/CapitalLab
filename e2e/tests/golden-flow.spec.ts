/**
 * Golden Flow E2E — Patient books → Lab → QC → Results → Doctor → Report → Patient views
 *
 * Must be run against a live environment with seeded demo data.
 * Skips gracefully if the app is not reachable.
 *
 * Run: RUN_E2E_AGAINST_LIVE=true RUN_API_E2E=true npm test -- --grep "golden-flow"
 */
import { expect, request, test, type Page } from '@playwright/test';

const webBaseUrl = process.env.WEB_BASE_URL || 'http://localhost:4200';
const apiBaseUrl = process.env.API_BASE_URL  || 'http://localhost:5001';
const roleClaim  = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function makeToken(roles: string[], sub = 'e2e-user', name = 'E2E User'): string {
  const header  = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub, name, email: `${sub}@e2e.test`,
    exp: Math.floor(Date.now() / 1000) + 3600,
    [roleClaim]: roles,
  }));
  return `${header}.${payload}.e2e`;
}

async function loginAs(page: Page, roles: string[], sub?: string, name?: string): Promise<void> {
  const token = makeToken(roles, sub, name);
  await page.addInitScript(([t]) => {
    localStorage.setItem('cl_access_token', t);
    localStorage.setItem('cl_refresh_token', 'e2e-refresh');
  }, [token]);
}

async function appReachable(): Promise<boolean> {
  const ctx = await request.newContext();
  try {
    const res = await ctx.get(webBaseUrl, { timeout: 6_000 });
    return res.ok() || res.status() < 500;
  } catch {
    return false;
  } finally {
    await ctx.dispose();
  }
}

async function apiReachable(): Promise<boolean> {
  const ctx = await request.newContext();
  try {
    const res = await ctx.get(`${apiBaseUrl}/health/live`, { timeout: 6_000 });
    return res.ok();
  } catch {
    return false;
  } finally {
    await ctx.dispose();
  }
}

// ────────────────────────────────────────────────────────────
// Suite
// ────────────────────────────────────────────────────────────

test.describe('golden-flow: end-to-end patient journey', () => {

  test.beforeEach(async ({}, testInfo) => {
    if (process.env.RUN_E2E_AGAINST_LIVE === 'true') return;
    const up = await appReachable();
    test.skip(!up, `Web app not reachable at ${webBaseUrl}. Pass RUN_E2E_AGAINST_LIVE=true to enforce.`);
  });

  // ── Step 1: Patient → Booking flow ──────────────────────────
  test('step 1 — patient sees dashboard after login', async ({ page }) => {
    await loginAs(page, ['Patient'], 'e2e-patient', 'E2E Patient');
    await page.goto('/patient/dashboard');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/patient\/dashboard/);
    // Dashboard should render without crash
    await expect(page.locator('body')).not.toContainText(/error|exception|cannot read/i);
  });

  test('step 2 — patient booking wizard renders all steps', async ({ page }) => {
    await loginAs(page, ['Patient'], 'e2e-patient', 'E2E Patient');
    await page.goto('/patient/book');
    await expect(page).toHaveURL(/\/patient\/book/);

    // Step indicator should be visible
    await expect(page.locator('body')).toBeVisible();
    // At minimum the first step (service selection or branch selection) should render
    const step = page.locator('.step-indicator, .stepper, [class*="step"]').first();
    await expect(step).toBeVisible({ timeout: 8_000 });
  });

  test('step 3 — patient can view results list', async ({ page }) => {
    await loginAs(page, ['Patient'], 'e2e-patient', 'E2E Patient');
    await page.goto('/patient/results');
    await expect(page).toHaveURL(/\/patient\/results/);
    await expect(page.locator('body')).toBeVisible();
    // Results page should show either a list or an empty state — no crash
    await expect(page.locator('body')).not.toContainText(/error|exception/i);
  });

  // ── Step 4: Lab technician portal ───────────────────────────
  test('step 4 — lab technician sees overview dashboard', async ({ page }) => {
    await loginAs(page, ['LabTechnician'], 'e2e-lab', 'E2E Lab Tech');
    await page.goto('/lab');
    await expect(page).toHaveURL(/\/lab/);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/error|exception/i);
  });

  test('step 5 — lab orders queue renders', async ({ page }) => {
    await loginAs(page, ['LabTechnician'], 'e2e-lab', 'E2E Lab Tech');
    await page.goto('/lab/orders');
    await expect(page).toHaveURL(/\/lab\/orders/);
    await expect(page.locator('body')).toBeVisible();
    // Should show orders or empty state
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('step 6 — lab barcode scanner page renders', async ({ page }) => {
    await loginAs(page, ['LabTechnician'], 'e2e-lab', 'E2E Lab Tech');
    await page.goto('/lab/barcode');
    await expect(page).toHaveURL(/\/lab\/barcode/);
    await expect(page.locator('body')).toBeVisible();
  });

  // ── Step 7: Doctor review ────────────────────────────────────
  test('step 7 — doctor review center renders', async ({ page }) => {
    await loginAs(page, ['Doctor'], 'e2e-doctor', 'E2E Doctor');
    await page.goto('/doctor');
    await expect(page).toHaveURL(/\/doctor/);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/error|exception/i);
  });

  test('step 8 — doctor review list loads', async ({ page }) => {
    await loginAs(page, ['Doctor'], 'e2e-doctor', 'E2E Doctor');
    await page.goto('/doctor/reviews');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/error|exception/i);
  });

  // ── Step 9: Full API + seeded data flow ──────────────────────
  test('step 9 — api health check passes', async () => {
    test.skip(process.env.RUN_API_E2E !== 'true', 'Set RUN_API_E2E=true to enforce API checks.');
    const ctx = await request.newContext({ baseURL: apiBaseUrl });
    const res  = await ctx.get('/health/ready');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('status');
    await ctx.dispose();
  });

  test('step 10 — api version endpoint returns build info', async () => {
    test.skip(process.env.RUN_API_E2E !== 'true', 'Set RUN_API_E2E=true to enforce API checks.');
    const ctx = await request.newContext({ baseURL: apiBaseUrl });
    const res  = await ctx.get('/api/version');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('buildDate');
    await ctx.dispose();
  });

  // ── Step 11: Patient report viewer ──────────────────────────
  test('step 11 — patient notifications page renders', async ({ page }) => {
    await loginAs(page, ['Patient'], 'e2e-patient', 'E2E Patient');
    await page.goto('/patient/notifications');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/error|exception/i);
  });

  // ── Step 12: Admin audit + notifications ─────────────────────
  test('step 12 — admin audit log renders', async ({ page }) => {
    await loginAs(page, ['Admin', 'Owner'], 'e2e-admin', 'E2E Admin');
    await page.goto('/admin/audit');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/error|exception/i);
  });

  test('step 13 — admin notifications dashboard renders', async ({ page }) => {
    await loginAs(page, ['Admin', 'Owner'], 'e2e-admin', 'E2E Admin');
    await page.goto('/admin/notifications');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/error|exception/i);
  });

  // ── Step 14: Owner executive dashboard ───────────────────────
  test('step 14 — owner executive dashboard renders with summary strip', async ({ page }) => {
    await loginAs(page, ['Owner'], 'e2e-owner', 'E2E Owner');
    await page.goto('/owner/executive');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/owner\/executive/);
    await expect(page.locator('body')).not.toContainText(/error|exception/i);
  });

  // ── Step 15: System health page ───────────────────────────────
  test('step 15 — system health page renders with indicators', async ({ page }) => {
    await loginAs(page, ['Admin', 'Owner'], 'e2e-admin', 'E2E Admin');
    await page.goto('/admin/system-health');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/error|exception/i);
    // Overall status card should be visible
    await expect(page.locator('.overall-card')).toBeVisible({ timeout: 6_000 });
  });

  // ── Cross-cutting: no horizontal overflow on mobile ───────────
  test('mobile — patient dashboard has no horizontal overflow', async ({ page }) => {
    await loginAs(page, ['Patient'], 'e2e-patient', 'E2E Patient');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/patient/dashboard');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(overflow, 'Patient dashboard overflows horizontally on mobile').toBe(false);
  });

  test('mobile — lab dashboard has no horizontal overflow', async ({ page }) => {
    await loginAs(page, ['LabTechnician'], 'e2e-lab', 'E2E Lab Tech');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/lab');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(overflow, 'Lab dashboard overflows horizontally on mobile').toBe(false);
  });
});
