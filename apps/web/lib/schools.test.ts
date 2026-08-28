import { describe, expect, it } from 'vitest';

import { getSchool, getSchools, isSchoolSlug, schools } from './schools';

describe('Luminol school content', () => {
  it('keeps the three public school routes stable', () => {
    expect(Object.keys(schools)).toEqual([
      'psychology',
      'languages',
      'training',
    ]);
  });

  it('validates only supported school slugs', () => {
    expect(isSchoolSlug('psychology')).toBe(true);
    expect(isSchoolSlug('languages')).toBe(true);
    expect(isSchoolSlug('training')).toBe(true);
    expect(isSchoolSlug('unknown')).toBe(false);
  });

  it('provides complete localized program and journey content for every school', () => {
    for (const locale of ['ar', 'fr', 'en'] as const) {
      for (const school of Object.values(getSchools(locale))) {
        expect(school.programs).toHaveLength(4);
        expect(school.approach).toHaveLength(3);
        expect(school.audiences.length).toBeGreaterThanOrEqual(4);
        expect(school.note.length).toBeGreaterThan(40);
      }
    }
  });

  it('localizes the public school identity without changing route slugs', () => {
    expect(getSchools('ar').psychology.name).toBe('علم النفس');
    expect(getSchools('fr').training.name).toBe('Formation professionnelle');
    expect(getSchools('en').languages.slug).toBe('languages');
  });

  it.each([
    ['en', 'Therapy & consultations'],
    ['fr', 'Thérapie & consultations'],
    ['ar', 'العلاج النفسي والاستشارات'],
  ] as const)(
    'makes therapy and consultations visible for %s',
    (locale, title) => {
      const psychology = getSchool(locale, 'psychology');

      expect(psychology.programs[0]?.title).toBe(title);
      expect(psychology.introduction).toContain(
        locale === 'ar' ? 'الاستشارات' : 'consult',
      );
    },
  );

  it.each(['en', 'fr', 'ar'] as const)(
    'distinguishes clinical and educational pathways in the safety note for %s',
    (locale) => {
      const note = getSchool(locale, 'psychology').note;

      expect(note).toMatch(
        locale === 'ar' ? /العلاج النفسي|الاستشارات/ : /thérapie|therapy/i,
      );
      expect(note).toMatch(
        locale === 'ar'
          ? /البرامج التعليمية/
          : /programmes? éducatifs|educational programmes/i,
      );
    },
  );
});
