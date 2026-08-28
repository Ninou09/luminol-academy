import { expect, test } from '@playwright/test';

for (const locale of ['en', 'fr', 'ar'] as const) {
  test(`${locale} programme enquiry carries governed context into contact`, async ({
    page,
  }) => {
    const response = await page.goto(`/${locale}/programmes`);
    expect(response).not.toBeNull();
    expect(response!.ok()).toBeTruthy();

    const card = page.locator('[data-programme-card]').first();
    if ((await card.count()) === 0) {
      await expect(
        page.locator('main [role="status"], main [aria-live="polite"]').first(),
      ).toBeVisible();
      return;
    }

    const programmeLink = card.locator('h3 a');
    const programmeTitle = ((await programmeLink.textContent()) ?? '').trim();
    const programmeHref = await programmeLink.getAttribute('href');
    expect(programmeTitle).not.toBe('');
    expect(programmeHref).toMatch(
      new RegExp(`^/${locale}/programmes/([a-z0-9]+(?:-[a-z0-9]+)*)$`),
    );
    const slug = programmeHref!.split('/').at(-1)!;

    const enquiryLink = card.locator('a[data-programme-enquiry="true"]');
    await expect(enquiryLink).toHaveCount(1);
    await expect(enquiryLink).toHaveAttribute(
      'href',
      `/${locale}/contact?programme=${slug}`,
    );

    await enquiryLink.click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/contact\\?programme=${slug}$`),
    );
    await expect(page.locator('select[name="school"]')).not.toHaveValue('GENERAL');
    const message = await page.locator('textarea[name="message"]').inputValue();
    expect(message).toContain(programmeTitle);
  });

  test(`${locale} generic contact keeps generic enquiry defaults`, async ({ page }) => {
    await page.goto(`/${locale}/contact`);

    await expect(page.locator('select[name="school"]')).toHaveValue('GENERAL');
    await expect(page.locator('textarea[name="message"]')).toHaveValue('');
  });

  test(`${locale} unsafe programme context fails closed`, async ({ page }) => {
    await page.goto(`/${locale}/contact?programme=../draft`);

    await expect(page.locator('select[name="school"]')).toHaveValue('GENERAL');
    await expect(page.locator('textarea[name="message"]')).toHaveValue('');
  });
}
