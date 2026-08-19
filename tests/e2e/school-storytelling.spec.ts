import { expect, test } from '@playwright/test';

import { breadcrumbJsonLdSchema } from '../../packages/validation/test-support/breadcrumb-jsonld';

test('premium school storytelling preserves landmarks and governed media', async ({
  page,
}) => {
  await page.goto('/en/schools/psychology');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.locator('[data-school-hero="psychology"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const founderMedia = page.locator(
    '[data-school-hero="psychology"] [data-founder-media]',
  );
  await expect(founderMedia).toBeVisible();
  await expect(founderMedia).toHaveAttribute(
    'data-media-source',
    'user-approved-upload',
  );
  await expect(founderMedia).toHaveAttribute(
    'data-media-approval',
    '2026-08-13',
  );
  await expect(
    founderMedia.getByRole('img', {
      name: 'Kheddaoui Fettouma, founder of Luminol Academy',
    }),
  ).toBeVisible();

  await expect(page.locator('[data-programme-card]')).not.toHaveCount(0);

  const firstProgrammeCard = page.locator('[data-programme-card]').first();
  const firstProgrammeTitle = (
    await firstProgrammeCard.getByRole('heading', { level: 3 }).innerText()
  ).trim();
  await expect(firstProgrammeCard.locator('a[href="/en/contact"]')).toHaveAttribute(
    'aria-label',
    new RegExp(firstProgrammeTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );

  const mediaSources = await page
    .locator('[data-programme-card] [data-media-source]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-media-source')),
    );

  expect(mediaSources.length).toBeGreaterThan(0);
  expect(
    mediaSources.every(
      (source) => source === 'governed-fallback' || source === 'sanity',
    ),
  ).toBeTruthy();
});

test('school reduced motion keeps the centered editorial core in place', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/schools/languages');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('[data-founder-media]')).toHaveCount(0);
  const core = page.locator(
    '[data-school-hero="languages"] [data-motion-float]',
  );
  await expect(core).toHaveCSS('translate', '-50% -50%');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('Arabic school storytelling remains RTL and mobile-safe', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('/ar/schools/training');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-programme-card]').first()).toBeVisible();

  const horizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});

test('Arabic school primary CTA keeps readable foreground contrast', async ({
  page,
}) => {
  await page.goto('/ar/schools/psychology');

  const primaryCta = page.getByRole('link', { name: /استكشف البرامج/ });
  await expect(primaryCta).toBeVisible();
  await expect(primaryCta).toContainText('استكشف البرامج');

  const colors = await primaryCta.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return {
      foreground: styles.color,
      background: styles.backgroundColor,
    };
  });

  expect(colors.foreground).toBe('rgb(250, 250, 248)');
  expect(colors.foreground).not.toBe(colors.background);
});

test('localized school pages publish matching breadcrumb structured data', async ({
  page,
}) => {
  for (const route of [
    '/en/schools/psychology',
    '/fr/schools/languages',
    '/ar/schools/training',
  ]) {
    const response = await page.goto(route);
    expect(response).not.toBeNull();
    expect(response!.ok()).toBeTruthy();

    const rawJsonLd = await page
      .locator('script[data-breadcrumb-jsonld]')
      .textContent();
    expect(rawJsonLd).toBeTruthy();

    const parsedJsonLd: unknown = JSON.parse(rawJsonLd!);
    const jsonLd = breadcrumbJsonLdSchema.parse(parsedJsonLd);

    expect(jsonLd.itemListElement).toHaveLength(2);
    expect(jsonLd.itemListElement.map((item) => item.position)).toEqual([1, 2]);

    const expectedLocale = route.split('/')[1];
    const firstUrl = new URL(jsonLd.itemListElement[0]!.item);
    const currentUrl = new URL(jsonLd.itemListElement[1]!.item);

    expect(firstUrl.pathname).toBe(`/${expectedLocale}`);
    expect(firstUrl.hash).toBe('#schools');
    expect(currentUrl.pathname).toBe(route);
    expect(currentUrl.origin).toBe(firstUrl.origin);

    const ancestorLink = page
      .locator(`main a[href="${firstUrl.pathname}${firstUrl.hash}"]`)
      .first();
    const visibleBreadcrumb = ancestorLink.locator('..');
    const currentCrumb = visibleBreadcrumb.locator('[aria-current="page"]');

    await expect(ancestorLink).toHaveText(jsonLd.itemListElement[0]!.name);
    await expect(currentCrumb).toContainText(jsonLd.itemListElement[1]!.name);
    await expect(currentCrumb).not.toHaveAttribute('href');
  }
});
