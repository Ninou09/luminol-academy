export const RECENT_ENQUIRY_STATUS_SEQUENCE = [
  'NEW',
  'IN_REVIEW',
  'CONTACTED',
  'CLOSED',
  'SPAM',
] as const;

export type RecentEnquiryStatus =
  (typeof RECENT_ENQUIRY_STATUS_SEQUENCE)[number];

export type RecentEnquiryStatusMixItem = {
  status: RecentEnquiryStatus;
  count: number;
};

export type RecentEnquiryStatusMixSummary = {
  total: number;
  items: RecentEnquiryStatusMixItem[];
};

export function normalizeRecentEnquiryStatusMix(
  groups: Array<{ status: string; _count: { _all: number } }>,
): RecentEnquiryStatusMixSummary {
  const counts = new Map<RecentEnquiryStatus, number>();

  for (const group of groups) {
    if (
      RECENT_ENQUIRY_STATUS_SEQUENCE.includes(
        group.status as RecentEnquiryStatus,
      ) &&
      Number.isFinite(group._count._all) &&
      group._count._all > 0
    ) {
      counts.set(
        group.status as RecentEnquiryStatus,
        Math.floor(group._count._all),
      );
    }
  }

  const items = RECENT_ENQUIRY_STATUS_SEQUENCE.flatMap((status) => {
    const count = counts.get(status);
    return count ? [{ status, count }] : [];
  });

  return {
    total: items.reduce((total, item) => total + item.count, 0),
    items,
  };
}
