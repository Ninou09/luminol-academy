export const ENQUIRY_ATTRIBUTION_COVERAGE_FIELDS = [
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'landingPath',
] as const;

export type EnquiryAttributionCoverageField =
  (typeof ENQUIRY_ATTRIBUTION_COVERAGE_FIELDS)[number];

export type EnquiryAttributionCoverageItem = {
  field: EnquiryAttributionCoverageField;
  recorded: number;
  percent: number;
};

export type EnquiryAttributionCoverageSummary = {
  total: number;
  items: EnquiryAttributionCoverageItem[];
};

function safeCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

function coveragePercent(recorded: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((recorded / total) * 1_000) / 10;
}

export function summarizeEnquiryAttributionCoverage(
  total: number,
  counts: Record<EnquiryAttributionCoverageField, number>,
): EnquiryAttributionCoverageSummary {
  const safeTotal = safeCount(total);
  const items = ENQUIRY_ATTRIBUTION_COVERAGE_FIELDS.map((field) => {
    const recorded = Math.min(safeTotal, safeCount(counts[field]));
    return {
      field,
      recorded,
      percent: coveragePercent(recorded, safeTotal),
    };
  });

  return { total: safeTotal, items };
}
