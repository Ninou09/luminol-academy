import type { OperationsDashboard } from './operations.server';

function safeMetric(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function largestCount(items: Array<{ count: number }>) {
  return items.reduce(
    (largest, item) => Math.max(largest, safeMetric(item.count)),
    0,
  );
}

function attributionRecorded(
  operations: Pick<OperationsDashboard, 'enquiryAttributionCoverageLast30Days'>,
  field:
    'utmSource' | 'utmMedium' | 'utmCampaign' | 'utmContent' | 'landingPath',
) {
  return safeMetric(
    operations.enquiryAttributionCoverageLast30Days.items.find(
      (item) => item.field === field,
    )?.recorded ?? 0,
  );
}

export function buildAiProviderOperationalMetrics(
  operations: Pick<
    OperationsDashboard,
    | 'summary'
    | 'activeEnquiryFollowUpTiming'
    | 'enquiryOutcomeCoverageLast30Days'
    | 'enquiryWorkflowCoverageLast30Days'
  >,
) {
  return {
    activeEnquiries: safeMetric(operations.summary.activeEnquiries),
    unassignedActiveEnquiries: safeMetric(
      operations.summary.unassignedActiveEnquiries,
    ),
    enquiriesLast30Days: safeMetric(operations.summary.enquiriesLast30Days),
    newEnquiries: safeMetric(operations.summary.newEnquiries),
    pastDueFollowUps: safeMetric(
      operations.activeEnquiryFollowUpTiming.buckets.pastDue,
    ),
    missingFollowUpPlans: safeMetric(
      operations.activeEnquiryFollowUpTiming.buckets.missingPlan,
    ),
    missingClosedOutcomesLast30Days: safeMetric(
      operations.enquiryOutcomeCoverageLast30Days.missingTotal,
    ),
    ownerCoveragePercent: safeMetric(
      operations.enquiryWorkflowCoverageLast30Days.ownerPercent,
    ),
    followUpCoveragePercent: safeMetric(
      operations.enquiryWorkflowCoverageLast30Days.followUpPercent,
    ),
    qualificationCoveragePercent: safeMetric(
      operations.enquiryWorkflowCoverageLast30Days.qualificationPercent,
    ),
  };
}

export function buildAiProviderCampaignMetrics(
  operations: Pick<
    OperationsDashboard,
    | 'summary'
    | 'campaignEnquiryMixLast30Days'
    | 'enquiryCampaignMediumMixLast30Days'
    | 'enquiryCampaignContentMixLast30Days'
    | 'enquiryAttributionCoverageLast30Days'
  >,
) {
  const sourceMix = operations.campaignEnquiryMixLast30Days.sourceMix;
  const campaignMix = operations.campaignEnquiryMixLast30Days.campaignMix;
  const mediumMix = operations.enquiryCampaignMediumMixLast30Days;
  const contentMix = operations.enquiryCampaignContentMixLast30Days;

  return {
    enquiriesLast30Days: safeMetric(operations.summary.enquiriesLast30Days),
    campaignTaggedTotal: safeMetric(
      operations.campaignEnquiryMixLast30Days.taggedTotal,
    ),
    campaignUntaggedTotal: safeMetric(
      operations.campaignEnquiryMixLast30Days.untaggedTotal,
    ),
    campaignSourceBuckets: safeMetric(sourceMix.length),
    largestCampaignSourceCount: largestCount(sourceMix),
    campaignBuckets: safeMetric(campaignMix.length),
    largestCampaignCount: largestCount(campaignMix),
    campaignMediumRecorded: safeMetric(mediumMix.recorded),
    campaignMediumMissing: safeMetric(mediumMix.missing),
    campaignMediumBuckets: safeMetric(mediumMix.items.length),
    largestCampaignMediumCount: largestCount(mediumMix.items),
    campaignContentRecorded: safeMetric(contentMix.recorded),
    campaignContentMissing: safeMetric(contentMix.missing),
    campaignContentBuckets: safeMetric(contentMix.items.length),
    largestCampaignContentCount: largestCount(contentMix.items),
    attributionTotal: safeMetric(
      operations.enquiryAttributionCoverageLast30Days.total,
    ),
    utmSourceRecorded: attributionRecorded(operations, 'utmSource'),
    utmMediumRecorded: attributionRecorded(operations, 'utmMedium'),
    utmCampaignRecorded: attributionRecorded(operations, 'utmCampaign'),
    utmContentRecorded: attributionRecorded(operations, 'utmContent'),
    landingPathRecorded: attributionRecorded(operations, 'landingPath'),
  };
}
