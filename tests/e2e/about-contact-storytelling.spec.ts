import { expect, test } from '@playwright/test';

test('premium About storytelling preserves public landmarks and school pathways', async ({
  page,
}) => {
  await page.goto('/en/about');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.locator('[data-about-hero]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-value-card]')).not.toHaveCount(0);
  await expect(page.locator('[data-ecosystem-school]')).toHaveCount(3);
});

test('About reduced motion keeps the centered brand core in place', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/about');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('[data-about-hero] [data-motion-float]')).toHaveCSS(
    'translate',
    '-50% -50%',
  );
});

test('premium Contact page preserves the enquiry form contract', async ({
  page,
}) => {
  await page.goto('/en/contact');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.locator('[data-contact-hero]')).toBeVisible();
  await expect(page.locator('[data-contact-path]')).toHaveCount(3);

  const form = page.locator('[data-contact-form] form.enquiry-form');
  await expect(form).toBeVisible();
  await expect(form.locator('input[name="name"]')).toHaveAttribute(
    'required',
    '',
  );
  await expect(form.locator('input[name="email"]')).toHaveAttribute(
    'required',
    '',
  );
  await expect(form.locator('select[name="school"]')).toHaveAttribute(
    'required',
    '',
  );
  await expect(form.locator('textarea[name="message"]')).toHaveAttribute(
    'required',
    '',
  );
  await expect(form.locator('input[name="consent"]')).toHaveAttribute(
    'required',
    '',
  );
});

test('Arabic About and Contact storytelling stay RTL and mobile-safe', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });

  for (const pathname of ['/ar/about', '/ar/contact']) {
    await page.goto(pathname);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const horizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBeLessThanOrEqual(1);
  }
});
