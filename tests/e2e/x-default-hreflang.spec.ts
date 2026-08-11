import { expect, test } from '@playwright/test';

test('localized public routes render the governed x-default hreflang fallback', async ({
  page,
}) => {
  for (const { route, pathname } of [
    { route: '/en', pathname: '' },
    { route: '/fr/about', pathname: '/about' },
    { route: '/ar/contact', pathname: '/contact' },
  ]) {
    await page.goto(route);

    const xDefault = page.locator(
      'link[rel="alternate"][hreflang="x-default"]',
    );
    await expect(xDefault).toHaveCount(1);

    const xDefaultHref = await xDefault.getAttribute('href');
    expect(xDefaultHref).toBeTruthy();
    expect(new URL(xDefaultHref!).pathname).toBe(`/en${pathname}`);

    for (const locale of ['en', 'fr', 'ar'] as const) {
      const alternate = page.locator(
        `link[rel="alternate"][hreflang="${locale}"]`,
      );
      await expect(alternate).toHaveCount(1);

      const href = await alternate.getAttribute('href');
      expect(href).toBeTruthy();
      expect(new URL(href!).pathname).toBe(`/${locale}${pathname}`);
    }
  }
});
