import { expect, test } from '@playwright/test';

test('public header uses the supplied logo without phone chrome', async ({
  page,
}) => {
  await page.goto('/en');
  const logo = page.locator('header [data-academy-logo]');
  await expect(logo).toContainText('Luminol');
  const frame = logo.locator('[data-media-crop]');
  await expect(frame).toHaveCSS('overflow', 'hidden');
  await expect(frame).toHaveAttribute(
    'data-media-source',
    'user-upload:1000077217.jpg',
  );
  await expect
    .poll(() =>
      frame
        .locator('img')
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
});

test('cinematic depth responds to scroll without intercepting navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');
  const hero = page.locator('#top');
  await expect
    .poll(() =>
      hero.evaluate((el) => el.style.getPropertyValue('--scene-scale')),
    )
    .not.toBe('');
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
  await expect
    .poll(() =>
      hero.evaluate((el) => parseFloat(el.style.getPropertyValue('--scene-y'))),
    )
    .toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => hero.evaluate((el) => el.style.getPropertyValue('--scene-y')))
    .toBe('');
});

test('hero and school artwork retain their source metadata', async ({
  page,
}) => {
  await page.goto('/en');
  const hero = page.locator('#top [data-media-source]').first();
  await expect(hero).toHaveAttribute(
    'data-media-source',
    'luminol-commissioned-3d',
  );
  await expect(hero.locator('img')).toHaveAttribute(
    'alt',
    'A glass sphere filled with flowing luminous cyan light',
  );
  for (const school of ['psychology', 'languages', 'training']) {
    const art = page.locator(`#${school} [data-academy-media="${school}"]`);
    await expect(art).toHaveAttribute(
      'data-media-source',
      'luminol-commissioned-3d',
    );
    await expect(art.locator('img')).not.toHaveAttribute('alt', '');
  }
  // "Why Luminol exists" now plays the second academy film.
  await expect(page.locator('#about video')).toHaveCount(1);
});
