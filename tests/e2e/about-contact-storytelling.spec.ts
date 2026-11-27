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
  await expect(
    page.locator('section[aria-labelledby="about-origin-title"]'),
  ).toBeVisible();
  await expect(page.locator('#about-origin-title')).toHaveJSProperty(
    'tagName',
    'H2',
  );
  await expect(
    page.locator('section[aria-labelledby="about-cta-title"]'),
  ).toBeVisible();
  await expect(page.locator('#about-cta-title')).toHaveJSProperty(
    'tagName',
    'H2',
  );

  for (const labelId of ['about-mission-title', 'about-vision-title']) {
    const heading = page.locator(`#${labelId}`);
    await expect(heading).toHaveJSProperty('tagName', 'H2');
    const articleName = ((await heading.textContent()) ?? '').trim();
    expect(articleName).not.toBe('');
    await expect(
      page.getByRole('article', { name: articleName, exact: true }),
    ).toBeVisible();
  }

  const gallery = page.getByRole('region', { name: 'Moments at Luminol' });
  const lastPhoto = gallery.getByRole('button', {
    name: 'Recognising progress',
  });
  await lastPhoto.click();
  await expect(lastPhoto).toHaveAttribute('aria-current', 'true');
  await expect(gallery.locator('[aria-live="polite"]')).toHaveText('12 / 12');
  const founder = page.locator('[data-founder-authority]');
  await expect(
    founder.locator('img[src*="founder-office-portrait.webp"]'),
  ).toBeVisible();
  await expect(
    founder.getByRole('link', { name: 'Meet the founder' }),
  ).toHaveAttribute('href', '/en/about/founder');

  const valueCards = page.locator('[data-value-card]');
  await expect(valueCards).not.toHaveCount(0);
  for (let index = 0; index < (await valueCards.count()); index += 1) {
    const card = valueCards.nth(index);
    const labelId = await card.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const heading = page.locator(`#${labelId}`);
    await expect(heading).toHaveJSProperty('tagName', 'H3');
    const articleName = ((await heading.textContent()) ?? '').trim();
    expect(articleName).not.toBe('');
    await expect(
      page.getByRole('article', { name: articleName, exact: true }),
    ).toBeVisible();
  }

  await expect(page.locator('[data-ecosystem-school]')).toHaveCount(0);
  await expect(
    page.getByRole('complementary', { name: 'Our schools' }).locator('a'),
  ).toHaveAttribute('href', '/en/schools');
});

test('About reduced motion keeps the editorial image in place', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/about');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(
    page.locator('[data-about-hero] [data-editorial-film] img'),
  ).toBeVisible();
  await expect(page.locator('[data-founder-media]')).toHaveCount(0);
});

test('editorial films autoplay muted on phones and keep their source metadata', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/en/about', '/fr/psy-library']) {
    await page.goto(path);
    const film = page.locator('[data-editorial-film]');
    await film.scrollIntoViewIfNeeded();
    const video = film.locator('video');
    await expect(video).toHaveJSProperty('paused', false);
    await expect(video).toHaveJSProperty('loop', true);
    await expect(video).toHaveJSProperty('muted', true);
    await expect(film).toHaveAttribute(
      'data-media-source',
      /^https:\/\/www\.pexels\.com/,
    );
    await expect(film.locator('figcaption')).toHaveCount(0);
  }
});

test('premium Contact page preserves the enquiry form contract', async ({
  page,
}) => {
  await page.goto('/en/contact');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.locator('[data-contact-hero]')).toBeVisible();
  const contactPaths = page.locator('[data-contact-path]');
  await expect(contactPaths).toHaveCount(3);
  await expect(page.locator('#contact-paths-title')).toHaveJSProperty(
    'tagName',
    'H2',
  );
  await expect(page.locator('[data-contact-path] h3')).toHaveCount(3);

  for (let index = 0; index < (await contactPaths.count()); index += 1) {
    const path = contactPaths.nth(index);
    const labelId = await path.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const heading = page.locator(`#${labelId}`);
    await expect(heading).toHaveJSProperty('tagName', 'H3');
    const pathName = ((await heading.textContent()) ?? '').trim();
    expect(pathName).not.toBe('');
    await expect(path).toHaveAccessibleName(pathName);
  }

  const form = page.locator('[data-contact-form] form.enquiry-form');
  await expect(form).toBeVisible();
  const formHeading = form.locator('#enquiry-form-title');
  await expect(formHeading).toHaveJSProperty('tagName', 'H2');
  const formName = ((await formHeading.textContent()) ?? '').trim();
  expect(formName).not.toBe('');
  await expect(
    page.getByRole('form', { name: formName, exact: true }),
  ).toBeVisible();
  await expect(form.locator('input[name="name"]')).toHaveAttribute(
    'required',
    '',
  );

  const email = form.locator('input[name="email"]');
  const phone = form.locator('input[name="phone"]');
  const preferredContact = form.locator('select[name="preferredContact"]');
  await expect(preferredContact).toHaveAttribute('required', '');
  await expect(email).toHaveCount(0);
  await expect(phone).toHaveAttribute('required', '');

  await preferredContact.selectOption('EMAIL');
  await expect(email).toHaveAttribute('required', '');
  await expect(phone).toHaveCount(0);

  await preferredContact.selectOption('WHATSAPP');
  await expect(email).toHaveCount(0);
  await expect(phone).toHaveAttribute('required', '');

  const interest = form.locator('select[name="school"]');
  await expect(interest).toHaveAttribute('required', '');
  for (const [input, select] of [
    [form.locator('input[name="name"]'), preferredContact],
    [phone, interest],
  ] as const) {
    const inputBox = await input.boundingBox();
    const selectBox = await select.boundingBox();
    expect(inputBox).not.toBeNull();
    expect(selectBox).not.toBeNull();
    expect(Math.abs(inputBox!.y - selectBox!.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(inputBox!.height - selectBox!.height)).toBeLessThanOrEqual(
      1,
    );
  }
  await expect(form.locator('textarea[name="message"]')).not.toHaveAttribute(
    'required',
    '',
  );
  await expect(form.locator('input[name="consent"]')).toHaveAttribute(
    'required',
    '',
  );
});

test('Contact exploration keeps clinical consultation routing distinct in every locale', async ({
  page,
}) => {
  for (const locale of ['en', 'fr', 'ar'] as const) {
    await page.goto(`/${locale}/contact`);
    await expect(
      page.locator('[data-contact-path="psychology"]'),
    ).toHaveAttribute('href', `/${locale}/consultations`);
    await expect(
      page.locator('[data-contact-path="languages"]'),
    ).toHaveAttribute('href', `/${locale}/schools/languages`);
    await expect(
      page.locator('[data-contact-path="training"]'),
    ).toHaveAttribute('href', `/${locale}/schools/training`);
  }
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
