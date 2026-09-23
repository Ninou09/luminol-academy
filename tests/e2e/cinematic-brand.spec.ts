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

test('distinct academy scenes retain provenance, crop intent and descriptive alternatives', async ({
  page,
}) => {
  await page.goto('/en');
  const scenes = page.locator('main [data-academy-media]');
  const sources: string[] = [];
  for (const scene of await scenes.all()) {
    await expect(scene).toHaveAttribute(
      'data-media-source',
      '/media/academy/manifest.json',
    );
    await expect(scene).toHaveAttribute(
      'data-media-license',
      /AI-generated editorial illustration/,
    );
    await expect(scene).toHaveAttribute('data-media-crop', /focal point/);
    const image = scene.getByRole('img');
    await expect(image).toHaveAttribute('alt', /.+/);
    const src = await image.getAttribute('src');
    expect(src).toBeTruthy();
    sources.push(src!);
  }
  expect(sources.length).toBeGreaterThanOrEqual(10);
  expect(new Set(sources).size).toBe(sources.length);
  await expect(page.locator('[data-school="languages"] img')).toHaveAttribute(
    'alt',
    /Algerian, French and British flags/,
  );
});
