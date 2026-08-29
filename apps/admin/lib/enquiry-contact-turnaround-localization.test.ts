import { describe, expect, it } from 'vitest';

import { getEnquiryContactTurnaroundCopy } from './enquiry-contact-turnaround-localization';

describe('enquiry contact turnaround localization', () => {
  it('keeps the metric explicitly operational in English', () => {
    const copy = getEnquiryContactTurnaroundCopy('en');

    expect(copy.title).toBe('30-day enquiry first-contact turnaround');
    expect(copy.intro).toContain('earliest recorded status transition');
    expect(copy.intro).toContain('does not prove message delivery');
    expect(copy.bucketsTitle).toBe('Recorded-contact turnaround buckets');
  });

  it('provides French labels and guardrail copy', () => {
    const copy = getEnquiryContactTurnaroundCopy('fr');

    expect(copy.title).toBe('Délai du premier contact sur 30 jours');
    expect(copy.intro).toContain('première transition de statut enregistrée');
    expect(copy.noMedian).toBe('Aucun contact enregistré');
  });

  it('provides Arabic labels and guardrail copy', () => {
    const copy = getEnquiryContactTurnaroundCopy('ar');

    expect(copy.title).toBe('زمن تسجيل أول تواصل خلال 30 يومًا');
    expect(copy.intro).toContain('أول انتقال حالة مسجل');
    expect(copy.uncontacted).toBe('لا يوجد حدث «تم التواصل» بعد');
  });

  it('formats localized duration units', () => {
    expect(getEnquiryContactTurnaroundCopy('en').minutes('45')).toBe('45 min');
    expect(getEnquiryContactTurnaroundCopy('fr').hours('2,5')).toBe('2,5 h');
    expect(getEnquiryContactTurnaroundCopy('ar').minutes('٤٥')).toBe(
      '٤٥ دقيقة',
    );
  });
});
