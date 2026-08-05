import { describe, expect, it } from 'vitest';

import { buildTrainingPlan, careerGoalSchema } from './pathways';

describe('career pathway planning', () => {
  it('orders recommendations by the largest competency gap', () => {
    const plan = buildTrainingPlan({
      goal: {
        title: 'Prepare for team leadership',
        targetRole: 'Team Lead',
        targetCategories: ['leadership', 'communication', 'project-management'],
        targetScore: 75,
      },
      ratings: [
        { competencyId: 'leadership-1', category: 'leadership', score: 35 },
        {
          competencyId: 'communication-1',
          category: 'communication',
          score: 60,
        },
        {
          competencyId: 'project-1',
          category: 'project-management',
          score: 70,
        },
      ],
    });

    expect(plan).toEqual([
      {
        category: 'leadership',
        currentScore: 35,
        targetScore: 75,
        gap: 40,
        priority: 'HIGH',
      },
      {
        category: 'communication',
        currentScore: 60,
        targetScore: 75,
        gap: 15,
        priority: 'MEDIUM',
      },
      {
        category: 'project-management',
        currentScore: 70,
        targetScore: 75,
        gap: 5,
        priority: 'LOW',
      },
    ]);
  });

  it('averages multiple ratings within the same category', () => {
    const [recommendation] = buildTrainingPlan({
      goal: {
        title: 'Improve digital capability',
        targetRole: 'Digital Operations Specialist',
        targetCategories: ['digital-skills'],
        targetScore: 80,
      },
      ratings: [
        { competencyId: 'tools', category: 'digital-skills', score: 60 },
        { competencyId: 'data', category: 'digital-skills', score: 70 },
      ],
    });

    expect(recommendation?.currentScore).toBe(65);
    expect(recommendation?.gap).toBe(15);
  });

  it('omits categories that already meet the target', () => {
    const plan = buildTrainingPlan({
      goal: {
        title: 'Validate readiness',
        targetRole: 'Project Manager',
        targetCategories: ['project-management'],
        targetScore: 70,
      },
      ratings: [
        { competencyId: 'delivery', category: 'project-management', score: 85 },
      ],
    });

    expect(plan).toEqual([]);
  });

  it('rejects goals without target competency categories', () => {
    expect(() =>
      careerGoalSchema.parse({
        title: 'Invalid goal',
        targetRole: 'Manager',
        targetCategories: [],
      }),
    ).toThrow();
  });
});
