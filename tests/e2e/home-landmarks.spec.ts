import { expect, test } from '@playwright/test';

test('homepage sections have accessible names', async ({ page }) => {
  await page.goto('/en');

  await expect(page.locator('#schools')).toHaveAttribute(
    'aria-labelledby',
    'home-schools-title',
  );
  await expect(page.locator('#approach')).toHaveAttribute(
    'aria-labelledby',
    'home-approach-title',
  );
  await expect(page.locator('#about')).toHaveAttribute(
    'aria-labelledby',
    'home-about-title',
  );
  await expect(page.locator('#contact')).toHaveAttribute(
    'aria-labelledby',
    'home-contact-title',
  );
});
