import {
  BUILTIN_STORIES,
  BUILTIN_STORY_IDS,
  type BuiltinStoryId,
} from '@luminol/kids-learning';

import type { Utterance } from './utterance';

/**
 * Built-in social stories in the first person, with verbs that read the same
 * for girls and boys. Each sentence describes what happens and what the child
 * can do, never what the child did wrong.
 */
const STORIES = {
  angry: {
    title: 'عندما أغضب',
    pages: [
      'أحيانًا أشعر بالغضب، وكلّ الناس يغضبون أحيانًا.',
      'عندما أغضب، أتوقّف وأتنفّس ببطء.',
      'أستطيع أن أطلب استراحة في مكان هادئ.',
      'أستطيع أن أطلب عناقًا من شخص أحبّه.',
      'بعد قليل يهدأ جسمي، وأشعر بتحسّن.',
    ],
  },
  help: {
    title: 'عندما أحتاج إلى مساعدة',
    pages: [
      'أحيانًا يكون شيء ما صعبًا عليّ، وهذا لا بأس به.',
      'في المدرسة، أستطيع أن أطلب المساعدة من المعلّم.',
      'في البيت، أستطيع أن أطلب المساعدة من أمّي أو أبي.',
      'أقول ما أريد بكلماتي أو بلوحة الكلام.',
      'عندما يساعدني أحد، أقول: شكرًا.',
    ],
  },
  school: {
    title: 'الذهاب إلى المدرسة',
    pages: [
      'في الصباح، أستعدّ في البيت للذهاب إلى المدرسة.',
      'أذهب إلى المدرسة بالحافلة أو بالسيّارة.',
      'أصل إلى المدرسة، وأدخل إلى صفّي.',
      'يستقبلني المعلّم، وأجلس في مكاني.',
      'أتعلّم أشياء جديدة، وألعب مع أصدقائي.',
      'بعد المدرسة، أعود إلى البيت.',
    ],
  },
  bedtime: {
    title: 'وقت النوم',
    pages: [
      'في المساء، نتناول العشاء معًا.',
      'أذهب إلى الحمّام قبل النوم.',
      'نقرأ قصّة قصيرة معًا.',
      'أقول لأهلي: تصبحون على خير.',
      'أنام في سريري، ويرتاح جسمي حتى الصباح.',
    ],
  },
  change: {
    title: 'عندما تتغيّر الخطة',
    pages: [
      'أحيانًا نخطّط للذهاب إلى الحديقة.',
      'لكن قد يتغيّر الجوّ، فتتغيّر الخطة.',
      'عندها نبقى في البيت.',
      'أختار شيئًا آخر أحبّه، مثل قراءة كتاب.',
      'تغيُّر الخطة لا بأس به، وقد نذهب إلى الحديقة في يوم آخر.',
    ],
  },
  ramadan: {
    title: 'شهر رمضان',
    pages: [
      'عندما يظهر الهلال، يبدأ شهر رمضان.',
      'في رمضان، يصوم الكبار في النهار، فلا يأكلون ولا يشربون.',
      'عند غروب الشمس، نفطر على التمر والماء.',
      'تجتمع العائلة، ونأكل معًا.',
      'في الليل، يصلّي الناس ويدعون الله.',
      'رمضان شهر جميل ننتظره كلّ عام.',
    ],
  },
  eid: {
    title: 'عيد الفطر',
    pages: [
      'بعد رمضان، يأتي عيد الفطر.',
      'نقول: عيد مبارك، ونتعانق.',
      'نزور الأهل والأقارب في بيوتهم.',
      'قد نحصل على هدايا أو عيديّة.',
      'قد يكون العيد مزدحمًا وصاخبًا، وأستطيع أن أطلب استراحة.',
      'العيد يوم فرح.',
    ],
  },
} as const satisfies Record<
  BuiltinStoryId,
  { title: string; pages: readonly string[] }
>;

export function storyTitle(id: BuiltinStoryId): Utterance {
  return { key: `story.${id}.title`, text: STORIES[id].title };
}

/** The sentence of one page; pages are numbered from 1 in recording keys. */
export function storyPage(id: BuiltinStoryId, index: number): Utterance {
  const text = STORIES[id].pages[index];
  if (text === undefined) throw new Error(`Story ${id} has no page ${index}.`);
  return { key: `story.${id}.${index + 1}`, text };
}

export function storyPageCount(id: BuiltinStoryId): number {
  return STORIES[id].pages.length;
}

export function storyUtterances(): Utterance[] {
  return BUILTIN_STORY_IDS.flatMap((id) => [
    storyTitle(id),
    ...BUILTIN_STORIES[id].pages.map((_, index) => storyPage(id, index)),
  ]);
}
