import { describe, expect, it } from 'vitest';

import {
  evaluateCompletionEligibility,
  summarizeCohortCompletion,
} from './reporting';

describe('evaluateCompletionEligibility', () => {
  it('marks a learner eligible when every requirement is complete', () => {
    const result = evaluateCompletionEligibility({
      learnerId: 'learner-1',
      enrollmentId: 'enrollment-1',
      completedModules: 8,
      totalModules: 8,
      approvedProjects: 2,
      requiredProjects: 2,
      assessmentScore: 84,
    });

    expect(result.eligible).toBe(true);
    expect(result.completionPercentage).toBe(100);
    expect(result.missingRequirements).toEqual([]);
  });

  it('returns explicit missing completion evidence', () => {
    const result = evaluateCompletionEligibility({
      learnerId: 'learner-2',
      enrollmentId: 'enrollment-2',
      completedModules: 5,
      totalModules: 10,
      approvedProjects: 0,
      requiredProjects: 1,
      assessmentScore: 62,
    });

    expect(result.eligible).toBe(false);
    expect(result.completionPercentage).toBe(50);
    expect(result.missingRequirements).toHaveLength(3);
  });

  it('supports a configurable passing score', () => {
    const result = evaluateCompletionEligibility(
      {
        learnerId: 'learner-3',
        enrollmentId: 'enrollment-3',
        completedModules: 4,
        totalModules: 4,
        approvedProjects: 0,
        requiredProjects: 0,
        assessmentScore: 65,
      },
      60,
    );

    expect(result.eligible).toBe(true);
  });
});

describe('summarizeCohortCompletion', () => {
  it('returns zero-safe reporting for an empty cohort', () => {
    expect(summarizeCohortCompletion([])).toEqual({
      learnerCount: 0,
      eligibleCount: 0,
      completionRate: 0,
      averageModuleCompletion: 0,
    });
  });

  it('calculates cohort completion and average module progress', () => {
    const result = summarizeCohortCompletion([
      {
        learnerId: 'learner-1',
        enrollmentId: 'enrollment-1',
        completedModules: 10,
        totalModules: 10,
        approvedProjects: 1,
        requiredProjects: 1,
        assessmentScore: 90,
      },
      {
        learnerId: 'learner-2',
        enrollmentId: 'enrollment-2',
        completedModules: 5,
        totalModules: 10,
        approvedProjects: 0,
        requiredProjects: 1,
        assessmentScore: 60,
      },
    ]);

    expect(result).toEqual({
      learnerCount: 2,
      eligibleCount: 1,
      completionRate: 50,
      averageModuleCompletion: 75,
    });
  });
});
