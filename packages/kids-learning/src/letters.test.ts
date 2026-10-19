import { describe, expect, it } from 'vitest';

import {
  createCountRound,
  createLetterFormsRound,
  createLetterRound,
  LETTER_CHARS,
  LETTER_IDS,
  letterForm,
  NON_JOINING,
  SIMILAR_LETTERS,
} from './letters';
import { createRandom } from './random';
import { levelSpec, maxLevel, SKILLS } from './skills';
import {
  letterTrace,
  pickTraceLetter,
  resample,
  SIMPLE_TRACE_LETTERS,
  START_TRACE,
  traceLift,
  traceTouch,
  type TraceState,
} from './tracing';

const SEEDS = Array.from({ length: 150 }, (_, index) => index + 1);

describe('letters', () => {
  it('covers the 28 letters with distinct characters', () => {
    expect(LETTER_IDS).toHaveLength(28);
    expect(new Set(Object.values(LETTER_CHARS)).size).toBe(28);
  });

  it('builds positional forms with zero-width joiners', () => {
    expect(letterForm('ba', 'isolated')).toBe('ب');
    expect(letterForm('ba', 'initial')).toBe('ب‍');
    expect(letterForm('ba', 'medial')).toBe('‍ب‍');
    expect(letterForm('ba', 'final')).toBe('‍ب');
    // Non-joining letters never connect forwards.
    expect(letterForm('dal', 'initial')).toBe('د');
    expect(letterForm('dal', 'medial')).toBe('‍د');
  });

  it('groups only real letters as look-alikes, each in one group', () => {
    const seen = SIMILAR_LETTERS.flat();
    expect(new Set(seen).size).toBe(seen.length);
  });
});

describe.each(['letter-match', 'letter-sound'] as const)('%s rounds', (id) => {
  it('always have one target among distinct letters', () => {
    const skill = SKILLS[id];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      for (const seed of SEEDS) {
        const round = createLetterRound(spec, createRandom(seed));
        expect(round.choices).toHaveLength(spec.choices);
        expect(new Set(round.choices).size).toBe(spec.choices);
        expect(round.choices[round.correctIndex]).toBe(round.target);
        if (spec.similar) {
          const group = SIMILAR_LETTERS.find((g) => g.includes(round.target));
          for (const choice of round.choices) expect(group).toContain(choice);
        }
      }
    }
  });
});

describe('letter forms rounds', () => {
  it('only ask for start and middle forms of joining letters', () => {
    const skill = SKILLS['letter-forms'];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      for (const seed of SEEDS) {
        const round = createLetterFormsRound(spec, createRandom(seed));
        expect(new Set(round.choices).size).toBe(spec.choices);
        expect(round.choices[round.correctIndex]).toBe(round.target);
        if (spec.position !== 'final') {
          for (const choice of round.choices) {
            expect(NON_JOINING.has(choice)).toBe(false);
          }
        }
      }
    }
  });
});

describe('count rounds', () => {
  it('stay in range and offer ordered, nearby numbers', () => {
    const skill = SKILLS['count-objects'];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      for (const seed of SEEDS) {
        const round = createCountRound(spec, createRandom(seed));
        expect(round.count).toBeGreaterThanOrEqual(1);
        expect(round.count).toBeLessThanOrEqual(spec.max);
        expect(round.choices).toHaveLength(Math.min(spec.choices, spec.max));
        expect(round.choices).toEqual([...round.choices].sort((a, b) => a - b));
        expect(round.choices[round.correctIndex]).toBe(round.count);
        for (const choice of round.choices) {
          expect(Math.abs(choice - round.count)).toBeLessThanOrEqual(
            spec.choices,
          );
        }
      }
    }
  });
});

describe('tracing', () => {
  it('has strokes for every letter that stay inside the box', () => {
    for (const id of LETTER_IDS) {
      const trace = letterTrace(id);
      expect(trace.checkpoints.length).toBeGreaterThan(0);
      for (const point of trace.checkpoints.flat()) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(100);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(100);
      }
    }
  });

  it('writes the body before the dots', () => {
    for (const id of ['ba', 'ta', 'tha', 'nun', 'ya', 'shin'] as const) {
      const [body, ...dots] = letterTrace(id).checkpoints;
      expect(body!.length).toBeGreaterThan(1);
      for (const dot of dots) expect(dot).toHaveLength(1);
    }
  });

  it('resamples a path into evenly spaced checkpoints', () => {
    const points = resample(
      [
        { x: 0, y: 0 },
        { x: 70, y: 0 },
      ],
      7,
    );
    expect(points).toHaveLength(11);
    expect(points[1]).toEqual({ x: 7, y: 0 });
  });

  function traceAll(id: (typeof LETTER_IDS)[number]): TraceState {
    const trace = letterTrace(id);
    let state = START_TRACE;
    for (const stroke of trace.checkpoints) {
      for (const point of stroke) state = traceTouch(trace, state, point);
      state = traceLift(state);
    }
    return state;
  }

  it.each(LETTER_IDS)(
    'completes %s when every checkpoint is touched in order',
    (id) => {
      expect(traceAll(id)).toMatchObject({ done: true, strays: 0 });
    },
  );

  it('ignores jumps ahead and counts each wander off the stroke once', () => {
    const trace = letterTrace('alif');
    const end = trace.checkpoints[0]!.at(-1)!;
    let state = traceTouch(trace, START_TRACE, end);
    expect(state.next).toBe(0);
    state = traceTouch(trace, state, { x: 95, y: 95 });
    state = traceTouch(trace, state, { x: 96, y: 96 });
    expect(state).toMatchObject({ strays: 1, astray: true });
    state = traceTouch(trace, state, trace.checkpoints[0]![0]!);
    expect(state).toMatchObject({ astray: false, strays: 1 });
    expect(state.next).toBeGreaterThan(0);
  });

  it('ignores movement after a stroke until the finger lifts', () => {
    const trace = letterTrace('ba');
    let state = START_TRACE;
    for (const point of trace.checkpoints[0]!) {
      state = traceTouch(trace, state, point);
    }
    expect(state).toMatchObject({ stroke: 1, awaitingLift: true });
    state = traceTouch(trace, state, { x: 0, y: 0 });
    expect(state.strays).toBe(0);
    state = traceTouch(trace, traceLift(state), trace.checkpoints[1]![0]!);
    expect(state).toMatchObject({ done: true, strays: 0 });
  });

  it('starts with simple letters', () => {
    for (const seed of SEEDS) {
      expect(SIMPLE_TRACE_LETTERS).toContain(
        pickTraceLetter(
          levelSpec(SKILLS['letter-trace'], 1),
          createRandom(seed),
        ),
      );
    }
  });
});
