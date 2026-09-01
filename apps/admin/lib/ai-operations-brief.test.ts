import { describe, expect, it } from 'vitest';

import {
  buildAiOperationsBrief,
  type AiOperationsBriefInput,
} from './ai-operations-brief';

function makeInput(
  overrides: Partial<AiOperationsBriefInput> = {},
): AiOperationsBriefInput {
  return {
    summary: { unassignedActiveEnquiries: 0 },
    activeEnquiryFollowUpTiming: {
      buckets: { missingPlan: 0, pastDue: 0 },
    },
    enquiryQualificationGapsLast30Days: {
      cityMissing: 0,
      preferredContactMissing: 0,
      deliveryPreferenceMissing: 0,
      timingPreferenceMissing: 0,
    },
    enquiryOutcomeCoverageLast30Days: { missingTotal: 0 },
    enquiryAttributionCoverageLast30Days: { total: 0, items: [] },
    ...overrides,
  };
}

describe('buildAiOperationsBrief', () => {
  it('returns an explicit clear state when supported workflow gaps are zero', () => {
    expect(buildAiOperationsBrief(makeInput())).toEqual({
      status: 'clear',
      items: [],
      source: 'operations-dashboard',
    });
  });

  it('keeps the documented workflow order', () => {
    const brief = buildAiOperationsBrief(
      makeInput({
        summary: { unassignedActiveEnquiries: 2 },
        activeEnquiryFollowUpTiming: {
          buckets: { missingPlan: 4, pastDue: 3 },
        },
        enquiryQualificationGapsLast30Days: {
          cityMissing: 5,
          preferredContactMissing: 1,
          deliveryPreferenceMissing: 0,
          timingPreferenceMissing: 0,
        },
        enquiryOutcomeCoverageLast30Days: { missingTotal: 6 },
        enquiryAttributionCoverageLast30Days: {
          total: 10,
          items: [
            { field: 'utmSource', recorded: 4 },
            { field: 'utmMedium', recorded: 8 },
            { field: 'utmCampaign', recorded: 9 },
            { field: 'utmContent', recorded: 10 },
            { field: 'landingPath', recorded: 10 },
          ],
        },
      }),
    );

    expect(brief.status).toBe('attention');
    expect(brief.items.map((item) => item.kind)).toEqual([
      'unassigned',
      'pastDueFollowUp',
      'missingFollowUpPlan',
      'qualificationGap',
      'missingOutcome',
      'attributionGap',
    ]);
    expect(brief.items.map((item) => item.count)).toEqual([2, 3, 4, 5, 6, 6]);
  });

  it('uses the established protected enquiry drill-down queries', () => {
    const brief = buildAiOperationsBrief(
      makeInput({
        summary: { unassignedActiveEnquiries: 1 },
        activeEnquiryFollowUpTiming: {
          buckets: { missingPlan: 2, pastDue: 3 },
        },
        enquiryOutcomeCoverageLast30Days: { missingTotal: 4 },
      }),
    );

    expect(brief.items.map((item) => item.query)).toEqual([
      'attention=unassigned',
      'followUpTiming=pastDue',
      'followUpTiming=missingPlan',
      'attention=closed-without-outcome',
    ]);
  });

  it('selects the largest qualification gap with stable tie order', () => {
    const brief = buildAiOperationsBrief(
      makeInput({
        enquiryQualificationGapsLast30Days: {
          cityMissing: 4,
          preferredContactMissing: 4,
          deliveryPreferenceMissing: 2,
          timingPreferenceMissing: 1,
        },
      }),
    );

    expect(brief.items).toEqual([
      {
        kind: 'qualificationGap',
        count: 4,
        qualificationGap: 'city',
        query: 'qualificationGap=city',
      },
    ]);
  });

  it('selects the largest attribution gap and bounds recorded counts', () => {
    const brief = buildAiOperationsBrief(
      makeInput({
        enquiryAttributionCoverageLast30Days: {
          total: 10,
          items: [
            { field: 'utmSource', recorded: 12 },
            { field: 'utmMedium', recorded: 6 },
            { field: 'utmCampaign', recorded: 6 },
            { field: 'utmContent', recorded: 9 },
            { field: 'landingPath', recorded: 10 },
          ],
        },
      }),
    );

    expect(brief.items).toEqual([
      {
        kind: 'attributionGap',
        count: 4,
        attributionGap: 'utmMedium',
        query: 'attributionGap=utmMedium',
      },
    ]);
  });
});
