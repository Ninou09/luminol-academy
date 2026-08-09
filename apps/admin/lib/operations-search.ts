import { z } from 'zod';

import {
  ADMIN_SEARCH_MAX_QUERY_LENGTH,
  ADMIN_SEARCH_MIN_QUERY_LENGTH,
} from './operations-search.constants';

export {
  ADMIN_SEARCH_MAX_QUERY_LENGTH,
  ADMIN_SEARCH_MIN_QUERY_LENGTH,
  ADMIN_SEARCH_RESULT_LIMIT,
} from './operations-search.constants';

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

export function isAdminSearchQueryEligible(value: string) {
  return value.length >= ADMIN_SEARCH_MIN_QUERY_LENGTH;
}

export function escapePostgresLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}
