import { z } from 'zod';

export const localeSchema = z.enum(['ar', 'en', 'fr']);
export const enquirySchoolSchema = z.enum([
  'PSYCHOLOGY',
  'LANGUAGES',
  'TRAINING',
  'GENERAL',
]);
export const enquiryContactPreferenceSchema = z.enum([
  'EMAIL',
  'PHONE',
  'WHATSAPP',
]);
export const enquiryDeliveryPreferenceSchema = z.enum([
  'IN_PERSON',
  'ONLINE',
  'FLEXIBLE',
  'NOT_SURE',
]);
export const enquiryTimingPreferenceSchema = z.enum([
  'SOON',
  'WITHIN_MONTH',
  'LATER',
  'NOT_SURE',
]);
export const publicProgrammeSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email().max(254),
    phone: z.string().trim().max(30).optional(),
    city: z.string().trim().min(2).max(120),
    preferredContact: enquiryContactPreferenceSchema,
    deliveryPreference: enquiryDeliveryPreferenceSchema,
    timingPreference: enquiryTimingPreferenceSchema,
    school: enquirySchoolSchema,
    programmeSlug: publicProgrammeSlugSchema.optional(),
    message: z.string().trim().min(10).max(2_000),
    locale: localeSchema.default('en'),
    consent: z.literal(true),
    website: z.string().max(0).optional(),
  })
  .superRefine((data, context) => {
    if (
      (data.preferredContact === 'PHONE' ||
        data.preferredContact === 'WHATSAPP') &&
      !data.phone?.trim()
    ) {
      context.addIssue({
        code: 'custom',
        message: 'A phone number is required for the selected contact method.',
        path: ['phone'],
      });
    }
  });

export type ContactInput = z.infer<typeof contactSchema>;
