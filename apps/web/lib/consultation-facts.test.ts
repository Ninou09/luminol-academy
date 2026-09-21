import { describe, expect, it } from 'vitest';

import { getConsultationFacts } from './consultation-facts';

describe('approved consultation facts', () => {
  it('localizes the approved 3,000 DZD price, duration, and availability boundary', () => {
    for (const locale of ['ar', 'fr', 'en'] as const) {
      const facts = getConsultationFacts(locale);
      expect(facts.price).toContain('3');
      expect(facts.duration).toMatch(/45|٤٥/);
      expect(facts.duration).toMatch(/60|٦٠/);
      expect(facts.availability.length).toBeGreaterThan(20);
    }
  });
});
