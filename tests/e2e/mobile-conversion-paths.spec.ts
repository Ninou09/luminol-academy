import { expect, test } from '@playwright/test';

test('Arabic consultation conversion stays usable at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('/ar/consultations');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(
    page.locator('a[href="#consultation-enquiry"]'),
  ).toBeVisible();
  await expect(page.locator('#consultation-enquiry form')).toBeVisible();

  const horizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});

test('Arabic programme enquiry handoff stays usable at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto('/ar/programmes');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  const card = page.locator('[data-programme-card]').first();
  if ((await card.count()) === 0) {
    await expect(
      page.locator('main [role="status"], main [aria-live="polite"]').first(),
    ).toBeVisible();
  } else {
    const enquiry = card.locator('[data-programme-enquiry-action]');
    await expect(enquiry).toBeVisible();

    const enquiryHref = await enquiry.getAttribute('href');
    expect(enquiryHref).toMatch(/^\/ar\/contact\?programme=[^&#]+$/);

    await enquiry.click();
    await expect(page).toHaveURL(/\/ar\/contact\?programme=[^&#]+$/);
    await expect(
      page.locator('[data-contact-form] form.enquiry-form'),
    ).toBeVisible();
  }

  const horizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});
