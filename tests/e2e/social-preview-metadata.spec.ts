import { expect, test } from '@playwright/test';

const socialPreviewCases = [
  {
    route: '/en',
    previewPath: '/api/social-preview?locale=en',
  },
  {
    route: '/fr/about',
    previewPath: '/api/social-preview?locale=fr',
  },
  {
    route: '/ar/contact',
    previewPath: '/social-preview-ar.png',
  },
] as const;

test('localized routes publish reachable governed social preview images', async ({
  page,
  request,
}) => {
  for (const { route, previewPath } of socialPreviewCases) {
    await page.goto(route);

    const openGraphImage = page.locator('meta[property="og:image"]');
    const twitterImage = page.locator('meta[name="twitter:image"]');

    await expect(openGraphImage).toHaveCount(1);
    await expect(twitterImage).toHaveCount(1);

    const openGraphImageUrl = await openGraphImage.getAttribute('content');
    const twitterImageUrl = await twitterImage.getAttribute('content');

    expect(openGraphImageUrl).toBeTruthy();
    expect(twitterImageUrl).toBe(openGraphImageUrl);

    const parsedImageUrl = new URL(openGraphImageUrl!);
    expect(parsedImageUrl.protocol).toBe('https:');
    expect(`${parsedImageUrl.pathname}${parsedImageUrl.search}`).toBe(
      previewPath,
    );

    const previewResponse = await request.get(previewPath);
    expect(previewResponse.ok()).toBeTruthy();
    expect(previewResponse.headers()['content-type']).toMatch(/image\/png/i);
  }
});
