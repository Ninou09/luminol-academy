import { expect, test } from '@playwright/test';

for (const [locale, nextText, previousText, sign] of [
  ['en', 'Next story', 'Previous story', 1],
  ['ar', 'المقال التالي', 'المقال السابق', -1],
] as const) {
  test(`journal stories advance and reverse in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/journal`);

    const track = page.locator('#journal-stories');
    await expect(track.getByRole('link')).toHaveCount(4);
    const previous = page.getByRole('button', { name: previousText });
    const next = page.getByRole('button', { name: nextText });
    await expect(previous).toBeDisabled();
    await next.click();
    await expect(previous).toBeEnabled();
    expect(
      sign * (await track.evaluate((element) => element.scrollLeft)),
    ).toBeGreaterThan(0);
    await previous.click();
    await expect(previous).toBeDisabled();
  });
}
