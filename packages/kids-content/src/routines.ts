import {
  BUILTIN_ROUTINE_IDS,
  type BuiltinRoutineId,
  type RoutinePicture,
} from '@luminol/kids-learning';

import type { Utterance } from './utterance';

/**
 * Built-in routines in the first person, one sentence per step. Prayer
 * sentences are the same for the boy's and the girl's pictures.
 */
const ROUTINES = {
  handwashing: {
    title: 'غسل اليدين',
    steps: [
      'أبلّل يديّ بالماء.',
      'أفرك يديّ بالصابون.',
      'أشطف يديّ بالماء.',
      'أجفّف يديّ بالمنشفة.',
    ],
  },
  toothbrushing: {
    title: 'تنظيف الأسنان',
    steps: [
      'أضع المعجون على الفرشاة.',
      'أنظّف أسناني بالفرشاة.',
      'أتمضمض بالماء.',
      'أعيد الفرشاة إلى الكوب.',
    ],
  },
  dressing: {
    title: 'ارتداء الملابس',
    steps: ['ألبس القميص.', 'ألبس السروال.', 'ألبس الجوارب.', 'ألبس الحذاء.'],
  },
  wudu: {
    title: 'الوضوء',
    steps: [
      'أنوي الوضوء، وأغسل يديّ.',
      'أتمضمض بالماء.',
      'أستنشق الماء، ثمّ أُخرجه.',
      'أغسل وجهي.',
      'أغسل يدي اليمنى إلى المرفق، ثمّ اليسرى.',
      'أمسح رأسي.',
      'أمسح أذنيّ.',
      'أغسل قدمي اليمنى إلى الكعبين، ثمّ اليسرى.',
    ],
  },
  prayer: {
    title: 'الصلاة',
    steps: [
      'أقف بهدوء، وأقول: الله أكبر.',
      'أركع.',
      'أرفع من الركوع، وأقف.',
      'أسجد.',
      'أجلس.',
      'أسلّم إلى اليمين.',
    ],
  },
} as const satisfies Record<
  BuiltinRoutineId,
  { title: string; steps: readonly string[] }
>;

export function routineTitle(id: BuiltinRoutineId): Utterance {
  return { key: `routine.${id}.title`, text: ROUTINES[id].title };
}

/** The sentence of one step; steps are numbered from 1 in recording keys. */
export function routineStep(id: BuiltinRoutineId, index: number): Utterance {
  const text = ROUTINES[id].steps[index];
  if (text === undefined)
    throw new Error(`Routine ${id} has no step ${index}.`);
  return { key: `routine.${id}.${index + 1}`, text };
}

export function routineStepCount(id: BuiltinRoutineId): number {
  return ROUTINES[id].steps.length;
}

export function routineUtterances(): Utterance[] {
  return BUILTIN_ROUTINE_IDS.flatMap((id) => [
    routineTitle(id),
    ...ROUTINES[id].steps.map((_, index) => routineStep(id, index)),
  ]);
}

/** Describes each routine picture for parents choosing one for a step. */
export const ROUTINE_PICTURE_LABELS: Record<RoutinePicture, string> = {
  'wash-wet': 'تبليل اليدين',
  'wash-soap': 'فرك اليدين بالصابون',
  'wash-rinse': 'شطف اليدين',
  'wash-dry': 'تجفيف اليدين',
  'teeth-paste': 'وضع المعجون على الفرشاة',
  'teeth-brush': 'تنظيف الأسنان',
  'teeth-rinse': 'المضمضة بالماء',
  'teeth-cup': 'إعادة الفرشاة إلى الكوب',
  'dress-shirt': 'ارتداء القميص',
  'dress-trousers': 'ارتداء السروال',
  'dress-socks': 'ارتداء الجوارب',
  'dress-shoes': 'ارتداء الحذاء',
  'wudu-hands': 'الوضوء: غسل اليدين',
  'wudu-mouth': 'الوضوء: المضمضة',
  'wudu-nose': 'الوضوء: الاستنشاق',
  'wudu-face': 'الوضوء: غسل الوجه',
  'wudu-arms': 'الوضوء: غسل الذراعين',
  'wudu-head': 'الوضوء: مسح الرأس',
  'wudu-ears': 'الوضوء: مسح الأذنين',
  'wudu-feet': 'الوضوء: غسل القدمين',
  'prayer-boy-stand': 'الصلاة (ولد): القيام',
  'prayer-boy-bow': 'الصلاة (ولد): الركوع',
  'prayer-boy-rise': 'الصلاة (ولد): الرفع من الركوع',
  'prayer-boy-prostrate': 'الصلاة (ولد): السجود',
  'prayer-boy-sit': 'الصلاة (ولد): الجلوس',
  'prayer-boy-salam': 'الصلاة (ولد): التسليم',
  'prayer-girl-stand': 'الصلاة (بنت): القيام',
  'prayer-girl-bow': 'الصلاة (بنت): الركوع',
  'prayer-girl-rise': 'الصلاة (بنت): الرفع من الركوع',
  'prayer-girl-prostrate': 'الصلاة (بنت): السجود',
  'prayer-girl-sit': 'الصلاة (بنت): الجلوس',
  'prayer-girl-salam': 'الصلاة (بنت): التسليم',
};
