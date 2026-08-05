import { expect, test } from '@playwright/test';

test('institutional home is available', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Develop your mind.',
  );
});

test('public metadata and error behavior are available', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('Sitemap:');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain('<urlset');

  const missing = await request.get('/definitely-not-a-launch-route');
  expect(missing.status()).toBe(404);
});

test('public pages publish route-specific canonical and Open Graph URLs', async ({
  page,
}) => {
  for (const route of [
    '/about',
    '/contact',
    '/schools/psychology',
    '/schools/languages',
    '/schools/training',
  ]) {
    await page.goto(route);

    const canonicalHref = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    const openGraphUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute('content');

    expect(canonicalHref).toBeTruthy();
    expect(openGraphUrl).toBeTruthy();

    const canonical = new URL(canonicalHref!);
    const openGraph = new URL(openGraphUrl!);

    expect(canonical.pathname).toBe(route);
    expect(openGraph.pathname).toBe(route);
    expect(openGraph.origin).toBe(canonical.origin);
  }
});

test('responses include launch security headers', async ({ request }) => {
  const response = await request.get('/');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  );
});

test('certificate verification does not reveal unknown or malformed records', async ({
  request,
}) => {
  const unknown = await request.get(
    '/certificates/unknown-certificate-identifier',
  );
  expect(unknown.status()).toBe(404);

  const malformed = await request.get('/certificates/short');
  expect(malformed.status()).toBe(404);
});

test.describe('authenticated launch journeys', () => {
  test.skip(
    !process.env.PLAYWRIGHT_ADMIN_STORAGE_STATE ||
      !process.env.PLAYWRIGHT_ADMIN_BASE_URL ||
      !process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE ||
      !process.env.PLAYWRIGHT_PORTAL_BASE_URL,
    'Requires CI-managed admin and learner storage-state files and preview URLs.',
  );

  test('admin can open the overview and protected certificate registry', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: process.env.PLAYWRIGHT_ADMIN_STORAGE_STATE,
    });
    const page = await context.newPage();
    await page.goto(process.env.PLAYWRIGHT_ADMIN_BASE_URL!);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const protectedResponse = await page.goto(
      `${process.env.PLAYWRIGHT_ADMIN_BASE_URL}/certificates`,
    );
    await expect(
      page.getByRole('heading', { name: 'Certificate registry' }),
    ).toBeVisible();
    expect(protectedResponse?.headers()['cache-control']).toContain('no-store');
    const staticAsset = await page
      .locator('script[src*="/_next/static/"]')
      .first()
      .getAttribute('src');
    expect(staticAsset).toBeTruthy();
    const staticResponse = await context.request.get(staticAsset!);
    expect(staticResponse.headers()['cache-control']).not.toContain('no-store');
    await context.close();
  });

  test('learner can open the portal overview and certificate area', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE,
    });
    const page = await context.newPage();
    await page.goto(process.env.PLAYWRIGHT_PORTAL_BASE_URL!);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto(`${process.env.PLAYWRIGHT_PORTAL_BASE_URL}/finance`);
    await expect(
      page.getByRole('heading', { name: 'Invoices and payments' }),
    ).toBeVisible();
    await context.close();
  });
});
