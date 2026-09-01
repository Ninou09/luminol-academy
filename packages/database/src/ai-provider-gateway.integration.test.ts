import { afterAll, describe, expect, test, vi } from 'vitest';

import {
  AiProviderUsageOutcome,
  db,
  getAiProviderUsageSummary,
  runAiProviderTask,
  type AiReasoningProvider,
} from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const baseNow = new Date('2026-09-01T18:30:00.000Z');

const successProvider: AiReasoningProvider = {
  mode: 'OPENAI',
  async run(input) {
    return {
      text: `Observed ${Object.keys(input.metrics).length} aggregate metrics.`,
      model: input.model,
      inputTokens: 100,
      outputTokens: 20,
    };
  },
};

function env(overrides: Record<string, string | undefined> = {}) {
  return {
    LUMINOL_AI_PROVIDER_MODE: 'OPENAI',
    OPENAI_API_KEY: `sk-integration-${suffix}`,
    LUMINOL_AI_MODEL: 'gpt-5.6-luna',
    LUMINOL_AI_MONTHLY_BUDGET_USD: '5',
    LUMINOL_AI_INPUT_USD_PER_MILLION: '0.2',
    LUMINOL_AI_OUTPUT_USD_PER_MILLION: '1.2',
    LUMINOL_AI_TIMEOUT_MS: '5000',
    ...overrides,
  };
}

suite('AI provider gateway persistence and budget controls', () => {
  afterAll(async () => {
    await db.$disconnect();
  });

  test('OFF mode records a zero-cost blocked attempt and never invokes a provider', async () => {
    const run = vi.fn(successProvider.run);
    const result = await runAiProviderTask(
      db,
      {
        taskClass: 'SUMMARIZE_OPERATIONAL_STATE',
        metrics: { activeEnquiries: 4 },
      },
      {
        env: env({ LUMINOL_AI_PROVIDER_MODE: 'OFF' }),
        provider: { mode: 'OPENAI', run },
        now: baseNow,
      },
    );

    expect(result).toEqual({
      status: 'BLOCKED',
      errorCode: 'AI_PROVIDER_OFF',
    });
    expect(run).not.toHaveBeenCalled();

    const stored = await db.aiProviderUsage.findFirstOrThrow({
      where: {
        occurredAt: baseNow,
        errorCode: 'AI_PROVIDER_OFF',
      },
    });
    expect(stored.outcome).toBe(AiProviderUsageOutcome.BLOCKED);
    expect(stored.estimatedCostUsdMicros).toBe(0);
    expect(stored.model).toBeNull();
  });

  test('missing OpenAI credentials fail closed without a network request', async () => {
    const result = await runAiProviderTask(
      db,
      {
        taskClass: 'SUMMARIZE_OPERATIONAL_STATE',
        metrics: { activeEnquiries: 2 },
      },
      {
        env: env({ OPENAI_API_KEY: undefined }),
        now: new Date(baseNow.getTime() + 1_000),
      },
    );

    expect(result).toEqual({
      status: 'BLOCKED',
      errorCode: 'AI_PROVIDER_MISSING_CREDENTIALS',
    });
  });

  test('executes one bounded structured task and replaces budget reservation with actual usage', async () => {
    const now = new Date(baseNow.getTime() + 2_000);
    const result = await runAiProviderTask(
      db,
      {
        taskClass: 'SUMMARIZE_OPERATIONAL_STATE',
        metrics: {
          activeEnquiries: 8,
          unassignedActiveEnquiries: 3,
          pastDueFollowUps: 2,
        },
      },
      { env: env(), provider: successProvider, now },
    );

    expect(result).toMatchObject({
      status: 'SUCCEEDED',
      model: 'gpt-5.6-luna',
      inputTokens: 100,
      outputTokens: 20,
      estimatedCostUsdMicros: 44,
    });

    const stored = await db.aiProviderUsage.findFirstOrThrow({
      where: { occurredAt: now },
    });
    expect(stored.outcome).toBe(AiProviderUsageOutcome.SUCCEEDED);
    expect(stored.inputTokens).toBe(100);
    expect(stored.outputTokens).toBe(20);
    expect(stored.estimatedCostUsdMicros).toBe(44);
    expect(stored.errorCode).toBeNull();
  });

  test('blocks before provider invocation when conservative request headroom exceeds the monthly allowance', async () => {
    const run = vi.fn(successProvider.run);
    const now = new Date(baseNow.getTime() + 3_000);
    const result = await runAiProviderTask(
      db,
      {
        taskClass: 'SUMMARIZE_OPERATIONAL_STATE',
        metrics: { activeEnquiries: 1 },
      },
      {
        env: env({ LUMINOL_AI_MONTHLY_BUDGET_USD: '0.001' }),
        provider: { mode: 'OPENAI', run },
        now,
      },
    );

    expect(result).toEqual({
      status: 'BLOCKED',
      errorCode: 'AI_BUDGET_EXHAUSTED',
    });
    expect(run).not.toHaveBeenCalled();
  });

  test('provider failures persist only bounded codes and never credentials or raw exception text', async () => {
    const provider: AiReasoningProvider = {
      mode: 'OPENAI',
      async run() {
        throw new Error(`raw provider failure sk-secret-${suffix}`);
      },
    };
    const now = new Date(baseNow.getTime() + 4_000);
    const result = await runAiProviderTask(
      db,
      {
        taskClass: 'DRAFT_OPERATOR_RECOMMENDATIONS',
        metrics: { pastDueFollowUps: 4 },
      },
      { env: env(), provider, now },
    );

    expect(result).toEqual({
      status: 'FAILED',
      errorCode: 'OPENAI_NETWORK_ERROR',
    });

    const stored = await db.aiProviderUsage.findFirstOrThrow({
      where: { occurredAt: now },
    });
    expect(stored.outcome).toBe(AiProviderUsageOutcome.FAILED);
    expect(stored.errorCode).toBe('OPENAI_NETWORK_ERROR');
    expect(JSON.stringify(stored)).not.toContain(`sk-secret-${suffix}`);
    expect(JSON.stringify(stored)).not.toContain(`sk-integration-${suffix}`);
  });

  test('summarizes current-month budget and failures without exposing prompts or secrets', async () => {
    const summary = await getAiProviderUsageSummary(db, {
      env: env(),
      now: new Date(baseNow.getTime() + 5_000),
    });

    expect(summary.mode).toBe('OPENAI');
    expect(summary.model).toBe('gpt-5.6-luna');
    expect(summary.requests).toBeGreaterThanOrEqual(5);
    expect(summary.succeeded).toBeGreaterThanOrEqual(1);
    expect(summary.failed).toBeGreaterThanOrEqual(1);
    expect(summary.blocked).toBeGreaterThanOrEqual(2);
    expect(summary.inputTokens).toBeGreaterThanOrEqual(100);
    expect(summary.outputTokens).toBeGreaterThanOrEqual(20);
    expect(summary.spentUsdMicros).toBeGreaterThan(0);
    expect(summary.remainingUsdMicros).toBeLessThan(summary.budgetUsdMicros);
    expect(JSON.stringify(summary)).not.toContain(`sk-integration-${suffix}`);
  });
});
