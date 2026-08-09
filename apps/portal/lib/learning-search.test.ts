import { describe, expect, it } from 'vitest';

import {
  LEARNING_SEARCH_MAX_QUERY_LENGTH,
  normalizeLearningSearchQuery,
  parseLearningSearchParam,
  rankLearningSearchResults,
  type LearningSearchCandidate,
} from './learning-search';

const candidates: LearningSearchCandidate[] = [
  {
    kind: 'programme',
    courseSlug: 'english-b1',
    courseTitle: 'English B1',
    title: 'English B1',
  },
  {
    kind: 'module',
    courseSlug: 'english-b1',
    courseTitle: 'English B1',
    title: 'Confident conversations',
    body: 'Build practical speaking habits for everyday situations.',
    moduleTitle: 'Confident conversations',
  },
  {
    kind: 'lesson',
    courseSlug: 'english-b1',
    courseTitle: 'English B1',
    title: 'Job interview vocabulary',
    body: 'Prepare useful vocabulary for professional interviews.',
    moduleTitle: 'Professional communication',
    lessonSlug: 'job-interview-vocabulary',
  },
  {
    kind: 'lesson',
    courseSlug: 'psychology-foundations',
    courseTitle: 'Psychology Foundations',
    title: 'Understanding stress',
    body: 'Practical ways to recognise common stress responses.',
    moduleTitle: 'Self-awareness',
    lessonSlug: 'understanding-stress',
  },
];

describe('learner search', () => {
  it('validates URL-owned search parameters', () => {
    expect(parseLearningSearchParam('job interview')).toBe('job interview');
    expect(parseLearningSearchParam(['stress'])).toBe('stress');
    expect(parseLearningSearchParam(['one', 'two'])).toBeUndefined();
    expect(parseLearningSearchParam(42)).toBeUndefined();
    expect(
      parseLearningSearchParam(
        'x'.repeat(LEARNING_SEARCH_MAX_QUERY_LENGTH + 1),
      ),
    ).toBeUndefined();
  });

  it('normalizes whitespace and bounds query length', () => {
    expect(normalizeLearningSearchQuery('  job   interview  ')).toBe(
      'job interview',
    );
    expect(normalizeLearningSearchQuery('x'.repeat(300))).toHaveLength(
      LEARNING_SEARCH_MAX_QUERY_LENGTH,
    );
  });

  it('ranks title matches ahead of body-only matches', () => {
    const results = rankLearningSearchResults(candidates, 'job interview');

    expect(results[0]?.title).toBe('Job interview vocabulary');
    expect(results[0]?.href).toBe(
      '/courses/english-b1/lessons/job-interview-vocabulary',
    );
  });

  it('supports normalized Arabic search text', () => {
    const arabic: LearningSearchCandidate[] = [
      {
        kind: 'lesson',
        courseSlug: 'arabic-example',
        courseTitle: 'مهارات نفسية',
        title: 'إدارة الضغط',
        lessonSlug: 'stress-management',
      },
    ];

    expect(rankLearningSearchResults(arabic, 'ادارة الضغط')[0]?.title).toBe(
      'إدارة الضغط',
    );
  });

  it('rejects trivial queries and caps result counts', () => {
    expect(rankLearningSearchResults(candidates, 'a')).toEqual([]);

    const repeated = Array.from({ length: 40 }, (_, index) => ({
      ...candidates[0]!,
      title: `English programme ${index}`,
      courseSlug: `english-${index}`,
      courseTitle: `English programme ${index}`,
    }));

    expect(rankLearningSearchResults(repeated, 'English', 200)).toHaveLength(
      20,
    );
  });

  it('does not return unrelated content', () => {
    expect(rankLearningSearchResults(candidates, 'quantum mechanics')).toEqual(
      [],
    );
  });
});
