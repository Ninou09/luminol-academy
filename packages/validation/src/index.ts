import { z } from 'zod';
export const localeSchema = z.enum(['ar', 'en', 'fr']);
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  message: z.string().trim().min(10).max(2_000),
});
export type ContactInput = z.infer<typeof contactSchema>;
