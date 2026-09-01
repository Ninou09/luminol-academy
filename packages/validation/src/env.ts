import { z } from 'zod';

import { aiProviderEnvSchema } from './ai-provider';

export const databaseUrlSchema = z.url().startsWith('postgresql://');

const serverEnvSchema = z
  .object({
    DATABASE_URL: databaseUrlSchema,
    CLERK_SECRET_KEY: z.string().min(1).optional(),
    SANITY_API_TOKEN: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().startsWith('re_').optional(),
  })
  .extend(aiProviderEnvSchema.shape);

export function validateServerEnv(env: Record<string, string | undefined>) {
  return serverEnvSchema.parse(env);
}

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().default('production'),
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
});
