import { describe, expect, it } from 'vitest';

import { getPortalArrow } from './portal-direction';

describe('portal navigation direction', () => {
  it('uses LTR arrows for English and French', () => {
    expect(getPortalArrow('en', 'back')).toBe('←');
    expect(getPortalArrow('en', 'forward')).toBe('→');
    expect(getPortalArrow('fr', 'back')).toBe('←');
    expect(getPortalArrow('fr', 'forward')).toBe('→');
  });

  it('mirrors navigation arrows for Arabic', () => {
    expect(getPortalArrow('ar', 'back')).toBe('→');
    expect(getPortalArrow('ar', 'forward')).toBe('←');
  });
});
