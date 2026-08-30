import { describe, expect, it } from 'vitest';

import {
  ENQUIRY_ATTRIBUTION_COVERAGE_FIELDS,
  summarizeEnquiryAttributionCoverage,
} from './enquiry-attribution-coverage-reporting';

describe('summarizeEnquiryAttributionCoverage', () => {
  it('returns all persisted attribution fields in deterministic order', () => {
    const summary = summarizeEnquiryAttributionCoverage(20, {
      utmSource: 12,
      utmMedium: 10,
      utmCampaign: 8,
      utmContent: 6,
      landingPath: 18,
    });

    expect(summary.total).toBe(20);
    expect(summary.items.map((item) => item.field)).toEqual([
      ...ENQUIRY_ATTRIBUTION_COVERAGE_FIELDS,
    ]);
    expect(summary.items).toEqual([
      { field: 'utmSource', recorded: 12, percent: 60 },
      { field: 'utmMedium', recorded: 10, percent: 50 },
      { field: 'utmCampaign', recorded: 8, percent: 40 },
      { field: 'utmContent', recorded: 6, percent: 30 },
      { field: 'landingPath', recorded: 18, percent: 90 },
    ]);
  });

  it('bounds recorded counts to the common denominator', () => {
    const summary = summarizeEnquiryAttributionCoverage(5, {
      utmSource: 9,
      utmMedium: 4.9,
      utmCampaign: 3,
      utmContent: 2,
      landingPath: 1,
    });

    expect(summary.items[0]).toEqual({
      field: 'utmSource',
      recorded: 5,
      percent: 100,
    });
    expect(summary.items[1]).toEqual({
      field: 'utmMedium',
      recorded: 4,
      percent: 80,
    });
  });

  it('handles zero and invalid inputs safely', () => {
    expect(
      summarizeEnquiryAttributionCoverage(Number.NaN, {
        utmSource: 4,
        utmMedium: Number.NaN,
        utmCampaign: -2,
        utmContent: 0,
        landingPath: 9,
      }),
    ).toEqual({
      total: 0,
      items: ENQUIRY_ATTRIBUTION_COVERAGE_FIELDS.map((field) => ({
        field,
        recorded: 0,
        percent: 0,
      })),
    });
  });

  it('rounds coverage to one decimal place', () => {
    const summary = summarizeEnquiryAttributionCoverage(3, {
      utmSource: 1,
      utmMedium: 1,
      utmCampaign: 1,
      utmContent: 1,
      landingPath: 1,
    });

    expect(summary.items.every((item) => item.percent === 33.3)).toBe(true);
  });
});
