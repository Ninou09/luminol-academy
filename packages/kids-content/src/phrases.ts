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
  'nav.talk': 'لوحة الكلام',
  'nav.finish': 'إلى اللقاء',
  'activity.finish': 'احتفال صغير',
  'activity.done': 'انتهى هذا النشاط. أحسنت!',
  'matching.instruction': 'لنبحث عن الشكل نفسه',
  'matching.instructionPicture': 'لنبحث عن الصورة نفسها',
  'sorting.instruction.color': 'لنضع الشكل مع لونه',
  'sorting.instruction.shape': 'لنضع الشكل مع شكله',
  'sorting.instruction.size': 'لنضع الشكل مع حجمه',
  'causeEffect.instruction': 'لنلمس الصورة',
  'pattern.instruction': 'ماذا يأتي بعد ذلك؟',
  'memory.instruction': 'لنجد الصورتين المتشابهتين',
  'memory.hidden': 'بطاقة مقلوبة',
  'puzzle.instruction': 'لنكمل الصورة',
  'letters.matchInstruction': 'لنبحث عن الحرف نفسه',
  'letters.soundInstruction': 'لنجد الحرف',
  'letters.formsInstruction': 'لنجد الحرف نفسه في الكلمة',
  'trace.instruction': 'لنكتب الحرف مع النقاط',
  'count.instruction': 'لنعدّ الصور',
  'emotion.instruction': 'لننظر إلى الوجوه',
  'situation.instruction': 'لنستمع إلى القصة',
  'situation.question': 'كيف يشعر سامي؟',
  'greetings.instruction': 'ماذا نقول؟',
  'turns.instruction': 'لنلعب بالدور',
  'turns.mine': 'دوري',
  'turns.yours': 'دورك',
  'turns.wait': 'لننتظر دورنا',
  'turns.add': 'لنضع مكعّبًا',
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
  'aac.empty': 'لنختر صورة',
  'aac.speak': 'لنسمع',
  'aac.removeLast': 'لنمسح كلمة',
  'aac.clear': 'لنبدأ من جديد',
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
  'pattern-next': 'ماذا بعد؟',
  'memory-pairs': 'لعبة الذاكرة',
  'puzzle-complete': 'إكمال الصورة',
  'letter-match': 'مطابقة الحروف',
  'letter-sound': 'أصوات الحروف',
  'letter-forms': 'أشكال الحروف',
  'letter-trace': 'كتابة الحروف',
  'count-objects': 'العدّ',
  'emotion-find': 'الوجوه والمشاعر',
  'emotion-situation': 'كيف يشعر؟',
  'turn-taking': 'دوري ودورك',
  greetings: 'كلمات لطيفة',
};

export function skillTitle(skillId: SkillId): Utterance {
  return { key: `skill.${skillId}`, text: SKILL_TITLES[skillId] };
}
