import { expect, test } from '@playwright/test';

const schoolSlugs = ['psychology', 'languages', 'training'] as const;

test('school pages name related-school links from their headings', async ({
  page,
}) => {
  for (const schoolSlug of schoolSlugs) {
    await page.goto(`/en/schools/${schoolSlug}`);

    const relatedLinks = page.locator('[data-related-school]');
    await expect(relatedLinks).toHaveCount(2);

    for (let index = 0; index < (await relatedLinks.count()); index += 1) {
      const link = relatedLinks.nth(index);
      const relatedSlug = await link.getAttribute('data-related-school');
      const labelId = await link.getAttribute('aria-labelledby');

      expect(relatedSlug).toMatch(/^(psychology|languages|training)$/);
      expect(relatedSlug).not.toBe(schoolSlug);
      expect(labelId).toBe(`related-school-${relatedSlug}-title`);

      const heading = page.locator(`#${labelId}`);
      await expect(heading).toHaveJSProperty('tagName', 'H3');
      const relatedName = ((await heading.textContent()) ?? '').trim();
      expect(relatedName).not.toBe('');

      await expect(link).toHaveAccessibleName(relatedName);
      await expect(link).toHaveAttribute(
        'href',
        `/en/schools/${relatedSlug}`,
      );
    }
  }
});
