import { expect, test } from '@playwright/test';

import { organizationJsonLdSchema } from '../../packages/validation/test-support/organization-jsonld';

test(
  'localized home pages render the governed organization and website structured data',
  async ({ page }) => {
    for (const locale of ['en', 'fr', 'ar'] as const) {
      const response = await page.goto(`/${locale}`);
      expect(response).not.toBeNull();
      expect(response!.ok()).toBeTruthy();

      const organizationScript = page.locator(
        'script[data-organization-jsonld]',
      );
      const websiteScript = page.locator('script[data-website-jsonld]');
      await expect(organizationScript).toHaveCount(1);
      await expect(websiteScript).toHaveCount(1);

      const rawJsonLd = await organizationScript.textContent();
      const rawWebsiteJsonLd = await websiteScript.textContent();
      expect(rawJsonLd).toBeTruthy();
      expect(rawWebsiteJsonLd).toBeTruthy();

      const parsedJsonLd: unknown = JSON.parse(rawJsonLd!);
      const jsonLd = organizationJsonLdSchema.parse(parsedJsonLd);
      const websiteJsonLd = JSON.parse(rawWebsiteJsonLd!) as Record<
        string,
        unknown
      >;
      const canonicalHref = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href');
      const metaDescription = await page
        .locator('meta[name="description"]')
        .getAttribute('content');

      expect(canonicalHref).toBeTruthy();
      expect(metaDescription).toBeTruthy();
      const origin = new URL(canonicalHref!).origin;

      expect(jsonLd['@id']).toBe(`${origin}/#organization`);
      expect(jsonLd.url).toBe(origin);
      expect(jsonLd.description).toBe(metaDescription);
      expect(websiteJsonLd['@type']).toBe('WebSite');
      expect(websiteJsonLd['@id']).toBe(`${origin}/#website`);
      expect(websiteJsonLd.url).toBe(origin);
      expect(websiteJsonLd.description).toBe(metaDescription);
      expect(websiteJsonLd.publisher).toEqual({
        '@id': `${origin}/#organization`,
      });
    }
  },
);

test(
  'localized About pages expose the verified founder identity without invented claims',
  async ({ page }) => {
    for (const locale of ['en', 'fr', 'ar'] as const) {
      const response = await page.goto(`/${locale}/about`);
      expect(response).not.toBeNull();
      expect(response!.ok()).toBeTruthy();

      const founderScript = page.locator('script[data-founder-jsonld]');
      await expect(founderScript).toHaveCount(1);

      const rawFounderJsonLd = await founderScript.textContent();
      expect(rawFounderJsonLd).toBeTruthy();

      const founderJsonLd = JSON.parse(rawFounderJsonLd!) as Record<
        string,
        unknown
      >;
      const canonicalHref = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href');
      expect(canonicalHref).toBeTruthy();
      const origin = new URL(canonicalHref!).origin;

      expect(founderJsonLd['@type']).toBe('Person');
      expect(founderJsonLd['@id']).toBe(
        `${origin}/#founder-kheddaoui-fettouma`,
      );
      expect(founderJsonLd.url).toBe(canonicalHref);
      expect(founderJsonLd.worksFor).toEqual({
        '@type': 'EducationalOrganization',
        '@id': `${origin}/#organization`,
        name: 'Luminol Academy',
        url: origin,
      });
      expect(founderJsonLd).not.toHaveProperty('address');
      expect(founderJsonLd).not.toHaveProperty('aggregateRating');
      expect(founderJsonLd).not.toHaveProperty('hasCredential');
    }
  },
);
