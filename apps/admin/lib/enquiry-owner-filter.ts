import type { Prisma } from '@luminol/database';

export const enquiryOwnerFilters = ['mine'] as const;
export type EnquiryOwnerFilter = (typeof enquiryOwnerFilters)[number];

export function parseEnquiryOwnerFilter(
  value: string | string[] | undefined,
): EnquiryOwnerFilter | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === 'mine' ? candidate : null;
}

export function getEnquiryOwnerWhere(
  filter: EnquiryOwnerFilter | null,
  administratorId: string,
): Prisma.EnquiryWhereInput | null {
  return filter === 'mine' ? { ownerUserId: administratorId } : null;
}
