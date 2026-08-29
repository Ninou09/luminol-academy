export const ENQUIRY_CONTACT_PREFERENCES = [
  'EMAIL',
  'PHONE',
  'WHATSAPP',
] as const;

export type EnquiryContactPreference =
  (typeof ENQUIRY_CONTACT_PREFERENCES)[number];

export type EnquiryContactPreferenceMixItem = {
  preferredContact: EnquiryContactPreference;
  count: number;
};

export type EnquiryContactPreferenceMixSummary = {
  total: number;
  missing: number;
  items: EnquiryContactPreferenceMixItem[];
};

function safeCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

export function normalizeEnquiryContactPreferenceMix(
  groups: Array<{
    preferredContact: string | null;
    _count: { _all: number };
  }>,
  total: number,
): EnquiryContactPreferenceMixSummary {
  const allowed = new Set<string>(ENQUIRY_CONTACT_PREFERENCES);
  const counts = new Map<EnquiryContactPreference, number>();

  for (const group of groups) {
    if (!allowed.has(group.preferredContact ?? '')) continue;
    const count = safeCount(group._count._all);
    if (count === 0) continue;

    const preference = group.preferredContact as EnquiryContactPreference;
    counts.set(preference, (counts.get(preference) ?? 0) + count);
  }

  const items = ENQUIRY_CONTACT_PREFERENCES.flatMap((preferredContact) => {
    const count = counts.get(preferredContact) ?? 0;
    return count > 0 ? [{ preferredContact, count }] : [];
  });
  const safeTotal = safeCount(total);
  const structuredTotal = items.reduce((sum, item) => sum + item.count, 0);

  return {
    total: safeTotal,
    missing: Math.max(0, safeTotal - structuredTotal),
    items,
  };
}
