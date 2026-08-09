import { describe, expect, it } from 'vitest';

import {
  filterPublicProgrammes,
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

  it('ranks featured programmes first and stays deterministic', () => {
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
