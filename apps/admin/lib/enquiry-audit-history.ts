export const ENQUIRY_AUDIT_RELATION_LIMIT = 6;
export const ENQUIRY_AUDIT_TIMELINE_LIMIT = 12;

export type EnquiryAuditAction =
  | 'status-changed'
  | 'ownership-assigned'
  | 'ownership-reassigned'
  | 'ownership-cleared'
  | 'follow-up-planned'
  | 'follow-up-updated'
  | 'follow-up-cleared'
  | 'outcome-recorded'
  | 'outcome-updated'
  | 'outcome-cleared';

type AuditActor = {
  email: string;
  firstName: string | null;
  lastName: string | null;
};

type StatusEvent = {
  id: string;
  fromStatus: string;
  toStatus: string;
  createdAt: Date;
  actor: AuditActor;
};

type OwnershipEvent = {
  id: string;
  fromOwnerUserId: string | null;
  toOwnerUserId: string | null;
  createdAt: Date;
  actor: AuditActor;
};

type FollowUpEvent = {
  id: string;
  fromNextFollowUpAt: Date | null;
  toNextFollowUpAt: Date | null;
  createdAt: Date;
  actor: AuditActor;
};

type OutcomeEvent = {
  id: string;
  fromOutcomeAt: Date | null;
  toOutcomeAt: Date | null;
  createdAt: Date;
  actor: AuditActor;
};

export type EnquiryAuditTimelineItem = {
  id: string;
  action: EnquiryAuditAction;
  createdAt: Date;
  actor: AuditActor;
  fromStatus?: string;
  toStatus?: string;
  followUpAt?: Date | null;
};

type EnquiryAuditInput = {
  statusEvents: StatusEvent[];
  ownershipEvents: OwnershipEvent[];
  followUpEvents: FollowUpEvent[];
  outcomeEvents: OutcomeEvent[];
};

function ownershipAction(event: OwnershipEvent): EnquiryAuditAction {
  if (!event.toOwnerUserId) return 'ownership-cleared';
  return event.fromOwnerUserId ? 'ownership-reassigned' : 'ownership-assigned';
}

function followUpAction(event: FollowUpEvent): EnquiryAuditAction {
  if (!event.toNextFollowUpAt) return 'follow-up-cleared';
  return event.fromNextFollowUpAt ? 'follow-up-updated' : 'follow-up-planned';
}

function outcomeAction(event: OutcomeEvent): EnquiryAuditAction {
  if (!event.toOutcomeAt) return 'outcome-cleared';
  return event.fromOutcomeAt ? 'outcome-updated' : 'outcome-recorded';
}

export function buildEnquiryAuditTimeline(
  events: EnquiryAuditInput,
  limit = ENQUIRY_AUDIT_TIMELINE_LIMIT,
): EnquiryAuditTimelineItem[] {
  const items: EnquiryAuditTimelineItem[] = [
    ...events.statusEvents.map((event) => ({
      id: `status:${event.id}`,
      action: 'status-changed' as const,
      createdAt: event.createdAt,
      actor: event.actor,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
    })),
    ...events.ownershipEvents.map((event) => ({
      id: `ownership:${event.id}`,
      action: ownershipAction(event),
      createdAt: event.createdAt,
      actor: event.actor,
    })),
    ...events.followUpEvents.map((event) => ({
      id: `follow-up:${event.id}`,
      action: followUpAction(event),
      createdAt: event.createdAt,
      actor: event.actor,
      followUpAt: event.toNextFollowUpAt,
    })),
    ...events.outcomeEvents.map((event) => ({
      id: `outcome:${event.id}`,
      action: outcomeAction(event),
      createdAt: event.createdAt,
      actor: event.actor,
    })),
  ];

  return items
    .sort(
      (left, right) =>
        right.createdAt.getTime() - left.createdAt.getTime() ||
        left.id.localeCompare(right.id),
    )
    .slice(0, Math.max(0, limit));
}
