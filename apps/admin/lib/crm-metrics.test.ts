import { describe, expect, it } from 'vitest';

import {
  groupConversion,
  leadSourceKey,
  median,
  parseCrmDashboardPeriod,
  percent,
} from './crm-metrics';

describe('CRM metrics', () => {
  it('computes medians and percentages safely', () => {
    expect(median([])).toBeNull();
    expect(median([5, 1, 3])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(percent(1, 3)).toBe(33);
    expect(percent(1, 0)).toBeNull();
  });

  it('groups conversion by key, largest first', () => {
    const leads = [
      { source: 'facebook', won: true },
      { source: 'facebook', won: false },
      { source: 'instagram', won: true },
    ];
    expect(
      groupConversion(
        leads,
        ({ source }) => source,
        ({ won }) => won,
      ),
    ).toEqual([
      { key: 'facebook', total: 2, converted: 1, rate: 50 },
      { key: 'instagram', total: 1, converted: 1, rate: 100 },
    ]);
  });

  it('normalizes sources and periods', () => {
    expect(leadSourceKey({ utmSource: ' Facebook ', source: 'web' })).toBe(
      'facebook',
    );
    expect(leadSourceKey({ utmSource: null, source: null })).toBe('direct');
    expect(parseCrmDashboardPeriod('90')).toBe(90);
    expect(parseCrmDashboardPeriod('365')).toBe(30);
  });
});
