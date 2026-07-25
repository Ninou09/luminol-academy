import { describe, expect, it } from 'vitest';

import { calculateCourseProgress } from './course';

describe('calculateCourseProgress', () => {
  it('calculates completion across multiple modules', () => {
    expect(
      calculateCourseProgress([
        {
          id: 'module-1',
          lessons: [
            { id: 'lesson-1', status: 'COMPLETED' },
            { id: 'lesson-2', status: 'IN_PROGRESS' },
          ],
        },
        {
          id: 'module-2',
          lessons: [{ id: 'lesson-3', status: 'COMPLETED' }],
        },
      ]),
    ).toEqual({
      completedLessons: 2,
      totalLessons: 3,
      percentage: 67,
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
