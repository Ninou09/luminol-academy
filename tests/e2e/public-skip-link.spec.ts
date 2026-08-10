import { expect, test } from '@playwright/test';

const routeCases = [
  '/en',
  '/en/programmes',
  '/en/schools/psychology',
  '/en/about',
  '/en/contact',
] as const;

for (const route of routeCases) {
  test(`${route} exposes one main skip target`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator('main#main-content')).toHaveCount(1);
    await expect(page.locator('main#main-content')).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });
}

test('English keyboard users can skip the sticky public navigation', async ({
  page,
}) => {
  await page.goto('/en/about');

  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  const beforeFocus = await skipLink.boundingBox();

  expect(beforeFocus).not.toBeNull();
  expect(
    (beforeFocus?.y ?? 0) + (beforeFocus?.height ?? 0),
  ).toBeLessThanOrEqual(0);

  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();

  const whileFocused = await skipLink.boundingBox();
  expect(whileFocused).not.toBeNull();
  expect(whileFocused?.y ?? -1).toBeGreaterThanOrEqual(0);

  await page.keyboard.press('Enter');
  await expect(page.locator('main#main-content')).toBeFocused();
  await expect(page).toHaveURL(/#main-content$/);
});

test('shared public shell uses explicit keyboard focus rings', async ({
  page,
}) => {
  await page.goto('/en');
  await page.keyboard.press('Tab');

  const primaryLink = page
    .getByRole('navigation', { name: /primary navigation/i })
    .getByRole('link')
    .first();
  const contactLink = page.getByRole('banner').getByRole('link', {
    name: 'Start your journey',
  });
  const footerLink = page.locator('footer nav a').first();

  for (const link of [primaryLink, contactLink, footerLink]) {
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('outline-style', 'solid');
    await expect(link).toHaveCSS('outline-width', '2px');
    await expect(link).toHaveCSS('outline-offset', '4px');
  }
});

test('Arabic public shell localizes the skip link and keeps the RTL target', async ({
  page,
}) => {
  await page.goto('/ar/contact');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.keyboard.press('Tab');

  const skipLink = page.getByRole('link', {
    name: 'انتقل إلى المحتوى الرئيسي',
  });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.locator('main#main-content')).toBeFocused();
});

test('localized 404 keeps the same keyboard recovery boundary', async ({
  page,
}) => {
  const response = await page.goto('/fr/skip-link-missing-route');

  expect(response?.status()).toBe(404);
  await expect(page.locator('main#main-content')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Aller au contenu principal' }),
  ).toBeFocused();
});
