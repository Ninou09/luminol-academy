import { expect, test } from '@playwright/test';

const route = '/ar/workshops/family-after-trauma';

test('workshop page preserves the approved Tally flow and safe attribution', async ({
  page,
}) => {
  const response = await page.goto(
    `${route}?utm_source=facebook&utm_medium=paid_social&utm_campaign=LUM_FREE_250926_TRAFFIC&utm_content=poster_01&meta_campaign_id=120260600000000059&meta_adset_id=120260600000000060&meta_ad_id=120260634590040059&fbclid=private-click-id&email=private%40example.com`,
  );

  expect(response?.ok()).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'الأسرة بعد الصدمة النفسية كيف نفهم ونساند؟',
    }),
  ).toBeVisible();

  const links = page.locator('[data-registration-link]');
  expect(await links.count()).toBeGreaterThanOrEqual(3);
  const registrationHref = await links.first().getAttribute('href');
  expect(registrationHref).toBeTruthy();

  const registrationUrl = new URL(registrationHref!);
  expect(registrationUrl.origin + registrationUrl.pathname).toBe(
    'https://tally.so/r/GxMz8z',
  );
  expect(Object.fromEntries(registrationUrl.searchParams)).toEqual({
    utm_source: 'facebook',
    utm_medium: 'paid_social',
    utm_campaign: 'LUM_FREE_250926_TRAFFIC',
    utm_content: 'poster_01',
    meta_campaign_id: '120260600000000059',
    meta_adset_id: '120260600000000060',
    meta_ad_id: '120260634590040059',
  });

  const visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toMatch(/volgograd|telegram|t\.me\//i);
  expect(visibleText).not.toContain('private@example.com');
});

test('desktop participant experience exposes working tabs, FAQ and privacy dialog', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route);

  await expect(page.getByRole('button', { name: 'القائمة' })).toBeHidden();
  await page.getByRole('tab', { name: /مساندة عملية/ }).click();
  await expect(
    page.getByRole('tabpanel').getByRole('heading', {
      name: 'كيف نساند من دون ضغط أو إلغاء؟',
    }),
  ).toBeVisible();

  const firstFaq = page.locator('details').first();
  await firstFaq.locator('summary').click();
  await expect(firstFaq).toHaveAttribute('open', '');

  await page.getByRole('button', { name: 'كيف نحمي خصوصيتك؟' }).click();
  const dialog = page.getByRole('dialog', {
    name: 'ما الذي يحدث عند التسجيل؟',
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'إغلاق نافذة الخصوصية' }).click();
  await expect(dialog).toBeHidden();

  expect(
    await page
      .locator('body')
      .evaluate((body) => body.scrollWidth <= innerWidth),
  ).toBe(true);
});

test('mobile menu, tabs, FAQ and fixed registration action remain usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(route);

  const menuButton = page.locator(
    'button[aria-controls="workshop-navigation"]',
  );
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  const menu = page.getByRole('navigation', {
    name: 'التنقل في صفحة اللقاء',
  });
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: 'المحاور' }).click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  await page.getByRole('tab', { name: /طلب المساعدة/ }).click();
  await expect(
    page.getByRole('tabpanel').getByRole('heading', {
      name: 'متى يصبح التقييم المتخصص خطوة مهمة؟',
    }),
  ).toBeVisible();

  const faq = page.locator('details').nth(2);
  await faq.locator('summary').click();
  await expect(faq).toHaveAttribute('open', '');

  const quickRegistration = page
    .getByLabel('التسجيل السريع')
    .getByRole('link', { name: 'سجّل الآن' });
  await expect(quickRegistration).toBeVisible();
  const box = await quickRegistration.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(48);

  expect(
    await page
      .locator('body')
      .evaluate((body) => body.scrollWidth <= innerWidth),
  ).toBe(true);
  expect(
    await page
      .locator('main')
      .evaluate((main) =>
        Array.from(main.querySelectorAll('h1, h2, h3')).every(
          (heading) => heading.scrollWidth <= heading.clientWidth + 1,
        ),
      ),
  ).toBe(true);
});

test('calendar download is an Algeria-time event with no joining link', async ({
  request,
}) => {
  const response = await request.get(`${route}/calendar`);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/calendar');

  const calendar = await response.text();
  expect(calendar).toContain('TZID:Africa/Algiers');
  expect(calendar).toContain('DTSTART;TZID=Africa/Algiers:20260925T200000');
  expect(calendar).not.toMatch(/volgograd|telegram|t\.me\//i);
});
