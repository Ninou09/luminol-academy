import { expect, test } from '@playwright/test';

test('Arabic institutional home is available', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'طوّر عقلك',
  );
  await expect(
    page.getByRole('navigation', { name: 'الوصول السريع' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'اكتشف برامج علم النفس',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'FR' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'EN' }).first()).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('French and English homes are localized LTR experiences', async ({
  page,
}) => {
  await page.goto('/fr');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Développez votre esprit',
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(
    page.getByRole('link', { name: 'Commencer' }).first(),
  ).toBeVisible();

  await page.goto('/en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Develop your mind',
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(
    page.getByRole('link', { name: 'Get started' }).first(),
  ).toBeVisible();
});

test('language switcher preserves the current public route', async ({
  page,
}) => {
  await page.goto('/schools/languages');
  const frenchHref = await page
    .getByRole('link', { name: 'FR' })
    .first()
    .getAttribute('href');
  const englishHref = await page
    .getByRole('link', { name: 'EN' })
    .first()
    .getAttribute('href');
  expect(frenchHref).toBe('/fr/schools/languages');
  expect(englishHref).toBe('/en/schools/languages');
});

test('all three Arabic schools expose a conversion path and FAQ', async ({
  page,
}) => {
  for (const route of [
    '/schools/psychology',
    '/schools/languages',
    '/schools/training',
  ]) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /سجّل اهتمامك/ }).first(),
    ).toBeVisible();
    await expect(page.getByText('الأسئلة الشائعة').first()).toBeVisible();
  }
});

test('French and English school routes are complete', async ({ page }) => {
  for (const locale of ['fr', 'en']) {
    for (const school of ['psychology', 'languages', 'training']) {
      await page.goto(`/${locale}/schools/${school}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    }
  }
});

test('contact retains working localized enquiry experiences', async ({
  page,
}) => {
  await page.goto('/contact');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /خطوتك التالية تبدأ بمحادثة واضحة/,
    }),
  ).toBeVisible();
  await expect(page.getByLabel('الاسم الكامل')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'أرسل استفساري' }),
  ).toBeVisible();

  await page.goto('/fr/contact');
  await expect(page.getByLabel('Nom complet')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Envoyer ma demande' }),
  ).toBeVisible();

  await page.goto('/en/contact');
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Send my enquiry' }),
  ).toBeVisible();
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
  expect(sitemapText).toContain('/fr/schools/psychology');
  expect(sitemapText).toContain('/en/schools/training');

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
    '/fr/about',
    '/fr/contact',
    '/fr/schools/psychology',
    '/en/about',
    '/en/contact',
    '/en/schools/training',
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
