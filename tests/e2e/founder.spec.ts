import { expect, test } from '@playwright/test';

test('founder milestones work by keyboard and the violet theme follows the profile only', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/about/founder');

  await expect(page.getByRole('banner')).toHaveAttribute(
    'data-founder-theme',
    'true',
  );
  await expect(page.getByRole('contentinfo')).toHaveAttribute(
    'data-founder-theme',
    'true',
  );
  await expect(
    page.getByRole('main').locator('img[src*="founder-fettouma-wide.webp"]'),
  ).toBeVisible();
  const chapters = page.getByRole('navigation', { name: 'On this page' });
  await chapters.getByRole('link', { name: 'Career' }).click();
  await expect(page).toHaveURL(/#founder-career$/);

  const entry = page
    .locator('summary')
    .filter({ hasText: 'Postgraduate diploma' });
  await entry.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByText('Specialisation in psychopathology.'),
  ).toBeVisible();

  await page.goto('/en/consultations');
  await expect(page.getByRole('banner')).not.toHaveAttribute(
    'data-founder-theme',
  );
  await expect(page.getByRole('contentinfo')).not.toHaveAttribute(
    'data-founder-theme',
  );
});

test('the mobile founder menu is violet and the Arabic profile stays within the viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/ar/about/founder');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'القائمة', exact: true }).click();
  const panel = page.locator('#mobile-menu-panel');
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('data-founder-theme', 'true');
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  const overflow = await page
    .getByRole('main')
    .evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
