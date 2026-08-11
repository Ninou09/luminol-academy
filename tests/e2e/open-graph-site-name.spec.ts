import { expect, test } from '@playwright/test';

test('public route metadata preserves the governed Open Graph site name', async ({
  page,
}) => {
  for (const route of [
    '/en',
    '/fr/about',
    '/ar/contact',
    '/en/programmes',
    '/fr/schools/languages',
  ]) {
    await page.goto(route);

    const siteName = page.locator('meta[property="og:site_name"]');
    await expect(siteName).toHaveCount(1);
    await expect(siteName).toHaveAttribute('content', 'Luminol Academy');

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
