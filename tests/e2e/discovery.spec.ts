import { expect, test } from '@playwright/test';

const routePaths = [
  '',
  '/programmes',
  '/about',
  '/contact',
  '/schools/psychology',
  '/schools/languages',
  '/schools/training',
] as const;

const locales = ['ar', 'fr', 'en'] as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function alternatePattern(language: string, href: string): RegExp {
  const escapedHref = escapeRegExp(href);
  return new RegExp(
    `hreflang=["']${language}["'][^>]+href=["']${escapedHref}["']|href=["']${escapedHref}["'][^>]+hreflang=["']${language}["']`,
  );
}

test('robots and sitemap preserve governed public discovery', async ({
  request,
}) => {
  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBeTruthy();
  expect(robotsResponse.headers()['content-type']).toMatch(/text\/plain/);

  const robots = await robotsResponse.text();
  expect(robots).toMatch(/User-Agent:\s*\*/i);
  expect(robots).toMatch(/Allow:\s*\//i);
  expect(robots).toMatch(/Disallow:\s*\/api\//i);

  const sitemapDirective = robots.match(/^Sitemap:\s*(https?:\/\/\S+)$/im);
  expect(sitemapDirective?.[1]).toBeTruthy();

  const sitemapUrl = new URL(sitemapDirective![1]);
  expect(sitemapUrl.pathname).toBe('/sitemap.xml');

  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(sitemapResponse.headers()['content-type']).toMatch(
    /application\/xml|text\/xml/,
  );

  const sitemap = await sitemapResponse.text();
  expect((sitemap.match(/<url>/g) ?? []).length).toBe(
    routePaths.length * locales.length,
  );

  for (const locale of locales) {
    for (const routePath of routePaths) {
      const localizedPath = `/${locale}${routePath}`;
      expect(sitemap).toContain(
        `<loc>${sitemapUrl.origin}${localizedPath}</loc>`,
      );
    }
  }

  for (const { routePath, defaultPath } of [
    { routePath: '', defaultPath: '/en' },
    {
      routePath: '/schools/psychology',
      defaultPath: '/en/schools/psychology',
    },
  ]) {
    for (const locale of locales) {
      const href = `${sitemapUrl.origin}/${locale}${routePath}`;
      expect(sitemap).toMatch(alternatePattern(locale, href));
    }

    const defaultHref = `${sitemapUrl.origin}${defaultPath}`;
    expect(sitemap).toMatch(alternatePattern('x-default', defaultHref));
  }
});
