import { expect, test } from '@playwright/test';

test('institutional home is available', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Grow with clarity.',
  );
});

test('locale routing persists language and document direction', async ({
  page,
}) => {
  await page.goto('/fr/programmes?q=english&school=languages');
  await expect(page).toHaveURL(/\/fr\/programmes\?q=english&school=languages$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

  await page.goto('/programmes?q=english&school=languages');
  await expect(page).toHaveURL(/\/fr\/programmes\?q=english&school=languages$/);

  await page.goto('/ar');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  await page.goto('/FR/about');
  await expect(page).toHaveURL(/\/fr\/about$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('public copy follows the canonical locale', async ({ page }) => {
  await page.goto('/ar');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'تقدّم بوضوح.',
  );
  await expect(
    page.locator('header').getByRole('link', { name: 'البرامج' }),
  ).toBeVisible();

  await page.goto('/fr/contact');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Votre prochaine étape commence',
  );
  await expect(page.getByText('Parlez-nous de votre objectif')).toBeVisible();
});

test('public metadata and error behavior are available', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('Sitemap:');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain('<urlset');
  expect(sitemapText).toContain('/ar/about');
  expect(sitemapText).toContain('/fr/schools/languages');
  expect(sitemapText).toContain('/en/programmes');

  const missing = await request.get('/definitely-not-a-launch-route');
  expect(missing.status()).toBe(404);
});

test('public pages publish branded browser and device icons', async ({
  page,
  request,
}) => {
  await page.goto('/en');

  const iconHrefs = await page
    .locator('link[rel="icon"]')
    .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
  const appleTouchIconHref = await page
    .locator('link[rel="apple-touch-icon"]')
    .getAttribute('href');

  expect(iconHrefs.some((href) => new URL(href).pathname === '/favicon.ico')).toBe(
    true,
  );
  expect(iconHrefs.some((href) => new URL(href).pathname === '/icon.svg')).toBe(
    true,
  );
  expect(appleTouchIconHref).toBeTruthy();
  expect(new URL(appleTouchIconHref!).pathname).toBe('/apple-touch-icon.png');

  const favicon = await request.get('/favicon.ico');
  expect(favicon.ok()).toBeTruthy();
  expect(favicon.headers()['content-type']).toContain('image/');
  expect((await favicon.body()).byteLength).toBeGreaterThan(1000);

  const svgIcon = await request.get('/icon.svg');
  expect(svgIcon.ok()).toBeTruthy();
  expect(svgIcon.headers()['content-type']).toContain('image/svg+xml');
  expect(await svgIcon.text()).toContain('Luminol Academy');

  const appleTouchIcon = await request.get('/apple-touch-icon.png');
  expect(appleTouchIcon.ok()).toBeTruthy();
  expect(appleTouchIcon.headers()['content-type']).toContain('image/png');
  expect((await appleTouchIcon.body()).byteLength).toBeGreaterThan(500);
});

test('public pages publish localized canonical, hreflang and Open Graph URLs', async ({
  page,
}) => {
  for (const route of [
    '/about',
    '/contact',
    '/schools/psychology',
    '/schools/languages',
    '/schools/training',
  ]) {
    await page.goto(`/fr${route}`);

    const canonicalHref = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    const openGraphUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute('content');
    const arabicHref = await page
      .locator('link[rel="alternate"][hreflang="ar"]')
      .getAttribute('href');
    const englishHref = await page
      .locator('link[rel="alternate"][hreflang="en"]')
      .getAttribute('href');

    expect(canonicalHref).toBeTruthy();
    expect(openGraphUrl).toBeTruthy();
    expect(arabicHref).toBeTruthy();
    expect(englishHref).toBeTruthy();

    const canonical = new URL(canonicalHref!);
    const openGraph = new URL(openGraphUrl!);

    expect(canonical.pathname).toBe(`/fr${route}`);
    expect(openGraph.pathname).toBe(`/fr${route}`);
    expect(new URL(arabicHref!).pathname).toBe(`/ar${route}`);
    expect(new URL(englishHref!).pathname).toBe(`/en${route}`);
    expect(openGraph.origin).toBe(canonical.origin);
  }
});

test('social preview metadata is localized and serves wide PNG images', async ({
  page,
  request,
}) => {
  for (const locale of ['ar', 'fr', 'en'] as const) {
    await page.goto(`/${locale}/about`);

    const openGraphImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content');
    const twitterImage = await page
      .locator('meta[name="twitter:image"]')
      .getAttribute('content');
    const twitterCard = await page
      .locator('meta[name="twitter:card"]')
      .getAttribute('content');

    expect(openGraphImage).toBeTruthy();
    expect(twitterImage).toBeTruthy();
    expect(twitterCard).toBe('summary_large_image');

    const openGraphUrl = new URL(openGraphImage!);
    const twitterUrl = new URL(twitterImage!);
    const expectedPath =
      locale === 'ar' ? '/social-preview-ar.png' : '/api/social-preview';

    expect(openGraphUrl.pathname).toBe(expectedPath);
    expect(twitterUrl.pathname).toBe(expectedPath);

    if (locale === 'ar') {
      expect(openGraphUrl.search).toBe('');
      expect(twitterUrl.search).toBe('');
    } else {
      expect(openGraphUrl.searchParams.get('locale')).toBe(locale);
      expect(twitterUrl.searchParams.get('locale')).toBe(locale);
    }

    const image = await request.get(
      `${openGraphUrl.pathname}${openGraphUrl.search}`,
    );
    expect(image.ok()).toBeTruthy();
    expect(image.headers()['content-type']).toContain('image/png');
    expect((await image.body()).byteLength).toBeGreaterThan(1000);
  }

  const legacyArabicRoute = await request.get('/api/social-preview?locale=ar');
  expect(legacyArabicRoute.ok()).toBeTruthy();
  expect(legacyArabicRoute.headers()['content-type']).toContain('image/png');
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
