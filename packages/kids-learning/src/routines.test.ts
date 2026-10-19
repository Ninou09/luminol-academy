import { describe, expect, it } from 'vitest';

import { childProfileInputSchema } from './profile';
import { createRandom } from './random';
import { levelSpec, maxLevel, SKILLS } from './skills';
import {
  availableRoutines,
  availableStories,
  BUILTIN_ROUTINE_IDS,
  BUILTIN_STORIES,
  BUILTIN_STORY_IDS,
  childSequencesSchema,
  createSequenceRound,
  EMPTY_SEQUENCES,
  MAX_SEQUENCE_STEPS,
  moveStep,
  releasedSequenceMedia,
  removeSequence,
  ROUTINE_PICTURES,
  routinePicturesFor,
  routineSteps,
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

describe('built-in routines', () => {
  it('use only bundled routine pictures, each in one routine', () => {
    const used = BUILTIN_ROUTINE_IDS.flatMap((id) => [
      ...routineSteps(id, 'boy'),
      ...(id === 'prayer' ? routineSteps(id, 'girl') : []),
    ]);
    expect(new Set(used).size).toBe(used.length);
    expect([...used].sort()).toEqual([...ROUTINE_PICTURES].sort());
  });

  it('show the chosen prayer pictures', () => {
    expect(routineSteps('prayer', 'girl')[0]).toBe('prayer-girl-stand');
    expect(routineSteps('prayer', 'boy')).toHaveLength(6);
  });

  it('keep wudu and prayer in the religious pack', () => {
    expect(availableRoutines(false)).toEqual([
      'handwashing',
      'toothbrushing',
      'dressing',
    ]);
    expect(availableRoutines(true)).toContain('wudu');
    expect(availableRoutines(true)).toContain('prayer');
  });

  it('offer parents wudu and prayer pictures only with the pack', () => {
    expect(routinePicturesFor(false)).toHaveLength(12);
    expect(routinePicturesFor(false)).not.toContain('wudu-face');
    expect(routinePicturesFor(true)).toEqual([...ROUTINE_PICTURES]);
  });

  it('let parents use routine pictures on their own steps', () => {
    expect(
      sequenceSchema.safeParse(
        routine(1, [{ ...eat, picture: { kind: 'routine', id: 'wash-dry' } }]),
      ).success,
    ).toBe(true);
    expect(
      sequenceSchema.safeParse({
        ...routine(1, [eat]),
        steps: [{ ...eat, picture: { kind: 'routine', id: 'not-a-picture' } }],
      }).success,
    ).toBe(false);
  });
});

describe('sequence rounds', () => {
  const SEEDS = Array.from({ length: 200 }, (_, index) => index + 1);

  it('deal the steps of one routine out of order, keeping the real order as the answer', () => {
    const skill = SKILLS['sequence-steps'];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      for (const seed of SEEDS) {
        const round = createSequenceRound(spec, true, createRandom(seed));
        const length = routineSteps(round.routine, 'boy').length;
        expect(round.order).toHaveLength(Math.min(spec.steps, length));
        expect(round.order).toEqual([...round.order].sort((a, b) => a - b));
        expect([...round.dealt].sort((a, b) => a - b)).toEqual(round.order);
        expect(round.dealt).not.toEqual(round.order);
      }
    }
  });

  it('only use wudu and prayer with the religious pack', () => {
    for (const seed of SEEDS) {
      const round = createSequenceRound(
        { steps: 3 },
        false,
        createRandom(seed),
      );
      expect(['handwashing', 'toothbrushing', 'dressing']).toContain(
        round.routine,
      );
    }
  });
});
