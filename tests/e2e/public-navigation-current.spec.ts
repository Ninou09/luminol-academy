import { expect, test } from '@playwright/test';

for (const scenario of [
  {
    route: '/en',
    currentHref: '/en',
    inactiveHref: '/en/about',
  },
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
    currentHref: '/en/schools',
    inactiveHref: '/en/programmes',
  },
  {
    route: '/ar/schools/languages',
    currentHref: '/ar/schools',
    inactiveHref: '/ar/programmes',
  },
  {
    route: '/fr/schools/training',
    currentHref: '/fr/schools',
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
      scenario.currentHref.endsWith('/contact')
        ? page.getByRole('contentinfo').getByRole('navigation')
        : page.getByRole('contentinfo'),
    ]) {
      // The header can link to the current page more than once (the logo
      // and "Home"); every such link must be marked as the current page.
      const currentLinks = landmark.locator(
        `a[href="${scenario.currentHref}"]:not([hreflang])`,
      );
      const count = await currentLinks.count();
      expect(count).toBeGreaterThan(0);
      for (let index = 0; index < count; index += 1) {
        await expect(currentLinks.nth(index)).toHaveAttribute(
          'aria-current',
          'page',
        );
      }
      await expect(
        landmark.locator(`a[href="${scenario.inactiveHref}"]:not([hreflang])`),
      ).not.toHaveAttribute('aria-current');
    }
  });
}

test('study navigation opens and returns focus with the keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/programmes');
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  const study = nav.getByRole('button', { name: 'Study at Luminol' });
  await study.focus();
  await page.keyboard.press('Enter');
  await expect(study).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('link', { name: 'Our schools' })).toBeFocused();
  await expect(nav.locator('a[href="/en/programmes"]')).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.keyboard.press('Escape');
  await expect(study).toBeFocused();
  await expect(study).toHaveAttribute('aria-expanded', 'false');
});
