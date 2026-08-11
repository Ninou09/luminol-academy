import { expect, test } from '@playwright/test';

test('public route metadata preserves governed Open Graph identity and locale', async ({
  page,
}) => {
  for (const { route, locale } of [
    { route: '/en', locale: 'en' },
    { route: '/fr/about', locale: 'fr' },
    { route: '/ar/contact', locale: 'ar' },
    { route: '/en/programmes', locale: 'en' },
    { route: '/fr/schools/languages', locale: 'fr' },
  ]) {
    await page.goto(route);

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
