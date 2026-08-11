import { colors } from '@luminol/config/tailwind';
import { expect, test } from '@playwright/test';

test('public pages publish the governed app manifest and browser theme color', async ({
  page,
  request,
}) => {
  await page.goto('/en');

  const manifestHref = await page
    .locator('link[rel="manifest"]')
    .getAttribute('href');
  expect(manifestHref).toBeTruthy();

  const manifestUrl = new URL(manifestHref!, page.url());
  expect(manifestUrl.pathname).toBe('/manifest.webmanifest');

  const themeColor = await page
    .locator('meta[name="theme-color"]')
    .getAttribute('content');
  expect(themeColor).toBe(colors.ink);

  const response = await request.get(manifestUrl.pathname);
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toMatch(
    /application\/(?:manifest\+json|json)/,
  );

  const manifest = (await response.json()) as {
    name?: string;
    short_name?: string;
    start_url?: string;
    display?: string;
    background_color?: string;
    theme_color?: string;
    icons?: Array<{ src?: string; sizes?: string; type?: string }>;
  };

  expect(manifest).toMatchObject({
    name: 'Luminol Academy',
    short_name: 'Luminol',
    start_url: '/',
    display: 'standalone',
    background_color: colors.canvas,
    theme_color: colors.ink,
  });

  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ src: '/favicon.ico', type: 'image/x-icon' }),
      expect.objectContaining({ src: '/icon.svg', type: 'image/svg+xml' }),
      expect.objectContaining({
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      }),
    ]),
  );
});
