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
