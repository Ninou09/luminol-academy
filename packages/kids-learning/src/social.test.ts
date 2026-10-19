import { describe, expect, it } from 'vitest';

import { AAC_BUILTIN_CARDS, AAC_PICTURES } from './aac';
import { childProfileInputSchema } from './profile';
import { createRandom } from './random';
import { enabledSkills, planSession, skillsForAge } from './session';
import { levelSpec, maxLevel, SKILLS } from './skills';
import {
  createEmotionRound,
  createGreetingRound,
  createSituationRound,
  EMOTION_FACES,
  EMOTIONS,
  FACE_CHARACTERS,
  GREETINGS,
  SITUATION_IDS,
  SITUATION_SCENES,
  situationScene,
  SITUATIONS,
  STORY_SCENES,
} from './social';

const SEEDS = Array.from({ length: 150 }, (_, index) => index + 1);

describe('social catalogs', () => {
  it('uses feelings that have board pictures', () => {
    for (const emotion of EMOTIONS) {
      expect(AAC_PICTURES).toContain(emotion);
    }
  });

  it("offers every feeling on a boy's and a girl's board card", () => {
    for (const character of FACE_CHARACTERS) {
      for (const emotion of EMOTIONS) {
        const face = EMOTION_FACES[character][emotion];
        expect(AAC_BUILTIN_CARDS[emotion].pictures).toContain(face);
      }
    }
  });

  it('gives each scene to one story', () => {
    expect(new Set(STORY_SCENES).size).toBe(STORY_SCENES.length);
    expect(situationScene('gift')).toBe('sami-gift');
    expect(situationScene('park')).toBeNull();
    for (const id of Object.keys(SITUATION_SCENES)) {
      expect(SITUATION_IDS).toContain(id);
    }
  });

  it('has at least two stories for every feeling', () => {
    for (const emotion of EMOTIONS) {
      expect(
        SITUATION_IDS.filter((id) => SITUATIONS[id] === emotion).length,
      ).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('emotion rounds', () => {
  it('always include the target face once, at the correct index', () => {
    const skill = SKILLS['emotion-find'];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      for (const seed of SEEDS) {
        const round = createEmotionRound(spec, createRandom(seed));
        expect(round.choices).toHaveLength(spec.choices);
        expect(new Set(round.choices).size).toBe(spec.choices);
        expect(round.choices[round.correctIndex]).toBe(round.target);
      }
    }
  });

  it('shows both children across rounds', () => {
    const characters = new Set(
      SEEDS.map(
        (seed) =>
          createEmotionRound({ choices: 3 }, createRandom(seed)).character,
      ),
    );
    expect([...characters].sort()).toEqual(['boy', 'girl']);
  });

  it('starts with the clearest feelings', () => {
    const seen = new Set<string>();
    for (const seed of SEEDS) {
      const round = createEmotionRound({ choices: 2 }, createRandom(seed));
      round.choices.forEach((choice) => seen.add(choice));
    }
    expect([...seen].sort()).toEqual(['angry', 'happy', 'sad']);
  });
});

describe('situation rounds', () => {
  it("offer the story's feeling exactly once", () => {
    const skill = SKILLS['emotion-situation'];
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      for (const seed of SEEDS) {
        const round = createSituationRound(spec, createRandom(seed));
        const feeling = SITUATIONS[round.target];
        expect(round.choices).toHaveLength(spec.choices);
        expect(
          round.choices.filter((choice) => choice === feeling),
        ).toHaveLength(1);
        expect(round.choices[round.correctIndex]).toBe(feeling);
      }
    }
  });

  it('visits every story', () => {
    const seen = new Set(
      SEEDS.map(
        (seed) =>
          createSituationRound({ choices: 2 }, createRandom(seed)).target,
      ),
    );
    expect(seen.size).toBe(SITUATION_IDS.length);
  });
});

describe('greeting rounds', () => {
  it('offer distinct words with the right one at the correct index', () => {
    const skill = SKILLS.greetings;
    for (let level = 1; level <= maxLevel(skill); level += 1) {
      const spec = levelSpec(skill, level);
      for (const seed of SEEDS) {
        const round = createGreetingRound(spec, createRandom(seed));
        expect(new Set(round.choices).size).toBe(spec.choices);
        expect(round.choices[round.correctIndex]).toBe(round.target);
        expect(GREETINGS).toContain(round.target);
      }
    }
  });
});

describe('switching activities off', () => {
  it('keeps disabled activities out of every session', () => {
    const disabledSkills = ['emotion-find', 'emotion-situation'] as const;
    for (
      let previousSessions = 0;
      previousSessions < 20;
      previousSessions += 1
    ) {
      const steps = planSession({
        ageBand: '7-8',
        sessionMinutes: 20,
        previousSessions,
        disabledSkills: [...disabledSkills],
      });
      for (const step of steps) {
        if (step.kind === 'activity') {
          expect(disabledSkills).not.toContain(step.skillId);
        }
      }
    }
  });

  it('falls back to the whole rotation when everything is off', () => {
    expect(enabledSkills('3-4', skillsForAge('3-4'))).toEqual(
      skillsForAge('3-4'),
    );
  });

  it('reads profiles without the setting and drops unknown ids', () => {
    const base = {
      nickname: 'ريم',
      avatar: 'star-yellow',
      ageBand: '5-6',
      dialect: 'msa',
    } as const;
    expect(childProfileInputSchema.parse(base).disabledSkills).toEqual([]);
    expect(
      childProfileInputSchema.parse({
        ...base,
        disabledSkills: ['greetings', 'retired-game', 'greetings'],
      }).disabledSkills,
    ).toEqual(['greetings']);
  });
});
