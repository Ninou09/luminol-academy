import { describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;

suite('enquiry qualification persistence', () => {
  test('persists structured routing preferences without affecting legacy nullable fields', async () => {
    const enquiry = await db.enquiry.create({
      data: {
        id: `enquiry-qualification-${suffix}`,
        name: `Qualification Test ${suffix}`,
        email: `enquiry-qualification-${suffix}@example.test`,
        phone: '+213 555 12 34 56',
        city: 'Blida',
        preferredContact: 'WHATSAPP',
        deliveryPreference: 'FLEXIBLE',
        timingPreference: 'WITHIN_MONTH',
        school: 'PSYCHOLOGY',
        message: 'Please help me choose the appropriate enquiry pathway.',
        consent: true,
      },
      select: {
        city: true,
        preferredContact: true,
        deliveryPreference: true,
        timingPreference: true,
      },
    });

    expect(enquiry).toEqual({
      city: 'Blida',
      preferredContact: 'WHATSAPP',
      deliveryPreference: 'FLEXIBLE',
      timingPreference: 'WITHIN_MONTH',
    });

    const legacyCompatible = await db.enquiry.create({
      data: {
        id: `enquiry-qualification-legacy-${suffix}`,
        name: `Legacy Qualification Test ${suffix}`,
        email: `enquiry-qualification-legacy-${suffix}@example.test`,
        school: 'GENERAL',
        message:
          'This row verifies the new qualification fields remain nullable.',
        consent: true,
      },
      select: {
        city: true,
        preferredContact: true,
        deliveryPreference: true,
        timingPreference: true,
      },
    });

    expect(legacyCompatible).toEqual({
      city: null,
      preferredContact: null,
      deliveryPreference: null,
      timingPreference: null,
    });
  });
});
