import type { Prisma } from '@luminol/database';

import {
  ENQUIRY_DELIVERY_PREFERENCES,
  type EnquiryDeliveryPreference,
} from './enquiry-delivery-preference-reporting';

export type { EnquiryDeliveryPreference };

export function parseEnquiryDeliveryPreferenceFilter(
  value: string | string[] | undefined,
): EnquiryDeliveryPreference | null {
  if (typeof value !== 'string' || value.length === 0) return null;

  return (ENQUIRY_DELIVERY_PREFERENCES as readonly string[]).includes(value)
    ? (value as EnquiryDeliveryPreference)
    : null;
}

export function getEnquiryDeliveryPreferenceWhere(
  deliveryPreference: EnquiryDeliveryPreference | null,
): Prisma.EnquiryWhereInput | null {
  return deliveryPreference ? { deliveryPreference } : null;
}

export function buildEnquiryDeliveryPreferenceQuery(
  deliveryPreference: EnquiryDeliveryPreference,
): string {
  const query = new URLSearchParams();
  query.set('deliveryPreference', deliveryPreference);
  return query.toString();
}
