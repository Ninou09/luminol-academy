import { describe, expect, it } from 'vitest';

import {
  calculateCourseProgress,
  getLessonNavigation,
  getNextLearningLesson,
} from './course';

const modules = [
  {
    id: 'module-1',
    lessons: [
      { id: 'lesson-1', slug: 'welcome', status: 'COMPLETED' as const },
      { id: 'lesson-2', slug: 'foundations', status: 'IN_PROGRESS' as const },
    ],
  },
  {
    id: 'module-2',
    lessons: [
      { id: 'lesson-3', slug: 'practice', status: 'NOT_STARTED' as const },
    ],
  },
];

describe('calculateCourseProgress', () => {
  it('calculates completion across multiple modules', () => {
    expect(calculateCourseProgress(modules)).toEqual({
      completedLessons: 1,
      totalLessons: 3,
      percentage: 33,
    });
  });

  it('returns a safe empty curriculum result', () => {
    expect(calculateCourseProgress([])).toEqual({
      completedLessons: 0,
      totalLessons: 0,
      percentage: 0,
    });
  });
});

describe('getNextLearningLesson', () => {
  it('resumes an in-progress lesson before a new lesson', () => {
    expect(getNextLearningLesson(modules)?.id).toBe('lesson-2');
  });

  it('returns the last lesson after the curriculum is complete', () => {
    expect(
      getNextLearningLesson([
        {
          id: 'module-1',
          lessons: [
            { id: 'lesson-1', status: 'COMPLETED' },
            { id: 'lesson-2', status: 'COMPLETED' },
          ],
        },
      ])?.id,
    ).toBe('lesson-2');
  });
});

describe('getLessonNavigation', () => {
  it('calculates cross-module previous and next lessons', () => {
    expect(getLessonNavigation(modules, 'lesson-2')).toEqual({
      position: 2,
      total: 3,
      previous: modules[0]?.lessons[0],
      next: modules[1]?.lessons[0],
    });
  });

  it('returns null for an inaccessible lesson', () => {
    expect(getLessonNavigation(modules, 'unknown')).toBeNull();
  });
});
