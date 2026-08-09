import { describe, expect, it } from 'vitest';

import {
  ADMIN_SEARCH_MAX_QUERY_LENGTH,
  normalizeAdminSearchQuery,
  parseAdminSearchParam,
} from './operations-search';

describe('administration operations search', () => {
  it('validates URL-owned search parameters', () => {
    expect(parseAdminSearchParam('learner@example.com')).toBe(
      'learner@example.com',
    );
    expect(parseAdminSearchParam(['leadership'])).toBe('leadership');
    expect(parseAdminSearchParam(['one', 'two'])).toBeUndefined();
    expect(parseAdminSearchParam(42)).toBeUndefined();
    expect(
      parseAdminSearchParam('x'.repeat(ADMIN_SEARCH_MAX_QUERY_LENGTH + 1)),
    ).toBeUndefined();
  });

  it('normalizes whitespace and bounds trusted service input', () => {
    expect(normalizeAdminSearchQuery('  learner   name  ')).toBe(
      'learner name',
    );
    expect(normalizeAdminSearchQuery('x'.repeat(300))).toHaveLength(
      ADMIN_SEARCH_MAX_QUERY_LENGTH,
    );
  });
});
