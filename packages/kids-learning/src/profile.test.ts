import { describe, expect, it } from 'vitest';

import {
  childProfileInputSchema,
  childProfileSchema,
  createChildProfile,
  DEFAULT_SENSORY_SETTINGS,
  effectiveAnimationLevel,
  sensorySettingsSchema,
} from './profile';
import { trialRecordSchema } from './records';

const ID = '7f1c2a8e-4b3d-4e5f-9a6b-1c2d3e4f5a6b';

describe('child profiles', () => {
  it('creates a profile with calm defaults', () => {
    const profile = createChildProfile(
      {
        nickname: '  ريم ',
        avatar: 'star-yellow',
        ageBand: '5-6',
        dialect: 'maghrebi',
      },
      ID,
      new Date('2026-10-18T09:00:00.000Z'),
    );
    expect(profile.nickname).toBe('ريم');
    expect(profile.sensory).toEqual(DEFAULT_SENSORY_SETTINGS);
    expect(childProfileSchema.parse(profile)).toEqual(profile);
  });

  it('defaults to quiet, slow and low-motion settings', () => {
    expect(DEFAULT_SENSORY_SETTINGS).toMatchObject({
      volume: 0.5,
      voiceSpeed: 'slow',
      animationLevel: 'low',
    });
  });

  it('rejects empty, overlong and markup nicknames', () => {
    const base = {
      avatar: 'star-yellow',
      ageBand: '3-4',
      dialect: 'msa',
    } as const;
    expect(
      childProfileInputSchema.safeParse({ ...base, nickname: '   ' }).success,
    ).toBe(false);
    expect(
      childProfileInputSchema.safeParse({ ...base, nickname: 'أ'.repeat(25) })
        .success,
    ).toBe(false);
    expect(
      childProfileInputSchema.safeParse({ ...base, nickname: '<b>' }).success,
    ).toBe(false);
  });

  it('rejects settings outside the supported steps', () => {
    expect(
      sensorySettingsSchema.safeParse({
        ...DEFAULT_SENSORY_SETTINGS,
        volume: 0.3,
      }).success,
    ).toBe(false);
    expect(
      sensorySettingsSchema.safeParse({
        ...DEFAULT_SENSORY_SETTINGS,
        sessionMinutes: 30,
      }).success,
    ).toBe(false);
  });

  it('lets the device reduce-motion setting override the app', () => {
    expect(effectiveAnimationLevel('normal', true)).toBe('none');
    expect(effectiveAnimationLevel('low', false)).toBe('low');
  });
});

describe('trial records', () => {
  it('rejects unknown skills', () => {
    const record = {
      childId: ID,
      sessionId: ID,
      skillId: 'match-shapes',
      level: 1,
      promptLevel: 'full',
      firstTryCorrect: true,
      wrongAttempts: 0,
      escalatedToGuide: false,
      responseMs: 1200,
      at: '2026-10-18T09:00:00.000Z',
    };
    expect(trialRecordSchema.safeParse(record).success).toBe(true);
    expect(
      trialRecordSchema.safeParse({ ...record, skillId: 'nope' }).success,
    ).toBe(false);
  });
});
