import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('Site shell accessibility contract', () => {
  it('gives the footer navigation landmarks distinct localized names', async () => {
    const source = await readFile(
      new URL('./site-shell.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('const legalNavigationLabel = {');
    expect(source).toContain('aria-label={legalNavigationLabel[locale]}');
  });
});
