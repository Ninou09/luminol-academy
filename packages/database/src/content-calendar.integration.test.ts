import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  AiOperatorProposalStatus,
  ContentCalendarStatus,
  db,
} from './index';
import {
  buildContentCalendarPublishAction,
  contentCalendarPublishActionId,
  createContentCalendarItem,
  queueContentCalendarPublishProposal,
  transitionContentCalendarItemStatus,
  updateContentCalendarItem,
} from './content-calendar';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `content-calendar-user-${suffix}`;
const baseNow = new Date('2026-09-01T12:00:00.000Z');
const futureSchedule = new Date('2026-09-10T15:30:00.000Z');

suite('content calendar persistence', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `clerk-content-calendar-${suffix}`,
        email: `content-calendar-${suffix}@example.test`,
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('creates a draft with append-only provenance and validates scheduling pairs', async () => {
    const item = await createContentCalendarItem(db, {
      actorUserId: userId,
      title: 'Difference between psychologist and psychiatrist',
      caption: 'Educational reel caption',
      platform: 'INSTAGRAM',
      accountRef: 'luminol-academy-instagram',
      format: 'REEL',
      assetReference: 'asset:reel:psychologist-psychiatrist',
      scheduledFor: futureSchedule,
      timezone: 'Africa/Algiers',
      now: baseNow,
    });

    expect(item.status).toBe(ContentCalendarStatus.DRAFT);
    expect(item.revision).toBe(1);
    expect(item.scheduledFor?.toISOString()).toBe(futureSchedule.toISOString());
    expect(item.timezone).toBe('Africa/Algiers');

    const events = await db.contentCalendarItemEvent.findMany({
      where: { itemId: item.id },
      orderBy: { occurredAt: 'asc' },
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      eventType: 'CREATED',
      fromStatus: null,
      toStatus: 'DRAFT',
      fromRevision: null,
      toRevision: 1,
      actorUserId: userId,
    });

    await expect(
      createContentCalendarItem(db, {
        actorUserId: userId,
        title: 'Invalid schedule',
        caption: 'Missing timezone',
        platform: 'FACEBOOK',
        accountRef: 'luminol-academy-facebook',
        format: 'STATIC_POST',
        scheduledFor: futureSchedule,
        now: baseNow,
      }),
    ).rejects.toThrow('requires both an instant and an IANA timezone');

    await expect(
      db.contentCalendarItemEvent.update({
        where: { id: events[0]!.id },
        data: { toRevision: 99 },
      }),
    ).rejects.toThrow('append-only');
    await expect(
      db.contentCalendarItemEvent.delete({ where: { id: events[0]!.id } }),
    ).rejects.toThrow('append-only');
  });

  test('creates idempotent per-revision social publish proposals without publishing', async () => {
    const draft = await createContentCalendarItem(db, {
      actorUserId: userId,
      title: 'Self-hypnosis course reel',
      caption: 'Registration CTA',
      platform: 'INSTAGRAM',
      accountRef: 'luminol-academy-instagram',
      format: 'REEL',
      now: baseNow,
    });

    await expect(
      queueContentCalendarPublishProposal(db, {
        itemId: draft.id,
        expectedRevision: draft.revision,
        actorUserId: userId,
      }),
    ).rejects.toThrow('Only ready or scheduled content');

    const ready = await transitionContentCalendarItemStatus(db, {
      itemId: draft.id,
      expectedRevision: draft.revision,
      actorUserId: userId,
      toStatus: 'READY',
      now: baseNow,
    });
    expect(ready.revision).toBe(2);

    const expectedAction = buildContentCalendarPublishAction(ready);
    expect(expectedAction.actionId).toBe(contentCalendarPublishActionId(ready));
    expect(expectedAction.payload).toEqual({
      contentCalendarItemId: ready.id,
      contentRevision: ready.revision,
    });

    const first = await queueContentCalendarPublishProposal(db, {
      itemId: ready.id,
      expectedRevision: ready.revision,
      actorUserId: userId,
    });
    const duplicate = await queueContentCalendarPublishProposal(db, {
      itemId: ready.id,
      expectedRevision: ready.revision,
      actorUserId: userId,
    });

    expect(duplicate.id).toBe(first.id);
    expect(first.status).toBe(AiOperatorProposalStatus.PENDING_APPROVAL);
    expect(first.actionId).toBe(expectedAction.actionId);
    expect(first.actionEnvelope).toEqual(expectedAction);

    const edited = await updateContentCalendarItem(db, {
      itemId: ready.id,
      expectedRevision: ready.revision,
      actorUserId: userId,
      title: ready.title,
      caption: 'Revised CTA after operator review',
      platform: ready.platform,
      accountRef: ready.accountRef,
      format: ready.format,
      assetReference: ready.assetReference,
      now: new Date(baseNow.getTime() + 1_000),
    });
    expect(edited.status).toBe(ContentCalendarStatus.DRAFT);
    expect(edited.revision).toBe(3);

    await expect(
      queueContentCalendarPublishProposal(db, {
        itemId: edited.id,
        expectedRevision: ready.revision,
        actorUserId: userId,
      }),
    ).rejects.toThrow('updated by another operator');

    const readyAgain = await transitionContentCalendarItemStatus(db, {
      itemId: edited.id,
      expectedRevision: edited.revision,
      actorUserId: userId,
      toStatus: 'READY',
      now: new Date(baseNow.getTime() + 2_000),
    });
    const revisedProposal = await queueContentCalendarPublishProposal(db, {
      itemId: readyAgain.id,
      expectedRevision: readyAgain.revision,
      actorUserId: userId,
    });

    expect(revisedProposal.id).not.toBe(first.id);
    expect(revisedProposal.actionId).not.toBe(first.actionId);
    expect(first.actionEnvelope).toEqual(expectedAction);
  });

  test('requires a valid future schedule before entering SCHEDULED and enforces lifecycle concurrency', async () => {
    const draft = await createContentCalendarItem(db, {
      actorUserId: userId,
      title: 'Facebook carousel',
      caption: 'Course information carousel',
      platform: 'FACEBOOK',
      accountRef: 'luminol-academy-facebook',
      format: 'CAROUSEL',
      now: baseNow,
    });
    const ready = await transitionContentCalendarItemStatus(db, {
      itemId: draft.id,
      expectedRevision: draft.revision,
      actorUserId: userId,
      toStatus: 'READY',
      now: baseNow,
    });

    await expect(
      transitionContentCalendarItemStatus(db, {
        itemId: ready.id,
        expectedRevision: ready.revision,
        actorUserId: userId,
        toStatus: 'SCHEDULED',
        now: baseNow,
      }),
    ).rejects.toThrow('requires a schedule and timezone');

    const rescheduledDraft = await updateContentCalendarItem(db, {
      itemId: ready.id,
      expectedRevision: ready.revision,
      actorUserId: userId,
      title: ready.title,
      caption: ready.caption,
      platform: ready.platform,
      accountRef: ready.accountRef,
      format: ready.format,
      scheduledFor: futureSchedule,
      timezone: 'Europe/Berlin',
      now: baseNow,
    });
    const readyWithSchedule = await transitionContentCalendarItemStatus(db, {
      itemId: rescheduledDraft.id,
      expectedRevision: rescheduledDraft.revision,
      actorUserId: userId,
      toStatus: 'READY',
      now: baseNow,
    });
    const scheduled = await transitionContentCalendarItemStatus(db, {
      itemId: readyWithSchedule.id,
      expectedRevision: readyWithSchedule.revision,
      actorUserId: userId,
      toStatus: 'SCHEDULED',
      now: baseNow,
    });

    expect(scheduled.status).toBe(ContentCalendarStatus.SCHEDULED);
    await expect(
      transitionContentCalendarItemStatus(db, {
        itemId: scheduled.id,
        expectedRevision: readyWithSchedule.revision,
        actorUserId: userId,
        toStatus: 'READY',
        now: baseNow,
      }),
    ).rejects.toThrow('updated by another operator');

    const archived = await transitionContentCalendarItemStatus(db, {
      itemId: scheduled.id,
      expectedRevision: scheduled.revision,
      actorUserId: userId,
      toStatus: 'ARCHIVED',
      now: baseNow,
    });
    await expect(
      updateContentCalendarItem(db, {
        itemId: archived.id,
        expectedRevision: archived.revision,
        actorUserId: userId,
        title: archived.title,
        caption: archived.caption,
        platform: archived.platform,
        accountRef: archived.accountRef,
        format: archived.format,
        now: baseNow,
      }),
    ).rejects.toThrow('cannot be edited');
  });
});
