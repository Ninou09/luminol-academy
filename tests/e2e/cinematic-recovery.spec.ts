import { expect, test } from '@playwright/test';

test('video resumes after leaving the hero, but preserves an explicit pause', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');
  const video = page.locator('#top video');
  await expect
    .poll(() =>
      video.evaluate((v: HTMLVideoElement) => !v.paused && v.readyState >= 2),
    )
    .toBe(true);
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused))
    .toBe(true);
  await page
    .getByRole('button', { name: 'Pause background video', exact: true })
    .click();
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(
    page.getByRole('button', { name: 'Play background video', exact: true }),
  ).toBeVisible();
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('changing reduced motion during playback stops video and optional motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');
  const video = page.locator('#top video');
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused))
    .toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(true);
  await expect(video).not.toHaveAttribute('src');
  await expect(page.locator('h1')).toBeVisible();
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
    await page.getByRole('banner').locator('a[href="/ar#schools"]').click();
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
