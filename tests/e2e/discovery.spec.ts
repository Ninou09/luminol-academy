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
const governedPublicOrigin = 'https://luminol-academy-web.vercel.app';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function alternatePattern(language: string, href: string): RegExp {
  const escapedHref = escapeRegExp(href);
  return new RegExp(
    `hreflang=["']${language}["'][^>]+href=["']${escapedHref}["']|href=["']${escapedHref}["'][^>]+hreflang=["']${language}["']`,
  );
}

function findUrlEntry(sitemap: string, loc: string): string {
  const entries = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  const entry = entries.find((candidate) =>
    candidate.includes(`<loc>${loc}</loc>`),
  );
  expect(entry).toBeTruthy();
  return entry!;
}

test('robots and sitemap preserve governed public discovery', async ({
  request,
}) => {
  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBeTruthy();
  expect(robotsResponse.headers()['content-type']).toMatch(/text\/plain/);

  const robots = await robotsResponse.text();
  expect(robots).toMatch(/^User-Agent:\s*\*\s*$/im);
  expect(robots).toMatch(/^Allow:\s*\/\s*$/im);
  expect(robots).toMatch(/^Disallow:\s*\/api\/\s*$/im);

  const sitemapDirective = robots.match(/^Sitemap:\s*(https?:\/\/\S+)$/im);
  expect(sitemapDirective?.[1]).toBeTruthy();

  const sitemapUrl = new URL(sitemapDirective![1]);
  expect(sitemapUrl.origin).toBe(governedPublicOrigin);
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
        `<loc>${governedPublicOrigin}${localizedPath}</loc>`,
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
    for (const entryLocale of locales) {
      const entryLoc = `${governedPublicOrigin}/${entryLocale}${routePath}`;
      const entry = findUrlEntry(sitemap, entryLoc);

      for (const alternateLocale of locales) {
        const href = `${governedPublicOrigin}/${alternateLocale}${routePath}`;
        expect(entry).toMatch(alternatePattern(alternateLocale, href));
      }

      const defaultHref = `${governedPublicOrigin}${defaultPath}`;
      expect(entry).toMatch(alternatePattern('x-default', defaultHref));
    }
  }
});
