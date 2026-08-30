import { describe, expect, it } from 'vitest';

import { getUnrecordedContactAgeCopy } from './enquiry-unrecorded-contact-age-localization';

describe('getUnrecordedContactAgeCopy', () => {
  it('provides English copy and raw-count formatting', () => {
    const copy = getUnrecordedContactAgeCopy('en');
    expect(copy.title).toBe('No recorded contact age');
    expect(copy.count('5')).toBe('5 enquiries without recorded contact');
  });

  it('provides French copy and raw-count formatting', () => {
    const copy = getUnrecordedContactAgeCopy('fr');
    expect(copy.title).toBe('Âge des demandes sans contact enregistré');
    expect(copy.count('5')).toBe('5 demandes sans contact enregistré');
  });

  it('provides Arabic copy and raw-count formatting', () => {
    const copy = getUnrecordedContactAgeCopy('ar');
    expect(copy.title).toBe('عمر الطلبات دون اتصال مسجل');
    expect(copy.count('5')).toBe('5 طلبات دون اتصال مسجل');
  });
});
