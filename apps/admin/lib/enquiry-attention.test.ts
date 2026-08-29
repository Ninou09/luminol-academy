import { describe, expect, it } from 'vitest';

import {
  ACTIVE_ENQUIRY_WHERE,
  ACTIVE_INCOMPLETE_QUALIFICATION_WHERE,
  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,
  ACTIVE_WITHOUT_FOLLOW_UP_WHERE,
  CLOSED_WITHOUT_OUTCOME_WHERE,
  getEnquiryAttentionWhere,
  parseEnquiryAttentionFilter,
} from './enquiry-attention';

describe('enquiry attention filters', () => {
  it('accepts only stable attention tokens and fails closed for invalid values', () => {
    expect(parseEnquiryAttentionFilter('unassigned')).toBe('unassigned');
    expect(parseEnquiryAttentionFilter('active-without-follow-up')).toBe(
      'active-without-follow-up',
    );
    expect(parseEnquiryAttentionFilter('active-incomplete-qualification')).toBe(
      'active-incomplete-qualification',
    );
    expect(parseEnquiryAttentionFilter('closed-without-outcome')).toBe(
      'closed-without-outcome',
    );
    expect(parseEnquiryAttentionFilter(['unassigned', 'ignored'])).toBe(
      'unassigned',
    );
    expect(parseEnquiryAttentionFilter('lead@example.com')).toBeNull();
    expect(parseEnquiryAttentionFilter(undefined)).toBeNull();
  });

  it('keeps attention semantics explicit and limited to structured fields', () => {
    expect(ACTIVE_ENQUIRY_WHERE).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
    });
    expect(getEnquiryAttentionWhere('unassigned')).toEqual(
      ACTIVE_UNASSIGNED_ENQUIRY_WHERE,
    );
    expect(ACTIVE_UNASSIGNED_ENQUIRY_WHERE).toEqual({
      ownerUserId: null,
      status: { notIn: ['CLOSED', 'SPAM'] },
    });
    expect(getEnquiryAttentionWhere('active-without-follow-up')).toEqual(
      ACTIVE_WITHOUT_FOLLOW_UP_WHERE,
    );
    expect(ACTIVE_WITHOUT_FOLLOW_UP_WHERE).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      nextFollowUpAt: null,
      nextAction: null,
    });
    expect(getEnquiryAttentionWhere('active-incomplete-qualification')).toEqual(
      ACTIVE_INCOMPLETE_QUALIFICATION_WHERE,
    );
    expect(ACTIVE_INCOMPLETE_QUALIFICATION_WHERE).toEqual({
      status: { notIn: ['CLOSED', 'SPAM'] },
      OR: [
        { city: null },
        { preferredContact: null },
        { deliveryPreference: null },
        { timingPreference: null },
      ],
    });
    expect(getEnquiryAttentionWhere('closed-without-outcome')).toEqual(
      CLOSED_WITHOUT_OUTCOME_WHERE,
    );
    expect(CLOSED_WITHOUT_OUTCOME_WHERE).toEqual({
      status: 'CLOSED',
      outcome: null,
      outcomeAt: null,
    });
    expect(getEnquiryAttentionWhere(null)).toBeNull();
  });
});
