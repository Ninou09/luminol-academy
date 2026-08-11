import { expect, test } from '@playwright/test';

const localizedRoutes = [
  { route: '/en/about', lang: 'en', dir: 'ltr' },
  { route: '/fr/programmes', lang: 'fr', dir: 'ltr' },
  { route: '/ar/schools/psychology', lang: 'ar', dir: 'rtl' },
] as const;

test('localized public routes render the governed document language and direction', async ({
  page,
}) => {
  for (const { route, lang, dir } of localizedRoutes) {
    const response = await page.goto(route);
    expect(response).not.toBeNull();
    expect(response!.ok()).toBeTruthy();

    const documentRoot = page.locator('html');
    await expect(documentRoot).toHaveCount(1);
    await expect(documentRoot).toHaveAttribute('lang', lang);
    await expect(documentRoot).toHaveAttribute('dir', dir);
  }
});
