import { afterEach, describe, expect, it, vi } from 'vitest';
import { getProgrammesForSchool, getSanityConfig } from './sanity';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('Sanity configuration', () => {
  it('disables CMS reads for missing and placeholder projects', () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'replace-me');
    expect(getSanityConfig()).toBeNull();
  });

  it('accepts a valid public project and dataset', () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');

    expect(getSanityConfig()).toEqual({
      projectId: 'abc123xy',
      dataset: 'production',
    });
  });
});

describe('getProgrammesForSchool', () => {
  it('returns null without calling the network when CMS is unconfigured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'placeholder');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(getProgrammesForSchool('psychology')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns validated published programmes with governed image data', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            result: [
              {
                _id: 'programme-1',
                title: 'Confident Communication',
                summary:
                  'A practical pathway for clear and confident communication.',
                slug: { current: 'confident-communication' },
                delivery: 'Hybrid',
                featured: true,
                image: {
                  url: 'https://cdn.sanity.io/images/abc123xy/production/programme.jpg',
                  alt: 'Learners practising confident communication together',
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(getProgrammesForSchool('languages')).resolves.toEqual([
      {
        _id: 'programme-1',
        title: 'Confident Communication',
        summary:
          'A practical pathway for clear and confident communication.',
        slug: { current: 'confident-communication' },
        delivery: 'Hybrid',
        featured: true,
        image: {
          url: 'https://cdn.sanity.io/images/abc123xy/production/programme.jpg',
          alt: 'Learners practising confident communication together',
        },
      },
    ]);
  });

  it('accepts published programmes without an image', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            result: [
              {
                _id: 'programme-2',
                title: 'Leadership Foundations',
                summary:
                  'A practical introduction to thoughtful leadership habits.',
                slug: { current: 'leadership-foundations' },
                delivery: 'In person',
                featured: false,
                image: null,
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(getProgrammesForSchool('training')).resolves.toEqual([
      {
        _id: 'programme-2',
        title: 'Leadership Foundations',
        summary: 'A practical introduction to thoughtful leadership habits.',
        slug: { current: 'leadership-foundations' },
        delivery: 'In person',
        featured: false,
        image: null,
      },
    ]);
  });

  it.each([
    {
      image: {
        url: 'https://example.com/programme.jpg',
        alt: 'Approved programme image',
      },
      caseName: 'an image outside the Sanity CDN',
    },
    {
      image: {
        url: 'https://cdn.sanity.io/images/abc123xy/production/programme.jpg',
        alt: '  ',
      },
      caseName: 'an image without meaningful alternative text',
    },
  ])('fails closed for $caseName', async ({ image }) => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            result: [
              {
                _id: 'programme-3',
                title: 'Stress Management',
                summary:
                  'Practical learning for recognising and managing everyday stress.',
                slug: { current: 'stress-management' },
                delivery: 'Flexible',
                featured: false,
                image,
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(getProgrammesForSchool('psychology')).resolves.toBeNull();
  });

  it('fails closed when CMS data does not match the public contract', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ result: [{ title: 42 }] }), {
          status: 200,
        }),
      ),
    );

    await expect(getProgrammesForSchool('training')).resolves.toBeNull();
  });
});
