import { expect, test } from '@playwright/test';

test('localized home pages render the governed organization structured data', async ({
  page,
}) => {
  for (const locale of ['en', 'fr', 'ar'] as const) {
    await page.goto(`/${locale}`);

    const organizationScript = page.locator('script[data-organization-jsonld]');
    await expect(organizationScript).toHaveCount(1);

    const rawJsonLd = await organizationScript.textContent();
    expect(rawJsonLd).toBeTruthy();

    const jsonLd = JSON.parse(rawJsonLd!) as Record<string, unknown>;
    const canonicalHref = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');

    expect(canonicalHref).toBeTruthy();
    const origin = new URL(canonicalHref!).origin;

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('EducationalOrganization');
    expect(jsonLd['@id']).toBe(`${origin}/#organization`);
    expect(jsonLd.name).toBe('Luminol Academy');
    expect(jsonLd.url).toBe(origin);
    expect(typeof jsonLd.description).toBe('string');
    expect((jsonLd.description as string).trim().length).toBeGreaterThan(0);
  }
});
