import { describe, expect, it } from 'vitest';

import { getAttendanceCertificateCopy } from '@luminol/localization';
import {
  getProgrammeSpotlightPresentation,
  selectSpotlightProgramme,
} from './programme-spotlight';
import type { PublicCmsProgramme } from './sanity';

const programme: PublicCmsProgramme = {
  _id: 'test-programme',
  title: 'Published programme',
  summary: 'A governed description used only in automated tests.',
  slug: { current: 'test-programme' },
  school: 'psychology',
  languages: ['ar', 'fr'],
  delivery: 'Online',
  featured: true,
  image: null,
};

describe('homepage programme spotlight presentation', () => {
  it.each(['ar', 'fr', 'en'] as const)(
    'keeps %s detail and enquiry destinations localized',
    (locale) => {
      const view = getProgrammeSpotlightPresentation(locale, programme);
      expect(view.programmeHref).toBe(`/${locale}/programmes/test-programme`);
      expect(view.contactHref).toBe(
        `/${locale}/contact?programme=test-programme`,
      );
      expect(view.isWaitlist).toBe(false);
      expect(view.asset).toBeNull();
    },
  );
  it('shows only published languages and delivery', () => {
    const view = getProgrammeSpotlightPresentation('ar', programme);
    expect(view.details).toEqual(['العربية', 'الفرنسية', 'عن بُعد']);
    expect(view.enquiryAction).toBe('استفسر عن هذا البرنامج');
  });
  it('does not fabricate missing programme details', () => {
    expect(
      getProgrammeSpotlightPresentation('en', {
        ...programme,
        languages: [],
        delivery: null,
      }).details,
    ).toEqual([]);
  });
  it.each(['ar', 'fr', 'en'] as const)(
    'suppresses stale waitlist logistics and images in %s',
    (locale) => {
      const view = getProgrammeSpotlightPresentation(locale, {
        ...programme,
        slug: { current: 'acceptance-commitment-therapy-act' },
        image: {
          url: 'https://cdn.sanity.io/images/test/production/old-cohort.jpg',
          alt: 'Old cohort image',
          dimensions: { width: 1200, height: 675 },
        },
      });
      expect(view.isWaitlist).toBe(true);
      expect(view.asset).toBeNull();
      expect(view.details).toEqual([]);
      expect(view.contactHref).toContain(
        'programme=acceptance-commitment-therapy-act',
      );
      expect(view.status).toBeTruthy();
      expect(view.enquiryAction).toBeTruthy();
    },
  );
  it('keeps the approved image source, alternative text and editorial crop', () => {
    const view = getProgrammeSpotlightPresentation('en', {
      ...programme,
      image: {
        url: 'https://cdn.sanity.io/images/test/production/reviewed-course.jpg',
        alt: 'Reviewed editorial course image',
        dimensions: { width: 1600, height: 900 },
        crop: { top: 0, bottom: 0, left: 0.1, right: 0.1 },
      },
    });
    expect(view.asset).toMatchObject({
      source: 'sanity',
      alt: 'Reviewed editorial course image',
    });
    const url = new URL(view.asset!.src);
    expect(url.hostname).toBe('cdn.sanity.io');
    expect(url.searchParams.get('rect')?.split(',')[0]).toBe('160');
    expect(url.searchParams.get('w')).toBe('1200');
  });
  it.each([null, []])(
    'does not invent a course for empty or unavailable CMS content',
    (entries) => {
      expect(selectSpotlightProgramme(entries)).toBeNull();
    },
  );
  it('preserves the existing psychology-first selection and does not mutate source order', () => {
    const language: PublicCmsProgramme = {
      ...programme,
      _id: 'language',
      school: 'languages',
    };
    const entries = [language, programme];
    expect(selectSpotlightProgramme(entries)).toBe(programme);
    expect(entries[0]).toBe(language);
    expect(selectSpotlightProgramme([language])).toBe(language);
  });
  it('uses attendance-only certificate copy in all supported languages', () => {
    expect(getAttendanceCertificateCopy('ar').title).toBe('شهادة حضور');
    expect(getAttendanceCertificateCopy('fr').title).toBe(
      'Attestation de présence',
    );
    expect(getAttendanceCertificateCopy('en').title).toBe(
      'Attendance certificate',
    );
  });
});
