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

  for (const labelId of ['school-promise-title', 'school-cta-title']) {
    const label = page.locator(`#${labelId}`);
    await expect(label).toBeVisible();
    const regionName = ((await label.textContent()) ?? '').trim();
    expect(regionName).not.toBe('');
    await expect(
      page.getByRole('region', { name: regionName, exact: true }),
    ).toBeVisible();
  }

  const academyMedia = page.locator(
    '[data-school-hero="psychology"] [data-academy-media="psychology"]',
  );
  await expect(academyMedia).toBeVisible();
  await expect(academyMedia).toHaveAttribute(
    'data-media-source',
    'https://www.pexels.com/photo/3184306/',
  );
  await expect(
    academyMedia.getByRole('img', {
      name: 'A diverse learning group collaborating around a table',
    }),
  ).toBeVisible();
  await expect(page.locator('[data-founder-media]')).toHaveCount(0);

  const programmeCards = page.locator('[data-programme-card]');
  await expect(programmeCards).not.toHaveCount(0);

  for (let index = 0; index < (await programmeCards.count()); index += 1) {
    const card = programmeCards.nth(index);
    const labelId = await card.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const heading = page.locator(`#${labelId}`);
    await expect(heading).toHaveJSProperty('tagName', 'H3');
    const articleName = ((await heading.textContent()) ?? '').trim();
    expect(articleName).not.toBe('');
    await expect(
      page.getByRole('article', { name: articleName, exact: true }),
    ).toBeVisible();
  }

  const firstProgrammeCard = programmeCards.first();
  const firstProgrammeTitle = (
    await firstProgrammeCard.getByRole('heading', { level: 3 }).innerText()
  ).trim();
  const contactActionLabel = await firstProgrammeCard
    .locator('a[href="/en/contact"]')
    .getAttribute('aria-label');
  expect(contactActionLabel).toContain(firstProgrammeTitle);

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

test('school reduced motion keeps the editorial image in place', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/schools/languages');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('[data-founder-media]')).toHaveCount(0);
  const image = page.locator(
    '[data-school-hero="languages"] [data-academy-media="languages"] img',
  );
  await expect(image).toBeVisible();
  await expect(image).toHaveCSS('transform', 'none');
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
