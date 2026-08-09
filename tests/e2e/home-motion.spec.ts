import { expect, test } from '@playwright/test';

test('premium home shell exposes core navigation and brand surfaces', async ({ page }) => {
  await page.goto('/en');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('navigation', { name: /primary navigation/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Grow with clarity.');
  await expect(page.locator('[data-reveal]')).not.toHaveCount(0);
  await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('motion controller honors reduced motion without hiding content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('html')).toHaveAttribute('data-motion-ready', 'true');
  await expect(page.locator('[data-reveal]').first()).toHaveAttribute('data-reveal-state', 'visible');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('full motion progressively reveals the homepage', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.locator('html')).toHaveAttribute('data-motion-ready', 'true');
  await expect(page.locator('[data-reveal-state="visible"]').first()).toBeVisible();
});
