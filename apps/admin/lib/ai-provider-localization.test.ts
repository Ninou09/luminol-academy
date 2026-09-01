import { describe, expect, test } from 'vitest';

import { getAiProviderCopy } from './ai-provider-localization';

describe('AI provider localization', () => {
  test.each(['en', 'fr', 'ar'] as const)(
    'provides complete protected gateway copy for %s',
    (locale) => {
      const copy = getAiProviderCopy(locale);

      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.modeDescription.OFF.length).toBeGreaterThan(0);
      expect(copy.modeDescription.OPENAI.length).toBeGreaterThan(0);
      expect(copy.warning.BELOW_50.length).toBeGreaterThan(0);
      expect(copy.warning.AT_50.length).toBeGreaterThan(0);
      expect(copy.warning.AT_80.length).toBeGreaterThan(0);
      expect(copy.warning.EXHAUSTED.length).toBeGreaterThan(0);
      expect(copy.taskLabel.SUMMARIZE_OPERATIONAL_STATE.length).toBeGreaterThan(
        0,
      );
      expect(
        copy.taskLabel.DRAFT_OPERATOR_RECOMMENDATIONS.length,
      ).toBeGreaterThan(0);
      expect(copy.taskLabel.ANALYZE_CAMPAIGN_METRICS.length).toBeGreaterThan(0);
      expect(copy.privacy.length).toBeGreaterThan(0);
    },
  );

  test('English copy states the zero-call and no-side-effect guardrails', () => {
    const copy = getAiProviderCopy('en');

    expect(copy.modeDescription.OFF).toContain('zero external AI requests');
    expect(copy.noSideEffects).toContain('cannot mutate CRM data');
    expect(copy.privacy).toContain('API keys are not stored');
  });
});
