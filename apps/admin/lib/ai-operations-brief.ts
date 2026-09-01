import {
  buildEnquiryAttributionGapQuery,
  type EnquiryAttributionGap,
} from './enquiry-attribution-gap-filter';
import { buildEnquiryFollowUpTimingQuery } from './enquiry-follow-up-timing-filter';
import {
  buildEnquiryQualificationGapQuery,
  type EnquiryQualificationGap,
} from './enquiry-qualification-gap-filter';

export type AiOperationsBriefKind =
  | 'unassigned'
  | 'pastDueFollowUp'
  | 'missingFollowUpPlan'
  | 'qualificationGap'
  | 'missingOutcome'
  | 'attributionGap';

export type AiOperationsBriefItem = {
  kind: AiOperationsBriefKind;
  count: number;
  query: string;
  qualificationGap?: EnquiryQualificationGap;
  attributionGap?: EnquiryAttributionGap;
};

export type AiOperationsBrief = {
  status: 'clear' | 'attention';
  items: AiOperationsBriefItem[];
  source: 'operations-dashboard';
};

export type AiOperationsBriefInput = {
  summary: {
    unassignedActiveEnquiries: number;
  };
  activeEnquiryFollowUpTiming: {
    buckets: {
      missingPlan: number;
      pastDue: number;
    };
  };
  enquiryQualificationGapsLast30Days: {
    cityMissing: number;
    preferredContactMissing: number;
    deliveryPreferenceMissing: number;
    timingPreferenceMissing: number;
  };
  enquiryOutcomeCoverageLast30Days: {
    missingTotal: number;
  };
  enquiryAttributionCoverageLast30Days: {
    total: number;
    items: Array<{
      field: EnquiryAttributionGap;
      recorded: number;
    }>;
  };
};

const QUALIFICATION_GAP_ORDER: readonly EnquiryQualificationGap[] = [
  'city',
  'preferredContact',
  'deliveryPreference',
  'timingPreference',
];

const ATTRIBUTION_GAP_ORDER: readonly EnquiryAttributionGap[] = [
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'landingPath',
];

function safeCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

function buildAttentionQuery(
  attention: 'unassigned' | 'closed-without-outcome',
) {
  const query = new URLSearchParams();
  query.set('attention', attention);
  return query.toString();
}

function getLargestQualificationGap(
  input: AiOperationsBriefInput['enquiryQualificationGapsLast30Days'],
): { field: EnquiryQualificationGap; count: number } | null {
  const counts: Record<EnquiryQualificationGap, number> = {
    city: safeCount(input.cityMissing),
    preferredContact: safeCount(input.preferredContactMissing),
    deliveryPreference: safeCount(input.deliveryPreferenceMissing),
    timingPreference: safeCount(input.timingPreferenceMissing),
  };

  let selected: { field: EnquiryQualificationGap; count: number } | null = null;

  for (const field of QUALIFICATION_GAP_ORDER) {
    const count = counts[field];
    if (count === 0) continue;
    if (!selected || count > selected.count) selected = { field, count };
  }

  return selected;
}

function getLargestAttributionGap(
  input: AiOperationsBriefInput['enquiryAttributionCoverageLast30Days'],
): { field: EnquiryAttributionGap; count: number } | null {
  const total = safeCount(input.total);
  if (total === 0) return null;

  const recordedByField = new Map<EnquiryAttributionGap, number>();
  for (const item of input.items) {
    recordedByField.set(item.field, Math.min(total, safeCount(item.recorded)));
  }

  let selected: { field: EnquiryAttributionGap; count: number } | null = null;

  for (const field of ATTRIBUTION_GAP_ORDER) {
    const missing = total - (recordedByField.get(field) ?? 0);
    if (missing === 0) continue;
    if (!selected || missing > selected.count)
      selected = { field, count: missing };
  }

  return selected;
}

export function buildAiOperationsBrief(
  input: AiOperationsBriefInput,
): AiOperationsBrief {
  const items: AiOperationsBriefItem[] = [];

  const unassigned = safeCount(input.summary.unassignedActiveEnquiries);
  if (unassigned > 0) {
    items.push({
      kind: 'unassigned',
      count: unassigned,
      query: buildAttentionQuery('unassigned'),
    });
  }

  const pastDue = safeCount(input.activeEnquiryFollowUpTiming.buckets.pastDue);
  if (pastDue > 0) {
    items.push({
      kind: 'pastDueFollowUp',
      count: pastDue,
      query: buildEnquiryFollowUpTimingQuery('pastDue'),
    });
  }

  const missingPlan = safeCount(
    input.activeEnquiryFollowUpTiming.buckets.missingPlan,
  );
  if (missingPlan > 0) {
    items.push({
      kind: 'missingFollowUpPlan',
      count: missingPlan,
      query: buildEnquiryFollowUpTimingQuery('missingPlan'),
    });
  }

  const qualificationGap = getLargestQualificationGap(
    input.enquiryQualificationGapsLast30Days,
  );
  if (qualificationGap) {
    items.push({
      kind: 'qualificationGap',
      count: qualificationGap.count,
      qualificationGap: qualificationGap.field,
      query: buildEnquiryQualificationGapQuery(qualificationGap.field),
    });
  }

  const missingOutcome = safeCount(
    input.enquiryOutcomeCoverageLast30Days.missingTotal,
  );
  if (missingOutcome > 0) {
    items.push({
      kind: 'missingOutcome',
      count: missingOutcome,
      query: buildAttentionQuery('closed-without-outcome'),
    });
  }

  const attributionGap = getLargestAttributionGap(
    input.enquiryAttributionCoverageLast30Days,
  );
  if (attributionGap) {
    items.push({
      kind: 'attributionGap',
      count: attributionGap.count,
      attributionGap: attributionGap.field,
      query: buildEnquiryAttributionGapQuery(attributionGap.field),
    });
  }

  return {
    status: items.length === 0 ? 'clear' : 'attention',
    items,
    source: 'operations-dashboard',
  };
}
