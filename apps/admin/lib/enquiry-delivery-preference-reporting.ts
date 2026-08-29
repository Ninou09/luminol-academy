export const ENQUIRY_DELIVERY_PREFERENCES = [
  'IN_PERSON',
  'ONLINE',
  'FLEXIBLE',
  'NOT_SURE',
] as const;

export type EnquiryDeliveryPreference =
  (typeof ENQUIRY_DELIVERY_PREFERENCES)[number];

export type EnquiryDeliveryPreferenceMixItem = {
  deliveryPreference: EnquiryDeliveryPreference;
  count: number;
};

export type EnquiryDeliveryPreferenceMixSummary = {
  total: number;
  missing: number;
  items: EnquiryDeliveryPreferenceMixItem[];
};

function safeCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

export function normalizeEnquiryDeliveryPreferenceMix(
  groups: Array<{
    deliveryPreference: string | null;
    _count: { _all: number };
  }>,
  total: number,
): EnquiryDeliveryPreferenceMixSummary {
  const allowed = new Set<string>(ENQUIRY_DELIVERY_PREFERENCES);
  const counts = new Map<EnquiryDeliveryPreference, number>();

  for (const group of groups) {
    if (!allowed.has(group.deliveryPreference ?? '')) continue;
    const count = safeCount(group._count._all);
    if (count === 0) continue;

    const preference = group.deliveryPreference as EnquiryDeliveryPreference;
    counts.set(preference, (counts.get(preference) ?? 0) + count);
  }

  const items = ENQUIRY_DELIVERY_PREFERENCES.flatMap((deliveryPreference) => {
    const count = counts.get(deliveryPreference) ?? 0;
    return count > 0 ? [{ deliveryPreference, count }] : [];
  });
  const safeTotal = safeCount(total);
  const structuredTotal = items.reduce((sum, item) => sum + item.count, 0);

  return {
    total: safeTotal,
    missing: Math.max(0, safeTotal - structuredTotal),
    items,
  };
}
