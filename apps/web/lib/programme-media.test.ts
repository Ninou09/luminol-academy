import { describe, expect, it } from 'vitest';

import {
  resolveProgrammeMedia,
  type ProgrammeMediaInput,
} from './programme-media';
import { getSchools } from './schools';

const programme: ProgrammeMediaInput = {
  school: 'psychology',
  slug: { current: 'acceptance-commitment-therapy-act' },
  image: null,
};

describe('governed programme imagery', () => {
  it.each(['en', 'fr', 'ar'] as const)(
    'gives the ACT waitlist an evergreen image with localized alt in %s',
    (locale) => {
      const media = resolveProgrammeMedia(
        {
          ...programme,
          image: {
            url: 'https://cdn.sanity.io/images/test/production/expired-cohort-poster.png',
            alt: 'Previous cohort poster',
            dimensions: { width: 1200, height: 675 },
          },
        },
        locale,
      );
      expect(media).toMatchObject({ kind: 'stock', asset: 'reflection' });
      expect(media.src).toBe('/media/stock/reflection.webp');
      expect(media.alt.trim().length).toBeGreaterThan(10);
      expect(media.sourceUrl).toMatch(/^https:\/\//);
      expect(media.crop).toContain('focal point');
      expect(media.src).not.toContain('expired');
    },
  );

  it('preserves approved CMS alt, crop, source and priority over topic fallbacks', () => {
    const image = {
      url: 'https://cdn.sanity.io/images/test/production/reviewed-1600x900.jpg',
      alt: 'Reviewed course photograph',
      dimensions: { width: 1600, height: 900 },
      crop: { top: 0, bottom: 0, left: 0.1, right: 0.1 },
      hotspot: { x: 0.65, y: 0.5, width: 0.25, height: 0.5 },
    };
    const media = resolveProgrammeMedia(
      {
        ...programme,
        slug: { current: 'french-b2' },
        image,
      },
      'fr',
    );
    expect(media).toMatchObject({
      kind: 'sanity',
      source: 'sanity',
      sourceUrl: image.url,
      alt: image.alt,
      publicationApproved: true,
    });
    expect(JSON.parse(media.crop)).toEqual({
      crop: image.crop,
      hotspot: image.hotspot,
    });
    expect(new URL(media.src).searchParams.get('rect')?.split(',')[0]).toBe(
      '160',
    );
  });

  it.each([
    ['english-ielts', 'english'],
    ['french-b2', 'french'],
    ['productivity-and-digital-skills', 'online'],
    ['public-speaking', 'speaking'],
  ])('matches the programme topic for %s', (slug, asset) => {
    expect(
      resolveProgrammeMedia({ ...programme, slug: { current: slug } }, 'en'),
    ).toMatchObject({ kind: 'stock', asset });
  });

  it('keeps every school offering distinct and stable across all locales', () => {
    for (const school of ['psychology', 'languages', 'training'] as const) {
      const english = getSchools('en')[school].programs;
      const expectedTopics = english.map((entry) => entry.mediaTopic);
      for (const locale of ['en', 'fr', 'ar'] as const) {
        const offerings = getSchools(locale)[school].programs;
        expect(offerings.map((entry) => entry.mediaTopic)).toEqual(
          expectedTopics,
        );
        const media = offerings.map((entry) =>
          resolveProgrammeMedia(
            {
              school,
              slug: null,
              image: null,
              mediaTopic: entry.mediaTopic,
            },
            locale,
          ),
        );
        expect(new Set(media.map((entry) => entry.src)).size).toBe(
          offerings.length,
        );
        expect(
          media.every(
            (entry) => entry.alt.length > 10 && entry.sourceUrl && entry.crop,
          ),
        ).toBe(true);
      }
    }
  });

  it('provides a relevant school image for newly published programmes without media', () => {
    const media = ['psychology', 'languages', 'training'].map((school) =>
      resolveProgrammeMedia(
        {
          school: school as ProgrammeMediaInput['school'],
          slug: { current: 'new-programme' },
          image: null,
        },
        'en',
      ),
    );
    expect(new Set(media.map((entry) => entry.src)).size).toBe(3);
    expect(media.every((entry) => entry.src.endsWith('.webp'))).toBe(true);
  });
});
