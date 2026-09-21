import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  afterTasks,
  createEnquiry,
  dispatchEnquiryCommunications,
  getPublicProgrammeBySlug,
  scheduleAfter,
} = vi.hoisted(() => ({
  afterTasks: [] as Array<() => Promise<unknown> | unknown>,
  createEnquiry: vi.fn(),
  dispatchEnquiryCommunications: vi.fn(),
  getPublicProgrammeBySlug: vi.fn(),
  scheduleAfter: vi.fn((task: () => Promise<unknown> | unknown) => {
    afterTasks.push(task);
  }),
}));

vi.mock('@luminol/database', () => ({
  db: { enquiry: { create: createEnquiry } },
}));

vi.mock('../../../lib/programme-detail', () => ({
  getPublicProgrammeBySlug,
}));

vi.mock('../../../lib/enquiry-communications.server', () => ({
  dispatchEnquiryCommunications,
}));

vi.mock('next/server', () => ({ after: scheduleAfter }));

import { POST } from './route';

const validEnquiry = {
  name: 'Luminol Learner',
  email: 'learner@example.com',
  phone: '',
  city: 'Blida',
  preferredContact: 'EMAIL',
  deliveryPreference: 'FLEXIBLE',
  timingPreference: 'WITHIN_MONTH',
  school: 'PSYCHOLOGY',
  message: 'I would like help choosing the most suitable program.',
  locale: 'en',
  consent: true,
  website: '',
};

function createRequest(
  body: unknown,
  address = '203.0.113.10',
  headers: Record<string, string> = {},
) {
  return new Request('https://luminol.example/api/enquiries', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': address,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/enquiries', () => {
  beforeEach(() => {
    vi.stubEnv('VERCEL', '1');
    afterTasks.length = 0;
    createEnquiry.mockReset();
    createEnquiry.mockResolvedValue({ id: 'enquiry_1' });
    dispatchEnquiryCommunications.mockReset();
    dispatchEnquiryCommunications.mockResolvedValue({
      staffNotificationsQueued: 1,
      visitorAcknowledgement: 'sent',
      failures: 0,
    });
    getPublicProgrammeBySlug.mockReset();
    getPublicProgrammeBySlug.mockResolvedValue(null);
    scheduleAfter.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('stores a qualified same-origin enquiry without retaining request metadata', async () => {
    const response = await POST(
      createRequest(validEnquiry, '203.0.113.10', {
        'content-type': 'application/json; charset=utf-8',
        'sec-fetch-site': 'same-origin',
      }),
    );

    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('retry-after')).toBeNull();
    expect(createEnquiry).toHaveBeenCalledWith({
      data: {
        name: validEnquiry.name,
        email: validEnquiry.email,
        phone: null,
        city: validEnquiry.city,
        preferredContact: validEnquiry.preferredContact,
        deliveryPreference: validEnquiry.deliveryPreference,
        timingPreference: validEnquiry.timingPreference,
        school: validEnquiry.school,
        programmeSlug: null,
        programmeTitleSnapshot: null,
        landingPath: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmContent: null,
        message: validEnquiry.message,
        locale: validEnquiry.locale,
        consent: true,
      },
    });
    expect(scheduleAfter).toHaveBeenCalledOnce();
    await afterTasks[0]?.();
    expect(dispatchEnquiryCommunications).toHaveBeenCalledWith({
      id: 'enquiry_1',
      name: validEnquiry.name,
      email: validEnquiry.email,
      phone: null,
      preferredContact: validEnquiry.preferredContact,
      school: validEnquiry.school,
      programmeTitleSnapshot: null,
      locale: validEnquiry.locale,
      message: validEnquiry.message,
    });
  });

  it('persists phone-first enquiries without forcing an email address', async () => {
    const enquiry = {
      ...validEnquiry,
      email: '',
      preferredContact: 'WHATSAPP',
      phone: '+213 555 12 34 56',
    };

    const response = await POST(createRequest(enquiry, '203.0.113.24'));

    expect(response.status).toBe(201);
    expect(createEnquiry).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: '',
        phone: enquiry.phone,
        preferredContact: 'WHATSAPP',
      }),
    });
  });

  it('persists only submitted bounded campaign attribution fields', async () => {
    const campaignEnquiry = {
      ...validEnquiry,
      landingPath: '/fr/contact',
      utmSource: 'instagram',
      utmMedium: 'paid_social',
      utmCampaign: 'august-psychology',
      utmContent: 'reel-03',
    };

    const response = await POST(
      createRequest(campaignEnquiry, '203.0.113.23', {
        'sec-fetch-site': 'same-origin',
        referer:
          'https://example.invalid/private?email=private%40example.com&utm_term=ignored',
      }),
    );

    expect(response.status).toBe(201);
    expect(createEnquiry).toHaveBeenCalledWith({
      data: expect.objectContaining({
        landingPath: '/fr/contact',
        utmSource: 'instagram',
        utmMedium: 'paid_social',
        utmCampaign: 'august-psychology',
        utmContent: 'reel-03',
      }),
    });
    expect(createEnquiry).not.toHaveBeenCalledWith({
      data: expect.objectContaining({
        referer: expect.anything(),
        utmTerm: expect.anything(),
      }),
    });
  });

  it('keeps non-browser clients compatible when Fetch Metadata is absent', async () => {
    const response = await POST(createRequest(validEnquiry, '203.0.113.15'));

    expect(response.status).toBe(201);
    expect(createEnquiry).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported media types before persistence', async () => {
    const response = await POST(
      createRequest(validEnquiry, '203.0.113.16', {
        'content-type': 'text/plain',
      }),
    );

    expect(response.status).toBe(415);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(createEnquiry).not.toHaveBeenCalled();
  });

  it('rejects explicit cross-site browser submissions before persistence', async () => {
    const response = await POST(
      createRequest(validEnquiry, '203.0.113.17', {
        'sec-fetch-site': 'cross-site',
      }),
    );

    expect(response.status).toBe(403);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(createEnquiry).not.toHaveBeenCalled();
  });

  it('rejects invalid and honeypot submissions', async () => {
    const invalid = await POST(
      createRequest({ ...validEnquiry, consent: false }, '203.0.113.11'),
    );
    const honeypot = await POST(
      createRequest(
        { ...validEnquiry, website: 'https://spam.example' },
        '203.0.113.12',
      ),
    );

    expect(invalid.status).toBe(400);
    expect(honeypot.status).toBe(400);
    expect(invalid.headers.get('cache-control')).toBe('no-store');
    expect(honeypot.headers.get('cache-control')).toBe('no-store');
    expect(createEnquiry).not.toHaveBeenCalled();
  });

  it('rejects contact preferences without the required contact details', async () => {
    const missingPhone = await POST(
      createRequest(
        { ...validEnquiry, preferredContact: 'WHATSAPP', phone: '' },
        '203.0.113.19',
      ),
    );

    expect(missingPhone.status).toBe(400);
    expect(createEnquiry).not.toHaveBeenCalled();
  });

  it('stores a minimal enquiry with absent qualification fields as null', async () => {
    const response = await POST(
      createRequest(
        {
          name: 'Luminol Learner',
          phone: '0555 12 34 56',
          preferredContact: 'WHATSAPP',
          school: 'PSYCHOLOGY',
          locale: 'ar',
          consent: true,
        },
        '203.0.113.18',
      ),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ submitted: true });
    expect(createEnquiry).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: '',
        message: '',
        city: null,
        deliveryPreference: null,
        timingPreference: null,
        preferredContact: 'WHATSAPP',
        phone: '0555 12 34 56',
      }),
    });
  });

  it('persists a phone number when WhatsApp follow-up is requested', async () => {
    const enquiry = {
      ...validEnquiry,
      preferredContact: 'WHATSAPP',
      phone: '+213 555 12 34 56',
    };

    const response = await POST(createRequest(enquiry, '203.0.113.20'));

    expect(response.status).toBe(201);
    expect(createEnquiry).toHaveBeenCalledWith({
      data: expect.objectContaining({
        phone: enquiry.phone,
        preferredContact: 'WHATSAPP',
      }),
    });
  });

  it('persists only server-verified public programme context', async () => {
    getPublicProgrammeBySlug.mockResolvedValueOnce({
      title: 'Acceptance and Commitment Therapy',
      slug: { current: 'acceptance-commitment-therapy' },
    });

    const response = await POST(
      createRequest(
        {
          ...validEnquiry,
          programmeSlug: 'acceptance-commitment-therapy',
        },
        '203.0.113.21',
      ),
    );

    expect(response.status).toBe(201);
    expect(getPublicProgrammeBySlug).toHaveBeenCalledWith(
      'acceptance-commitment-therapy',
    );
    expect(createEnquiry).toHaveBeenCalledWith({
      data: expect.objectContaining({
        programmeSlug: 'acceptance-commitment-therapy',
        programmeTitleSnapshot: 'Acceptance and Commitment Therapy',
      }),
    });
  });

  it('keeps lead capture available when programme verification fails', async () => {
    getPublicProgrammeBySlug.mockResolvedValueOnce(null);

    const response = await POST(
      createRequest(
        { ...validEnquiry, programmeSlug: 'retired-programme' },
        '203.0.113.22',
      ),
    );

    expect(response.status).toBe(201);
    expect(createEnquiry).toHaveBeenCalledWith({
      data: expect.objectContaining({
        programmeSlug: null,
        programmeTitleSnapshot: null,
      }),
    });
  });

  it('returns a safe error when persistence fails', async () => {
    createEnquiry.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await POST(createRequest(validEnquiry, '203.0.113.13'));

    expect(response.status).toBe(500);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      error: 'We could not save your enquiry. Please try again.',
    });
  });

  it('keeps the saved lead successful when background scheduling is unavailable', async () => {
    scheduleAfter.mockImplementationOnce(() => {
      throw new Error('after unavailable');
    });
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const response = await POST(createRequest(validEnquiry, '203.0.113.25'));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ submitted: true });
    expect(createEnquiry).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(
      'Enquiry communication scheduling failed',
      { enquiryId: 'enquiry_1' },
    );
    consoleError.mockRestore();
  });

  it('limits repeated submissions from one trusted edge address and returns retry timing', async () => {
    const address = '203.0.113.14';
    const responses = [];
    for (let index = 0; index < 6; index += 1) {
      responses.push(await POST(createRequest(validEnquiry, address)));
    }

    const rateLimited = responses.at(-1);
    expect(rateLimited?.status).toBe(429);
    expect(rateLimited?.headers.get('cache-control')).toBe('no-store');

    const retryAfter = Number(rateLimited?.headers.get('retry-after'));
    expect(Number.isInteger(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(15 * 60);
    expect(createEnquiry).toHaveBeenCalledTimes(5);
  });
});
