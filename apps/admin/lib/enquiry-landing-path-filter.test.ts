import { describe, expect, it } from 'vitest';

import {
  buildEnquiryLandingPathQuery,
  ENQUIRY_LANDING_PATH_FILTER_LIMIT,
  getEnquiryLandingPathWhere,
  parseEnquiryLandingPathFilter,
} from './enquiry-landing-path-filter';

describe('enquiry landing path filter', () => {
  it('accepts a bounded stored pathname without repairing it', () => {
    expect(parseEnquiryLandingPathFilter('/programmes/self-hypnosis')).toBe(
      '/programmes/self-hypnosis',
    );
    expect(parseEnquiryLandingPathFilter('/')).toBe('/');
  });

  it('uses only the first query value', () => {
    expect(
      parseEnquiryLandingPathFilter(['/programmes/a', '/programmes/b']),
    ).toBe('/programmes/a');
  });

  it('fails closed for missing, blank, oversized or non-path values', () => {
    expect(parseEnquiryLandingPathFilter(undefined)).toBeNull();
    expect(parseEnquiryLandingPathFilter('')).toBeNull();
    expect(parseEnquiryLandingPathFilter('   ')).toBeNull();
    expect(parseEnquiryLandingPathFilter('programmes/a')).toBeNull();
    expect(parseEnquiryLandingPathFilter('https://example.com/a')).toBeNull();
    expect(parseEnquiryLandingPathFilter('//example.com/a')).toBeNull();
    expect(
      parseEnquiryLandingPathFilter(
        `/${'a'.repeat(ENQUIRY_LANDING_PATH_FILTER_LIMIT)}`,
      ),
    ).toBeNull();
  });

  it('rejects query, hash, whitespace, backslash and control characters', () => {
    expect(parseEnquiryLandingPathFilter('/programme?x=1')).toBeNull();
    expect(parseEnquiryLandingPathFilter('/programme#details')).toBeNull();
    expect(parseEnquiryLandingPathFilter('/programme name')).toBeNull();
    expect(parseEnquiryLandingPathFilter('/programme\\name')).toBeNull();
    expect(parseEnquiryLandingPathFilter('/programme\nname')).toBeNull();
    expect(parseEnquiryLandingPathFilter('/programme\u0000name')).toBeNull();
  });

  it('creates an exact persisted-path Prisma predicate only', () => {
    expect(getEnquiryLandingPathWhere('/programmes/self-hypnosis')).toEqual({
      landingPath: '/programmes/self-hypnosis',
    });
    expect(getEnquiryLandingPathWhere(null)).toBeNull();
  });

  it('encodes the protected landing-path query deterministically', () => {
    expect(buildEnquiryLandingPathQuery('/programmes/self hypnosis')).toBe(
      'landingPath=%2Fprogrammes%2Fself+hypnosis',
    );
  });
});
