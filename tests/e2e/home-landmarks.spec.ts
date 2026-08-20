import { expect, test } from '@playwright/test';

test('homepage sections, pathway navigation and school articles have accessible names', async ({
  page,
}) => {
  await page.goto('/en');

  await expect(page.locator('#schools')).toHaveAttribute(
    'aria-labelledby',
    'home-schools-title',
  );
  await expect(page.locator('#approach')).toHaveAttribute(
    'aria-labelledby',
    'home-approach-title',
  );
  await expect(page.locator('#about')).toHaveAttribute(
    'aria-labelledby',
    'home-about-title',
  );
  await expect(page.locator('#contact')).toHaveAttribute(
    'aria-labelledby',
    'home-contact-title',
  );

  const pathwayHeading = page.locator('#pathway-title');
  const pathwayName = ((await pathwayHeading.textContent()) ?? '').trim();
  expect(pathwayName).not.toBe('');
  const pathwayNavigation = page.getByRole('navigation', {
    name: pathwayName,
    exact: true,
  });
  await expect(pathwayNavigation).toBeVisible();

  const pathwayLinks = pathwayNavigation.getByRole('link');
  await expect(pathwayLinks).toHaveCount(3);

  for (let index = 0; index < (await pathwayLinks.count()); index += 1) {
    const link = pathwayLinks.nth(index);
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/en\/schools\/(psychology|languages|training)$/);

    const accessibleName = (
      (await link.getAttribute('aria-label')) ?? ''
    ).trim();
    if (accessibleName) {
      await expect(link).toHaveAccessibleName(accessibleName);
      continue;
    }

    const visibleName = (await link.innerText())
      .replace('↗', '')
      .replace(/\s+/g, ' ')
      .trim();
    expect(visibleName).not.toBe('');
    await expect(link).toHaveAccessibleName(visibleName);
  }

  const schoolCards = page.locator('[data-school-card]');
  await expect(schoolCards).toHaveCount(3);

  for (let index = 0; index < (await schoolCards.count()); index += 1) {
    const card = schoolCards.nth(index);
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
});
