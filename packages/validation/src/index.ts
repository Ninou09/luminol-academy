import { z } from 'zod';

export const localeSchema = z.enum(['ar', 'en', 'fr']);
export const enquirySchoolSchema = z.enum([
  'PSYCHOLOGY',
  'LANGUAGES',
  'TRAINING',
  'GENERAL',
]);

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z.string().trim().max(30).optional(),
  school: enquirySchoolSchema,
  message: z.string().trim().min(10).max(2_000),
  locale: localeSchema.default('en'),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
