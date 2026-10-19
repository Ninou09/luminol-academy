import type { SkillId } from './skills';
import type { ThemeId } from './themes';

/**
 * Luminol Noor is free to use with one child. The Plus subscription adds
 * the rest. The communication board, the calm corner, the built-in routines
 * and stories, the religious pack and every privacy control are free on
 * every plan: a child's voice and calm are never behind a payment.
 */
export const PLANS = ['free', 'plus'] as const;
export type Plan = (typeof PLANS)[number];

/** A spread of activities across ages and areas, all playable for free. */
export const FREE_SKILLS: readonly SkillId[] = [
  'cause-effect',
  'match-shapes',
  'sort-color',
  'memory-pairs',
  'count-objects',
  'letter-match',
  'emotion-find',
  'turn-taking',
];

export const FREE_THEMES: readonly ThemeId[] = ['shapes', 'food'];

export const PROFILE_LIMITS: Record<Plan, number> = { free: 1, plus: 6 };

/** What Plus adds, in the order the parent area lists it. */
export const PLUS_FEATURES = [
  'all-activities',
  'all-themes',
  'profiles',
  'own-routines',
  'pdf-report',
] as const;
export type PlusFeature = (typeof PLUS_FEATURES)[number];

export function hasPlus(plan: Plan): boolean {
  return plan === 'plus';
}

export function isSkillPlayable(plan: Plan, skillId: SkillId): boolean {
  return hasPlus(plan) || FREE_SKILLS.includes(skillId);
}

export function isThemeAvailable(plan: Plan, theme: ThemeId): boolean {
  return hasPlus(plan) || FREE_THEMES.includes(theme);
}

/** The child's interests that the plan includes, or shapes if none are. */
export function playableInterests(
  interests: readonly ThemeId[],
  plan: Plan,
): ThemeId[] {
  const playable = interests.filter((theme) => isThemeAvailable(plan, theme));
  return playable.length > 0 ? playable : ['shapes'];
}

/**
 * New profiles stop at the plan's limit. Profiles made earlier always stay,
 * so a lapsed subscription never locks a child out.
 */
export function canAddProfile(plan: Plan, profileCount: number): boolean {
  return profileCount < PROFILE_LIMITS[plan];
}
