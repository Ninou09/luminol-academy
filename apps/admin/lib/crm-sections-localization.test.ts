import {
  crmOfferKinds,
  crmOfferStatuses,
  crmQuickLeadSources,
  crmSections,
  crmStageKeys,
} from '@luminol/validation/crm-sections';
import { describe, expect, it } from 'vitest';

import { getCrmSectionsCopy } from './crm-sections-localization';

describe('CRM sections localization', () => {
  it.each(['en', 'fr', 'ar'] as const)('is complete in %s', (locale) => {
    const copy = getCrmSectionsCopy(locale);
    for (const section of crmSections) {
      expect(copy.section[section]).toBeTruthy();
    }
    for (const stage of crmStageKeys) {
      expect(copy.stage[stage]).toBeTruthy();
    }
    for (const kind of crmOfferKinds) {
      expect(copy.offerKind[kind]).toBeTruthy();
    }
    for (const status of crmOfferStatuses) {
      expect(copy.offerStatus[status]).toBeTruthy();
    }
    for (const source of crmQuickLeadSources) {
      expect(copy.quickSourceLabel[source]).toBeTruthy();
    }
    for (const value of Object.values(copy.board)) {
      expect(value).toBeTruthy();
    }
    expect(copy.dealMoved('S', 'A', 'B')).toContain('B');
    expect(copy.limited('300')).toContain('300');
    expect(copy.offerDeals('4')).toContain('4');
  });
});
