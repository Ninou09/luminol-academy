import { expect, test } from '@playwright/test';

test('homepage sections and school articles have accessible names', async ({
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
