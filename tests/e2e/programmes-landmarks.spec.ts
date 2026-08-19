import { expect, test } from '@playwright/test';

for (const locale of ['en', 'fr', 'ar'] as const) {
  test(`${locale} programmes hero, search, results and cards have accessible names`, async ({
    page,
  }) => {
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

    const searchLabel = page.locator('label[for="programme-query"] span');
    const searchName = ((await searchLabel.textContent()) ?? '').trim();
    expect(searchName).not.toBe('');
    await expect(
      page.getByRole('search', { name: searchName, exact: true }),
    ).toBeVisible();

    const resultsHeading = page.locator('#programme-results-title');
    await expect(resultsHeading).toBeVisible();
    const resultsName = ((await resultsHeading.textContent()) ?? '').trim();
    expect(resultsName).not.toBe('');
    await expect(
      page.getByRole('region', { name: resultsName, exact: true }),
    ).toBeVisible();

    const programmeCards = page.locator('[data-programme-card]');
    await expect(programmeCards).not.toHaveCount(0);

    for (let index = 0; index < (await programmeCards.count()); index += 1) {
      const card = programmeCards.nth(index);
      const labelId = await card.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();

      const cardHeading = page.locator(`#${labelId}`);
      await expect(cardHeading).toHaveJSProperty('tagName', 'H3');
      const articleName = ((await cardHeading.textContent()) ?? '').trim();
      expect(articleName).not.toBe('');
      await expect(
        page.getByRole('article', { name: articleName, exact: true }),
      ).toBeVisible();
    }
  });
}
