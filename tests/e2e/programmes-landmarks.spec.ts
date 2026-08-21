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

    const programmeCards = page.locator('[data-programme-card]');
    const programmeCardCount = await programmeCards.count();

    if (programmeCardCount === 0) {
      await expect(
        page.locator('main [role="status"], main [aria-live="polite"]').first(),
      ).toBeVisible();
      await expect(page.locator('#programme-results-title')).toHaveCount(0);
      return;
    }

    const resultsHeading = page.locator('#programme-results-title');
    await expect(resultsHeading).toBeVisible();
    const resultsName = ((await resultsHeading.textContent()) ?? '').trim();
    expect(resultsName).not.toBe('');
    await expect(
      page.getByRole('region', { name: resultsName, exact: true }),
    ).toBeVisible();

    for (let index = 0; index < programmeCardCount; index += 1) {
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

  test(`${locale} programme detail sections have accessible names`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/programmes`);

    const programmeLink = page.locator('[data-programme-card] h3 a').first();
    if ((await programmeLink.count()) === 0) {
      await expect(
        page.locator('main [role="status"], main [aria-live="polite"]').first(),
      ).toBeVisible();
      return;
    }

    await expect(programmeLink).toBeVisible();
    const programmeHref = await programmeLink.getAttribute('href');
    expect(programmeHref).toMatch(
      new RegExp(`^/${locale}/programmes/[^/?#]+$`),
    );

    await page.goto(programmeHref!);

    const regions = page.locator('[data-programme-detail-region]');
    expect(await regions.count()).toBeGreaterThanOrEqual(3);

    for (let index = 0; index < (await regions.count()); index += 1) {
      const region = regions.nth(index);
      const labelId = await region.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();

      const heading = page.locator(`#${labelId}`);
      await expect(heading).toHaveRole('heading');
      const regionName = ((await heading.textContent()) ?? '').trim();
      expect(regionName).not.toBe('');
      await expect(
        page.getByRole('region', { name: regionName, exact: true }),
      ).toBeVisible();
    }
  });
}
