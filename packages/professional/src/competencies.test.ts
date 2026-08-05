import { describe, expect, it } from 'vitest';

import {
  calculateCompetencyProfile,
  determineCompetencyLevel,
} from './competencies';

describe('determineCompetencyLevel', () => {
  it.each([
    [0, 'FOUNDATIONAL'],
    [49.99, 'FOUNDATIONAL'],
    [50, 'PRACTITIONER'],
    [69.99, 'PRACTITIONER'],
    [70, 'ADVANCED'],
    [84.99, 'ADVANCED'],
    [85, 'EXPERT'],
    [100, 'EXPERT'],
  ])('maps %s to %s', (score, level) => {
    expect(determineCompetencyLevel(score)).toBe(level);
  });

  it('clamps scores outside the supported range', () => {
    expect(determineCompetencyLevel(-20)).toBe('FOUNDATIONAL');
    expect(determineCompetencyLevel(140)).toBe('EXPERT');
  });
});

describe('calculateCompetencyProfile', () => {
  it('creates an overall profile with strengths and priorities', () => {
    const profile = calculateCompetencyProfile([
      { competencyId: 'presenting', category: 'communication', score: 90 },
      { competencyId: 'team-leadership', category: 'leadership', score: 76 },
      { competencyId: 'planning', category: 'project-management', score: 68 },
      { competencyId: 'spreadsheets', category: 'digital-skills', score: 45 },
    ]);

    expect(profile.averageScore).toBe(70);
    expect(profile.overallLevel).toBe('ADVANCED');
    expect(profile.strengths).toEqual([
      'presenting',
      'team-leadership',
      'planning',
    ]);
    expect(profile.developmentPriorities).toEqual([
      'spreadsheets',
      'planning',
      'team-leadership',
    ]);
  });

  it('requires at least one competency rating', () => {
    expect(() => calculateCompetencyProfile([])).toThrow(/At least one/);
  });
});
