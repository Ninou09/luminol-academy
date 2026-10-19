import {
  EMOTIONS,
  GREETINGS,
  SITUATION_IDS,
  type Emotion,
  type GreetingId,
  type SituationId,
} from '@luminol/kids-learning';

import { aacCardLabel } from './aac';
import type { Utterance } from './utterance';

/** Feelings are board words, so their names reuse the board's recordings. */
export function emotionName(emotion: Emotion): Utterance {
  return { key: `aac.card.${emotion}`, text: aacCardLabel(emotion) };
}

const EMOTION_QUESTIONS: Record<Emotion, string> = {
  happy: 'أين الوجه السعيد؟',
  sad: 'أين الوجه الحزين؟',
  angry: 'أين الوجه الغاضب؟',
  scared: 'أين الوجه الخائف؟',
  tired: 'أين الوجه المتعب؟',
};

export function emotionQuestion(emotion: Emotion): Utterance {
  return { key: `emotion.find.${emotion}`, text: EMOTION_QUESTIONS[emotion] };
}

/**
 * Short stories about Sami, one sentence each, describing what happened and
 * never the feeling itself, so the child works it out.
 */
const SITUATION_TEXT: Record<SituationId, string> = {
  gift: 'حصل سامي على هديّة جميلة.',
  park: 'ذهب سامي إلى الحديقة ليلعب.',
  'broken-toy': 'انكسرت لعبة سامي المفضّلة.',
  'friend-left': 'عاد صديق سامي إلى بيته، وبقي سامي وحده.',
  'toy-taken': 'أخذ ولد لعبة سامي دون أن يسأله.',
  'tower-knocked': 'بنى سامي برجًا، فأوقعه أحدهم.',
  thunder: 'سمع سامي صوت رعد قويّ في الليل.',
  'barking-dog': 'نبح كلب كبير بصوت عالٍ قرب سامي.',
  'long-day': 'لعب سامي وركض طوال اليوم.',
  'long-walk': 'مشى سامي مسافة طويلة جدًّا.',
};

export function situationStory(id: SituationId): Utterance {
  return { key: `situation.${id}`, text: SITUATION_TEXT[id] };
}

/**
 * Everyday moments in the first-person plural, each with the words we say.
 * The person spoken to is named, so the polite words agree with them.
 */
const GREETING_TEXT: Record<GreetingId, { moment: string; words: string }> = {
  'good-morning': {
    moment: 'استيقظنا في الصباح، ورأينا أبي.',
    words: 'صباح الخير',
  },
  goodbye: {
    moment: 'انتهت زيارة جدّتي، وهي تخرج من الباب.',
    words: 'مع السلامة',
  },
  thanks: { moment: 'أعطتنا المعلّمة قلمًا.', words: 'شكرًا' },
  peace: { moment: 'دخلنا إلى بيت عمّي.', words: 'السلام عليكم' },
  'good-night': {
    moment: 'حان وقت النوم، وأمّي تطفئ الضوء.',
    words: 'تصبحين على خير',
  },
  please: { moment: 'نريد الماء، ونطلبه من أخي.', words: 'من فضلك' },
  'excuse-me': {
    moment: 'نريد أن نمرّ، وصديقنا يقف في الطريق.',
    words: 'عذرًا',
  },
};

export function greetingMoment(id: GreetingId): Utterance {
  return { key: `greeting.moment.${id}`, text: GREETING_TEXT[id].moment };
}

export function greetingWords(id: GreetingId): Utterance {
  return { key: `greeting.words.${id}`, text: GREETING_TEXT[id].words };
}

export function socialUtterances(): Utterance[] {
  return [
    ...EMOTIONS.map(emotionQuestion),
    ...SITUATION_IDS.map(situationStory),
    ...GREETINGS.flatMap((id) => [greetingMoment(id), greetingWords(id)]),
  ];
}
