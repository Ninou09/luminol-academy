import { expect, test } from '@playwright/test';

test('premium home shell exposes core navigation and brand surfaces', async ({
  page,
}) => {
  await page.goto('/en');

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: /primary navigation/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Psychological consultations and training in Blida',
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
  // Reduced motion keeps the static artwork and never starts the WebGL field.
  await expect(
    page.locator('#top [data-media-source="luminol-commissioned-3d"]'),
  ).not.toHaveAttribute('data-field', 'live');
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

  await page.locator('#top a[href="#schools"]').click();
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
  // The logo link is named by its visible wordmark, "Luminol Academy".
  await page
    .getByRole('banner')
    .getByRole('link', { name: /^luminol\s+academy$/i })
    .first()
    .click();

  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  const reveal = page.locator('[data-reveal]').first();
  await reveal.scrollIntoViewIfNeeded();
  await expect(reveal).toHaveAttribute('data-reveal-state', 'visible');
  await expect(reveal).toBeVisible();
});

test('constellation schools are native links with a visible keyboard focus', async ({
  page,
}) => {
  await page.goto('/en');
  const links = page.locator('[aria-labelledby="constellation-title"] a');
  await expect(links).toHaveCount(3);
  await links.first().focus();
  await page.keyboard.press('Tab');
  await expect(links.nth(1)).toBeFocused();
  await expect(links.nth(1)).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/en\/schools\/languages$/);
});

test('manual calm mode persists before any WebGL scene starts on reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ar');
  await page.locator('button[aria-controls="dock-tools"]').click();
  const calm = page.locator('#dock-tools button[aria-pressed]');
  await calm.click();
  await expect(calm).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.locator('[data-scene="live"], [data-field="live"], video'),
  ).toHaveCount(0);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = new Proxy(original, {
      apply(fn, target, args) {
        if (String(args[0]).includes('webgl'))
          document.documentElement.dataset.triedWebgl = 'true';
        return Reflect.apply(fn, target, args);
      },
    });
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  for (const id of [
    'constellation-title',
    'mind-title',
    'home-about-title',
    'pathway-title',
  ]) {
    await page
      .locator(`section[aria-labelledby="${id}"]`)
      .first()
      .scrollIntoViewIfNeeded();
  }
  await expect(page.locator('html')).not.toHaveAttribute('data-tried-webgl');
  await expect(page.locator('video')).toHaveCount(0);
});

test('data saver keeps school links and posters available', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      value: Object.assign(new EventTarget(), { saveData: true }),
    });
  });
  await page.goto('/fr');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(
    page.locator('video, [data-field="live"], [data-scene="live"]'),
  ).toHaveCount(0);
  await expect(page.locator('#about img').first()).toBeVisible();
  await page
    .locator('[aria-labelledby="constellation-title"] a')
    .last()
    .click();
  await expect(page).toHaveURL(/\/fr\/schools\/training$/);
});

test('without WebGL the mobile poster and school links still work by touch', async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    baseURL: 'http://localhost:3000',
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    await ctx.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = new Proxy(
        HTMLCanvasElement.prototype.getContext,
        {
          apply(fn, target, args) {
            return String(args[0]).includes('webgl')
              ? null
              : Reflect.apply(fn, target, args);
          },
        },
      );
    });
    const page = await ctx.newPage();
    const videos: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('.mp4')) videos.push(r.url());
    });
    await page.goto('/en');
    await expect(page.locator('#top img')).toBeVisible();
    for (const area of ['#about', 'section[aria-labelledby="pathway-title"]']) {
      await page.locator(area).scrollIntoViewIfNeeded();
      await expect(page.locator(area).locator('img').first()).toBeVisible();
    }
    expect(videos).toEqual([]);
    await page
      .locator('[aria-labelledby="constellation-title"] a')
      .nth(1)
      .tap();
    await expect(page).toHaveURL(/\/en\/schools\/languages$/);
  } finally {
    await ctx.close();
  }
});
