import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('certificate verification accessibility contract', () => {
  it('names the verification intro and privacy landmarks from existing copy', async () => {
    const source = await readFile(
      new URL('./page.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain(
      'aria-labelledby="certificate-verification-title"',
    );
    expect(source).toContain('<h1 id="certificate-verification-title">');
    expect(source).toContain('aria-labelledby="certificate-privacy-title"');
    expect(source).toContain(
      '<strong id="certificate-privacy-title">{copy.privacyTitle}</strong>',
    );
  });
});
