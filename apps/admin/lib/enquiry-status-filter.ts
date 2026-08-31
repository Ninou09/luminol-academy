import type { EnquiryStatusValue } from './operations';

export function buildEnquiryStatusQuery(status: EnquiryStatusValue): string {
  const query = new URLSearchParams();
  query.set('status', status);
  return query.toString();
}
