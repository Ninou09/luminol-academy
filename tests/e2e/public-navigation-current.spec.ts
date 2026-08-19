import { expect, test } from '@playwright/test';

for (const scenario of [
  {
    route: '/en/programmes',
    currentHref: '/en/programmes',
    inactiveHref: '/en/about',
  },
  {
    route: '/fr/about',
    currentHref: '/fr/about',
    inactiveHref: '/fr/programmes',
  },
  {
    route: '/ar/contact',
    currentHref: '/ar/contact',
    inactiveHref: '/ar/about',
  },
  {
    route: '/en/schools/psychology',
    currentHref: '/en#schools',
    inactiveHref: '/en/programmes',
  },
  {
    route: '/ar/schools/languages',
    currentHref: '/ar#schools',
    inactiveHref: '/ar/programmes',
  },
  {
    route: '/fr/schools/training',
    currentHref: '/fr#schools',
    inactiveHref: '/fr/about',
  },
] as const) {
  test(`${scenario.route} marks its current header and footer destinations`, async ({
    page,
  }) => {
    const response = await page.goto(scenario.route);
    expect(response).not.toBeNull();
    expect(response!.ok()).toBeTruthy();

    for (const landmark of [
      page.getByRole('banner'),
      page.getByRole('contentinfo'),
    ]) {
      await expect(
        landmark.locator(`a[href="${scenario.currentHref}"]:not([hreflang])`),
      ).toHaveAttribute('aria-current', 'page');
      await expect(
        landmark.locator(`a[href="${scenario.inactiveHref}"]:not([hreflang])`),
      ).not.toHaveAttribute('aria-current');
    }
  });
}
