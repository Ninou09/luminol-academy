import { describe, expect, it } from 'vitest';
import { isSchoolSlug, schools } from './schools';

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

  it('provides complete program and journey content for every school', () => {
    for (const school of Object.values(schools)) {
      expect(school.programs).toHaveLength(4);
      expect(school.approach).toHaveLength(3);
      expect(school.audiences.length).toBeGreaterThanOrEqual(4);
      expect(school.note.length).toBeGreaterThan(40);
    }
  });
});
