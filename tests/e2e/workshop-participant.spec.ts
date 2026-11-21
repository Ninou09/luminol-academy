import { expect, test } from '@playwright/test';

const route = '/ar/workshops/family-after-trauma';

test('workshop page closes registration and keeps private details out of the archive', async ({
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

  const subjectImage = page.getByRole('img', {
    name: 'صورة توضيحية لأسرة تتحاور بهدوء وتقدّم المساندة',
  });
  await expect(subjectImage).toBeVisible();
  expect(
    await subjectImage.evaluate(
      (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
    ),
  ).toBe(true);

  await expect(page.getByText('انتهى اللقاء', { exact: true })).toBeVisible();
  await expect(
    page.locator('[data-registration-link], a[href*="tally.so"], a[download]'),
  ).toHaveCount(0);
  await expect(
    page.locator('main a[href="/ar/programmes"]').first(),
  ).toBeVisible();

  const visibleText = await page.locator('body').innerText();
  expect(visibleText).not.toMatch(/volgograd|telegram|t\.me\//i);
  expect(visibleText).not.toContain('private@example.com');
});

test('desktop participant experience exposes working tabs and FAQ', async ({
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

  const presenterImage = page.getByRole('img', {
    name: 'الأستاذة خداوي فطومة، مقدّمة اللقاء',
  });
  await presenterImage.scrollIntoViewIfNeeded();
  await expect(presenterImage).toBeVisible();
  expect(
    await presenterImage.evaluate(
      (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
    ),
  ).toBe(true);

  expect(
    await page
      .locator('body')
      .evaluate((body) => body.scrollWidth <= innerWidth),
  ).toBe(true);
});

test('mobile menu, tabs, FAQ and programme link remain usable', async ({
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

  await expect(page.getByLabel('التسجيل السريع')).toHaveCount(0);
  await page.locator('main a[href="/ar/programmes"]').last().click();
  await expect(page).toHaveURL(/\/ar\/programmes$/);
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
