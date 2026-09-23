import { expect, test, type Page } from '@playwright/test';

async function expectSpiritPhotosToRender(page: Page) {
  const photos = page.locator('#spirit img');
  await expect(photos).not.toHaveCount(0);

  for (const photo of await photos.all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toBeVisible();
    await expect
      .poll(() =>
        photo.evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    await photo.evaluate((image: HTMLImageElement) => image.decode());

    // A downloaded image can still be invisible when its fill container collapses.
    const bounds = await photo.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.width).toBeGreaterThan(80);
    expect(bounds!.height).toBeGreaterThan(80);
  }
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  for (const width of [390, 1440]) {
    test(`spirit photos retain visible dimensions at ${width}px with ${reducedMotion} motion`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion });
      await page.goto('/en');
      await expectSpiritPhotosToRender(page);
    });
  }
}

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} school rail stays clickable beneath the moving hero`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`/${locale}`);
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
    const rail = page.locator('main > nav').first();

    await rail.evaluate((element) => {
      const header = document.querySelector('header');
      const headerHeight = header?.getBoundingClientRect().height ?? 128;
      window.scrollTo({
        top:
          window.scrollY +
          element.getBoundingClientRect().top -
          headerHeight -
          24,
        behavior: 'instant',
      });
    });
    // Allow the native scroll handler to paint its parallax frame before hit testing.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );

    await expect
      .poll(() =>
        rail.evaluate((element) =>
          Array.from(element.querySelectorAll('a')).flatMap((link) => {
            const bounds = link.getBoundingClientRect();
            return [0.25, 0.75].flatMap((position) => {
              const hit = document.elementFromPoint(
                bounds.left + bounds.width / 2,
                bounds.top + bounds.height * position,
              );
              return hit && link.contains(hit) ? [] : [link.textContent];
            });
          }),
        ),
      )
      .toEqual([]);
  });
}

test('Arabic spirit photos render without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 390, height: 1000 },
  });
  try {
    const page = await context.newPage();
    await page.goto('/ar');
    await expectSpiritPhotosToRender(page);
  } finally {
    await context.close();
  }
});

test('premium home shell exposes core navigation and brand surfaces', async ({
  page,
}) => {
  await page.goto('/en');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: /primary navigation/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Your next chapter',
  );
  await expect(page.locator('[data-reveal]')).not.toHaveCount(0);
  await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('motion controller honors reduced motion without hiding content', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('html')).toHaveAttribute(
    'data-motion-ready',
    'true',
  );
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await expect(page.locator('[data-reveal]').first()).toHaveAttribute(
    'data-reveal-state',
    'visible',
  );
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#top img').first()).toBeVisible();
  await expect(page.locator('#top video')).toHaveCount(0);
});

test('homepage film plays when visible and offers a working pause control', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');

  const hero = page.locator('#top');
  const video = hero.locator('video');
  await expect(video).toHaveAttribute('src', /academy-community-film\.mp4$/);
  await expect(hero.locator('[data-media-source]')).toHaveAttribute(
    'data-media-license',
    'Pexels License',
  );
  await expect(video).toHaveJSProperty('paused', false);

  await hero.getByRole('button', { name: 'Pause background film' }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await hero.getByRole('button', { name: 'Play background film' }).click();
  await expect(video).toHaveJSProperty('paused', false);
});

test('full motion progressively reveals the homepage', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');

  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.locator('html')).toHaveAttribute(
    'data-motion-ready',
    'true',
  );
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'smooth');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const reveal = page.locator('[data-reveal]').first();
  await reveal.scrollIntoViewIfNeeded();
  await expect(reveal).toHaveAttribute('data-reveal-state', 'visible');
  await expect(reveal).toBeVisible();
});

test('mobile in-page navigation clears the sticky header', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');

  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: /our schools/i })
    .click();

  await expect(page).toHaveURL(/#schools$/);
  await expect
    .poll(() =>
      page.locator('#schools').evaluate((target) => {
        const header = document.querySelector('header');
        if (!header) return Number.NEGATIVE_INFINITY;
        return (
          target.getBoundingClientRect().top -
          header.getBoundingClientRect().bottom
        );
      }),
    )
    .toBeGreaterThanOrEqual(-1);
});

test('motion targets are discovered after client navigation to home', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en/about');
  await page
    .getByRole('link', { name: /luminol home/i })
    .first()
    .click();

  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  const reveal = page.locator('[data-reveal]').first();
  await reveal.scrollIntoViewIfNeeded();
  await expect(reveal).toHaveAttribute('data-reveal-state', 'visible');
  await expect(reveal).toBeVisible();
});

test('school photos respond to hover and respect reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');

  const card = page.locator('[data-school-card]').first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();

  await expect
    .poll(() =>
      card.locator('img').evaluate((element) => {
        const transform = getComputedStyle(element).transform;
        if (transform === 'none') return 1;
        return new DOMMatrixReadOnly(transform).m11;
      }),
    )
    .toBeGreaterThan(1.01);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card.locator('img')).toHaveCSS('transform', 'none');
});

test('desktop learning film waits for meaningful visibility and preserves an explicit pause', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  const film = page.locator('[data-learning-film]');
  const video = film.locator('video');
  await expect(video).not.toHaveAttribute('src');

  // A thin slice at the viewport edge should not start downloading or playing.
  await film.evaluate((element) =>
    window.scrollTo({
      top:
        window.scrollY +
        element.getBoundingClientRect().top -
        window.innerHeight +
        20,
      behavior: 'instant',
    }),
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(video).not.toHaveAttribute('src');
  await expect(video).toHaveJSProperty('paused', true);

  await film.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute('src', /notebook\.mp4$/);
  await expect(video).toHaveJSProperty('paused', false);
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(0);
  await expect(
    film.getByRole('button', { name: 'Pause learning moment' }),
  ).toHaveAttribute('aria-pressed', 'true');

  // Later sticky chapters can cover the film without changing its intersection ratio.
  await page
    .locator('#approach article')
    .last()
    .evaluate((element) =>
      window.scrollTo({
        top: window.scrollY + element.getBoundingClientRect().top - 128,
        behavior: 'instant',
      }),
    );
  await expect(video).toHaveJSProperty('paused', true);
  await page.locator('#top').scrollIntoViewIfNeeded();
  await film.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('paused', false);

  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('paused', true);
  await page.locator('#top').scrollIntoViewIfNeeded();
  await film.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('paused', false);

  await film.getByRole('button', { name: 'Pause learning moment' }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await expect(
    film.getByRole('button', { name: 'Play learning moment' }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.locator('#top').scrollIntoViewIfNeeded();
  await film.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('paused', true);
  const pausedAt = await video.evaluate(
    (element: HTMLVideoElement) => element.currentTime,
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(
    await video.evaluate((element: HTMLVideoElement) => element.currentTime),
  ).toBe(pausedAt);
});

for (const mode of ['mobile', 'reduced-motion', 'data-saving'] as const) {
  test(`${mode} learning film keeps a static poster until explicitly played`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: mode === 'mobile' ? 390 : 1440,
      height: 1000,
    });
    await page.emulateMedia({
      reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
    });
    if (mode === 'data-saving') {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'connection', {
          configurable: true,
          value: { saveData: true },
        });
      });
    }
    const filmRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/media/stock/notebook.mp4'))
        filmRequests.push(request.url());
    });
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute(
      'data-motion',
      mode === 'reduced-motion' ? 'reduced' : 'full',
    );
    if (mode === 'data-saving') {
      await expect(page.locator('#top img')).toBeVisible();
      await expect(page.locator('#top video')).toHaveCount(0);
    }
    const film = page.locator('[data-learning-film]');
    const video = film.locator('video');
    await film.scrollIntoViewIfNeeded();
    const poster = film.locator('img');
    await expect(poster).toBeVisible();
    await poster.evaluate((image: HTMLImageElement) => image.decode());
    await expect(video).not.toHaveAttribute('src');
    await expect(video).toHaveJSProperty('paused', true);
    await expect(video).toHaveJSProperty('currentTime', 0);
    expect(filmRequests).toEqual([]);

    await film.getByRole('button', { name: 'Play learning moment' }).click();
    await expect(video).toHaveAttribute('src', /notebook\.mp4$/);
    await expect(video).toHaveJSProperty('paused', false);
    await expect(
      film.getByRole('button', { name: 'Pause learning moment' }),
    ).toBeVisible();
    await film.getByRole('button', { name: 'Pause learning moment' }).click();
    await expect(video).toHaveJSProperty('paused', true);
  });
}

test('switching to reduced motion stops a playing learning film', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  const film = page.locator('[data-learning-film]');
  const video = film.locator('video');
  await film.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('paused', false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).toHaveJSProperty('paused', true);
  await expect(film.locator('img')).toBeVisible();
});

test('homepage enquiry submits through the existing API and clears the form on success', async ({
  page,
}) => {
  const submissions: Record<string, unknown>[] = [];
  await page.route('**/api/enquiries', async (route) => {
    submissions.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({ status: 201, json: { submitted: true } });
  });
  await page.goto('/en');
  const form = page.locator('#contact .enquiry-form');
  await form.locator('[name="name"]').fill('Homepage enquiry browser test');
  await form.locator('[name="phone"]').fill('0555 12 34 56');
  await form.locator('[name="school"]').selectOption('LANGUAGES');
  await form.locator('[name="consent"]').check();
  await form.locator('[type="submit"]').click();
  await expect(form.locator('.form-status-success')).toBeVisible();
  expect(submissions).toHaveLength(1);
  expect(submissions[0]).toMatchObject({
    name: 'Homepage enquiry browser test',
    phone: '0555 12 34 56',
    school: 'LANGUAGES',
    locale: 'en',
    consent: true,
  });
  await expect(form.locator('[name="name"]')).toHaveValue('');
  await expect(form.locator('[name="consent"]')).not.toBeChecked();
});
