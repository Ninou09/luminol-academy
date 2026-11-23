import { describe, expect, it } from 'vitest';

import { answerFromSite, normaliseQuestion } from './assistant-offline';

describe('assistant answers from site facts', () => {
  it('answers opening hours in English, French, Arabic and Darja', () => {
    expect(answerFromSite('What are your opening hours?', 'en')).toContain(
      'closed on Friday',
    );
    expect(answerFromSite('Quels sont vos horaires ?', 'fr')).toContain(
      'vendredi',
    );
    expect(answerFromSite('ما هي أوقات العمل؟', 'ar')).toContain('الجمعة');
    expect(answerFromSite('waqtach tfat7o?', 'ar')).toContain('الجمعة');
  });

  it('never states an amount for fees', () => {
    for (const [question, locale] of [
      ['need prices', 'en'],
      ['combien coûte une consultation ?', 'fr'],
      ['شحال السومة تاع الدورة؟', 'ar'],
    ] as const) {
      const answer = answerFromSite(question, locale);
      expect(answer).not.toMatch(/\d{3,}\s?(da|dzd|دج|dinar)/i);
      expect(answer).toContain('+213 553 14 02 93');
    }
  });

  it('lists the psychology courses with their 18-hour format', () => {
    const answer = answerFromSite('Which courses do you offer?', 'en');
    expect(answer).toContain('Schema therapy');
    expect(answer).toContain('18 hours');
  });

  it('does not confuse contact with the ACT course', () => {
    const answer = answerFromSite('how can I contact you', 'en');
    expect(answer).toContain('WhatsApp');
    expect(answer).not.toContain('18 hours');
  });

  it('gives the address and the consultations offer in Arabic', () => {
    expect(answerFromSite('وين راكم؟ العنوان', 'ar')).toContain('البليدة');
    expect(answerFromSite('أريد استشارة زوجية', 'ar')).toContain('زوجية');
  });

  it('falls back to a helpful overview for unknown questions', () => {
    expect(answerFromSite('qwerty', 'fr')).toContain('Je peux répondre');
  });

  it('normalises accents and Arabic diacritics', () => {
    expect(normaliseQuestion('Éducation')).toBe('education');
    expect(normaliseQuestion('الدَّورة')).toBe('الدوره');
  });
});
