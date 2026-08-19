import { expect, test } from '@playwright/test';

test('public language switcher exposes native language names and linked resource languages', async ({
  page,
}) => {
  await page.goto('/en/about');

  const switcher = page.getByRole('navigation', {
    name: 'Interface language',
  });
  await expect(switcher).toBeVisible();

  for (const language of [
    {
      code: 'ar',
      name: 'العربية',
      href: '/ar/about',
      current: false,
    },
    {
      code: 'fr',
      name: 'Français',
      href: '/fr/about',
      current: false,
    },
    {
      code: 'en',
      name: 'English',
      href: '/en/about',
      current: true,
    },
  ] as const) {
    const link = switcher.getByRole('link', {
      name: language.name,
      exact: true,
    });

    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', language.href);
    await expect(link).toHaveAttribute('lang', language.code);
    await expect(link).toHaveAttribute('hreflang', language.code);

    if (language.current) {
      await expect(link).toHaveAttribute('aria-current', 'page');
    } else {
      await expect(link).not.toHaveAttribute('aria-current');
    }
  }
});
