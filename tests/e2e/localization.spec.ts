import { expect, test } from '@playwright/test';

test('mobile header keeps primary navigation, contact access and locale URL state', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('/fr/programmes?q=english&school=languages#catalogue');

  const primaryNav = page.getByRole('navigation', {
    name: 'Navigation principale',
  });
  await expect(primaryNav).toBeVisible();
  await expect(primaryNav).toHaveCSS('overflow-x', 'auto');

  const primaryLinks = primaryNav.getByRole('link');
  await expect(primaryLinks).toHaveCount(5);
  for (let index = 0; index < (await primaryLinks.count()); index += 1) {
    await primaryLinks.nth(index).focus();
    await expect(primaryLinks.nth(index)).toBeFocused();
  }
  await expect(
    primaryNav.locator('a[href="/fr/consultations"]'),
  ).toBeVisible();

  await expect(
    page.getByRole('navigation', { name: 'Navigation du pied de page' }),
  ).toBeVisible();
  await expect(page.locator('.site-header-actions > a')).toBeVisible();

  const arabicLocaleLink = page.locator('.locale-switcher a[lang="ar"]');
  await expect(arabicLocaleLink).toHaveAttribute(
    'href',
    '/ar/programmes?q=english&school=languages#catalogue',
  );

  const horizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});

test('Arabic mobile primary navigation remains RTL and page-safe', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('/ar');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const primaryNav = page.getByRole('navigation', { name: 'التنقل الرئيسي' });
  await expect(primaryNav).toBeVisible();
  await expect(primaryNav).toHaveCSS('direction', 'rtl');
  await expect(primaryNav.getByRole('link')).toHaveCount(5);
  await expect(
    primaryNav.locator('a[href="/ar/consultations"]'),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'التنقل في تذييل الصفحة' }),
  ).toBeVisible();

  const horizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
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
  await expect(page.locator('[data-school-card] h3').first()).toHaveCSS(
    'letter-spacing',
    'normal',
  );

  await page.goto('/ar/programmes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'letter-spacing',
    'normal',
  );
});
