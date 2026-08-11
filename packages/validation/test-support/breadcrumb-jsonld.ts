import { z } from 'zod';

const breadcrumbListItemSchema = z.strictObject({
  '@type': z.literal('ListItem'),
  position: z.number().int().positive(),
  name: z.string().trim().min(1),
  item: z.url(),
});

export const breadcrumbJsonLdSchema = z.strictObject({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('BreadcrumbList'),
  itemListElement: z.array(breadcrumbListItemSchema).min(1),
});
