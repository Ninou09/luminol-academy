import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'fr', 'en'] as const) {
  for (const width of [320, 390, 768]) {
    test(`${locale} homepage stays readable at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${locale}`);
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute(
        'dir',
        locale === 'ar' ? 'rtl' : 'ltr',
      );

      const metrics = await title.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          lineRatio: parseFloat(style.lineHeight) / parseFloat(style.fontSize),
          font: style.fontFamily,
          fits: element.scrollWidth <= element.clientWidth + 1,
        };
      });
      expect(metrics.fits).toBe(true);
      if (locale === 'ar') {
        expect(metrics.lineRatio).toBeGreaterThanOrEqual(1.45);
        expect(metrics.font.toLowerCase()).toContain('arabic');
      }

      const actions = page.locator(
        '#top a[href*="/programmes"], #top a[href*="/consultations"]',
      );
      await expect(actions).toHaveCount(2);
      for (const action of await actions.all()) {
        const box = await action.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThanOrEqual(48);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      }
      const firstCard = page.locator('[data-school-card]').first();
      await expect(firstCard).toHaveCSS('min-height', 'auto');
      await expect(firstCard.locator('a[href*="/schools/"]')).toHaveCSS(
        'min-height',
        '44px',
      );
      expect(
        await page.locator('main').evaluate((element) => {
          return Array.from(element.querySelectorAll('h1, h2, h3')).every(
            (heading) => {
              return heading.scrollWidth <= heading.clientWidth + 1;
            },
          );
        }),
      ).toBe(true);
    });
  }
}

const expectedHeroTitles = {
  ar: 'تقدّم بوضوح. وتعلّم بهدف.',
  fr: 'Grandissez avec clarté. Apprenez avec intention.',
  en: 'Grow with clarity. Learn with purpose.',
} as const;

for (const locale of ['ar', 'fr', 'en'] as const) {
  test(`${locale} homepage exposes a separated hero heading`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: expectedHeroTitles[locale],
        exact: true,
      }),
    ).toBeVisible();
  });
}

test('Arabic desktop hero preserves its poster under reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ar');
  await expect(page.locator('#top img').first()).toBeVisible();
  expect(await page.locator('#top video').getAttribute('src')).toBeNull();
  await expect(page.locator('#top button')).toHaveCount(0);
});

test('mobile training and consultation links work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000/ar');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.locator('#top a[href*="/programmes"]').click();
    await expect(page).toHaveURL(/\/ar\/programmes$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  } finally {
    await context.close();
  }
});
