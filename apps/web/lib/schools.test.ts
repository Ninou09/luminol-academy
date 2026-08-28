import { describe, expect, it } from 'vitest';
import { getSchools, isSchoolSlug, schools } from './schools';

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

  it('keeps therapy and consultations explicit and distinct in every locale', () => {
    const expected = {
      en: {
        title: 'Therapy & consultations',
        therapy: 'therapy',
        consultation: 'consultation',
      },
      fr: {
        title: 'Thérapie et consultations',
        therapy: 'thérapie',
        consultation: 'consultation',
      },
      ar: {
        title: 'العلاج النفسي والاستشارات',
        therapy: 'العلاج النفسي',
        consultation: 'الاستشار',
      },
    } as const;

    for (const locale of ['ar', 'fr', 'en'] as const) {
      const psychology = getSchools(locale).psychology;
      const copy = expected[locale];
      const introduction = psychology.introduction.toLocaleLowerCase(locale);
      const note = psychology.note.toLocaleLowerCase(locale);

      expect(psychology.programs[0]?.title).toBe(copy.title);
      expect(introduction).toContain(copy.therapy);
      expect(introduction).toContain(copy.consultation);
      expect(note).toContain(copy.therapy);
      expect(note).toContain(copy.consultation);
    }
  });
});
