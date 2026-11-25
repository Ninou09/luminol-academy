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
      name: 'الاستشارات النفسية في البليدة وعن بُعد',
    }),
  ).toBeVisible();

  const founderAuthority = page.locator(
    '[data-consultation-founder-authority]',
  );
  await expect(founderAuthority).toBeVisible();
  await expect(founderAuthority).toContainText('خداوي فطومة');
  await expect(founderAuthority).toContainText('31');
  await expect(founderAuthority.locator('a')).toHaveAttribute(
    'href',
    '/ar/about/founder',
  );

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

test('the founder link opens the localized profile with ways to get in touch', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ar/consultations');
  await page.locator('[data-consultation-founder-authority] a').click();

  await expect(page).toHaveURL(/\/ar\/about\/founder$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(
    page.getByRole('heading', { level: 1, name: 'خداوي فطومة' }),
  ).toBeVisible();
  const main = page.getByRole('main');
  await expect(main.locator('a[href^="mailto:"]')).toBeVisible();
  await expect(main.locator('a[href^="tel:"]')).toBeVisible();
  await expect(
    main.locator('a[href="https://luminolacademy.nl/"]').first(),
  ).toBeVisible();
  expect(
    await main.evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
});

test('About offers the founder profile on hover and through the keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en');
  const navigation = page.getByRole('banner').getByRole('navigation').first();
  const about = navigation.getByRole('button', { name: 'About Luminol' });
  const founder = navigation.getByRole('link', { name: 'About the founder' });

  await about.hover();
  await expect(founder).toBeVisible();
  await about.press('Escape');
  await expect(founder).toBeHidden();
  await about.press('Enter');
  await expect(founder).toBeVisible();
  await founder.click();
  await expect(page).toHaveURL(/\/en\/about\/founder$/);
});
