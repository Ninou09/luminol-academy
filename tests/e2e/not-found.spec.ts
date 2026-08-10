import { expect, test } from '@playwright/test';

const localeCases = [
  {
    locale: 'en',
    heading: 'This path ends here.',
    home: 'Return home',
    programmes: 'Explore programmes',
    direction: 'ltr',
  },
  {
    locale: 'fr',
    heading: 'Cette page s’arrête ici.',
    home: 'Retour à l’accueil',
    programmes: 'Voir les programmes',
    direction: 'ltr',
  },
  {
    locale: 'ar',
    heading: 'هذا المسار ينتهي هنا.',
    home: 'العودة إلى الرئيسية',
    programmes: 'استكشف البرامج',
    direction: 'rtl',
  },
] as const;

for (const localeCase of localeCases) {
  test(`${localeCase.locale} unmatched routes render the localized Luminol 404`, async ({
    page,
  }) => {
    const response = await page.goto(`/${localeCase.locale}/definitely-missing-page`);

    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', localeCase.locale);
    await expect(page.locator('html')).toHaveAttribute(
      'dir',
      localeCase.direction,
    );
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.locator('[data-not-found]')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: localeCase.heading }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: localeCase.home })).toHaveAttribute(
      'href',
      `/${localeCase.locale}`,
    );
    await expect(
      page.getByRole('link', { name: localeCase.programmes }),
    ).toHaveAttribute('href', `/${localeCase.locale}/programmes`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });
}

test('Arabic 404 stays within a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('/ar/missing-on-mobile');

  const horizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});
