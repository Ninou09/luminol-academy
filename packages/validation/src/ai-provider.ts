import { z } from 'zod';

export const aiProviderModeSchema = z.enum(['OFF', 'OPENAI']);
export type AiProviderMode = z.infer<typeof aiProviderModeSchema>;

export const aiProviderTaskClassSchema = z.enum([
  'SUMMARIZE_OPERATIONAL_STATE',
  'DRAFT_OPERATOR_RECOMMENDATIONS',
  'ANALYZE_CAMPAIGN_METRICS',
]);
export type AiProviderTaskClass = z.infer<typeof aiProviderTaskClassSchema>;

const operationalMetricKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[A-Za-z][A-Za-z0-9_.:-]*$/);

const operationalMetricValueSchema = z
  .number()
  .finite()
  .min(-1_000_000_000_000)
  .max(1_000_000_000_000);

export const aiProviderOperationalMetricsSchema = z
  .record(operationalMetricKeySchema, operationalMetricValueSchema)
  .refine((metrics) => Object.keys(metrics).length > 0, {
    message: 'At least one operational metric is required',
  })
  .refine((metrics) => Object.keys(metrics).length <= 24, {
    message: 'At most 24 operational metrics are allowed',
  });

export const aiProviderRequestSchema = z
  .object({
    taskClass: aiProviderTaskClassSchema,
    metrics: aiProviderOperationalMetricsSchema,
  })
  .strict();

export type AiProviderRequest = z.infer<typeof aiProviderRequestSchema>;

export const aiProviderEnvSchema = z
  .object({
    LUMINOL_AI_PROVIDER_MODE: aiProviderModeSchema.default('OFF'),
    OPENAI_API_KEY: z.string().trim().min(1).optional(),
    LUMINOL_AI_MODEL: z.string().trim().min(1).max(120).default('gpt-5.6-luna'),
    LUMINOL_AI_MONTHLY_BUDGET_USD: z.coerce
      .number()
      .finite()
      .min(0)
      .max(10_000)
      .default(5),
    LUMINOL_AI_INPUT_USD_PER_MILLION: z.coerce
      .number()
      .finite()
      .min(0)
      .max(10_000)
      .default(0.2),
    LUMINOL_AI_OUTPUT_USD_PER_MILLION: z.coerce
      .number()
      .finite()
      .min(0)
      .max(10_000)
      .default(1.2),
    LUMINOL_AI_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1_000)
      .max(60_000)
      .default(15_000),
  })
  .strict();

export type AiProviderEnv = z.infer<typeof aiProviderEnvSchema>;

export function parseAiProviderEnv(env: Record<string, string | undefined>) {
  return aiProviderEnvSchema.parse({
    LUMINOL_AI_PROVIDER_MODE: env.LUMINOL_AI_PROVIDER_MODE,
    OPENAI_API_KEY: env.OPENAI_API_KEY,
    LUMINOL_AI_MODEL: env.LUMINOL_AI_MODEL,
    LUMINOL_AI_MONTHLY_BUDGET_USD: env.LUMINOL_AI_MONTHLY_BUDGET_USD,
    LUMINOL_AI_INPUT_USD_PER_MILLION: env.LUMINOL_AI_INPUT_USD_PER_MILLION,
    LUMINOL_AI_OUTPUT_USD_PER_MILLION: env.LUMINOL_AI_OUTPUT_USD_PER_MILLION,
    LUMINOL_AI_TIMEOUT_MS: env.LUMINOL_AI_TIMEOUT_MS,
  });
}
