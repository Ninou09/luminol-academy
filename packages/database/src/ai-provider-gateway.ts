import {
  aiProviderRequestSchema,
  parseAiProviderEnv,
  type AiProviderRequest,
  type AiProviderTaskClass as AiProviderTaskClassValue,
} from '@luminol/validation/ai-provider';
import { z } from 'zod';

import {
  AiProviderMode,
  AiProviderTaskClass,
  AiProviderUsageOutcome,
  type PrismaClient,
} from '../generated/prisma/client';

const AI_PROVIDER_BUDGET_LOCK_KEY = 7_341_956_201;
const AI_PROVIDER_MAX_INPUT_TOKENS = 32_768;
const AI_PROVIDER_RESERVED_ERROR_CODE = 'AI_BUDGET_RESERVED';
const AI_PROVIDER_OUTPUT_CHARACTER_LIMIT = 4_000;

export const AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK = {
  SUMMARIZE_OPERATIONAL_STATE: 480,
  DRAFT_OPERATOR_RECOMMENDATIONS: 640,
  ANALYZE_CAMPAIGN_METRICS: 560,
} as const satisfies Record<AiProviderTaskClassValue, number>;

const AI_PROVIDER_TASK_INSTRUCTIONS = {
  SUMMARIZE_OPERATIONAL_STATE:
    'Summarize the supplied aggregate operational metrics in at most six concise bullets. Prioritize directly observable queue, follow-up, outcome, and workflow coverage gaps. Do not infer causes or individual intent.',
  DRAFT_OPERATOR_RECOMMENDATIONS:
    'Draft at most five advisory operational recommendations from the supplied aggregate metrics. Keep every recommendation non-clinical and evidence-bounded. Any recommendation that would mutate CRM data, contact a person, or publish content must explicitly state that the existing Luminol approval path is required.',
  ANALYZE_CAMPAIGN_METRICS:
    'Describe directly observable patterns in the supplied aggregate campaign metrics. Do not infer causality, ROI, lead quality, suitability, conversion probability, psychology, diagnosis, or clinical need from the metrics.',
} as const satisfies Record<AiProviderTaskClassValue, string>;

const AI_PROVIDER_TASK_TO_DATABASE = {
  SUMMARIZE_OPERATIONAL_STATE: AiProviderTaskClass.SUMMARIZE_OPERATIONAL_STATE,
  DRAFT_OPERATOR_RECOMMENDATIONS:
    AiProviderTaskClass.DRAFT_OPERATOR_RECOMMENDATIONS,
  ANALYZE_CAMPAIGN_METRICS: AiProviderTaskClass.ANALYZE_CAMPAIGN_METRICS,
} as const satisfies Record<AiProviderTaskClassValue, AiProviderTaskClass>;

export type AiProviderErrorCode =
  | 'AI_PROVIDER_OFF'
  | 'AI_PROVIDER_MISSING_CREDENTIALS'
  | 'AI_PROVIDER_MODE_MISMATCH'
  | 'AI_BUDGET_EXHAUSTED'
  | 'OPENAI_AUTH_FAILED'
  | 'OPENAI_RATE_LIMITED'
  | 'OPENAI_TIMEOUT'
  | 'OPENAI_UNAVAILABLE'
  | 'OPENAI_REQUEST_FAILED'
  | 'OPENAI_RESPONSE_INVALID'
  | 'OPENAI_RESPONSE_INCOMPLETE'
  | 'OPENAI_OUTPUT_INVALID'
  | 'OPENAI_NETWORK_ERROR'
  | 'AI_TOKEN_USAGE_EXCEEDED_BOUND';

class AiProviderSafeError extends Error {
  constructor(readonly code: AiProviderErrorCode) {
    super(code);
    this.name = 'AiProviderSafeError';
  }
}

export type AiReasoningProviderInput = {
  taskClass: AiProviderTaskClassValue;
  metrics: Record<string, number>;
  model: string;
  maxOutputTokens: number;
  timeoutMs: number;
};

export type AiReasoningProviderResult = {
  text: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
};

export interface AiReasoningProvider {
  readonly mode: 'OFF' | 'OPENAI';
  run(input: AiReasoningProviderInput): Promise<AiReasoningProviderResult>;
}

export function createOffAiProvider(): AiReasoningProvider {
  return {
    mode: 'OFF',
    async run() {
      throw new AiProviderSafeError('AI_PROVIDER_OFF');
    },
  };
}

const openAiResponseSchema = z
  .object({
    status: z.string().optional(),
    model: z.string().trim().min(1).max(120),
    output: z.array(
      z
        .object({
          type: z.string(),
          content: z
            .array(
              z
                .object({
                  type: z.string(),
                  text: z.string().optional(),
                })
                .passthrough(),
            )
            .optional(),
        })
        .passthrough(),
    ),
    usage: z
      .object({
        input_tokens: z.number().int().nonnegative(),
        output_tokens: z.number().int().nonnegative(),
      })
      .passthrough()
      .nullable()
      .optional(),
  })
  .passthrough();

function openAiOutputText(
  output: z.infer<typeof openAiResponseSchema>['output'],
) {
  const text = output
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text ?? '')
    .join('\n')
    .trim();

  if (!text || text.length > AI_PROVIDER_OUTPUT_CHARACTER_LIMIT) {
    throw new AiProviderSafeError('OPENAI_OUTPUT_INVALID');
  }
  return text;
}

function openAiHttpError(status: number): AiProviderSafeError {
  if (status === 401 || status === 403) {
    return new AiProviderSafeError('OPENAI_AUTH_FAILED');
  }
  if (status === 429) {
    return new AiProviderSafeError('OPENAI_RATE_LIMITED');
  }
  if (status >= 500) {
    return new AiProviderSafeError('OPENAI_UNAVAILABLE');
  }
  return new AiProviderSafeError('OPENAI_REQUEST_FAILED');
}

function isTimeoutError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  );
}

export function createOpenAiResponsesProvider(input: {
  apiKey: string;
  fetchImplementation?: typeof fetch;
}): AiReasoningProvider {
  const apiKey = input.apiKey.trim();
  if (!apiKey) throw new AiProviderSafeError('AI_PROVIDER_MISSING_CREDENTIALS');
  const fetchImplementation = input.fetchImplementation ?? fetch;

  return {
    mode: 'OPENAI',
    async run(request) {
      let response: Response;
      try {
        response = await fetchImplementation(
          'https://api.openai.com/v1/responses',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: request.model,
              instructions: [
                'You are the bounded reasoning layer for Luminol AI Operator.',
                'Use only the aggregate numeric metrics supplied in this request.',
                'Do not request, infer, reconstruct, or invent personal data or free-text records.',
                'Do not perform diagnosis, treatment advice, clinical urgency scoring, lead-quality scoring, conversion-probability scoring, suitability inference, autonomous CRM mutation, outbound messaging, or social publishing.',
                'Your output is advisory only and cannot bypass Luminol action validation, approval, readiness, or executor controls.',
                AI_PROVIDER_TASK_INSTRUCTIONS[request.taskClass],
              ].join(' '),
              input: JSON.stringify({
                taskClass: request.taskClass,
                metrics: request.metrics,
              }),
              max_output_tokens: request.maxOutputTokens,
              reasoning: { effort: 'low' },
              text: { verbosity: 'low' },
              store: false,
            }),
            signal: AbortSignal.timeout(request.timeoutMs),
          },
        );
      } catch (error) {
        if (isTimeoutError(error)) {
          throw new AiProviderSafeError('OPENAI_TIMEOUT');
        }
        throw new AiProviderSafeError('OPENAI_NETWORK_ERROR');
      }

      if (!response.ok) throw openAiHttpError(response.status);

      let raw: unknown;
      try {
        raw = await response.json();
      } catch {
        throw new AiProviderSafeError('OPENAI_RESPONSE_INVALID');
      }

      const parsed = openAiResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AiProviderSafeError('OPENAI_RESPONSE_INVALID');
      }
      if (parsed.data.status && parsed.data.status !== 'completed') {
        throw new AiProviderSafeError('OPENAI_RESPONSE_INCOMPLETE');
      }

      return {
        text: openAiOutputText(parsed.data.output),
        model: parsed.data.model,
        inputTokens: parsed.data.usage?.input_tokens ?? null,
        outputTokens: parsed.data.usage?.output_tokens ?? null,
      };
    },
  };
}

function monthBounds(now: Date) {
  if (!Number.isFinite(now.getTime()))
    throw new Error('Invalid AI provider time');
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );
  return { start, end };
}

function toDatabaseMode(mode: 'OFF' | 'OPENAI') {
  return mode === 'OPENAI' ? AiProviderMode.OPENAI : AiProviderMode.OFF;
}

function usdToMicros(usd: number) {
  return Math.max(0, Math.floor(usd * 1_000_000));
}

export function estimateAiProviderCostUsdMicros(input: {
  inputTokens: number;
  outputTokens: number;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
}) {
  const inputTokens = Math.max(0, Math.floor(input.inputTokens));
  const outputTokens = Math.max(0, Math.floor(input.outputTokens));
  return Math.ceil(
    inputTokens * input.inputUsdPerMillion +
      outputTokens * input.outputUsdPerMillion,
  );
}

function reservedCostUsdMicros(
  taskClass: AiProviderTaskClassValue,
  config: ReturnType<typeof parseAiProviderEnv>,
) {
  return estimateAiProviderCostUsdMicros({
    inputTokens: AI_PROVIDER_MAX_INPUT_TOKENS,
    outputTokens: AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK[taskClass],
    inputUsdPerMillion: config.LUMINOL_AI_INPUT_USD_PER_MILLION,
    outputUsdPerMillion: config.LUMINOL_AI_OUTPUT_USD_PER_MILLION,
  });
}

async function recordBlockedUsage(
  client: PrismaClient,
  input: {
    request: AiProviderRequest;
    mode: 'OFF' | 'OPENAI';
    model: string | null;
    errorCode: AiProviderErrorCode;
    now: Date;
  },
) {
  await client.aiProviderUsage.create({
    data: {
      providerMode: toDatabaseMode(input.mode),
      taskClass: AI_PROVIDER_TASK_TO_DATABASE[input.request.taskClass],
      outcome: AiProviderUsageOutcome.BLOCKED,
      model: input.model,
      estimatedCostUsdMicros: 0,
      errorCode: input.errorCode,
      occurredAt: input.now,
    },
  });
}

async function reserveMonthlyBudget(
  client: PrismaClient,
  input: {
    request: AiProviderRequest;
    model: string;
    budgetUsdMicros: number;
    reservationUsdMicros: number;
    now: Date;
  },
) {
  const { start, end } = monthBounds(input.now);

  return client.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(${AI_PROVIDER_BUDGET_LOCK_KEY})`;
    const aggregate = await transaction.aiProviderUsage.aggregate({
      where: { occurredAt: { gte: start, lt: end } },
      _sum: { estimatedCostUsdMicros: true },
    });
    const spentUsdMicros = aggregate._sum.estimatedCostUsdMicros ?? 0;
    const remainingUsdMicros = Math.max(
      0,
      input.budgetUsdMicros - spentUsdMicros,
    );

    if (
      input.budgetUsdMicros <= 0 ||
      input.reservationUsdMicros > remainingUsdMicros
    ) {
      await transaction.aiProviderUsage.create({
        data: {
          providerMode: AiProviderMode.OPENAI,
          taskClass: AI_PROVIDER_TASK_TO_DATABASE[input.request.taskClass],
          outcome: AiProviderUsageOutcome.BLOCKED,
          model: input.model,
          estimatedCostUsdMicros: 0,
          errorCode: 'AI_BUDGET_EXHAUSTED',
          occurredAt: input.now,
        },
      });
      return { usageId: null, spentUsdMicros, remainingUsdMicros };
    }

    const usage = await transaction.aiProviderUsage.create({
      data: {
        providerMode: AiProviderMode.OPENAI,
        taskClass: AI_PROVIDER_TASK_TO_DATABASE[input.request.taskClass],
        outcome: AiProviderUsageOutcome.BLOCKED,
        model: input.model,
        estimatedCostUsdMicros: input.reservationUsdMicros,
        errorCode: AI_PROVIDER_RESERVED_ERROR_CODE,
        occurredAt: input.now,
      },
      select: { id: true },
    });

    return {
      usageId: usage.id,
      spentUsdMicros: spentUsdMicros + input.reservationUsdMicros,
      remainingUsdMicros: Math.max(
        0,
        input.budgetUsdMicros - spentUsdMicros - input.reservationUsdMicros,
      ),
    };
  });
}

function safeProviderErrorCode(error: unknown): AiProviderErrorCode {
  if (error instanceof AiProviderSafeError) return error.code;
  return 'OPENAI_NETWORK_ERROR';
}

export type AiProviderGatewayResult =
  | {
      status: 'SUCCEEDED';
      text: string;
      model: string;
      inputTokens: number | null;
      outputTokens: number | null;
      estimatedCostUsdMicros: number;
    }
  | {
      status: 'BLOCKED' | 'FAILED';
      errorCode: AiProviderErrorCode;
    };

export async function runAiProviderTask(
  client: PrismaClient,
  rawRequest: unknown,
  options: {
    env?: Record<string, string | undefined>;
    provider?: AiReasoningProvider;
    fetchImplementation?: typeof fetch;
    now?: Date;
  } = {},
): Promise<AiProviderGatewayResult> {
  const request = aiProviderRequestSchema.parse(rawRequest);
  const config = parseAiProviderEnv(options.env ?? process.env);
  const now = options.now ?? new Date();
  monthBounds(now);
  const mode = config.LUMINOL_AI_PROVIDER_MODE;

  if (mode === 'OFF') {
    await recordBlockedUsage(client, {
      request,
      mode,
      model: null,
      errorCode: 'AI_PROVIDER_OFF',
      now,
    });
    return { status: 'BLOCKED', errorCode: 'AI_PROVIDER_OFF' };
  }

  if (!config.OPENAI_API_KEY?.trim() && !options.provider) {
    await recordBlockedUsage(client, {
      request,
      mode,
      model: config.LUMINOL_AI_MODEL,
      errorCode: 'AI_PROVIDER_MISSING_CREDENTIALS',
      now,
    });
    return {
      status: 'BLOCKED',
      errorCode: 'AI_PROVIDER_MISSING_CREDENTIALS',
    };
  }

  const provider =
    options.provider ??
    createOpenAiResponsesProvider({
      apiKey: config.OPENAI_API_KEY ?? '',
      fetchImplementation: options.fetchImplementation,
    });
  if (provider.mode !== 'OPENAI') {
    await recordBlockedUsage(client, {
      request,
      mode,
      model: config.LUMINOL_AI_MODEL,
      errorCode: 'AI_PROVIDER_MODE_MISMATCH',
      now,
    });
    return { status: 'BLOCKED', errorCode: 'AI_PROVIDER_MODE_MISMATCH' };
  }

  const budgetUsdMicros = usdToMicros(config.LUMINOL_AI_MONTHLY_BUDGET_USD);
  const reservationUsdMicros = reservedCostUsdMicros(request.taskClass, config);
  const reservation = await reserveMonthlyBudget(client, {
    request,
    model: config.LUMINOL_AI_MODEL,
    budgetUsdMicros,
    reservationUsdMicros,
    now,
  });
  if (!reservation.usageId) {
    return { status: 'BLOCKED', errorCode: 'AI_BUDGET_EXHAUSTED' };
  }

  const startedAt = Date.now();
  try {
    const result = await provider.run({
      taskClass: request.taskClass,
      metrics: request.metrics,
      model: config.LUMINOL_AI_MODEL,
      maxOutputTokens: AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK[request.taskClass],
      timeoutMs: config.LUMINOL_AI_TIMEOUT_MS,
    });
    const latencyMs = Math.max(0, Date.now() - startedAt);

    if (
      (result.inputTokens !== null &&
        result.inputTokens > AI_PROVIDER_MAX_INPUT_TOKENS) ||
      (result.outputTokens !== null &&
        result.outputTokens >
          AI_PROVIDER_MAX_OUTPUT_TOKENS_BY_TASK[request.taskClass])
    ) {
      await client.aiProviderUsage.update({
        where: { id: reservation.usageId },
        data: {
          outcome: AiProviderUsageOutcome.FAILED,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          latencyMs,
          errorCode: 'AI_TOKEN_USAGE_EXCEEDED_BOUND',
        },
      });
      return {
        status: 'FAILED',
        errorCode: 'AI_TOKEN_USAGE_EXCEEDED_BOUND',
      };
    }

    const estimatedCostUsdMicros =
      result.inputTokens !== null && result.outputTokens !== null
        ? estimateAiProviderCostUsdMicros({
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            inputUsdPerMillion: config.LUMINOL_AI_INPUT_USD_PER_MILLION,
            outputUsdPerMillion: config.LUMINOL_AI_OUTPUT_USD_PER_MILLION,
          })
        : reservationUsdMicros;

    await client.aiProviderUsage.update({
      where: { id: reservation.usageId },
      data: {
        outcome: AiProviderUsageOutcome.SUCCEEDED,
        model: result.model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        estimatedCostUsdMicros: Math.min(
          reservationUsdMicros,
          estimatedCostUsdMicros,
        ),
        latencyMs,
        errorCode: null,
      },
    });

    return {
      status: 'SUCCEEDED',
      text: result.text,
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCostUsdMicros: Math.min(
        reservationUsdMicros,
        estimatedCostUsdMicros,
      ),
    };
  } catch (error) {
    const errorCode = safeProviderErrorCode(error);
    await client.aiProviderUsage.update({
      where: { id: reservation.usageId },
      data: {
        outcome: AiProviderUsageOutcome.FAILED,
        latencyMs: Math.max(0, Date.now() - startedAt),
        errorCode,
      },
    });
    return { status: 'FAILED', errorCode };
  }
}

export type AiProviderBudgetWarning =
  'BELOW_50' | 'AT_50' | 'AT_80' | 'EXHAUSTED';

export function aiProviderBudgetWarning(input: {
  spentUsdMicros: number;
  budgetUsdMicros: number;
}): AiProviderBudgetWarning {
  if (
    input.budgetUsdMicros <= 0 ||
    input.spentUsdMicros >= input.budgetUsdMicros
  ) {
    return 'EXHAUSTED';
  }
  const ratio = input.spentUsdMicros / input.budgetUsdMicros;
  if (ratio >= 0.8) return 'AT_80';
  if (ratio >= 0.5) return 'AT_50';
  return 'BELOW_50';
}

export async function getAiProviderUsageSummary(
  client: PrismaClient,
  options: {
    env?: Record<string, string | undefined>;
    now?: Date;
    recentFailureLimit?: number;
  } = {},
) {
  const config = parseAiProviderEnv(options.env ?? process.env);
  const now = options.now ?? new Date();
  const { start, end } = monthBounds(now);
  const recentFailureLimit = Math.max(
    1,
    Math.min(20, Math.floor(options.recentFailureLimit ?? 8)),
  );

  const [aggregate, succeeded, failed, blocked, recentFailures] =
    await Promise.all([
      client.aiProviderUsage.aggregate({
        where: { occurredAt: { gte: start, lt: end } },
        _count: true,
        _sum: {
          inputTokens: true,
          outputTokens: true,
          estimatedCostUsdMicros: true,
        },
      }),
      client.aiProviderUsage.count({
        where: {
          occurredAt: { gte: start, lt: end },
          outcome: AiProviderUsageOutcome.SUCCEEDED,
        },
      }),
      client.aiProviderUsage.count({
        where: {
          occurredAt: { gte: start, lt: end },
          outcome: AiProviderUsageOutcome.FAILED,
        },
      }),
      client.aiProviderUsage.count({
        where: {
          occurredAt: { gte: start, lt: end },
          outcome: AiProviderUsageOutcome.BLOCKED,
          NOT: { errorCode: AI_PROVIDER_RESERVED_ERROR_CODE },
        },
      }),
      client.aiProviderUsage.findMany({
        where: {
          occurredAt: { gte: start, lt: end },
          OR: [
            { outcome: AiProviderUsageOutcome.FAILED },
            {
              outcome: AiProviderUsageOutcome.BLOCKED,
              NOT: { errorCode: AI_PROVIDER_RESERVED_ERROR_CODE },
            },
          ],
        },
        orderBy: { occurredAt: 'desc' },
        take: recentFailureLimit,
        select: {
          id: true,
          providerMode: true,
          taskClass: true,
          model: true,
          errorCode: true,
          occurredAt: true,
        },
      }),
    ]);

  const budgetUsdMicros = usdToMicros(config.LUMINOL_AI_MONTHLY_BUDGET_USD);
  const spentUsdMicros = aggregate._sum.estimatedCostUsdMicros ?? 0;

  return {
    mode: config.LUMINOL_AI_PROVIDER_MODE,
    model: config.LUMINOL_AI_MODEL,
    budgetUsdMicros,
    spentUsdMicros,
    remainingUsdMicros: Math.max(0, budgetUsdMicros - spentUsdMicros),
    warning: aiProviderBudgetWarning({ spentUsdMicros, budgetUsdMicros }),
    requests: aggregate._count,
    succeeded,
    failed,
    blocked,
    inputTokens: aggregate._sum.inputTokens ?? 0,
    outputTokens: aggregate._sum.outputTokens ?? 0,
    recentFailures,
    monthStart: start,
    monthEnd: end,
  };
}
