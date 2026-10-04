import { expect, test } from 'vitest';
import { getMuseCopy } from './muse-copy';

test.each(['ar', 'fr', 'en'] as const)(
  'provides complete command and agent labels for %s',
  (locale) => {
    const copy = getMuseCopy(locale);
    expect(Object.values(copy.intentions)).toHaveLength(9);
    expect(Object.values(copy.agents)).toHaveLength(7);
    expect(copy.handoffNote).toBeTruthy();
    expect(copy.safety).toBeTruthy();
  },
);
