import { expect, test } from '@playwright/test';

test('psychology consultations are localized and expose the enquiry flow', async ({
  page,
}) => {
  await page.goto('/ar/consultations');

  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'خطوة أولى أوضح عندما تحتاج إلى دعم نفسي.',
    }),
  ).toBeVisible();
  await expect(page.locator('#consultation-enquiry form')).toBeVisible();
  await expect(page.locator('select[name="school"]')).toHaveValue('PSYCHOLOGY');
});

test('consultation metadata keeps localized canonical and language alternates', async ({
  page,
}) => {
  await page.goto('/fr/consultations');

  const canonicalHref = await page
    .locator('link[rel="canonical"]')
    .getAttribute('href');
  const arabicHref = await page
    .locator('link[rel="alternate"][hreflang="ar"]')
    .getAttribute('href');
  const englishHref = await page
    .locator('link[rel="alternate"][hreflang="en"]')
    .getAttribute('href');

  expect(canonicalHref).toBeTruthy();
  expect(arabicHref).toBeTruthy();
  expect(englishHref).toBeTruthy();
  expect(new URL(canonicalHref!).pathname).toBe('/fr/consultations');
  expect(new URL(arabicHref!).pathname).toBe('/ar/consultations');
  expect(new URL(englishHref!).pathname).toBe('/en/consultations');
});
