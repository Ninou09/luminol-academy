import { z } from 'zod';

export const organizationJsonLdSchema = z.strictObject({
  '@context': z.literal('https://schema.org'),
  '@type': z.literal('EducationalOrganization'),
  '@id': z.url(),
  name: z.literal('Luminol Academy'),
  url: z.url(),
  telephone: z.string().min(1),
  email: z.email(),
  address: z.strictObject({
    '@type': z.literal('PostalAddress'),
    streetAddress: z.string().min(1),
    addressLocality: z.string().min(1),
    postalCode: z.string().min(1),
    addressCountry: z.literal('DZ'),
  }),
  geo: z.strictObject({
    '@type': z.literal('GeoCoordinates'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  hasMap: z.url(),
  sameAs: z.array(z.url()),
  openingHours: z.string().min(1),
  description: z.string().trim().min(1),
});
