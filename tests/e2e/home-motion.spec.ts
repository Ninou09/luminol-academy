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
