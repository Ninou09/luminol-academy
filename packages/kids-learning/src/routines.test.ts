import { describe, expect, it } from 'vitest';

import { childProfileInputSchema } from './profile';
import {
  availableStories,
  BUILTIN_STORIES,
  BUILTIN_STORY_IDS,
  childSequencesSchema,
  EMPTY_SEQUENCES,
  MAX_SEQUENCE_STEPS,
  moveStep,
  releasedSequenceMedia,
  removeSequence,
  sequenceSchema,
  upsertSequence,
  type Sequence,
} from './routines';

const CHILD = '7f1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b';
const uuid = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const photo = (n: number) => `children/${CHILD}/aac/${uuid(n)}.jpg`;
const voice = (n: number) => `children/${CHILD}/aac/${uuid(n)}.m4a`;

function routine(id: number, steps: Sequence['steps']): Sequence {
  return { id: uuid(id), kind: 'routine', title: 'الصباح', steps };
}

const wash = {
  id: uuid(10),
  text: 'أغسل يديّ',
  picture: { kind: 'photo' as const, path: photo(11) },
  voicePath: voice(12),
};
const eat = {
  id: uuid(20),
  text: 'أتناول الفطور',
  picture: { kind: 'builtin' as const, id: 'food' as const },
  voicePath: null,
};

describe('sequences', () => {
  it('validates steps, titles and limits', () => {
    expect(sequenceSchema.safeParse(routine(1, [wash, eat])).success).toBe(
      true,
    );
    expect(sequenceSchema.safeParse(routine(1, [])).success).toBe(false);
    expect(
      sequenceSchema.safeParse(
        routine(
          1,
          Array.from({ length: MAX_SEQUENCE_STEPS + 1 }, (_, n) => ({
            ...eat,
            id: uuid(100 + n),
          })),
        ),
      ).success,
    ).toBe(false);
    expect(
      sequenceSchema.safeParse(routine(1, [{ ...eat, text: '<b>' }])).success,
    ).toBe(false);
    expect(
      sequenceSchema.safeParse(
        routine(1, [
          {
            ...wash,
            picture: { kind: 'photo', path: '../../etc/passwd.jpg' },
          },
        ]),
      ).success,
    ).toBe(false);
  });

  it('adds, replaces and removes sequences', () => {
    const added = upsertSequence(EMPTY_SEQUENCES, routine(1, [eat]));
    const replaced = upsertSequence(added, {
      ...routine(1, [eat]),
      title: 'المساء',
    });
    expect(replaced.items).toHaveLength(1);
    expect(replaced.items[0]?.title).toBe('المساء');
    expect(removeSequence(replaced, uuid(1)).items).toEqual([]);
    expect(childSequencesSchema.parse(replaced)).toEqual(replaced);
  });

  it('moves steps without falling off either end', () => {
    expect(moveStep(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveStep(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(moveStep(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveStep(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c']);
  });

  it('releases the photos and recordings of removed steps only', () => {
    const before = upsertSequence(EMPTY_SEQUENCES, routine(1, [wash, eat]));
    const after = upsertSequence(before, routine(1, [eat]));
    expect(releasedSequenceMedia(before, after).sort()).toEqual(
      [photo(11), voice(12)].sort(),
    );
    expect(releasedSequenceMedia(before, before)).toEqual([]);
  });
});

describe('built-in stories', () => {
  it('have at least three pages each', () => {
    for (const id of BUILTIN_STORY_IDS) {
      expect(BUILTIN_STORIES[id].pages.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keep the religious pack hidden until it is switched on', () => {
    expect(availableStories(false)).not.toContain('ramadan');
    expect(availableStories(false)).not.toContain('eid');
    expect(availableStories(true)).toEqual(BUILTIN_STORY_IDS);
  });

  it('starts profiles with the religious pack off', () => {
    const profile = childProfileInputSchema.parse({
      nickname: 'ريم',
      avatar: 'star-yellow',
      ageBand: '5-6',
      dialect: 'msa',
    });
    expect(profile.religiousPack).toBe(false);
  });
});
