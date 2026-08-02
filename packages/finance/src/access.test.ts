import { describe, expect, it } from 'vitest';
import { requireFinancePermission } from './access';

describe('finance authorization', () => {
  it('rejects actors without the requested permission', () => {
    expect(() =>
      requireFinancePermission(
        { userId: 'user_1', permissions: ['finance:reconcile'] },
        'finance:refund',
      ),
    ).toThrow('not authorized');
  });
  it('allows a scoped permission and finance managers', () => {
    expect(
      requireFinancePermission(
        { userId: 'user_1', permissions: ['finance:refund'] },
        'finance:refund',
      ).userId,
    ).toBe('user_1');
    expect(
      requireFinancePermission(
        { userId: 'admin_1', permissions: ['finance:manage'] },
        'finance:reconcile',
      ).userId,
    ).toBe('admin_1');
  });
});
