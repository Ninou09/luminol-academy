import type { Prisma } from '@luminol/database';

export const enquiryAttentionFilters = [
  'unassigned',
  'active-without-follow-up',
  'closed-without-outcome',
] as const;

export type EnquiryAttentionFilter = (typeof enquiryAttentionFilters)[number];

export const ACTIVE_ENQUIRY_WHERE = {
  status: { notIn: ['CLOSED', 'SPAM'] },
} satisfies Prisma.EnquiryWhereInput;

export const ACTIVE_UNASSIGNED_ENQUIRY_WHERE = {
  ...ACTIVE_ENQUIRY_WHERE,
  ownerUserId: null,
} satisfies Prisma.EnquiryWhereInput;

export const ACTIVE_WITHOUT_FOLLOW_UP_WHERE = {
  status: { notIn: ['CLOSED', 'SPAM'] },
  nextFollowUpAt: null,
  nextAction: null,
} satisfies Prisma.EnquiryWhereInput;

export const CLOSED_WITHOUT_OUTCOME_WHERE = {
  status: 'CLOSED',
  outcome: null,
  outcomeAt: null,
} satisfies Prisma.EnquiryWhereInput;

export function parseEnquiryAttentionFilter(
  value: string | string[] | undefined,
): EnquiryAttentionFilter | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return null;

  return (enquiryAttentionFilters as readonly string[]).includes(candidate)
    ? (candidate as EnquiryAttentionFilter)
    : null;
}

export function getEnquiryAttentionWhere(
  filter: EnquiryAttentionFilter | null,
): Prisma.EnquiryWhereInput | null {
  if (filter === 'unassigned') return ACTIVE_UNASSIGNED_ENQUIRY_WHERE;
  if (filter === 'active-without-follow-up')
    return ACTIVE_WITHOUT_FOLLOW_UP_WHERE;
  if (filter === 'closed-without-outcome') return CLOSED_WITHOUT_OUTCOME_WHERE;
  return null;
}
