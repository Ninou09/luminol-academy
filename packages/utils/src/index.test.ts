import { describe, expect, it } from 'vitest';
import { directionFor, joinClassNames } from './index';
describe('utilities', () => {
  it('selects RTL for Arabic', () => expect(directionFor('ar')).toBe('rtl'));
  it('joins truthy classes', () =>
    expect(joinClassNames('a', false, 'b')).toBe('a b'));
});
