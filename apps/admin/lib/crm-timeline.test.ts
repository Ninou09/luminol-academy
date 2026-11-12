import { describe, expect, it } from 'vitest';

import { buildCrmTimeline, personLabel } from './crm-timeline';

describe('CRM timeline', () => {
  it('merges sources newest first and keeps ties stable', () => {
    const at = (iso: string) => new Date(iso);
    const items = buildCrmTimeline(
      [
        { id: 'a', kind: 'status', at: at('2026-11-10T10:00:00Z'), title: 'A' },
        {
          id: 'b',
          kind: 'activity',
          at: at('2026-11-12T10:00:00Z'),
          title: 'B',
        },
      ],
      [
        {
          id: 'c',
          kind: 'payment',
          at: at('2026-11-12T10:00:00Z'),
          title: 'C',
        },
        { id: 'd', kind: 'task', at: at('2026-11-01T10:00:00Z'), title: 'D' },
      ],
    );
    expect(items.map(({ id }) => id)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('labels people by name or email', () => {
    expect(
      personLabel({
        email: 'a@example.test',
        firstName: 'Nacera',
        lastName: null,
      }),
    ).toBe('Nacera');
    expect(
      personLabel({ email: 'a@example.test', firstName: null, lastName: null }),
    ).toBe('a@example.test');
    expect(personLabel(null)).toBeNull();
  });
});
