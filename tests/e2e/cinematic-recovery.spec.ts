import { expect, test } from '@playwright/test';

test('the hero remains available after returning from the footer', async ({
  page,
}) => {
  await page.goto('/en');
  const image = page.locator('#top img');
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate(
        (element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await page.locator('#top a[href="/en/programmes"]').click();
  await expect(page).toHaveURL(/\/en\/programmes$/);
});

test('changing reduced motion disables sticky chapters without hiding content', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');
  const chapters = page.locator('#approach article');
  await expect(chapters).toHaveCount(3);
  await expect(chapters.first()).toHaveCSS('position', 'sticky');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  for (const chapter of await chapters.all()) {
    await expect(chapter).toHaveCSS('position', 'relative');
    await expect(chapter.getByRole('heading')).toBeVisible();
  }
});

for (const width of [390, 1440]) {
  test(`page navigation starts at the top at ${width}px and anchors still work`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ar');
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    await page
      .getByRole('contentinfo')
      .locator('a[href="/ar/consultations"]')
      .click();
    await expect(page).toHaveURL(/\/ar\/consultations$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    await page.getByRole('contentinfo').locator('a[href="/ar/about"]').click();
    await expect(page).toHaveURL(/\/ar\/about$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    const headingLineRatio = await page.locator('h1').evaluate((heading) => {
      const style = getComputedStyle(heading);
      return parseFloat(style.lineHeight) / parseFloat(style.fontSize);
    });
    expect(headingLineRatio).toBeGreaterThanOrEqual(1.4);
    await page.getByRole('button', { name: 'القائمة', exact: true }).click();
    await page.getByRole('dialog').locator('a[href="/ar#schools"]').click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page).toHaveURL(/\/ar#schools$/);
    await expect
      .poll(() =>
        page
          .locator('#schools')
          .evaluate((el) => el.getBoundingClientRect().top),
      )
      .toBeLessThan(200);
  });
}
