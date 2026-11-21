import { describe, expect, it } from 'vitest';

import { crisisReply, looksLikeCrisis } from './assistant-safety';

describe('assistant crisis check', () => {
  it.each([
    'I want to die',
    'thinking about suicide',
    'je veux mourir',
    'بغيت نموت',
    'أفكر في الانتحار',
  ])('flags "%s"', (text) => {
    expect(looksLikeCrisis(text)).toBe(true);
  });

  it.each([
    'What events are coming up?',
    'Où se trouve l’académie ?',
    'أين تقع الأكاديمية؟',
  ])('does not flag "%s"', (text) => {
    expect(looksLikeCrisis(text)).toBe(false);
  });

  it('gives human contacts in every language', () => {
    for (const reply of Object.values(crisisReply)) {
      expect(reply).toContain('+213 777 07 71 97');
      expect(reply).toContain('+213 556 91 45 17');
    }
  });
});
