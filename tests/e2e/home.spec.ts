import { expect, test } from '@playwright/test';
test('institutional home is available', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Education for',
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

test('responses include launch security headers', async ({ request }) => {
  const response = await request.get('/');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['content-security-policy']).toContain(
    "frame-ancestors 'none'",
  );
});

test('certificate verification does not reveal an unknown record', async ({
  page,
}) => {
  await page.goto('/certificates/unknown-certificate-identifier');
  await expect(page.getByText('This page could not be found')).toBeVisible();
});

test.describe('authenticated launch journeys', () => {
  test.skip(
    !process.env.PLAYWRIGHT_ADMIN_STORAGE_STATE ||
      !process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE,
    'Authenticated smoke tests require CI-managed Clerk storage-state secrets.',
  );

  test('credentials are configured for the separate admin and portal projects', () => {
    expect(process.env.PLAYWRIGHT_ADMIN_STORAGE_STATE).toBeTruthy();
    expect(process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE).toBeTruthy();
  });
});
