import { expect, test } from '@playwright/test';

const openGraphRoutes = [
  { route: '/en', locale: 'en_DZ' },
  { route: '/fr/about', locale: 'fr_DZ' },
  { route: '/ar/contact', locale: 'ar_DZ' },
  { route: '/en/programmes', locale: 'en_DZ' },
  { route: '/fr/schools/languages', locale: 'fr_DZ' },
] as const;

test('public route metadata preserves governed Open Graph identity and locale', async ({
  page,
}) => {
  for (const { route, locale } of openGraphRoutes) {
    const response = await page.goto(route);
    expect(response).not.toBeNull();
    expect(response!.ok()).toBeTruthy();

    const siteName = page.locator('meta[property="og:site_name"]');
    await expect(siteName).toHaveCount(1);
    await expect(siteName).toHaveAttribute('content', 'Luminol Academy');

    const openGraphLocale = page.locator('meta[property="og:locale"]');
    await expect(openGraphLocale).toHaveCount(1);
    await expect(openGraphLocale).toHaveAttribute('content', locale);

    const canonicalHref = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    const openGraphUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute('content');
    const openGraphImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content');

    expect(canonicalHref).toBeTruthy();
    expect(openGraphUrl).toBeTruthy();
    expect(openGraphImage).toBeTruthy();
    expect(new URL(canonicalHref!).pathname).toBe(route);
    expect(new URL(openGraphUrl!).pathname).toBe(route);
  }
});
