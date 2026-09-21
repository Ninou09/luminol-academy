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

test('new learning and workshop photos retain their source metadata', async ({
  page,
}) => {
  await page.goto('/en');
  await expect(page.locator('#top video')).toHaveAttribute(
    'src',
    '/media/editorial/academy-film.mp4',
  );
  await expect(page.locator('#languages [data-academy-media]')).toHaveAttribute(
    'data-media-source',
    'https://unsplash.com/photos/omeaHbEFlN4',
  );
  await expect(page.locator('#training [data-academy-media]')).toHaveAttribute(
    'data-media-source',
    'https://unsplash.com/photos/vdXMSiX-n6M',
  );
});
