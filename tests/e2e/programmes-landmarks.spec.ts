import { expect, test } from '@playwright/test';

for (const locale of ['en', 'fr', 'ar'] as const) {
  test(`${locale} programmes hero is a named region`, async ({ page }) => {
    const response = await page.goto(`/${locale}/programmes`);
    expect(response).not.toBeNull();
    expect(response!.ok()).toBeTruthy();

    const heading = page.locator('#programmes-hero-title');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveRole('heading');

    const regionName = ((await heading.textContent()) ?? '').trim();
    expect(regionName).not.toBe('');
    await expect(
      page.getByRole('region', { name: regionName, exact: true }),
    ).toBeVisible();
  });
}
