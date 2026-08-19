import { expect, test } from '@playwright/test';

test('homepage story sections expose named landmarks', async ({ page }) => {
  await page.goto('/en');

  const landmarks = [
    ['schools', 'home-schools-title'],
    ['approach', 'home-approach-title'],
    ['about', 'home-about-title'],
    ['contact', 'home-contact-title'],
  ] as const;

  for (const [sectionId, titleId] of landmarks) {
    await expect(
      page.locator(`section#${sectionId}[aria-labelledby="${titleId}"]`),
    ).toBeVisible();
    await expect(page.locator(`#${titleId}`)).toHaveJSProperty(
      'tagName',
      'H2',
    );
  }
});
