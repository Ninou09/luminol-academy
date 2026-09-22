import { z } from 'zod';

export const WORKSHOP_TALLY_REGISTRATION_URL = 'https://tally.so/r/GxMz8z';

export type WorkshopSearchParams = Record<
  string,
  string | string[] | undefined
>;

const textAttributionSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .refine(
    (value) =>
      !Array.from(value).some((character) => {
        const codePoint = character.codePointAt(0);
        return (
          codePoint !== undefined && (codePoint <= 0x1f || codePoint === 0x7f)
        );
      }),
    'Attribution values cannot contain control characters',
  );

const metaIdSchema = z
  .string()
  .trim()
  .regex(/^\d{1,100}$/);

const attributionSchema = z.object({
  utm_source: textAttributionSchema.optional(),
  utm_medium: textAttributionSchema.optional(),
  utm_campaign: textAttributionSchema.optional(),
  utm_content: textAttributionSchema.optional(),
  meta_campaign_id: metaIdSchema.optional(),
  meta_adset_id: metaIdSchema.optional(),
  meta_ad_id: metaIdSchema.optional(),
});

const attributionKeys = Object.keys(attributionSchema.shape) as (keyof z.infer<
  typeof attributionSchema
>)[];

export function buildWorkshopRegistrationHref(
  searchParams: WorkshopSearchParams,
): string {
  const candidate = Object.fromEntries(
    attributionKeys.flatMap((key) => {
      const value = searchParams[key];
      return typeof value === 'string' ? [[key, value]] : [];
    }),
  );
  const parsed = attributionSchema.safeParse(candidate);
  const url = new URL(WORKSHOP_TALLY_REGISTRATION_URL);

  if (!parsed.success) return url.toString();

  for (const key of attributionKeys) {
    const value = parsed.data[key];
    if (value) url.searchParams.set(key, value);
  }

  return url.toString();
}
