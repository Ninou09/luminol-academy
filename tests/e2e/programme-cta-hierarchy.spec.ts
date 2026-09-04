import { expect, test } from '@playwright/test';

for (const locale of ['en', 'fr', 'ar'] as const) {
  test(
    `${locale} programme cards and details keep one clear programme-specific conversion path`,
    async ({ page }) => {
      const response = await page.goto(`/${locale}/programmes`);
      expect(response).not.toBeNull();
      expect(response!.ok()).toBeTruthy();

      const card = page.locator('[data-programme-card]').first();
      if ((await card.count()) === 0) {
        await expect(
          page
            .locator('main [role="status"], main [aria-live="polite"]')
            .first(),
        ).toBeVisible();
        return;
      }

      const actions = card.locator('[data-programme-actions]');
      const primary = actions.locator('[data-programme-primary-action]');
      const enquiry = actions.locator('[data-programme-enquiry-action]');

      await expect(actions).toBeVisible();
      await expect(primary).toHaveCount(1);
      await expect(enquiry).toHaveCount(1);

      const links = actions.getByRole('link');
      await expect(links).toHaveCount(3);
      await expect(links.nth(0)).toHaveAttribute(
        'href',
        new RegExp(`^/${locale}/programmes/[^/?#]+$`),
      );
      await expect(links.nth(1)).toHaveAttribute(
        'href',
        new RegExp(`^/${locale}/contact\\?programme=[^&#]+$`),
      );
      await expect(links.nth(2)).toHaveAttribute(
        'href',
        new RegExp(
          `^/${locale}/schools/(psychology|languages|training)#programs$`,
        ),
      );

      const programmeHref = await primary.getAttribute('href');
      const enquiryHref = await enquiry.getAttribute('href');
      expect(programmeHref).toBeTruthy();
      expect(enquiryHref).toMatch(
        new RegExp(`^/${locale}/contact\\?programme=[^&#]+$`),
      );

      await page.goto(programmeHref!);
      await expect(page.locator(`a[href="${enquiryHref}"]`).first()).toBeVisible();
    },
  );
}
