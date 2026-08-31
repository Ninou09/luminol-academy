import type { EnquiryActiveAgeBucket } from './enquiry-active-age-filter';
import type { EnquiryAttentionFilter } from './enquiry-attention';

export const ENQUIRY_OPERATIONAL_AGE_ATTENTION_FILTERS = [
  'unassigned',
  'active-without-follow-up',
  'active-incomplete-qualification',
  'active-without-recorded-contact',
] as const satisfies readonly EnquiryAttentionFilter[];

export type EnquiryOperationalAgeAttention =
  (typeof ENQUIRY_OPERATIONAL_AGE_ATTENTION_FILTERS)[number];

export function buildEnquiryOperationalAgeQuery(
  attention: EnquiryOperationalAgeAttention,
  activeAge: EnquiryActiveAgeBucket,
): string {
  const query = new URLSearchParams();
  query.set('attention', attention);
  query.set('activeAge', activeAge);
  return query.toString();
}
