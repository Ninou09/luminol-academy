import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createEnquiry } = vi.hoisted(() => ({
  createEnquiry: vi.fn(),
}));

vi.mock('@luminol/database', () => ({
  db: { enquiry: { create: createEnquiry } },
}));

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
    createEnquiry.mockReset();
    createEnquiry.mockResolvedValue({ id: 'enquiry_1' });
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
        message: validEnquiry.message,
        locale: validEnquiry.locale,
        consent: true,
      },
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

  it('rejects missing qualification fields and contact preferences that require a phone', async () => {
    const missingCity = await POST(
      createRequest({ ...validEnquiry, city: '' }, '203.0.113.18'),
    );
    const missingPhone = await POST(
      createRequest(
        { ...validEnquiry, preferredContact: 'WHATSAPP', phone: '' },
        '203.0.113.19',
      ),
    );

    expect(missingCity.status).toBe(400);
    expect(missingPhone.status).toBe(400);
    expect(createEnquiry).not.toHaveBeenCalled();
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

  it('returns a safe error when persistence fails', async () => {
    createEnquiry.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await POST(createRequest(validEnquiry, '203.0.113.13'));

    expect(response.status).toBe(500);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      error: 'We could not save your enquiry. Please try again.',
    });
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
