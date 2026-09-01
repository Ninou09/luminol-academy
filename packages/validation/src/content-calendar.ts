import { z } from 'zod';

export const contentCalendarPlatformSchema = z.enum(['INSTAGRAM', 'FACEBOOK']);

export const contentCalendarFormatSchema = z.enum([
  'REEL',
  'CAROUSEL',
  'STATIC_POST',
  'STORY',
  'OTHER',
]);

export const contentCalendarStatusSchema = z.enum([
  'DRAFT',
  'READY',
  'SCHEDULED',
  'ARCHIVED',
]);

export const contentCalendarTitleSchema = z.string().trim().min(1).max(160);
export const contentCalendarCaptionSchema = z.string().trim().min(1).max(5_000);
export const contentCalendarAccountRefSchema = z
  .string()
  .trim()
  .min(1)
  .max(255);
export const contentCalendarAssetReferenceSchema = z
  .string()
  .trim()
  .min(1)
  .max(1_000);

export const ianaTimezoneSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date(0));
      return true;
    } catch {
      return false;
    }
  }, 'Invalid IANA timezone');

export const contentCalendarLocalDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

export type ContentCalendarPlatform = z.infer<
  typeof contentCalendarPlatformSchema
>;
export type ContentCalendarFormat = z.infer<typeof contentCalendarFormatSchema>;
export type ContentCalendarStatus = z.infer<typeof contentCalendarStatusSchema>;
