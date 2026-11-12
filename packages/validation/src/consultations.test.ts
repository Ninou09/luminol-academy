import { describe, expect, it } from 'vitest';

import {
  checkConsultationSlot,
  consultationEndsAt,
  dinarsToMinor,
  getZonedParts,
  isConsultationTransitionAllowed,
  operationalNoteSchema,
  utcToZonedLocal,
  zonedDayRange,
  zonedLocalToUtc,
} from './consultations';

describe('consultation time zone conversion', () => {
  it('maps Blida wall-clock time to UTC (UTC+1, no DST)', () => {
    expect(zonedLocalToUtc('2026-11-14T10:00').toISOString()).toBe(
      '2026-11-14T09:00:00.000Z',
    );
    expect(zonedLocalToUtc('2026-07-14T10:00').toISOString()).toBe(
      '2026-07-14T09:00:00.000Z',
    );
    expect(utcToZonedLocal(new Date('2026-11-14T15:45:00.000Z'))).toBe(
      '2026-11-14T16:45',
    );
  });

  it('builds day ranges in the consultation zone', () => {
    const { start, end } = zonedDayRange('2026-11-14', 7);
    expect(start.toISOString()).toBe('2026-11-13T23:00:00.000Z');
    expect(end.toISOString()).toBe('2026-11-20T23:00:00.000Z');
  });

  it('rejects malformed local times', () => {
    expect(() => zonedLocalToUtc('2026-11-14 10:00')).toThrow();
    expect(() => zonedLocalToUtc('2026-02-30T10:00')).toThrow();
  });
});

describe('consultation slot rules', () => {
  const at = (local: string) => zonedLocalToUtc(local);

  it('accepts aligned slots inside 08:00–17:00 on open days', () => {
    expect(getZonedParts(at('2026-11-14T08:00')).weekday).toBe(6);
    expect(checkConsultationSlot(at('2026-11-14T08:00'), 60)).toBeNull();
    expect(checkConsultationSlot(at('2026-11-15T16:00'), 60)).toBeNull();
  });

  it('closes Friday', () => {
    expect(checkConsultationSlot(at('2026-11-13T10:00'), 60)).toBe(
      'closed-day',
    );
  });

  it('keeps sessions inside opening hours', () => {
    expect(checkConsultationSlot(at('2026-11-14T07:45'), 30)).toBe(
      'outside-hours',
    );
    expect(checkConsultationSlot(at('2026-11-14T16:30'), 45)).toBe(
      'outside-hours',
    );
  });

  it('requires 15-minute alignment and bounded durations', () => {
    expect(checkConsultationSlot(at('2026-11-14T10:10'), 60)).toBe(
      'misaligned',
    );
    expect(checkConsultationSlot(at('2026-11-14T10:00'), 50)).toBe(
      'invalid-duration',
    );
    expect(checkConsultationSlot(at('2026-11-14T10:00'), 180)).toBe(
      'invalid-duration',
    );
  });

  it('computes the end instant', () => {
    expect(consultationEndsAt(at('2026-11-14T10:00'), 45).toISOString()).toBe(
      '2026-11-14T09:45:00.000Z',
    );
  });
});

describe('consultation lifecycle and values', () => {
  it('allows only governed transitions', () => {
    expect(isConsultationTransitionAllowed('REQUESTED', 'CONFIRMED')).toBe(
      true,
    );
    expect(isConsultationTransitionAllowed('CONFIRMED', 'COMPLETED')).toBe(
      true,
    );
    expect(isConsultationTransitionAllowed('REQUESTED', 'COMPLETED')).toBe(
      false,
    );
    expect(isConsultationTransitionAllowed('CANCELLED', 'CONFIRMED')).toBe(
      false,
    );
  });

  it('stores dinars as minor units and bounds notes', () => {
    expect(dinarsToMinor(3000)).toBe(300000);
    expect(() => dinarsToMinor(-1)).toThrow();
    expect(operationalNoteSchema.parse('   ')).toBeNull();
    expect(() => operationalNoteSchema.parse('x'.repeat(501))).toThrow();
  });
});
