import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildSanityProgrammeImageUrl,
  getProgrammesForSchool,
  getSanityConfig,
} from './sanity';

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

describe('buildSanityProgrammeImageUrl', () => {
  it('builds a centered card crop when no editor crop or hotspot exists', () => {
    const url = new URL(
      buildSanityProgrammeImageUrl({
        url: 'https://cdn.sanity.io/images/abc123xy/production/programme-1600x1200.jpg',
        alt: 'Learners taking part in a programme',
        crop: null,
        hotspot: null,
        dimensions: { width: 1600, height: 1200 },
      }),
    );

    expect(url.searchParams.get('rect')).toBe('0,150,1600,900');
    expect(url.searchParams.get('w')).toBe('1200');
    expect(url.searchParams.get('h')).toBe('675');
    expect(url.searchParams.get('fit')).toBe('crop');
    expect(url.searchParams.get('auto')).toBe('format');
  });

  it('preserves the editor crop and keeps the hotspot in frame', () => {
    const url = new URL(
      buildSanityProgrammeImageUrl({
        url: 'https://cdn.sanity.io/images/abc123xy/production/programme-2000x1000.jpg',
        alt: 'Facilitator leading a professional workshop',
        crop: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1 },
        hotspot: { x: 0.8, y: 0.5, width: 0.1, height: 0.2 },
        dimensions: { width: 2000, height: 1000 },
      }),
    );

    expect(url.searchParams.get('rect')).toBe('378,100,1422,800');
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
                  url: 'https://cdn.sanity.io/images/abc123xy/production/programme-2000x1000.jpg',
                  alt: 'Learners practising confident communication together',
                  crop: {
                    top: 0.1,
                    bottom: 0.1,
                    left: 0.1,
                    right: 0.1,
                  },
                  hotspot: {
                    x: 0.8,
                    y: 0.5,
                    width: 0.1,
                    height: 0.2,
                  },
                  dimensions: {
                    width: 2000,
                    height: 1000,
                    aspectRatio: 2,
                  },
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
          url: 'https://cdn.sanity.io/images/abc123xy/production/programme-2000x1000.jpg',
          alt: 'Learners practising confident communication together',
          crop: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1 },
          hotspot: { x: 0.8, y: 0.5, width: 0.1, height: 0.2 },
          dimensions: { width: 2000, height: 1000 },
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
        crop: null,
        hotspot: null,
        dimensions: { width: 1200, height: 675 },
      },
      caseName: 'an image outside the Sanity CDN',
    },
    {
      image: {
        url: 'https://cdn.sanity.io/images/abc123xy/production/programme-1200x675.jpg',
        alt: '  ',
        crop: null,
        hotspot: null,
        dimensions: { width: 1200, height: 675 },
      },
      caseName: 'an image without meaningful alternative text',
    },
    {
      image: {
        url: 'https://cdn.sanity.io/images/abc123xy/production/programme-1200x675.jpg',
        alt: 'Approved programme image',
        crop: { top: 0, bottom: 0, left: 0.6, right: 0.4 },
        hotspot: null,
        dimensions: { width: 1200, height: 675 },
      },
      caseName: 'a crop that removes the full image width',
    },
    {
      image: {
        url: 'https://cdn.sanity.io/images/abc123xy/production/programme-100x100.jpg',
        alt: 'Approved programme image',
        crop: { top: 0, bottom: 0, left: 0.001, right: 0.988 },
        hotspot: null,
        dimensions: { width: 100, height: 100 },
      },
      caseName: 'a fractional crop that rounds to an empty pixel rectangle',
    },
    {
      image: {
        url: 'https://cdn.sanity.io/images/abc123xy/production/programme-1200x675.jpg',
        alt: 'Approved programme image',
        crop: null,
        hotspot: null,
        dimensions: { width: 0, height: 675 },
      },
      caseName: 'invalid source dimensions',
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
