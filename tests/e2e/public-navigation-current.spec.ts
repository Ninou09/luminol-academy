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
] as const) {
  test(`${scenario.route} marks its current header destination`, async ({
    page,
  }) => {
    const response = await page.goto(scenario.route);
    expect(response).not.toBeNull();
    expect(response!.ok()).toBeTruthy();

    const header = page.getByRole('banner');
    await expect(header.locator(`a[href="${scenario.currentHref}"]`)).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      header.locator(`a[href="${scenario.inactiveHref}"]`),
    ).not.toHaveAttribute('aria-current');
  });
}
