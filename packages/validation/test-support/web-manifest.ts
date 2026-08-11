import { z } from 'zod';

const manifestIconSchema = z.strictObject({
  src: z.string().startsWith('/'),
  sizes: z.string().min(1),
  type: z.string().min(1),
});

export const webManifestSchema = z.strictObject({
  name: z.literal('Luminol Academy'),
  short_name: z.literal('Luminol'),
  description: z.string().trim().min(1),
  start_url: z.literal('/'),
  display: z.literal('standalone'),
  background_color: z.string().min(1),
  theme_color: z.string().min(1),
  icons: z.array(manifestIconSchema).min(1),
});
