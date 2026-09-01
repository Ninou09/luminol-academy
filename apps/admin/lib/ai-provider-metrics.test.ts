import { describe, expect, test } from 'vitest';

import {
  buildAiProviderCampaignMetrics,
  buildAiProviderOperationalMetrics,
} from './ai-provider-metrics';

describe('AI provider metric envelopes', () => {
  test('builds a fixed operational metric envelope with numeric values only', () => {
    const metrics = buildAiProviderOperationalMetrics({
      summary: {
        activeUsers: 0,
        activeEnrollments: 0,
        publishedCourses: 0,
        newEnquiries: 3,
        enquiriesLast30Days: 12,
        programmeAttributedLast30Days: 0,
        activeEnquiries: 8,
        unassignedActiveEnquiries: 2,
        completionRate: 0,
      },
      activeEnquiryFollowUpTiming: {
        total: 8,
        buckets: {
          missingPlan: 1,
          pastDue: 2,
          dueToday: 1,
          dueNext7Days: 2,
          scheduledLater: 2,
        },
      },
      enquiryOutcomeCoverageLast30Days: {
        closedTotal: 5,
        recordedTotal: 4,
        missingTotal: 1,
        coveragePercent: 80,
      },
      enquiryWorkflowCoverageLast30Days: {
        activeTotal: 8,
        ownerCovered: 6,
        ownerPercent: 75,
        followUpCovered: 7,
        followUpPercent: 87.5,
        qualificationCovered: 5,
        qualificationPercent: 62.5,
      },
    });

    expect(metrics).toEqual({
      activeEnquiries: 8,
      unassignedActiveEnquiries: 2,
      enquiriesLast30Days: 12,
      newEnquiries: 3,
      pastDueFollowUps: 2,
      missingFollowUpPlans: 1,
      missingClosedOutcomesLast30Days: 1,
      ownerCoveragePercent: 75,
      followUpCoveragePercent: 87.5,
      qualificationCoveragePercent: 62.5,
    });
    expect(
      Object.values(metrics).every((value) => typeof value === 'number'),
    ).toBe(true);
  });

  test('builds campaign analysis metrics without campaign labels or free text', () => {
    const metrics = buildAiProviderCampaignMetrics({
      summary: {
        activeUsers: 0,
        activeEnrollments: 0,
        publishedCourses: 0,
        newEnquiries: 0,
        enquiriesLast30Days: 20,
        programmeAttributedLast30Days: 0,
        activeEnquiries: 0,
        unassignedActiveEnquiries: 0,
        completionRate: 0,
      },
      campaignEnquiryMixLast30Days: {
        taggedTotal: 14,
        untaggedTotal: 6,
        sourceMix: [
          { utmSource: 'private-source-name', count: 9 },
          { utmSource: 'another-source', count: 5 },
        ],
        campaignMix: [
          {
            utmSource: 'private-source-name',
            utmCampaign: 'private-campaign-name',
            count: 7,
          },
        ],
      },
      enquiryCampaignMediumMixLast30Days: {
        total: 20,
        recorded: 12,
        missing: 8,
        items: [{ utmMedium: 'private-medium-name', count: 8 }],
      },
      enquiryCampaignContentMixLast30Days: {
        total: 20,
        recorded: 10,
        missing: 10,
        items: [{ utmContent: 'private-content-name', count: 6 }],
      },
      enquiryAttributionCoverageLast30Days: {
        total: 20,
        items: [
          { field: 'utmSource', recorded: 14, percent: 70 },
          { field: 'utmMedium', recorded: 12, percent: 60 },
          { field: 'utmCampaign', recorded: 11, percent: 55 },
          { field: 'utmContent', recorded: 10, percent: 50 },
          { field: 'landingPath', recorded: 16, percent: 80 },
        ],
      },
    });

    expect(metrics).toEqual({
      enquiriesLast30Days: 20,
      campaignTaggedTotal: 14,
      campaignUntaggedTotal: 6,
      campaignSourceBuckets: 2,
      largestCampaignSourceCount: 9,
      campaignBuckets: 1,
      largestCampaignCount: 7,
      campaignMediumRecorded: 12,
      campaignMediumMissing: 8,
      campaignMediumBuckets: 1,
      largestCampaignMediumCount: 8,
      campaignContentRecorded: 10,
      campaignContentMissing: 10,
      campaignContentBuckets: 1,
      largestCampaignContentCount: 6,
      attributionTotal: 20,
      utmSourceRecorded: 14,
      utmMediumRecorded: 12,
      utmCampaignRecorded: 11,
      utmContentRecorded: 10,
      landingPathRecorded: 16,
    });

    const serialized = JSON.stringify(metrics);
    expect(serialized).not.toContain('private-source-name');
    expect(serialized).not.toContain('private-campaign-name');
    expect(serialized).not.toContain('private-medium-name');
    expect(serialized).not.toContain('private-content-name');
    expect(Object.keys(metrics)).toHaveLength(21);
  });
});
