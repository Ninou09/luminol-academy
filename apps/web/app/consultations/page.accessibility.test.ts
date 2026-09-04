import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('psychology consultation page accessibility contract', () => {
  it('exposes a main landmark, labelled routing section and labelled enquiry section', async () => {
    const source = await readFile(
      new URL('./page.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('id="main-content"');
    expect(source).toContain('aria-labelledby="consultation-title"');
    expect(source).toContain('aria-labelledby="routing-title"');
    expect(source).toContain('aria-labelledby="consultation-enquiry-title"');
    expect(source).toContain('initialSchool="PSYCHOLOGY"');
  });

  it('keeps the conversion flow localized, qualified and safety-aware', async () => {
    const source = await readFile(
      new URL('./page.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain("buildLanguageAlternates('/consultations')");
    expect(source).toContain("localizeHref(locale, '/schools/psychology')");
    expect(source).toContain('id="consultation-enquiry"');
    expect(source).toContain('initialMessage={copy.initialMessage as string}');
    expect(source).toContain('className={styles.safetyNote}');
  });
});
