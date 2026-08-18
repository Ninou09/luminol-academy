import { describe, expect, it } from 'vitest';

import {
  filterPublicProgrammes,
  hasProgrammeDiscoveryFilters,
  parseProgrammeDiscoveryParams,
} from './programme-discovery';
import type { PublicCmsProgramme } from './sanity';

const programmes: PublicCmsProgramme[] = [
  {
    _id: 'programme-english',
    title: 'English Conversation',
    summary: 'Build confidence for practical everyday conversations.',
    slug: { current: 'english-conversation' },
    school: 'languages',
    languages: ['en'],
    delivery: 'Hybrid',
    featured: true,
    image: null,
  },
  {
    _id: 'programme-stress',
    title: 'إدارة الضغط',
    summary: 'برنامج عملي لفهم الضغط وبناء عادات يومية أكثر توازناً.',
    slug: { current: 'stress-management' },
    school: 'psychology',
    languages: ['ar', 'fr'],
    delivery: 'In person',
    featured: false,
    image: null,
  },
  {
    _id: 'programme-leadership',
    title: 'Leadership Foundations',
    summary: 'Practical leadership habits for managers and team leads.',
    slug: { current: 'leadership-foundations' },
    school: 'training',
    languages: ['en', 'fr'],
    delivery: 'Flexible',
    featured: false,
    image: null,
  },
];

describe('programme discovery filters', () => {
  it('validates and bounds URL-owned filters', () => {
    expect(
      parseProgrammeDiscoveryParams({
        q: '  leadership  ',
        school: 'training',
        language: 'fr',
      }),
    ).toEqual({ query: 'leadership', school: 'training', language: 'fr' });

    expect(
      parseProgrammeDiscoveryParams({
        q: ['one', 'two'],
        school: 'unknown',
        language: 'de',
      }),
    ).toEqual({ query: '' });
  });

  it('distinguishes canonical catalogue views from valid filtered variants', () => {
    expect(hasProgrammeDiscoveryFilters({ query: '' })).toBe(false);
    expect(hasProgrammeDiscoveryFilters({ query: 'leadership' })).toBe(true);
    expect(
      hasProgrammeDiscoveryFilters({ query: '', school: 'psychology' }),
    ).toBe(true);
    expect(hasProgrammeDiscoveryFilters({ query: '', language: 'fr' })).toBe(
      true,
    );

    expect(
      hasProgrammeDiscoveryFilters(
        parseProgrammeDiscoveryParams({
          q: ['one', 'two'],
          school: 'unknown',
          language: 'de',
        }),
      ),
    ).toBe(false);
  });

  it('filters by school and delivery language', () => {
    expect(
      filterPublicProgrammes(programmes, {
        query: '',
        school: 'training',
        language: 'fr',
      }).map((programme) => programme._id),
    ).toEqual(['programme-leadership']);
  });

  it('supports normalized Arabic programme search', () => {
    expect(
      filterPublicProgrammes(programmes, { query: 'ادارة الضغط' })[0]?._id,
    ).toBe('programme-stress');
  });

  it('matches school and language concepts across interface languages', () => {
    expect(
      filterPublicProgrammes(programmes, { query: 'التكوين المهني' })[0]?._id,
    ).toBe('programme-leadership');

    const frenchResults = filterPublicProgrammes(programmes, {
      query: 'Francais',
    }).map((programme) => programme._id);

    expect(frenchResults).toHaveLength(2);
    expect(frenchResults).toEqual(
      expect.arrayContaining(['programme-leadership', 'programme-stress']),
    );
  });

  it('ranks stronger search matches ahead of featured status', () => {
    const searchableProgrammes = programmes.map((programme) =>
      programme._id === 'programme-english'
        ? {
            ...programme,
            summary:
              'A broad overview of leadership vocabulary for English learners.',
          }
        : programme,
    );

    expect(
      filterPublicProgrammes(searchableProgrammes, {
        query: 'leadership',
      }).map((programme) => programme._id),
    ).toEqual(['programme-leadership', 'programme-english']);
  });

  it('uses featured status to break equal search relevance ties', () => {
    const tiedProgrammes = programmes.map((programme) => {
      if (programme._id === 'programme-english') {
        return {
          ...programme,
          summary: 'Communication practice for everyday English learners.',
        };
      }

      if (programme._id === 'programme-leadership') {
        return {
          ...programme,
          summary: 'Communication practice for managers and team leads.',
        };
      }

      return programme;
    });

    expect(
      filterPublicProgrammes(tiedProgrammes, {
        query: 'communication',
      }).map((programme) => programme._id),
    ).toEqual(['programme-english', 'programme-leadership']);
  });

  it('ranks featured programmes first and stays deterministic without search', () => {
    expect(
      filterPublicProgrammes(programmes, { query: '' }).map(
        (programme) => programme._id,
      ),
    ).toEqual([
      'programme-english',
      'programme-leadership',
      'programme-stress',
    ]);
  });
});
