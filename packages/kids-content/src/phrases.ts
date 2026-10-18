import type { SkillId } from '@luminol/kids-learning';

import type { Utterance } from './utterance';

/**
 * Child-facing phrases. Instructions use the first-person plural ("let's…")
 * so they read naturally for girls and boys without separate recordings, and
 * none of them describe a mistake.
 */
const PHRASE_TEXT = {
  'chooser.title': 'من سيلعب اليوم؟',
  'schedule.first': 'أوّلًا',
  'schedule.then': 'ثمّ',
  'schedule.start': 'هيّا نبدأ',
  'schedule.allDone': 'انتهينا! أحسنت',
  'nav.schedule': 'جدولي',
  'nav.calm': 'ركن الهدوء',
  'nav.finish': 'إلى اللقاء',
  'activity.finish': 'احتفال صغير',
  'activity.done': 'انتهى هذا النشاط. أحسنت!',
  'matching.instruction': 'لنبحث عن الشكل نفسه',
  'sorting.instruction.color': 'لنضع الشكل مع لونه',
  'sorting.instruction.shape': 'لنضع الشكل مع شكله',
  'sorting.instruction.size': 'لنضع الشكل مع حجمه',
  'causeEffect.instruction': 'لنلمس الشكل',
  'hint.look': 'لننظر هنا',
  'praise.wellDone': 'أحسنت!',
  'praise.great': 'رائع!',
  'praise.lovely': 'عمل جميل!',
  'praise.excellent': 'ممتاز!',
  'calm.title': 'ركن الهدوء',
  'calm.intro': 'لنتنفّس معًا ببطء',
  'calm.inhale': 'شهيق',
  'calm.exhale': 'زفير',
  'calm.soundOn': 'صوت هادئ',
  'calm.soundOff': 'بلا صوت',
  'calm.back': 'لنعد إلى اللعب',
} as const;

export type PhraseKey = keyof typeof PHRASE_TEXT;

export const PHRASE_KEYS = Object.keys(PHRASE_TEXT) as PhraseKey[];

export function phrase(key: PhraseKey): Utterance {
  return { key: `phrase.${key}`, text: PHRASE_TEXT[key] };
}

export const PRAISE_KEYS = [
  'praise.wellDone',
  'praise.great',
  'praise.lovely',
  'praise.excellent',
] as const satisfies readonly PhraseKey[];

/** Rotates praise so it stays warm without becoming random or surprising. */
export function praiseFor(index: number): Utterance {
  const key =
    PRAISE_KEYS[Math.abs(index) % PRAISE_KEYS.length] ?? 'praise.wellDone';
  return phrase(key);
}

const SKILL_TITLES: Record<SkillId, string> = {
  'cause-effect': 'المس وشاهد',
  'match-shapes': 'مطابقة الأشكال',
  'sort-color': 'فرز الألوان',
  'sort-shape': 'فرز الأشكال',
  'sort-size': 'فرز الأحجام',
};

export function skillTitle(skillId: SkillId): Utterance {
  return { key: `skill.${skillId}`, text: SKILL_TITLES[skillId] };
}
