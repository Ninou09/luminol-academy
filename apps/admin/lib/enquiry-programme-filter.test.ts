import { describe, expect, it } from 'vitest';

import {
  buildEnquiryProgrammeQuery,
  getEnquiryProgrammeWhere,
  parseEnquiryProgrammeFilter,
} from './enquiry-programme-filter';

describe('enquiry programme filter', () => {
  it('accepts one exact canonical persisted programme pair', () => {
    expect(
      parseEnquiryProgrammeFilter('act-foundations', 'ACT Foundations'),
    ).toEqual({
      programmeSlug: 'act-foundations',
      programmeTitleSnapshot: 'ACT Foundations',
    });
  });

  it('fails closed for repeated or one-sided values', () => {
    expect(
      parseEnquiryProgrammeFilter(['act-foundations'], 'ACT Foundations'),
    ).toBeNull();
    expect(
      parseEnquiryProgrammeFilter('act-foundations', [
        'ACT Foundations',
        'Other',
      ]),
    ).toBeNull();
    expect(
      parseEnquiryProgrammeFilter('act-foundations', undefined),
    ).toBeNull();
    expect(
      parseEnquiryProgrammeFilter(undefined, 'ACT Foundations'),
    ).toBeNull();
  });

  it('fails closed rather than normalizing malformed programme context', () => {
    expect(
      parseEnquiryProgrammeFilter('ACT-Foundations', 'ACT Foundations'),
    ).toBeNull();
    expect(
      parseEnquiryProgrammeFilter('act foundations', 'ACT Foundations'),
    ).toBeNull();
    expect(
      parseEnquiryProgrammeFilter('act-foundations', ' ACT Foundations '),
    ).toBeNull();
    expect(
      parseEnquiryProgrammeFilter('act-foundations', 'ACT\nFoundations'),
    ).toBeNull();
    expect(
      parseEnquiryProgrammeFilter('a'.repeat(97), 'ACT Foundations'),
    ).toBeNull();
    expect(
      parseEnquiryProgrammeFilter('act-foundations', 'A'.repeat(241)),
    ).toBeNull();
  });

  it('builds an exact atomic Prisma predicate', () => {
    expect(
      getEnquiryProgrammeWhere({
        programmeSlug: 'act-foundations',
        programmeTitleSnapshot: 'ACT Foundations',
      }),
    ).toEqual({
      programmeSlug: 'act-foundations',
      programmeTitleSnapshot: 'ACT Foundations',
    });
    expect(getEnquiryProgrammeWhere(null)).toBeNull();
  });

  it('builds a deterministic encoded query from both persisted values', () => {
    expect(
      buildEnquiryProgrammeQuery({
        programmeSlug: 'act-foundations',
        programmeTitleSnapshot: 'ACT Foundations',
      }),
    ).toBe('programmeSlug=act-foundations&programmeTitle=ACT+Foundations');
  });
});
