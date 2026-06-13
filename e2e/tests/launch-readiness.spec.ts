import { expect, request, test } from '@playwright/test';

const webBaseUrl = process.env.WEB_BASE_URL || 'http://localhost:4200';
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function demoToken(roles: string[]): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: 'e2e-user',
    name: 'E2E User',
    exp: Math.floor(Date.now() / 1000) + 3600,
    [roleClaim]: roles
  }));

  return `${header}.${payload}.e2e`;
}

async function authenticateAs(page: import('@playwright/test').Page, roles: string[]) {
  await page.addInitScript(([accessToken]) => {
    localStorage.setItem('cl_access_token', accessToken);
    localStorage.setItem('cl_refresh_token', 'e2e-refresh-token');
  }, [demoToken(roles)]);
}

async function isReachable(url: string): Promise<boolean> {
  const context = await request.newContext();
  try {
    const response = await context.get(url, { timeout: 5_000 });
    return response.ok() || response.status() < 500;
  } catch {
    return false;
  } finally {
    await context.dispose();
  }
}

test.describe('Phase G launch readiness', () => {
  test.beforeEach(async ({}, testInfo) => {
    if (process.env.RUN_E2E_AGAINST_LIVE === 'true')
      return;

    const reachable = await isReachable(webBaseUrl);
    test.skip(!reachable, `No live web app at ${webBaseUrl}. Set RUN_E2E_AGAINST_LIVE=true for enforced validation.`);
  });

  test('public home loads without client-side errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error')
        errors.push(message.text());
    });

    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('authentication screen is reachable', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toContainText(/login|sign in|email/i);
  });

  test('patient portal route renders', async ({ page }) => {
    await authenticateAs(page, ['Patient']);
    await page.goto('/patient/dashboard');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/patient\/dashboard/);
  });

  test('booking route renders', async ({ page }) => {
    await authenticateAs(page, ['Patient']);
    await page.goto('/patient/book');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/patient\/book/);
  });

  test('lab dashboard route renders', async ({ page }) => {
    await authenticateAs(page, ['LabTechnician']);
    await page.goto('/lab');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/lab/);
  });

  test('doctor dashboard route renders', async ({ page }) => {
    await authenticateAs(page, ['Doctor']);
    await page.goto('/doctor');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/doctor/);
  });

  test('owner dashboard route renders', async ({ page }) => {
    await authenticateAs(page, ['Owner']);
    await page.goto('/owner/overview');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/\/owner\/overview/);
  });

  test('mobile viewport has no horizontal overflow on public home', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  });

  test('api health endpoint is ready', async () => {
    test.skip(process.env.RUN_API_E2E !== 'true', 'Set RUN_API_E2E=true to enforce API health validation.');

    const context = await request.newContext({ baseURL: apiBaseUrl });
    const response = await context.get('/health/ready');
    expect(response.ok()).toBe(true);
    await context.dispose();
  });
});
