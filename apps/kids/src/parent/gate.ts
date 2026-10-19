import { randomInt, shuffle, type Random } from '@luminol/kids-learning';

const NUMBER_WORDS: Record<number, string> = {
  3: 'ثلاثة',
  4: 'أربعة',
  5: 'خمسة',
  6: 'ستة',
  7: 'سبعة',
  8: 'ثمانية',
  9: 'تسعة',
};

export type GateQuestion = {
  /** Written in words so a pre-reading child cannot simply match digits. */
  prompt: string;
  answer: number;
  options: number[];
};

/**
 * An adult-level multiplication question, as app store kids-category rules
 * expect for parental gates.
 */
export function createGateQuestion(random: Random): GateQuestion {
  const left = 3 + randomInt(random, 7);
  const right = 3 + randomInt(random, 7);
  const answer = left * right;
  const candidates = [
    answer + left,
    answer - right,
    answer + 1,
    answer - 1,
    answer + right,
    answer + 10,
  ];
  const distractors = shuffle(
    random,
    [...new Set(candidates)].filter((value) => value > 0 && value !== answer),
  ).slice(0, 3);
  return {
    prompt: `ما ناتج ضرب ${NUMBER_WORDS[left]} في ${NUMBER_WORDS[right]}؟`,
    answer,
    options: shuffle(random, [answer, ...distractors]),
  };
}
