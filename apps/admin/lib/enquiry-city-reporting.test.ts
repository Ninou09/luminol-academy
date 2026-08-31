import { describe, expect, it } from 'vitest';

import {
  MAX_ENQUIRY_CITY_ITEMS,
  normalizeEnquiryCityMix,
} from './enquiry-city-reporting';

describe('enquiry city reporting', () => {
  it('keeps exact recorded city labels, sorts by count and reports coverage', () => {
    expect(
      normalizeEnquiryCityMix(
        [
          { city: 'Blida', _count: { _all: 5 } },
          { city: 'Alger', _count: { _all: 7 } },
          { city: null, _count: { _all: 2 } },
          { city: 'البليدة', _count: { _all: 3 } },
        ],
        17,
        15,
      ),
    ).toEqual({
      total: 17,
      recorded: 15,
      missing: 2,
      items: [
        { city: 'Alger', count: 7 },
        { city: 'Blida', count: 5 },
        { city: 'البليدة', count: 3 },
      ],
    });
  });

  it('does not merge spelling or language variants', () => {
    const summary = normalizeEnquiryCityMix(
      [
        { city: 'Blida', _count: { _all: 2 } },
        { city: 'blida', _count: { _all: 1 } },
      ],
      3,
      3,
    );

    expect(summary.items).toHaveLength(2);
    expect(summary.items.map((item) => item.city)).toEqual(['Blida', 'blida']);
  });

  it('bounds the visible list and clamps invalid counts', () => {
    const groups = Array.from({ length: MAX_ENQUIRY_CITY_ITEMS + 3 }, (_, index) => ({
      city: `City ${index}`,
      _count: { _all: MAX_ENQUIRY_CITY_ITEMS + 3 - index },
    }));

    const summary = normalizeEnquiryCityMix(groups, Number.NaN, 99);
    expect(summary.total).toBe(0);
    expect(summary.recorded).toBe(0);
    expect(summary.missing).toBe(0);
    expect(summary.items).toHaveLength(MAX_ENQUIRY_CITY_ITEMS);
  });
});
