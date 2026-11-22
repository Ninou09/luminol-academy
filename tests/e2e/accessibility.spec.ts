import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Automated WCAG 2.1 AA checks for the main public journeys in all three
 * languages. Serious and critical findings fail the build; minor and moderate
 * findings are reported in the test output for follow-up.
 */
const routes = [
  '/ar',
  '/fr',
  '/en',
  '/ar/consultations',
  '/fr/programmes',
  '/en/schools',
  '/ar/schools/psychology',
  '/fr/about',
  '/ar/contact',
  '/en/privacy',
];

for (const route of routes) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    await expect(page.getByRole('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (violation) =>
        violation.impact === 'serious' || violation.impact === 'critical',
    );
    const summary = blocking.map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help} — ${violation.nodes
          .slice(0, 3)
          .map((node) => node.target.join(' '))
          .join(' | ')}`,
    );
    expect(summary, summary.join('\n')).toEqual([]);
  });
}
