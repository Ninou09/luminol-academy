import { describe, expect, it } from 'vitest';

import {
  calculateCompletionRate,
  displayPersonName,
  formatEnumLabel,
} from './operations';

describe('admin operations helpers', () => {
  it('calculates and bounds programme completion', () => {
    expect(calculateCompletionRate(3, 4)).toBe(75);
    expect(calculateCompletionRate(4, 0)).toBe(0);
    expect(calculateCompletionRate(8, 4)).toBe(100);
  });

  it('uses a safe fallback when a person has no synchronized name', () => {
    expect(displayPersonName('  Lina ', ' Haddad ', 'fallback')).toBe(
      'Lina Haddad',
    );
    expect(displayPersonName(null, null, 'learner@example.com')).toBe(
      'learner@example.com',
    );
  });

  it('turns stored enum values into readable labels', () => {
    expect(formatEnumLabel('IN_REVIEW')).toBe('In Review');
    expect(formatEnumLabel('PSYCHOLOGY')).toBe('Psychology');
  });
});
