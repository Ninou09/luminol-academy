import { describe, expect, it } from 'vitest';

import {
  contentCalendarAccountRefSchema,
  contentCalendarAssetReferenceSchema,
  contentCalendarCaptionSchema,
  contentCalendarFormatSchema,
  contentCalendarLocalDateTimeSchema,
  contentCalendarPlatformSchema,
  contentCalendarStatusSchema,
  contentCalendarTitleSchema,
  ianaTimezoneSchema,
} from './content-calendar';

describe('content calendar validation', () => {
  it('accepts the bounded platform, format and lifecycle values', () => {
    expect(contentCalendarPlatformSchema.parse('INSTAGRAM')).toBe('INSTAGRAM');
    expect(contentCalendarPlatformSchema.parse('FACEBOOK')).toBe('FACEBOOK');
    expect(contentCalendarFormatSchema.parse('REEL')).toBe('REEL');
    expect(contentCalendarFormatSchema.parse('CAROUSEL')).toBe('CAROUSEL');
    expect(contentCalendarStatusSchema.parse('SCHEDULED')).toBe('SCHEDULED');
    expect(() => contentCalendarPlatformSchema.parse('TIKTOK')).toThrow();
    expect(() => contentCalendarStatusSchema.parse('PUBLISHED')).toThrow();
  });

  it('bounds operator-authored planning fields', () => {
    expect(contentCalendarTitleSchema.parse('  Launch reel  ')).toBe(
      'Launch reel',
    );
    expect(contentCalendarCaptionSchema.parse('  Caption  ')).toBe('Caption');
    expect(contentCalendarAccountRefSchema.parse('  luminol-main  ')).toBe(
      'luminol-main',
    );
    expect(contentCalendarAssetReferenceSchema.parse('  asset:123  ')).toBe(
      'asset:123',
    );
    expect(() => contentCalendarTitleSchema.parse('')).toThrow();
    expect(() =>
      contentCalendarCaptionSchema.parse('x'.repeat(5_001)),
    ).toThrow();
  });

  it('requires a valid IANA timezone and bounded local datetime syntax', () => {
    expect(ianaTimezoneSchema.parse('Africa/Algiers')).toBe('Africa/Algiers');
    expect(ianaTimezoneSchema.parse('Europe/Berlin')).toBe('Europe/Berlin');
    expect(() => ianaTimezoneSchema.parse('GMT+1-ish')).toThrow();
    expect(contentCalendarLocalDateTimeSchema.parse('2026-09-10T15:30')).toBe(
      '2026-09-10T15:30',
    );
    expect(() =>
      contentCalendarLocalDateTimeSchema.parse('2026-09-10 15:30'),
    ).toThrow();
  });
});
