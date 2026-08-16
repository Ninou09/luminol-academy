import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPublicProgrammeBySlug } from './programme-detail';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('getPublicProgrammeBySlug', () => {
  it('rejects unsafe slugs without calling Sanity', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(getPublicProgrammeBySlug('../draft')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns validated published detail content and approved media', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubEnv('NEXT_PUBLIC_SANITY_DATASET', 'production');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: {
            _id: 'programme-act',
            title: 'العلاج بالتقبل والالتزام ACT',
            summary:
              'دورة تدريبية متخصصة في العلاج بالتقبل والالتزام ACT، تقدم مدخلًا إلى مبادئ هذا التوجه وتطبيقاته العملية.',
            slug: { current: 'acceptance-commitment-therapy-act' },
            school: 'psychology',
            languages: ['ar'],
            delivery: 'Hybrid',
            featured: false,
            bodyText:
              'تقدم هذه الدورة مدخلًا تطبيقيًا إلى العلاج بالتقبل والالتزام.\nتركز الدورة على تنمية المرونة النفسية.',
            outcomes: [
              'فهم المبادئ الأساسية للعلاج بالتقبل والالتزام ACT',
              'التعرف على مفهوم المرونة النفسية',
            ],
            audience: ['الأخصائيون والأخصائيات النفسيون'],
            image: {
              url: 'https://cdn.sanity.io/images/abc123xy/production/act-1060x1484.png',
              alt: 'ملصق دورة العلاج بالتقبل والالتزام ACT',
              crop: null,
              hotspot: null,
              dimensions: { width: 1060, height: 1484 },
            },
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getPublicProgrammeBySlug(
      'acceptance-commitment-therapy-act',
    );

    expect(result).toMatchObject({
      _id: 'programme-act',
      school: 'psychology',
      languages: ['ar'],
      outcomes: [
        'فهم المبادئ الأساسية للعلاج بالتقبل والالتزام ACT',
        'التعرف على مفهوم المرونة النفسية',
      ],
      audience: ['الأخصائيون والأخصائيات النفسيون'],
      image: {
        url: 'https://cdn.sanity.io/images/abc123xy/production/act-1060x1484.png',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.hostname).toBe('abc123xy.api.sanity.io');
    expect(requestedUrl.pathname).toContain('/data/query/production');
    expect(requestedUrl.searchParams.get('$slug')).toBe(
      '"acceptance-commitment-therapy-act"',
    );

    const query = requestedUrl.searchParams.get('query') ?? '';
    expect(query).toContain('active == true');
    expect(query).toContain('!(_id in path("drafts.**"))');
    expect(query).toContain('image.publicationApproved');
    expect(query).toContain('pt::text(body)');
  });

  it('fails closed when the CMS payload is malformed', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'abc123xy');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            result: {
              _id: 'programme-bad',
              title: 'Bad programme',
              summary: 'This record has an invalid public school value.',
              slug: { current: 'bad-programme' },
              school: 'private-school',
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(getPublicProgrammeBySlug('bad-programme')).resolves.toBeNull();
  });
});
