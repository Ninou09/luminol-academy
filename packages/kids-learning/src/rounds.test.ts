import { describe, expect, it } from 'vitest';

import { pieceKey, piecesEqual } from './pieces';
import { createRandom, sample, shuffle } from './random';
import {
  binMatches,
  createCauseEffectRound,
  createMatchingRound,
  createSortingBins,
  createSortingItem,
} from './rounds';
import { levelSpec, maxLevel, SKILLS } from './skills';

const SEEDS = Array.from({ length: 200 }, (_, index) => index + 1);

describe('random helpers', () => {
  it('is deterministic for a seed', () => {
    const first = createRandom(42);
    const second = createRandom(42);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('shuffles without losing items and samples distinct items', () => {
    const random = createRandom(7);
    expect(shuffle(random, [1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
    const picked = sample(random, ['a', 'b', 'c', 'd'], 3);
    expect(new Set(picked).size).toBe(3);
    expect(() => sample(random, ['a'], 2)).toThrow();
  });
});

describe('matching rounds', () => {
  const skill = SKILLS['match-shapes'];

  it.each(skill.levels.map((level, index) => [index + 1, level] as const))(
    'level %i always has one exact match among unique choices',
    (_, level) => {
      for (const seed of SEEDS) {
        const round = createMatchingRound(level, createRandom(seed));
        expect(round.choices).toHaveLength(level.choices);
        expect(new Set(round.choices.map(pieceKey)).size).toBe(level.choices);
        const matches = round.choices.filter((choice) =>
          piecesEqual(choice, round.target),
        );
        expect(matches).toHaveLength(1);
        expect(
          piecesEqual(round.choices[round.correctIndex]!, round.target),
        ).toBe(true);
      }
    },
  );

  it('uses distractors that force attention to the intended feature', () => {
    for (const seed of SEEDS) {
      const sameColor = createMatchingRound(
        levelSpec(skill, 4),
        createRandom(seed),
      );
      for (const choice of sameColor.choices) {
        expect(choice.color).toBe(sameColor.target.color);
      }
      const sameShape = createMatchingRound(
        levelSpec(skill, 5),
        createRandom(seed),
      );
      for (const choice of sameShape.choices) {
        expect(choice.shape).toBe(sameShape.target.shape);
      }
      const different = createMatchingRound(
        levelSpec(skill, 3),
        createRandom(seed),
      );
      for (const [index, choice] of different.choices.entries()) {
        if (index === different.correctIndex) continue;
        expect(choice.shape).not.toBe(different.target.shape);
        expect(choice.color).not.toBe(different.target.color);
      }
    }
  });
});

describe('sorting rounds', () => {
  const sortingSkills = [
    SKILLS['sort-color'],
    SKILLS['sort-shape'],
    SKILLS['sort-size'],
  ];

  it.each(sortingSkills.map((skill) => [skill.id, skill] as const))(
    '%s items always belong to exactly one bin',
    (_, skill) => {
      for (let level = 1; level <= maxLevel(skill); level += 1) {
        const spec = levelSpec(skill, level);
        for (const seed of SEEDS) {
          const random = createRandom(seed);
          const bins = createSortingBins(skill.dimension, spec, random);
          expect(bins).toHaveLength(spec.bins);
          expect(new Set(bins.map((bin) => bin.value)).size).toBe(spec.bins);
          const item = createSortingItem(bins, spec, random);
          const matching = bins.filter((bin) => binMatches(bin, item.piece));
          expect(matching).toEqual([bins[item.correctBin]]);
        }
      }
    },
  );

  it('keeps bins in a stable canonical order', () => {
    const spec = levelSpec(SKILLS['sort-color'], 4);
    const bins = createSortingBins('color', spec, createRandom(3));
    expect(bins.map((bin) => bin.value)).toEqual([
      'red',
      'blue',
      'yellow',
      'green',
    ]);
    const sizes = createSortingBins(
      'size',
      levelSpec(SKILLS['sort-size'], 3),
      createRandom(3),
    );
    expect(sizes.map((bin) => bin.value)).toEqual(['large', 'medium', 'small']);
  });

  it('holds the other attributes still at early levels', () => {
    const spec = levelSpec(SKILLS['sort-color'], 1);
    for (const seed of SEEDS) {
      const random = createRandom(seed);
      const bins = createSortingBins('color', spec, random);
      expect(createSortingItem(bins, spec, random).piece.shape).toBe('circle');
    }
  });
});

describe('cause and effect rounds', () => {
  const skill = SKILLS['cause-effect'];

  it('centres fixed targets and keeps moving targets inside the play area', () => {
    for (const seed of SEEDS) {
      const fixed = createCauseEffectRound(
        levelSpec(skill, 1),
        createRandom(seed),
      );
      expect(fixed.position).toEqual({ x: 0.5, y: 0.5 });
      const spec = levelSpec(skill, 4);
      const moving = createCauseEffectRound(spec, createRandom(seed));
      for (const value of [moving.position.x, moving.position.y]) {
        expect(value).toBeGreaterThanOrEqual(spec.targetScale / 2);
        expect(value).toBeLessThanOrEqual(1 - spec.targetScale / 2);
      }
    }
  });
});

describe('skill catalog', () => {
  it('clamps level lookups to the defined range', () => {
    const skill = SKILLS['match-shapes'];
    expect(levelSpec(skill, 0)).toEqual(skill.levels[0]);
    expect(levelSpec(skill, 99)).toEqual(skill.levels.at(-1));
  });
});
