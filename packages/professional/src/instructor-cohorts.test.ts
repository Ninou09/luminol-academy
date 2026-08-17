import { describe, expect, it } from 'vitest';

import {
  FORBIDDEN_INSTRUCTOR_DATA_KINDS,
  INSTRUCTOR_COHORT_DATA_KINDS,
  assertInstructorCohortAccess,
  decideInstructorCohortAccess,
  isForbiddenInstructorDataKind,
  isInstructorCohortDataKind,
} from './instructor-cohorts';

const assignment = {
  cohortId: 'cohort-1',
  instructorUserId: 'instructor-1',
  role: 'LEAD' as const,
  active: true,
};

describe('instructor cohort authorization contracts', () => {
  it('allows only the exact active instructor assignment', () => {
    expect(
      decideInstructorCohortAccess({
        actorUserId: 'instructor-1',
        cohortId: 'cohort-1',
        assignment,
      }),
    ).toEqual({ allowed: true, authority: 'instructor-assignment' });
  });

  it('fails closed for another instructor', () => {
    expect(
      decideInstructorCohortAccess({
        actorUserId: 'instructor-2',
        cohortId: 'cohort-1',
        assignment,
      }),
    ).toEqual({ allowed: false, reason: 'wrong-instructor' });
  });

  it('fails closed for another cohort', () => {
    expect(
      decideInstructorCohortAccess({
        actorUserId: 'instructor-1',
        cohortId: 'cohort-2',
        assignment,
      }),
    ).toEqual({ allowed: false, reason: 'wrong-cohort' });
  });

  it('fails closed for inactive or missing assignments', () => {
    expect(
      decideInstructorCohortAccess({
        actorUserId: 'instructor-1',
        cohortId: 'cohort-1',
        assignment: { ...assignment, active: false },
      }),
    ).toEqual({ allowed: false, reason: 'inactive-assignment' });

    expect(
      decideInstructorCohortAccess({
        actorUserId: 'instructor-1',
        cohortId: 'cohort-1',
        assignment: null,
      }),
    ).toEqual({ allowed: false, reason: 'missing-assignment' });
  });

  it('allows a deliberate academy override without pretending it is instructor scope', () => {
    expect(
      decideInstructorCohortAccess({
        actorUserId: 'academy-admin',
        cohortId: 'cohort-1',
        assignment: null,
        academyOverride: true,
      }),
    ).toEqual({ allowed: true, authority: 'academy-override' });
  });

  it('throws when a denied decision is asserted', () => {
    expect(() =>
      assertInstructorCohortAccess({
        actorUserId: 'instructor-1',
        cohortId: 'cohort-2',
        assignment,
      }),
    ).toThrow('Instructor cohort access denied: wrong-cohort');
  });

  it('keeps instructor-visible and forbidden data classes explicit and disjoint', () => {
    expect(INSTRUCTOR_COHORT_DATA_KINDS.length).toBeGreaterThan(0);
    expect(FORBIDDEN_INSTRUCTOR_DATA_KINDS.length).toBeGreaterThan(0);

    for (const value of INSTRUCTOR_COHORT_DATA_KINDS) {
      expect(isInstructorCohortDataKind(value)).toBe(true);
      expect(isForbiddenInstructorDataKind(value)).toBe(false);
    }
    for (const value of FORBIDDEN_INSTRUCTOR_DATA_KINDS) {
      expect(isForbiddenInstructorDataKind(value)).toBe(true);
      expect(isInstructorCohortDataKind(value)).toBe(false);
    }
  });
});
