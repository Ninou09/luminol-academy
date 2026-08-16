import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('About founder media governance', () => {
  it('renders only the approved founder portrait with localized accessible naming', async () => {
    const source = await readFile(
      new URL('./page.tsx', import.meta.url),
      'utf8',
    );

    expect(source).toContain('/media/founder-kheddaoui-fettouma.webp');
    expect(source).toContain('data-media-source="user-approved-upload"');
    expect(source).toContain('data-media-approval="2026-08-13"');
    expect(source).toContain('data-media-crop="portrait-center-face"');
    expect(source).toContain("name: 'خداوي فطومة'");
    expect(source).toContain('aria-label={founderMedia.alt}');
  });
});
