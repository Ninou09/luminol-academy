export type CrmTimelineKind =
  | 'enquiry-received'
  | 'status'
  | 'owner'
  | 'follow-up'
  | 'outcome'
  | 'activity'
  | 'appointment'
  | 'payment'
  | 'task'
  | 'client-created';

export type CrmTimelineItem = {
  id: string;
  kind: CrmTimelineKind;
  at: Date;
  title: string;
  detail?: string | null;
  actor?: string | null;
  tone?: 'default' | 'success' | 'warning';
};

/** Merges timeline sources newest first; stable for equal timestamps. */
export function buildCrmTimeline(
  ...sources: readonly (readonly CrmTimelineItem[])[]
): CrmTimelineItem[] {
  return sources
    .flat()
    .map((item, index) => ({ item, index }))
    .sort(
      (left, right) =>
        right.item.at.getTime() - left.item.at.getTime() ||
        left.index - right.index,
    )
    .map(({ item }) => item);
}

export function personLabel(
  person: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null,
) {
  if (!person) return null;
  return (
    [person.firstName, person.lastName].filter(Boolean).join(' ') ||
    person.email
  );
}
