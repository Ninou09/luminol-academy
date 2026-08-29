export const ACTIVE_ENQUIRY_STATUS_SEQUENCE = [
  'NEW',
  'IN_REVIEW',
  'CONTACTED',
] as const;

export type ActiveEnquiryStatus =
  (typeof ACTIVE_ENQUIRY_STATUS_SEQUENCE)[number];

export type ActiveEnquiryStatusMixItem = {
  status: ActiveEnquiryStatus;
  count: number;
};

export type ActiveEnquiryStatusMixSummary = {
  activeTotal: number;
  items: ActiveEnquiryStatusMixItem[];
};

export function normalizeActiveEnquiryStatusMix(
  groups: Array<{ status: string; _count: { _all: number } }>,
): ActiveEnquiryStatusMixSummary {
  const counts = new Map<ActiveEnquiryStatus, number>();

  for (const group of groups) {
    if (
      ACTIVE_ENQUIRY_STATUS_SEQUENCE.includes(
        group.status as ActiveEnquiryStatus,
      ) &&
      Number.isFinite(group._count._all) &&
      group._count._all > 0
    ) {
      counts.set(
        group.status as ActiveEnquiryStatus,
        Math.floor(group._count._all),
      );
    }
  }

  const items = ACTIVE_ENQUIRY_STATUS_SEQUENCE.flatMap((status) => {
    const count = counts.get(status);
    return count ? [{ status, count }] : [];
  });

  return {
    activeTotal: items.reduce((total, item) => total + item.count, 0),
    items,
  };
}
