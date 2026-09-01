import { aiOperatorPublishSocialContentActionSchema } from '@luminol/validation/ai-operator';
import {
  contentCalendarAccountRefSchema,
  contentCalendarAssetReferenceSchema,
  contentCalendarCaptionSchema,
  contentCalendarFormatSchema,
  contentCalendarPlatformSchema,
  contentCalendarStatusSchema,
  contentCalendarTitleSchema,
  ianaTimezoneSchema,
} from '@luminol/validation/content-calendar';

import {
  ContentCalendarEventType,
  ContentCalendarStatus,
  type ContentCalendarItem,
  type PrismaClient,
} from '../generated/prisma/client';
import { queueAiOperatorProposal } from './ai-operator-proposals';

const statusTransitions: Record<ContentCalendarStatus, ContentCalendarStatus[]> = {
  DRAFT: [ContentCalendarStatus.READY, ContentCalendarStatus.ARCHIVED],
  READY: [
    ContentCalendarStatus.DRAFT,
    ContentCalendarStatus.SCHEDULED,
    ContentCalendarStatus.ARCHIVED,
  ],
  SCHEDULED: [
    ContentCalendarStatus.READY,
    ContentCalendarStatus.ARCHIVED,
  ],
  ARCHIVED: [],
};

function requireIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 255) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function requireRevision(value: number) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error('Content calendar revision is invalid');
  }
  return value;
}

function validDate(value: Date, label: string) {
  if (!Number.isFinite(value.getTime())) throw new Error(`${label} is invalid`);
  return value;
}

function normalizeOptionalAssetReference(value?: string | null) {
  if (value == null || !value.trim()) return null;
  return contentCalendarAssetReferenceSchema.parse(value);
}

function normalizeSchedule(
  scheduledFor: Date | null | undefined,
  timezone: string | null | undefined,
  now: Date,
  requireSchedule: boolean,
) {
  const hasDate = scheduledFor != null;
  const hasTimezone = timezone != null && timezone.trim().length > 0;

  if (hasDate !== hasTimezone) {
    throw new Error(
      'Content calendar schedule requires both an instant and an IANA timezone',
    );
  }
  if (requireSchedule && !hasDate) {
    throw new Error('Scheduled content requires a schedule and timezone');
  }
  if (!hasDate) return { scheduledFor: null, timezone: null };

  const normalizedDate = validDate(
    new Date(scheduledFor!.getTime()),
    'Content calendar schedule',
  );
  const normalizedTimezone = ianaTimezoneSchema.parse(timezone);
  if (normalizedDate.getTime() <= now.getTime()) {
    throw new Error('Content calendar schedule must be in the future');
  }
  return {
    scheduledFor: normalizedDate,
    timezone: normalizedTimezone,
  };
}

function normalizeContentFields(
  input: {
    title: string;
    caption: string;
    platform: string;
    accountRef: string;
    format: string;
    assetReference?: string | null;
    scheduledFor?: Date | null;
    timezone?: string | null;
  },
  now: Date,
) {
  return {
    title: contentCalendarTitleSchema.parse(input.title),
    caption: contentCalendarCaptionSchema.parse(input.caption),
    platform: contentCalendarPlatformSchema.parse(input.platform),
    accountRef: contentCalendarAccountRefSchema.parse(input.accountRef),
    format: contentCalendarFormatSchema.parse(input.format),
    assetReference: normalizeOptionalAssetReference(input.assetReference),
    ...normalizeSchedule(input.scheduledFor, input.timezone, now, false),
  };
}

export function contentCalendarPublishActionId(
  item: Pick<ContentCalendarItem, 'id' | 'revision'>,
) {
  return `content-calendar:v1:publish:${item.id}:r${item.revision}`;
}

export function buildContentCalendarPublishAction(
  item: Pick<
    ContentCalendarItem,
    'id' | 'revision' | 'status' | 'platform' | 'accountRef'
  >,
) {
  if (
    item.status !== ContentCalendarStatus.READY &&
    item.status !== ContentCalendarStatus.SCHEDULED
  ) {
    throw new Error(
      'Only ready or scheduled content can enter the publish approval queue',
    );
  }

  return aiOperatorPublishSocialContentActionSchema.parse({
    version: '1',
    actionId: contentCalendarPublishActionId(item),
    kind: 'PUBLISH_SOCIAL_CONTENT',
    executionPolicy: 'approval_required',
    source: {
      surface: 'content_calendar',
      reference: `${item.id}:r${item.revision}`,
    },
    target: {
      surface: 'social_account',
      platform: item.platform,
      accountRef: item.accountRef,
    },
    payload: {
      contentCalendarItemId: item.id,
      contentRevision: item.revision,
    },
  });
}

export async function createContentCalendarItem(
  client: PrismaClient,
  input: {
    actorUserId: string;
    title: string;
    caption: string;
    platform: string;
    accountRef: string;
    format: string;
    assetReference?: string | null;
    scheduledFor?: Date | null;
    timezone?: string | null;
    now?: Date;
  },
) {
  const actorUserId = requireIdentifier(
    input.actorUserId,
    'Content calendar actor user ID',
  );
  const now = validDate(input.now ?? new Date(), 'Content calendar change time');
  const fields = normalizeContentFields(input, now);

  return client.$transaction(async (transaction) => {
    const item = await transaction.contentCalendarItem.create({
      data: {
        ...fields,
        createdByUserId: actorUserId,
        updatedByUserId: actorUserId,
      },
    });

    await transaction.contentCalendarItemEvent.create({
      data: {
        itemId: item.id,
        eventType: ContentCalendarEventType.CREATED,
        actorUserId,
        fromStatus: null,
        toStatus: ContentCalendarStatus.DRAFT,
        fromRevision: null,
        toRevision: item.revision,
        occurredAt: now,
      },
    });

    return item;
  });
}

export async function updateContentCalendarItem(
  client: PrismaClient,
  input: {
    itemId: string;
    expectedRevision: number;
    actorUserId: string;
    title: string;
    caption: string;
    platform: string;
    accountRef: string;
    format: string;
    assetReference?: string | null;
    scheduledFor?: Date | null;
    timezone?: string | null;
    now?: Date;
  },
) {
  const itemId = requireIdentifier(input.itemId, 'Content calendar item ID');
  const expectedRevision = requireRevision(input.expectedRevision);
  const actorUserId = requireIdentifier(
    input.actorUserId,
    'Content calendar actor user ID',
  );
  const now = validDate(input.now ?? new Date(), 'Content calendar change time');
  const fields = normalizeContentFields(input, now);

  return client.$transaction(async (transaction) => {
    const current = await transaction.contentCalendarItem.findUnique({
      where: { id: itemId },
    });
    if (!current) throw new Error('Content calendar item not found');
    if (current.revision !== expectedRevision) {
      throw new Error('Content calendar item was updated by another operator');
    }
    if (current.status === ContentCalendarStatus.ARCHIVED) {
      throw new Error('Archived content calendar items cannot be edited');
    }

    const nextRevision = current.revision + 1;
    const nextStatus = ContentCalendarStatus.DRAFT;
    const updated = await transaction.contentCalendarItem.updateMany({
      where: { id: current.id, revision: expectedRevision },
      data: {
        ...fields,
        status: nextStatus,
        revision: nextRevision,
        updatedByUserId: actorUserId,
      },
    });
    if (updated.count !== 1) {
      throw new Error('Content calendar item was updated by another operator');
    }

    await transaction.contentCalendarItemEvent.create({
      data: {
        itemId: current.id,
        eventType: ContentCalendarEventType.UPDATED,
        actorUserId,
        fromStatus: current.status,
        toStatus: nextStatus,
        fromRevision: current.revision,
        toRevision: nextRevision,
        occurredAt: now,
      },
    });

    return transaction.contentCalendarItem.findUniqueOrThrow({
      where: { id: current.id },
    });
  });
}

export async function transitionContentCalendarItemStatus(
  client: PrismaClient,
  input: {
    itemId: string;
    expectedRevision: number;
    actorUserId: string;
    toStatus: string;
    now?: Date;
  },
) {
  const itemId = requireIdentifier(input.itemId, 'Content calendar item ID');
  const expectedRevision = requireRevision(input.expectedRevision);
  const actorUserId = requireIdentifier(
    input.actorUserId,
    'Content calendar actor user ID',
  );
  const toStatus = contentCalendarStatusSchema.parse(input.toStatus);
  const now = validDate(input.now ?? new Date(), 'Content calendar change time');

  return client.$transaction(async (transaction) => {
    const current = await transaction.contentCalendarItem.findUnique({
      where: { id: itemId },
    });
    if (!current) throw new Error('Content calendar item not found');
    if (current.revision !== expectedRevision) {
      throw new Error('Content calendar status was updated by another operator');
    }
    if (!statusTransitions[current.status].includes(toStatus)) {
      throw new Error('Invalid content calendar status transition');
    }

    if (toStatus === ContentCalendarStatus.SCHEDULED) {
      normalizeSchedule(current.scheduledFor, current.timezone, now, true);
    }

    const nextRevision = current.revision + 1;
    const updated = await transaction.contentCalendarItem.updateMany({
      where: {
        id: current.id,
        revision: expectedRevision,
        status: current.status,
      },
      data: {
        status: toStatus,
        revision: nextRevision,
        updatedByUserId: actorUserId,
      },
    });
    if (updated.count !== 1) {
      throw new Error(
        'Content calendar status was updated by another operator',
      );
    }

    await transaction.contentCalendarItemEvent.create({
      data: {
        itemId: current.id,
        eventType: ContentCalendarEventType.STATUS_CHANGED,
        actorUserId,
        fromStatus: current.status,
        toStatus,
        fromRevision: current.revision,
        toRevision: nextRevision,
        occurredAt: now,
      },
    });

    return transaction.contentCalendarItem.findUniqueOrThrow({
      where: { id: current.id },
    });
  });
}

export async function queueContentCalendarPublishProposal(
  client: PrismaClient,
  input: {
    itemId: string;
    expectedRevision: number;
    actorUserId: string;
  },
) {
  const itemId = requireIdentifier(input.itemId, 'Content calendar item ID');
  const expectedRevision = requireRevision(input.expectedRevision);
  const actorUserId = requireIdentifier(
    input.actorUserId,
    'Content calendar actor user ID',
  );
  const item = await client.contentCalendarItem.findUnique({
    where: { id: itemId },
  });
  if (!item) throw new Error('Content calendar item not found');
  if (item.revision !== expectedRevision) {
    throw new Error('Content calendar item was updated by another operator');
  }

  const action = buildContentCalendarPublishAction(item);
  return queueAiOperatorProposal(client, action, actorUserId);
}
