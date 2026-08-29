import { describe, expect, it } from 'vitest';

import {
  buildEnquiryAuditTimeline,
  ENQUIRY_AUDIT_RELATION_LIMIT,
  ENQUIRY_AUDIT_TIMELINE_LIMIT,
} from './enquiry-audit-history';

const actor = {
  email: 'operator@example.com',
  firstName: 'Op',
  lastName: null,
};

describe('enquiry audit history', () => {
  it('normalizes all audited event families and sorts newest first', () => {
    const timeline = buildEnquiryAuditTimeline({
      statusEvents: [
        {
          id: 's1',
          fromStatus: 'NEW',
          toStatus: 'IN_REVIEW',
          createdAt: new Date('2026-08-29T08:00:00.000Z'),
          actor,
        },
      ],
      ownershipEvents: [
        {
          id: 'o1',
          fromOwnerUserId: null,
          toOwnerUserId: 'operator',
          createdAt: new Date('2026-08-29T09:00:00.000Z'),
          actor,
        },
      ],
      followUpEvents: [
        {
          id: 'f1',
          fromNextFollowUpAt: null,
          toNextFollowUpAt: new Date('2026-08-30T00:00:00.000Z'),
          createdAt: new Date('2026-08-29T10:00:00.000Z'),
          actor,
        },
      ],
      outcomeEvents: [
        {
          id: 'r1',
          fromOutcomeAt: null,
          toOutcomeAt: new Date('2026-08-29T11:00:00.000Z'),
          createdAt: new Date('2026-08-29T11:00:00.000Z'),
          actor,
        },
      ],
    });

    expect(timeline.map((item) => item.action)).toEqual([
      'outcome-recorded',
      'follow-up-planned',
      'ownership-assigned',
      'status-changed',
    ]);
    expect(timeline[3]).toMatchObject({
      fromStatus: 'NEW',
      toStatus: 'IN_REVIEW',
    });
  });

  it('classifies updates and clears without carrying historical free text', () => {
    const timeline = buildEnquiryAuditTimeline({
      statusEvents: [],
      ownershipEvents: [
        {
          id: 'o1',
          fromOwnerUserId: 'one',
          toOwnerUserId: 'two',
          createdAt: new Date('2026-08-29T08:00:00.000Z'),
          actor,
        },
        {
          id: 'o2',
          fromOwnerUserId: 'two',
          toOwnerUserId: null,
          createdAt: new Date('2026-08-29T09:00:00.000Z'),
          actor,
        },
      ],
      followUpEvents: [
        {
          id: 'f1',
          fromNextFollowUpAt: new Date('2026-08-30T00:00:00.000Z'),
          toNextFollowUpAt: new Date('2026-08-31T00:00:00.000Z'),
          createdAt: new Date('2026-08-29T10:00:00.000Z'),
          actor,
        },
        {
          id: 'f2',
          fromNextFollowUpAt: new Date('2026-08-31T00:00:00.000Z'),
          toNextFollowUpAt: null,
          createdAt: new Date('2026-08-29T11:00:00.000Z'),
          actor,
        },
      ],
      outcomeEvents: [
        {
          id: 'r1',
          fromOutcomeAt: new Date('2026-08-29T07:00:00.000Z'),
          toOutcomeAt: new Date('2026-08-29T08:00:00.000Z'),
          createdAt: new Date('2026-08-29T12:00:00.000Z'),
          actor,
        },
        {
          id: 'r2',
          fromOutcomeAt: new Date('2026-08-29T08:00:00.000Z'),
          toOutcomeAt: null,
          createdAt: new Date('2026-08-29T13:00:00.000Z'),
          actor,
        },
      ],
    });

    expect(timeline.map((item) => item.action)).toEqual([
      'outcome-cleared',
      'outcome-updated',
      'follow-up-cleared',
      'follow-up-updated',
      'ownership-cleared',
      'ownership-reassigned',
    ]);
    expect(JSON.stringify(timeline)).not.toContain('nextAction');
    expect(JSON.stringify(timeline)).not.toContain('outcomeText');
  });

  it('uses explicit bounded defaults and respects a smaller render limit', () => {
    expect(ENQUIRY_AUDIT_RELATION_LIMIT).toBe(6);
    expect(ENQUIRY_AUDIT_TIMELINE_LIMIT).toBe(12);

    const statusEvents = Array.from({ length: 4 }, (_, index) => ({
      id: `s${index}`,
      fromStatus: 'NEW',
      toStatus: 'IN_REVIEW',
      createdAt: new Date(`2026-08-29T0${index + 1}:00:00.000Z`),
      actor,
    }));
    expect(
      buildEnquiryAuditTimeline(
        {
          statusEvents,
          ownershipEvents: [],
          followUpEvents: [],
          outcomeEvents: [],
        },
        2,
      ),
    ).toHaveLength(2);
  });
});
