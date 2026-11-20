import { expect, test } from '@playwright/test';

for (const section of ['#about', 'section[aria-labelledby="pathway-title"]']) {
  test(`the film in ${section} follows visibility and remembers pause`, async ({
    page,
  }) => {
    await page.goto('/en');
    const area = page.locator(section);
    const video = area.locator('video');
    await expect(video).toHaveCount(0);
    await area.scrollIntoViewIfNeeded();
    await expect(video).toHaveJSProperty('paused', false);
    await area.getByRole('button', { name: 'Pause background video' }).click();
    await page.locator('#top').scrollIntoViewIfNeeded();
    await expect(video).toHaveCount(0);
    await area.scrollIntoViewIfNeeded();
    await expect(video).toHaveJSProperty('paused', true);
    await area.getByRole('button', { name: 'Play background video' }).click();
    await expect(video).toHaveJSProperty('paused', false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(video).toHaveCount(0);
    await expect(area.locator('img').first()).toBeVisible();
  });
}

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
    if (width < 901) {
      await page.locator('button[aria-controls="mobile-menu-panel"]').click();
      await page.locator('#mobile-menu-panel a[href="/ar/schools"]').click();
    } else {
      await page.getByRole('banner').locator('a[href="/ar/schools"]').click();
    }
    await expect(page).toHaveURL(/\/ar\/schools$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });
}
