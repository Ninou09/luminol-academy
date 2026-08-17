import { describe, expect, it } from 'vitest';

import {
  displayCohortPersonName,
  getCohortStatusTransitions,
  isCohortStatusTransitionAllowed,
} from './cohort-operations';

describe('cohort delivery lifecycle', () => {
  it('allows only forward or terminal cohort status transitions', () => {
    expect(getCohortStatusTransitions('PLANNED')).toEqual([
      'ACTIVE',
      'CANCELLED',
    ]);
    expect(getCohortStatusTransitions('ACTIVE')).toEqual([
      'COMPLETED',
      'CANCELLED',
    ]);
    expect(getCohortStatusTransitions('COMPLETED')).toEqual([]);
    expect(getCohortStatusTransitions('CANCELLED')).toEqual([]);

    expect(isCohortStatusTransitionAllowed('PLANNED', 'ACTIVE')).toBe(true);
    expect(isCohortStatusTransitionAllowed('ACTIVE', 'COMPLETED')).toBe(true);
    expect(isCohortStatusTransitionAllowed('COMPLETED', 'ACTIVE')).toBe(false);
    expect(isCohortStatusTransitionAllowed('CANCELLED', 'PLANNED')).toBe(false);
  });

  it('uses a deterministic display name without dropping the fallback email', () => {
    expect(
      displayCohortPersonName({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.test',
      }),
    ).toBe('Ada Lovelace · ada@example.test');
    expect(
      displayCohortPersonName({
        firstName: null,
        lastName: null,
        email: 'staff@example.test',
      }),
    ).toBe('staff@example.test');
  });
});
