import { describe, expect, it } from 'vitest';

import {
  ADMIN_SEARCH_MAX_QUERY_LENGTH,
  escapePostgresLikePattern,
  normalizeAdminSearchQuery,
  parseAdminSearchParam,
} from './operations-search';

describe('administration operations search', () => {
  it('validates untrusted search input', () => {
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

  it('escapes PostgreSQL LIKE wildcards so searches stay literal', () => {
    expect(escapePostgresLikePattern('50%_\\done')).toBe('50\\%\\_\\\\done');
    expect(escapePostgresLikePattern('plain text')).toBe('plain text');
  });
});
