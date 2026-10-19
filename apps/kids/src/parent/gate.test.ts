import { createRandom } from '@luminol/kids-learning';

import { createGateQuestion } from './gate';

describe('createGateQuestion', () => {
  it('asks a multiplication in Arabic words with four distinct options', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const question = createGateQuestion(createRandom(seed));
      expect(question.prompt).toMatch(/^ما ناتج ضرب [؀-ۿ]+ في [؀-ۿ]+؟$/);
      expect(question.prompt).not.toMatch(/\d/);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.answer).toBeGreaterThanOrEqual(9);
      expect(question.options.every((option) => option > 0)).toBe(true);
    }
  });
});
