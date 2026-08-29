import { describe, expect, it } from 'vitest';

import { getAdminCopy } from './admin-localization';
import {
  getProgrammeAttributedRecentEnquiryWhere,
  getRecentEnquiryWhere,
  getThirtyDayEnquiryStart,
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
