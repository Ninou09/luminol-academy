import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('programme catalogue accessibility contract', () => {
  it('names populated results and each programme article from existing headings', async () => {
    const source = await readFile(new URL('./page.tsx', import.meta.url), 'utf8');

    expect(source).toContain(
      '<section aria-labelledby="programme-results-title">',
    );
    expect(source).toContain('<h2 id="programme-results-title">');
    expect(source).toContain('aria-labelledby={titleId}');
    expect(source).toContain('data-programme-card');
    expect(source).toContain('<h3 id={titleId} dir="auto">');
  });
});
