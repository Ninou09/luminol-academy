import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('About founder media governance', () => {
  it('uses the owner-supplied portrait in the founder feature', async () => {
    const source = await readFile(
      new URL('./page.tsx', import.meta.url),
      'utf8',
    );

    expect(source).not.toContain('/media/founder-kheddaoui-fettouma.webp');
    expect(source).not.toContain('data-founder-media');
    expect(source).toContain('src={founderPhotos.window.src}');
    expect(source).toContain('data-media-source={founderPhotoCredit.source}');
    const profile = await readFile(
      new URL('./founder/page.tsx', import.meta.url),
      'utf8',
    );
    expect(profile).toContain('src={founderEditorialPortrait.src}');
    expect(source).toContain('<EditorialFilm');
    expect(source).toContain('film={editorialFilms.about}');
  });
});
