import { z } from 'zod';

export const organizationJsonLdSchema = z.strictObject({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('EducationalOrganization'),
  '@id': z.url(),
  name: z.literal('Luminol Academy'),
  url: z.url(),
  description: z.string().trim().min(1),
});
