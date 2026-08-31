import { describe, expect, it } from 'vitest';

import {
  buildEnquirySchoolQuery,
  getEnquirySchoolWhere,
  parseEnquirySchoolFilter,
} from './enquiry-school-filter';

describe('enquiry school filter', () => {
  it.each(['PSYCHOLOGY', 'LANGUAGES', 'TRAINING', 'GENERAL'] as const)(
    'accepts the persisted structured school %s',
    (school) => {
      expect(parseEnquirySchoolFilter(school)).toBe(school);
    },
  );

  it('uses only the first query value', () => {
    expect(parseEnquirySchoolFilter(['LANGUAGES', 'TRAINING'])).toBe(
      'LANGUAGES',
    );
  });

  it('fails closed for missing, blank, normalized-looking or unsupported values', () => {
    expect(parseEnquirySchoolFilter(undefined)).toBeNull();
    expect(parseEnquirySchoolFilter('')).toBeNull();
    expect(parseEnquirySchoolFilter(' ')).toBeNull();
    expect(parseEnquirySchoolFilter('psychology')).toBeNull();
    expect(parseEnquirySchoolFilter('PSYCHOLOGY ')).toBeNull();
    expect(parseEnquirySchoolFilter('CLINICAL')).toBeNull();
  });

  it('creates an exact structured Prisma predicate only', () => {
    expect(getEnquirySchoolWhere('PSYCHOLOGY')).toEqual({
      school: 'PSYCHOLOGY',
    });
    expect(getEnquirySchoolWhere(null)).toBeNull();
  });

  it('encodes the protected school query deterministically', () => {
    expect(buildEnquirySchoolQuery('TRAINING')).toBe('school=TRAINING');
  });
});
