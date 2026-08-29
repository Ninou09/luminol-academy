import { describe, expect, it } from 'vitest';

import { getAdminCopy } from './admin-localization';
import {
  calculateEnquiryCoveragePercent,
  getProgrammeAttributedRecentEnquiryWhere,
  getRecentActiveEnquiryWhere,
  getRecentActiveFollowUpPlannedEnquiryWhere,
  getRecentActiveOwnedEnquiryWhere,
  getRecentActiveQualifiedEnquiryWhere,
  getRecentEnquiryWhere,
  getThirtyDayEnquiryStart,
  MAX_PROGRAMME_ENQUIRY_MIX_ITEMS,
  normalizeEnquirySchoolMix,
  normalizeProgrammeEnquiryMix,
} from './enquiry-pipeline-reporting';

describe('enquiry pipeline reporting', () => {
  it('uses a rolling 30-day createdAt window', () => {
    const now = new Date('2026-08-29T06:00:00.000Z');
    const start = new Date('2026-07-30T06:00:00.000Z');

    expect(getThirtyDayEnquiryStart(now)).toEqual(start);
    expect(getRecentEnquiryWhere(now)).toEqual({
      createdAt: { gte: start },
    });
  });

  it('counts programme attribution only when both verified snapshot fields are present', () => {
    const now = new Date('2026-08-29T06:00:00.000Z');

    expect(getProgrammeAttributedRecentEnquiryWhere(now)).toEqual({
      createdAt: { gte: new Date('2026-07-30T06:00:00.000Z') },
      programmeSlug: { not: null },
      programmeTitleSnapshot: { not: null },
    });
  });

  it('keeps recent workflow coverage limited to active enquiries', () => {
    const now = new Date('2026-08-29T06:00:00.000Z');
    const base = {
      createdAt: { gte: new Date('2026-07-30T06:00:00.000Z') },
      status: { notIn: ['CLOSED', 'SPAM'] },
    };

    expect(getRecentActiveEnquiryWhere(now)).toEqual(base);
    expect(getRecentActiveOwnedEnquiryWhere(now)).toEqual({
      ...base,
      ownerUserId: { not: null },
    });
    expect(getRecentActiveFollowUpPlannedEnquiryWhere(now)).toEqual({
      ...base,
      nextFollowUpAt: { not: null },
      nextAction: { not: null },
    });
    expect(getRecentActiveQualifiedEnquiryWhere(now)).toEqual({
      ...base,
      city: { not: null },
      preferredContact: { not: null },
      deliveryPreference: { not: null },
      timingPreference: { not: null },
    });
  });

  it('calculates deterministic bounded workflow coverage percentages', () => {
    expect(calculateEnquiryCoveragePercent(7, 10)).toBe(70);
    expect(calculateEnquiryCoveragePercent(2, 3)).toBe(66.7);
    expect(calculateEnquiryCoveragePercent(0, 0)).toBe(0);
    expect(calculateEnquiryCoveragePercent(12, 10)).toBe(100);
    expect(calculateEnquiryCoveragePercent(-2, 10)).toBe(0);
  });

  it('normalizes only known non-zero school groups in descending count order', () => {
    expect(
      normalizeEnquirySchoolMix([
        { school: 'GENERAL', _count: { _all: 2 } },
        { school: 'PSYCHOLOGY', _count: { _all: 7 } },
        { school: 'UNKNOWN', _count: { _all: 99 } },
        { school: 'LANGUAGES', _count: { _all: 0 } },
      ]),
    ).toEqual([
      { school: 'PSYCHOLOGY', count: 7 },
      { school: 'GENERAL', count: 2 },
    ]);
  });

  it('keeps only atomic verified programme pairs, sorts them and bounds the result', () => {
    const groups = [
      {
        programmeSlug: 'programme-z',
        programmeTitleSnapshot: 'Zeta Programme',
        _count: { _all: 2 },
      },
      {
        programmeSlug: 'programme-b',
        programmeTitleSnapshot: 'Beta Programme',
        _count: { _all: 5 },
      },
      {
        programmeSlug: 'programme-a',
        programmeTitleSnapshot: 'Alpha Programme',
        _count: { _all: 5 },
      },
      {
        programmeSlug: null,
        programmeTitleSnapshot: 'Missing slug',
        _count: { _all: 99 },
      },
      {
        programmeSlug: 'missing-title',
        programmeTitleSnapshot: null,
        _count: { _all: 99 },
      },
      {
        programmeSlug: 'zero-count',
        programmeTitleSnapshot: 'Zero Count',
        _count: { _all: 0 },
      },
      ...Array.from(
        { length: MAX_PROGRAMME_ENQUIRY_MIX_ITEMS },
        (_, index) => ({
          programmeSlug: `extra-${index}`,
          programmeTitleSnapshot: `Extra ${index}`,
          _count: { _all: 1 },
        }),
      ),
    ];

    const result = normalizeProgrammeEnquiryMix(groups);

    expect(result).toHaveLength(MAX_PROGRAMME_ENQUIRY_MIX_ITEMS);
    expect(result.slice(0, 3)).toEqual([
      {
        programmeSlug: 'programme-a',
        programmeTitleSnapshot: 'Alpha Programme',
        count: 5,
      },
      {
        programmeSlug: 'programme-b',
        programmeTitleSnapshot: 'Beta Programme',
        count: 5,
      },
      {
        programmeSlug: 'programme-z',
        programmeTitleSnapshot: 'Zeta Programme',
        count: 2,
      },
    ]);
  });

  it('allows a zero programme-mix limit without returning records', () => {
    expect(
      normalizeProgrammeEnquiryMix(
        [
          {
            programmeSlug: 'programme-a',
            programmeTitleSnapshot: 'Programme A',
            _count: { _all: 3 },
          },
        ],
        0,
      ),
    ).toEqual([]);
  });

  it('keeps the protected pipeline snapshot labelled in every admin locale', () => {
    expect(getAdminCopy('en').dashboard).toMatchObject({
      enquiryPipeline: 'Enquiry pipeline',
      rollingThirtyDays: 'Rolling 30 days',
      enquiriesLast30Days: 'Enquiries received',
      programmeAttributedLast30Days: 'Programme-attributed',
      activeEnquiries: 'Active enquiries',
      unassignedActiveEnquiries: 'Active & unassigned',
    });
    expect(getAdminCopy('fr').dashboard).toMatchObject({
      enquiryPipeline: 'Pipeline des demandes',
      rollingThirtyDays: '30 derniers jours',
      enquiriesLast30Days: 'Demandes reçues',
      programmeAttributedLast30Days: 'Attribuées à un programme',
      activeEnquiries: 'Demandes actives',
      unassignedActiveEnquiries: 'Actives non attribuées',
    });
    expect(getAdminCopy('ar').dashboard).toMatchObject({
      enquiryPipeline: 'مسار الطلبات',
      rollingThirtyDays: 'آخر 30 يومًا',
      enquiriesLast30Days: 'الطلبات المستلمة',
      programmeAttributedLast30Days: 'مرتبطة ببرنامج',
      activeEnquiries: 'الطلبات النشطة',
      unassignedActiveEnquiries: 'نشطة وغير مسندة',
    });
  });
});
