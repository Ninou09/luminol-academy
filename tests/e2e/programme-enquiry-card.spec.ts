import { expect, test } from '@playwright/test';

const slug = 'acceptance-commitment-therapy-act';
const certificateTitles = {
  ar: 'شهادة حضور',
  fr: 'Attestation de présence',
  en: 'Attendance certificate',
} as const;

for (const locale of ['ar', 'fr', 'en'] as const) {
  for (const width of [320, 1280]) {
    test(`${locale} course enquiry stays readable and contextual at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const response = await page.goto(`/${locale}/programmes/${slug}`);
      expect(response?.ok()).toBe(true);
      const card = page.locator('[data-programme-enquiry-card]');
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute(
        'aria-labelledby',
        'programme-enquiry-title',
      );
      await expect(card.getByRole('heading', { level: 3 })).toHaveText(
        certificateTitles[locale],
      );
      await expect(
        card.locator('[data-programme-certificate] p'),
      ).not.toBeEmpty();

      const action = card.locator('[data-programme-panel-action]');
      await expect(action).toHaveAttribute(
        'href',
        `/${locale}/contact?programme=${slug}`,
      );
      const bounds = await action.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.height).toBeGreaterThanOrEqual(48);
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);

      const headings = await page
        .locator('main h1, main h2, main h3')
        .evaluateAll((elements) =>
          elements.map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              left: rect.left,
              right: rect.right,
              overflow: element.scrollWidth - element.clientWidth,
            };
          }),
        );
      for (const heading of headings) {
        expect(heading.left).toBeGreaterThanOrEqual(-1);
        expect(heading.right).toBeLessThanOrEqual(width + 1);
        expect(heading.overflow).toBeLessThanOrEqual(1);
      }
      if (locale === 'ar') {
        const headingStyle = await page
          .getByRole('heading', { level: 1 })
          .evaluate((element) => {
            const style = getComputedStyle(element);
            return {
              ratio: parseFloat(style.lineHeight) / parseFloat(style.fontSize),
              font: style.fontFamily,
            };
          });
        expect(headingStyle.ratio).toBeGreaterThanOrEqual(1.5);
        expect(headingStyle.font.toLowerCase()).toContain('arabic');
      }
      await action.click();
      await expect(page).toHaveURL(
        new RegExp(`/${locale}/contact\\?programme=${slug}$`),
      );
      await expect(page.locator('[data-contact-form]')).toBeVisible();
    });
  }
}

test('programme enquiry remains a usable native link without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 1000 },
  });
  try {
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:3000/ar/programmes/${slug}`);
    await expect(page.locator('[data-programme-certificate]')).toContainText(
      certificateTitles.ar,
    );
    await page.locator('[data-programme-panel-action]').click();
    await expect(page).toHaveURL(
      new RegExp(`/ar/contact\\?programme=${slug}$`),
    );
  } finally {
    await context.close();
  }
});
