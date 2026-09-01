import { describe, expect, test, vi } from 'vitest';

import {
  AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK,
  aiProviderBudgetWarning,
  createOffAiProvider,
  createOpenAiResponsesProvider,
  estimateAiProviderCostUsdMicros,
} from './ai-provider-gateway';

describe('AI provider gateway policy', () => {
  test('keeps the OFF provider incapable of external reasoning', async () => {
    const provider = createOffAiProvider();

    await expect(
      provider.run({
        taskClass: 'SUMMARIZE_OPERATIONAL_STATE',
        metrics: { activeEnquiries: 4 },
        model: 'gpt-5.6-luna',
        maxOutputTokens:
          AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK.SUMMARIZE_OPERATIONAL_STATE,
        timeoutMs: 5_000,
      }),
    ).rejects.toThrow('AI_PROVIDER_OFF');
  });

  test('calculates conservative usage cost and warning thresholds', () => {
    expect(
      estimateAiProviderCostUsdMicros({
        inputTokens: 1_000,
        outputTokens: 500,
        inputUsdPerMillion: 0.2,
        outputUsdPerMillion: 1.2,
      }),
    ).toBe(800);

    expect(
      aiProviderBudgetWarning({ spentUsdMicros: 2_000_000, budgetUsdMicros: 5_000_000 }),
    ).toBe('BELOW_50');
    expect(
      aiProviderBudgetWarning({ spentUsdMicros: 2_500_000, budgetUsdMicros: 5_000_000 }),
    ).toBe('AT_50');
    expect(
      aiProviderBudgetWarning({ spentUsdMicros: 4_000_000, budgetUsdMicros: 5_000_000 }),
    ).toBe('AT_80');
    expect(
      aiProviderBudgetWarning({ spentUsdMicros: 5_000_000, budgetUsdMicros: 5_000_000 }),
    ).toBe('EXHAUSTED');
  });
});

describe('OpenAI Responses provider', () => {
  test('sends only bounded structured metrics and returns bounded provider output', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'completed',
          model: 'gpt-5.6-luna',
          output: [
            {
              type: 'message',
              content: [
                {
                  type: 'output_text',
                  text: '- Active enquiries: 4\n- Past-due follow-ups: 2',
                },
              ],
            },
          ],
          usage: { input_tokens: 120, output_tokens: 35 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const provider = createOpenAiResponsesProvider({
      apiKey: 'sk-server-only-test',
      fetchImplementation,
    });

    const result = await provider.run({
      taskClass: 'SUMMARIZE_OPERATIONAL_STATE',
      metrics: { activeEnquiries: 4, pastDueFollowUps: 2 },
      model: 'gpt-5.6-luna',
      maxOutputTokens:
        AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK.SUMMARIZE_OPERATIONAL_STATE,
      timeoutMs: 5_000,
    });

    expect(result).toMatchObject({
      model: 'gpt-5.6-luna',
      inputTokens: 120,
      outputTokens: 35,
    });
    expect(result.text).toContain('Active enquiries');
    expect(fetchImplementation).toHaveBeenCalledTimes(1);

    const [, init] = fetchImplementation.mock.calls[0] ?? [];
    expect(init?.method).toBe('POST');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer sk-server-only-test');
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body.store).toBe(false);
    expect(body.model).toBe('gpt-5.6-luna');
    expect(body.max_output_tokens).toBe(
      AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK.SUMMARIZE_OPERATIONAL_STATE,
    );
    expect(String(body.input)).toContain('activeEnquiries');
    expect(String(body.input)).not.toContain('sk-server-only-test');
  });

  test.each([
    [401, 'OPENAI_AUTH_FAILED'],
    [429, 'OPENAI_RATE_LIMITED'],
    [503, 'OPENAI_UNAVAILABLE'],
    [400, 'OPENAI_REQUEST_FAILED'],
  ])('maps HTTP %i to a bounded safe error code', async (status, code) => {
    const provider = createOpenAiResponsesProvider({
      apiKey: 'sk-server-only-test',
      fetchImplementation: vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response('provider details must stay opaque', { status })),
    });

    await expect(
      provider.run({
        taskClass: 'SUMMARIZE_OPERATIONAL_STATE',
        metrics: { activeEnquiries: 1 },
        model: 'gpt-5.6-luna',
        maxOutputTokens:
          AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK.SUMMARIZE_OPERATIONAL_STATE,
        timeoutMs: 5_000,
      }),
    ).rejects.toThrow(code);
  });

  test('maps timeouts without retaining provider exception text', async () => {
    const timeout = new Error('secret transport detail');
    timeout.name = 'TimeoutError';
    const provider = createOpenAiResponsesProvider({
      apiKey: 'sk-server-only-test',
      fetchImplementation: vi.fn<typeof fetch>().mockRejectedValue(timeout),
    });

    await expect(
      provider.run({
        taskClass: 'SUMMARIZE_OPERATIONAL_STATE',
        metrics: { activeEnquiries: 1 },
        model: 'gpt-5.6-luna',
        maxOutputTokens:
          AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK.SUMMARIZE_OPERATIONAL_STATE,
        timeoutMs: 5_000,
      }),
    ).rejects.toThrow('OPENAI_TIMEOUT');
  });
});
