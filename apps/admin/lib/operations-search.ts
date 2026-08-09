import { z } from 'zod';

export const ADMIN_SEARCH_MAX_QUERY_LENGTH = 120;
export const ADMIN_SEARCH_RESULT_LIMIT = 20;

const adminSearchParamSchema = z
  .union([
    z.string().max(ADMIN_SEARCH_MAX_QUERY_LENGTH),
    z.array(z.string().max(ADMIN_SEARCH_MAX_QUERY_LENGTH)).max(1),
  ])
  .optional();

export function parseAdminSearchParam(value: unknown) {
  const parsed = adminSearchParamSchema.safeParse(value);
  if (!parsed.success) return undefined;
  return Array.isArray(parsed.data) ? parsed.data[0] : parsed.data;
}

export function normalizeAdminSearchQuery(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, ADMIN_SEARCH_MAX_QUERY_LENGTH);
}
