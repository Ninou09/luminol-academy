import { expect, test } from '@playwright/test';

test('mobile header keeps contact access and locale links preserve URL state', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/fr/programmes?q=english&school=languages#catalogue');

  await expect(page.locator('.site-header-actions > a')).toBeVisible();

  const arabicLocaleLink = page.locator('.locale-switcher a[lang="ar"]');
  await expect(arabicLocaleLink).toHaveAttribute(
    'href',
    '/ar/programmes?q=english&school=languages#catalogue',
  );
});

test('localized home metadata does not duplicate the academy brand', async ({
  page,
}) => {
  await page.goto('/ar');
  await expect(page).toHaveTitle('Luminol Academy');
});

test('Arabic public typography does not apply Latin tracking to joined text', async ({
  page,
}) => {
  await page.goto('/ar');
  await expect(page.locator('.school-card h3').first()).toHaveCSS(
    'letter-spacing',
    'normal',
  );

  await page.goto('/ar/programmes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'letter-spacing',
    'normal',
  );
});
