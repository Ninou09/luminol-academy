import { z } from 'zod';

import type { Piece } from './pieces';
import { isSkillId, type SkillId } from './skills';
import { interestsSchema } from './themes';

/** Spoken-audio dialects. Modern Standard Arabic is always available. */
export const DIALECTS = [
  'msa',
  'maghrebi',
  'gulf',
  'egyptian',
  'levantine',
] as const;
export const dialectSchema = z.enum(DIALECTS);
export type Dialect = z.infer<typeof dialectSchema>;

/** Western digits (3) or Arabic-Indic digits (٣) for numbers the child sees. */
export const NUMERAL_STYLES = ['western', 'arabic-indic'] as const;
export const numeralStyleSchema = z.enum(NUMERAL_STYLES);
export type NumeralStyle = z.infer<typeof numeralStyleSchema>;

export const AGE_BANDS = ['3-4', '5-6', '7-8', '9-10'] as const;
export const ageBandSchema = z.enum(AGE_BANDS);
export type AgeBand = z.infer<typeof ageBandSchema>;

export const ANIMATION_LEVELS = ['none', 'low', 'normal'] as const;
export const animationLevelSchema = z.enum(ANIMATION_LEVELS);
export type AnimationLevel = z.infer<typeof animationLevelSchema>;

export const REWARD_STYLES = ['stars', 'character', 'quiet'] as const;
export const rewardStyleSchema = z.enum(REWARD_STYLES);
export type RewardStyle = z.infer<typeof rewardStyleSchema>;

export const VOICE_SPEEDS = ['slow', 'normal', 'brisk'] as const;
export const voiceSpeedSchema = z.enum(VOICE_SPEEDS);
export type VoiceSpeed = z.infer<typeof voiceSpeedSchema>;

export const SESSION_MINUTES = [5, 10, 15, 20] as const;
export const sessionMinutesSchema = z.union([
  z.literal(5),
  z.literal(10),
  z.literal(15),
  z.literal(20),
]);
export type SessionMinutes = z.infer<typeof sessionMinutesSchema>;

/** Volume is stored in quarter steps so the parent control stays simple. */
export const VOLUME_STEPS = [0, 0.25, 0.5, 0.75, 1] as const;
export const volumeSchema = z.union([
  z.literal(0),
  z.literal(0.25),
  z.literal(0.5),
  z.literal(0.75),
  z.literal(1),
]);
export type Volume = z.infer<typeof volumeSchema>;

export const sensorySettingsSchema = z.object({
  volume: volumeSchema,
  voiceSpeed: voiceSpeedSchema,
  animationLevel: animationLevelSchema,
  rewardStyle: rewardStyleSchema,
  sessionMinutes: sessionMinutesSchema,
});
export type SensorySettings = z.infer<typeof sensorySettingsSchema>;

export const DEFAULT_SENSORY_SETTINGS: SensorySettings = {
  volume: 0.5,
  voiceSpeed: 'slow',
  animationLevel: 'low',
  rewardStyle: 'stars',
  sessionMinutes: 10,
};

/** Avatars are code-drawn shape and color pairs, never photos of the child. */
export const AVATARS = [
  'star-yellow',
  'circle-blue',
  'heart-red',
  'triangle-green',
  'diamond-blue',
  'square-yellow',
] as const;
export const avatarSchema = z.enum(AVATARS);
export type Avatar = z.infer<typeof avatarSchema>;

const AVATAR_PIECES: Record<Avatar, Piece> = {
  'star-yellow': { shape: 'star', color: 'yellow', size: 'medium' },
  'circle-blue': { shape: 'circle', color: 'blue', size: 'medium' },
  'heart-red': { shape: 'heart', color: 'red', size: 'medium' },
  'triangle-green': { shape: 'triangle', color: 'green', size: 'medium' },
  'diamond-blue': { shape: 'diamond', color: 'blue', size: 'medium' },
  'square-yellow': { shape: 'square', color: 'yellow', size: 'medium' },
};

export function avatarPiece(avatar: Avatar): Piece {
  return AVATAR_PIECES[avatar];
}

/**
 * Activities a parent switched off. Ids the app no longer knows are dropped
 * rather than rejected, so an update never makes a saved profile unreadable.
 */
export const disabledSkillsSchema = z
  .array(z.string())
  .max(64)
  .transform((ids): SkillId[] => [...new Set(ids.filter(isSkillId))]);

/** Child profiles one device can hold. */
export const MAX_PROFILES = 6;

export const NICKNAME_MAX_LENGTH = 24;

export const nicknameSchema = z
  .string()
  .trim()
  .min(1)
  .max(NICKNAME_MAX_LENGTH)
  .refine((value) => !/[\p{Cc}<>]/u.test(value), {
    message: 'Nickname contains unsupported characters.',
  });

/** What a parent enters when creating a profile. Kept deliberately minimal. */
export const childProfileInputSchema = z.object({
  nickname: nicknameSchema,
  avatar: avatarSchema,
  ageBand: ageBandSchema,
  dialect: dialectSchema,
  /** Profiles saved before themes existed read back with shapes. */
  interests: interestsSchema.default(['shapes']),
  numeralStyle: numeralStyleSchema.default('western'),
  disabledSkills: disabledSkillsSchema.default([]),
  /** Wudu, prayer, Ramadan and Eid content; off until a parent turns it on. */
  religiousPack: z.boolean().default(false),
  /** Whether the prayer steps show a boy or a girl. */
  prayerPictures: z.enum(['boy', 'girl']).default('boy'),
});
export type ChildProfileInput = z.input<typeof childProfileInputSchema>;

export const childProfileSchema = childProfileInputSchema.extend({
  id: z.uuid(),
  sensory: sensorySettingsSchema,
  createdAt: z.iso.datetime(),
});
export type ChildProfile = z.infer<typeof childProfileSchema>;

export function createChildProfile(
  input: ChildProfileInput,
  id: string,
  now: Date,
): ChildProfile {
  return childProfileSchema.parse({
    ...childProfileInputSchema.parse(input),
    id,
    sensory: DEFAULT_SENSORY_SETTINGS,
    createdAt: now.toISOString(),
  });
}

/** Speech rate multipliers passed to the speech engine. */
export const VOICE_SPEED_RATES: Record<VoiceSpeed, number> = {
  slow: 0.75,
  normal: 0.9,
  brisk: 1.05,
};

/**
 * The device's reduce-motion preference always wins over the app setting.
 */
export function effectiveAnimationLevel(
  setting: AnimationLevel,
  systemReduceMotion: boolean,
): AnimationLevel {
  return systemReduceMotion ? 'none' : setting;
}
