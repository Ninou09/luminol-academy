import { describe, expect, it } from 'vitest';

import { childProfileSchema } from './profile';
import { createRandom } from './random';
import { planSession } from './session';
import { levelSpec, maxLevel, SKILLS } from './skills';
import {
  createMemoryBoard,
  createPatternRound,
  createPuzzleRound,
  createThemedCauseEffectRound,
  createThemedMatchingRound,
  distinctTokens,
  PATTERN_SHOWN,
  regionRect,
} from './themedRounds';
import {
  MIN_THEME_TOKENS,
  THEMES,
  themeTokens,
  tokenKey,
  tokensEqual,
  type Token,
} from './themes';

const SEEDS = Array.from({ length: 150 }, (_, index) => index + 1);
const keys = (tokens: readonly Token[]) => tokens.map(tokenKey);

describe('themes', () => {
  it('offers enough distinct tokens for every game', () => {
    for (const theme of THEMES) {
      const tokens = themeTokens(theme);
      expect(tokens.length).toBeGreaterThanOrEqual(MIN_THEME_TOKENS);
      expect(new Set(keys(tokens)).size).toBe(tokens.length);
    }
  });

  it('keeps shape tokens visually distinct', () => {
    for (const seed of SEEDS) {
      const tokens = distinctTokens('shapes', 4, createRandom(seed));
      const shapes = tokens.map((token) =>
        token.kind === 'shape' ? token.piece.shape : '',
      );
      const colors = tokens.map((token) =>
        token.kind === 'shape' ? token.piece.color : '',
      );
      expect(new Set(shapes).size).toBe(4);
      expect(new Set(colors).size).toBe(4);
    }
  });
});

describe.each(THEMES)('%s theme', (theme) => {
  it('builds matching rounds with exactly one match', () => {
    const skill = SKILLS['match-shapes'];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      for (const seed of SEEDS) {
        const round = createThemedMatchingRound(
          levelSpec(skill, level),
          theme,
          createRandom(seed),
        );
        expect(new Set(keys(round.choices)).size).toBe(round.choices.length);
        expect(
          round.choices.filter((choice) => tokensEqual(choice, round.target)),
        ).toHaveLength(1);
        expect(
          tokensEqual(round.choices[round.correctIndex]!, round.target),
        ).toBe(true);
      }
    }
  });

  it('builds patterns whose answer continues the sequence', () => {
    const skill = SKILLS['pattern-next'];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      const unitLength = spec.pattern.length;
      for (const seed of SEEDS) {
        const round = createPatternRound(spec, theme, createRandom(seed));
        expect(round.sequence).toHaveLength(PATTERN_SHOWN);
        // The answer repeats the token one pattern unit earlier.
        expect(
          tokensEqual(
            round.answer,
            round.sequence[PATTERN_SHOWN - unitLength]!,
          ),
        ).toBe(true);
        expect(round.choices).toHaveLength(spec.choices);
        expect(new Set(keys(round.choices)).size).toBe(spec.choices);
        expect(
          round.choices.filter((choice) => tokensEqual(choice, round.answer)),
        ).toHaveLength(1);
        expect(round.choices[round.correctIndex]).toBe(round.answer);
      }
    }
  });

  it('builds memory boards of exact pairs', () => {
    const skill = SKILLS['memory-pairs'];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      for (const seed of SEEDS) {
        const cards = createMemoryBoard(spec, theme, createRandom(seed));
        expect(cards).toHaveLength(spec.pairs * 2);
        expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
        const counts = new Map<string, number>();
        for (const card of cards) {
          const key = tokenKey(card.token);
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        expect([...counts.values()].every((count) => count === 2)).toBe(true);
      }
    }
  });

  it('builds puzzles whose choices are all the missing part', () => {
    const skill = SKILLS['puzzle-complete'];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      for (const seed of SEEDS) {
        const round = createPuzzleRound(spec, theme, createRandom(seed));
        expect(round.missing).toBeGreaterThanOrEqual(0);
        expect(round.missing).toBeLessThan(spec.pieces);
        expect(round.choices).toHaveLength(spec.choices);
        expect(
          round.choices.every((choice) => choice.region === round.missing),
        ).toBe(true);
        expect(round.choices[round.correctIndex]?.token).toBe(round.token);
      }
    }
  });

  it('builds cause-and-effect rounds', () => {
    const round = createThemedCauseEffectRound(
      levelSpec(SKILLS['cause-effect'], 1),
      theme,
      createRandom(1),
    );
    expect(round.token.kind).toBe(theme === 'shapes' ? 'shape' : 'picture');
  });
});

describe('regionRect', () => {
  it('splits into halves and reading-order quarters', () => {
    expect(regionRect(2, 1, 200)).toEqual({
      x: 100,
      y: 0,
      width: 100,
      height: 200,
    });
    expect(regionRect(4, 2, 200)).toEqual({
      x: 0,
      y: 100,
      width: 100,
      height: 100,
    });
    expect(regionRect(4, 3, 200)).toEqual({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
    });
  });
});

describe('themes in sessions and profiles', () => {
  it('rotates interest themes through picture games and keeps sorting on shapes', () => {
    const steps = planSession({
      ageBand: '5-6',
      sessionMinutes: 20,
      previousSessions: 0,
      interests: ['food', 'things'],
    });
    const activities = steps.flatMap((step) =>
      step.kind === 'activity' ? [step] : [],
    );
    for (const step of activities) {
      if (SKILLS[step.skillId].game === 'sorting') {
        expect(step.theme).toBe('shapes');
      }
    }
    const themed = activities.filter(
      (step) => SKILLS[step.skillId].game !== 'sorting',
    );
    expect(themed.map((step) => step.theme)).toEqual(
      themed.map((_, index) => (index % 2 === 0 ? 'food' : 'things')),
    );
  });

  it('defaults to shapes for children without interests', () => {
    const [first] = planSession({
      ageBand: '3-4',
      sessionMinutes: 5,
      previousSessions: 0,
    });
    expect(first).toMatchObject({ theme: 'shapes' });
  });

  it('reads profiles saved before themes existed', () => {
    const profile = childProfileSchema.parse({
      id: '7f1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b',
      nickname: 'ريم',
      avatar: 'star-yellow',
      ageBand: '5-6',
      dialect: 'maghrebi',
      sensory: {
        volume: 0.5,
        voiceSpeed: 'slow',
        animationLevel: 'low',
        rewardStyle: 'stars',
        sessionMinutes: 10,
      },
      createdAt: '2026-10-18T09:00:00.000Z',
    });
    expect(profile.interests).toEqual(['shapes']);
  });

  it('rejects empty or repeated interests', () => {
    const base = {
      nickname: 'ريم',
      avatar: 'star-yellow',
      ageBand: '5-6',
      dialect: 'msa',
    } as const;
    expect(childProfileSchema.shape.interests.safeParse([]).success).toBe(
      false,
    );
    expect(
      childProfileSchema.shape.interests.safeParse(['food', 'food']).success,
    ).toBe(false);
    expect(
      childProfileSchema
        .pick({ nickname: true, interests: true })
        .safeParse({ ...base, interests: ['food'] }).success,
    ).toBe(true);
  });
});
