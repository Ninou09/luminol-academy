import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('public workshop privacy contract', () => {
  it('keeps private operations and joining details out of the participant page', async () => {
    const source = await readFile(
      new URL('./workshop-experience.tsx', import.meta.url),
      'utf8',
    );

    expect(source).not.toMatch(/volgograd|t\.me\/|telegram/i);
    expect(source).not.toMatch(/payment|admin dashboard|participant records/i);
    expect(source).not.toMatch(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
    expect(source).not.toMatch(/(?:\+?213|0)[567]\d{8}/);
    expect(source).toContain('20:00 بتوقيت الجزائر');
    expect(source).toContain('data-registration-link');
    expect(source).toContain(
      '/workshops/family-after-trauma/family-support.webp',
    );
    expect(source).toContain(
      '/workshops/family-after-trauma/fettouma-professional.webp',
    );
  });
});
