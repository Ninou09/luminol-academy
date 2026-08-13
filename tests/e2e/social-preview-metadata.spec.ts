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
    const pageResponse = await page.goto(route);
    expect(pageResponse).not.toBeNull();
    expect(pageResponse!.ok()).toBeTruthy();

    const openGraphImage = page.locator('meta[property="og:image"]');
    const twitterImage = page.locator('meta[name="twitter:image"]');

    await expect(openGraphImage).toHaveCount(1);
    await expect(twitterImage).toHaveCount(1);

    const canonicalHref = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    const openGraphImageUrl = await openGraphImage.getAttribute('content');
    const twitterImageUrl = await twitterImage.getAttribute('content');

    expect(canonicalHref).toBeTruthy();
    expect(openGraphImageUrl).toBeTruthy();
    expect(twitterImageUrl).toBe(openGraphImageUrl);

    const canonicalOrigin = new URL(canonicalHref!).origin;
    const parsedImageUrl = new URL(openGraphImageUrl!);
    expect(parsedImageUrl.protocol).toBe('https:');
    expect(parsedImageUrl.origin).toBe(canonicalOrigin);
    expect(`${parsedImageUrl.pathname}${parsedImageUrl.search}`).toBe(
      previewPath,
    );

    const previewResponse = await request.get(previewPath);
    expect(previewResponse.ok()).toBeTruthy();
    expect(previewResponse.headers()['content-type']).toMatch(/image\/png/i);

    if (previewPath.startsWith('/api/social-preview')) {
      expect(previewResponse.headers()['cache-control']).toBe(
        'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
      );
    }
  }
});
