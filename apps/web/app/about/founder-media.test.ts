import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('About founder media governance', () => {
  it('keeps the founder portrait out of the rendered About page', async () => {
    const source = await readFile(
      new URL('./page.tsx', import.meta.url),
      'utf8',
    );

    expect(source).not.toContain('/media/founder-kheddaoui-fettouma.webp');
    expect(source).not.toContain('data-founder-media');
    expect(source).toContain('<AcademyImage');
    expect(source).toContain('school="psychology"');
  });
});
