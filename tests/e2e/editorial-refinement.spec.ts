import { expect, test } from '@playwright/test';

for (const locale of ['en', 'fr', 'ar'] as const) {
  test(`${locale} school shortcuts preserve active programme search`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/programmes?q=communication&language=fr`);
    const pathways = page.locator('[data-programme-pathways]');
    await pathways.locator('a[href*="school=languages"]').click();
    await expect(page).toHaveURL(/school=languages/);
    const url = new URL(page.url());
    expect(url.searchParams.get('q')).toBe('communication');
    expect(url.searchParams.get('language')).toBe('fr');
    expect(url.searchParams.get('school')).toBe('languages');
    await expect(page.locator('#programme-school')).toHaveValue('languages');
    await expect(pathways.locator('[aria-current="true"]')).toHaveCount(1);
    await pathways.locator('a').first().click();
    await expect(page).not.toHaveURL(/school=/);
    expect(new URL(page.url()).searchParams.has('school')).toBe(false);
    await expect(page.locator('#programme-school')).toHaveValue('');
    await expect(page.locator('#programme-query')).toHaveValue('communication');
    await expect(page.locator('#programme-language')).toHaveValue('fr');
  });

  for (const width of [320, 768]) {
    test(`${locale} editorial headings and school content fit at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const route of [
        'about',
        'schools/languages',
        'schools/training',
        'consultations',
        'contact',
      ]) {
        await page.goto(`/${locale}/${route}`);
        await page.evaluate(() => document.fonts.ready);
        const clipped = await page
          .locator('main h1, main h2, main h3')
          .evaluateAll((elements) =>
            elements
              .filter(
                (element) => element.scrollWidth > element.clientWidth + 1,
              )
              .map((element) => element.textContent),
          );
        expect(
          clipped,
          `${route}: no heading should clip inside its column`,
        ).toEqual([]);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
        const media = page.locator('main [data-media-source]').first();
        await expect(media).toHaveAttribute('data-media-source', /\S+/);
        await expect(page.locator('main figure figcaption')).toHaveCount(0);
      }
    });
  }
}
