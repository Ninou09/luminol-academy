import { expect, test } from '@playwright/test';

test('premium school storytelling preserves landmarks and governed media', async ({
  page,
}) => {
  await page.goto('/en/schools/psychology');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.locator('[data-school-hero="psychology"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-programme-card]')).not.toHaveCount(0);

  const mediaSources = await page
    .locator('[data-programme-card] [data-media-source]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-media-source')),
    );

  expect(mediaSources.length).toBeGreaterThan(0);
  expect(
    mediaSources.every(
      (source) => source === 'governed-fallback' || source === 'sanity',
    ),
  ).toBeTruthy();
});

test('school reduced motion keeps the centered editorial core in place', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/schools/languages');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  const core = page.locator('[data-school-hero="languages"] [data-motion-float]');
  await expect(core).toHaveCSS('translate', '-50% -50%');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('Arabic school storytelling remains RTL and mobile-safe', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('/ar/schools/training');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-programme-card]').first()).toBeVisible();

  const horizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});
