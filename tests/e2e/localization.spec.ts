import { expect, test } from '@playwright/test';

for (const locale of ['fr', 'ar'] as const) {
  test(`${locale} mobile menu supports keyboard access and preserves locale URL state`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto(
      `/${locale}/programmes?q=english&school=languages#catalogue`,
    );
    const toggle = page.getByRole('button', {
      name: locale === 'ar' ? 'القائمة' : 'Menu',
      exact: true,
    });
    await toggle.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    const nav = dialog.getByRole('navigation');
    await expect(nav).toHaveCSS('direction', locale === 'ar' ? 'rtl' : 'ltr');
    await expect(nav.getByRole('link')).toHaveCount(5);
    for (const link of await nav.getByRole('link').all()) {
      await link.focus();
      await expect(link).toBeFocused();
    }
    await expect(nav.locator(`a[href="/${locale}/contact"]`)).toBeVisible();
    await expect(
      nav.locator(`a[href="/${locale}/consultations"]`),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    const targetLocale = locale === 'ar' ? 'fr' : 'ar';
    await expect(
      page.locator(`.locale-switcher a[lang="${targetLocale}"]`),
    ).toHaveAttribute(
      'href',
      `/${targetLocale}/programmes?q=english&school=languages#catalogue`,
    );
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
  });
}

test('localized home metadata does not duplicate the academy brand', async ({
  page,
}) => {
  await page.goto('/ar');
  await expect(page).toHaveTitle('Luminol Academy');
});

test('Arabic public typography does not apply Latin tracking to joined text', async ({
  page,
}) => {
  await page.goto('/ar');
  await expect(page.locator('[data-school-card] h3').first()).toHaveCSS(
    'letter-spacing',
    'normal',
  );

  await page.goto('/ar/programmes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'letter-spacing',
    'normal',
  );
});
