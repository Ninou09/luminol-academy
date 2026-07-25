import { expect, test } from '@playwright/test';
test('institutional home is available', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Education for',
  );
});
