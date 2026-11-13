import { describe, expect, it } from 'vitest';

import {
  consultationStartTimes,
  parseConsultationFeedback,
  resolveConsultationScope,
  safeOperationsReturnPath,
  shiftLocalDate,
} from './consultation-scope';

describe('consultation scope', () => {
  it('gives owners the full calendar and consultants their own', () => {
    expect(resolveConsultationScope(() => true)).toBe('all');
    expect(
      resolveConsultationScope(
        (permission) => permission === 'consultation:deliver',
      ),
    ).toBe('own');
    expect(
      resolveConsultationScope((permission) => permission === 'enquiry:work'),
    ).toBeNull();
  });

  it('offers start times from 08:00 to 16:30 in 15-minute steps', () => {
    const times = consultationStartTimes();
    expect(times[0]).toBe('08:00');
    expect(times.at(-1)).toBe('16:30');
    expect(times).toHaveLength(35);
  });

  it('accepts only known feedback codes', () => {
    expect(parseConsultationFeedback('overlap')).toBe('overlap');
    expect(parseConsultationFeedback('<script>')).toBeNull();
    expect(parseConsultationFeedback(['overlap'])).toBeNull();
  });

  it('shifts calendar dates across month ends', () => {
    expect(shiftLocalDate('2026-11-28', 7)).toBe('2026-12-05');
    expect(shiftLocalDate('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('consultation redirects', () => {
  it('keeps redirects inside the consultation workspaces', () => {
    expect(
      safeOperationsReturnPath(
        '/ar/consultations?date=2026-11-14',
        '/consultations',
      ),
    ).toBe('/ar/consultations?date=2026-11-14');
    expect(safeOperationsReturnPath('/clients?q=Sara', '/clients')).toBe(
      '/clients?q=Sara',
    );
    expect(
      safeOperationsReturnPath('/fr/office-payments?month=2026-11', '/clients'),
    ).toBe('/fr/office-payments?month=2026-11');
    expect(
      safeOperationsReturnPath('/ar/crm/leads/clx123_ab-9', '/clients'),
    ).toBe('/ar/crm/leads/clx123_ab-9');
    expect(
      safeOperationsReturnPath('/fr/crm/sections/languages', '/clients'),
    ).toBe('/fr/crm/sections/languages');
    expect(safeOperationsReturnPath('/ar/approvals', '/tasks')).toBe(
      '/ar/approvals',
    );
    expect(safeOperationsReturnPath('/crm/contacts/../team', '/clients')).toBe(
      '/clients',
    );
    for (const unsafe of [
      'https://evil.example/consultations',
      '//evil.example/consultations',
      '/team',
      '/office-paymentsx',
      '/consultations#x',
      null,
    ]) {
      expect(safeOperationsReturnPath(unsafe, '/consultations')).toBe(
        '/consultations',
      );
    }
  });
});
