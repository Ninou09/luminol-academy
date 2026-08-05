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
  school: 'PSYCHOLOGY',
  message: 'I would like help choosing the most suitable program.',
  locale: 'en',
  consent: true,
  website: '',
};

function createRequest(body: unknown, address = '203.0.113.10') {
  return new Request('https://luminol.example/api/enquiries', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': address,
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

  it('stores a valid enquiry without retaining request metadata', async () => {
    const response = await POST(createRequest(validEnquiry));

    expect(response.status).toBe(201);
    expect(createEnquiry).toHaveBeenCalledWith({
      data: {
        name: validEnquiry.name,
        email: validEnquiry.email,
        phone: null,
        school: validEnquiry.school,
        message: validEnquiry.message,
        locale: validEnquiry.locale,
        consent: true,
      },
    });
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
    expect(createEnquiry).not.toHaveBeenCalled();
  });

  it('returns a safe error when persistence fails', async () => {
    createEnquiry.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await POST(createRequest(validEnquiry, '203.0.113.13'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'We could not save your enquiry. Please try again.',
    });
  });

  it('limits repeated submissions from one trusted edge address', async () => {
    const address = '203.0.113.14';
    const responses = [];
    for (let index = 0; index < 6; index += 1) {
      responses.push(await POST(createRequest(validEnquiry, address)));
    }

    expect(responses.at(-1)?.status).toBe(429);
    expect(createEnquiry).toHaveBeenCalledTimes(5);
  });
});
