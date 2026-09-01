import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  AiOperatorProposalStatus,
  ContentCalendarStatus,
  db,
  decideAiOperatorProposal,
} from './index';
import {
  createContentCalendarItem,
  queueContentCalendarPublishProposal,
  transitionContentCalendarItemStatus,
  updateContentCalendarItem,
} from './content-calendar';
import {
  createSocialPublishingAccount,
  materializeSocialPublishingDeliveryPlan,
  setSocialPublishingAccountActive,
} from './social-publishing-delivery';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `social-delivery-user-${suffix}`;
const baseNow = new Date('2026-09-01T12:00:00.000Z');

suite('social publishing delivery persistence', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `clerk-social-delivery-${suffix}`,
        email: `social-delivery-${suffix}@example.test`,
      },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test('registers destinations with append-only activation history', async () => {
    const account = await createSocialPublishingAccount(db, {
      actorUserId: userId,
      accountRef: `luminol-instagram-${suffix}`,
      platform: 'INSTAGRAM',
      displayName: 'Luminol Academy Instagram',
      externalAccountId: `ig-${suffix}`,
      now: baseNow,
    });

    expect(account.active).toBe(true);
    const created = await db.socialPublishingAccountEvent.findFirstOrThrow({
      where: { accountId: account.id },
    });
    expect(created).toMatchObject({
      eventType: 'CREATED',
      actorUserId: userId,
      fromActive: null,
      toActive: true,
    });

    const inactive = await setSocialPublishingAccountActive(db, {
      accountId: account.id,
      expectedActive: true,
      active: false,
      actorUserId: userId,
      now: new Date(baseNow.getTime() + 1_000),
    });
    expect(inactive.active).toBe(false);

    await expect(
      setSocialPublishingAccountActive(db, {
        accountId: account.id,
        expectedActive: true,
        active: false,
        actorUserId: userId,
      }),
    ).rejects.toThrow('updated by another operator');

    const activationEvent =
      await db.socialPublishingAccountEvent.findFirstOrThrow({
        where: {
          accountId: account.id,
          eventType: 'ACTIVATION_CHANGED',
        },
      });
    await expect(
      db.socialPublishingAccountEvent.update({
        where: { id: activationEvent.id },
        data: { toActive: true },
      }),
    ).rejects.toThrow('append-only');
    await expect(
      db.socialPublishingAccountEvent.delete({
        where: { id: activationEvent.id },
      }),
    ).rejects.toThrow('append-only');
  });

  test('materializes one exact approved revision and fails closed after content drift', async () => {
    const accountRef = `luminol-facebook-${suffix}`;
    await createSocialPublishingAccount(db, {
      actorUserId: userId,
      accountRef,
      platform: 'FACEBOOK',
      displayName: 'Luminol Academy Facebook',
      externalAccountId: `fb-${suffix}`,
      now: baseNow,
    });

    const draft = await createContentCalendarItem(db, {
      actorUserId: userId,
      title: 'Approved social delivery test',
      caption: 'Exact reviewed caption',
      platform: 'FACEBOOK',
      accountRef,
      format: 'STATIC_POST',
      assetReference: `asset:social:${suffix}`,
      now: baseNow,
    });
    const ready = await transitionContentCalendarItemStatus(db, {
      itemId: draft.id,
      expectedRevision: draft.revision,
      actorUserId: userId,
      toStatus: 'READY',
      now: new Date(baseNow.getTime() + 1_000),
    });
    expect(ready.status).toBe(ContentCalendarStatus.READY);

    const proposal = await queueContentCalendarPublishProposal(db, {
      itemId: ready.id,
      expectedRevision: ready.revision,
      actorUserId: userId,
    });
    expect(proposal.status).toBe(AiOperatorProposalStatus.PENDING_APPROVAL);

    const approved = await decideAiOperatorProposal(db, {
      proposalId: proposal.id,
      actorUserId: userId,
      decision: 'APPROVED',
      now: new Date(baseNow.getTime() + 2_000),
    });
    expect(approved.status).toBe(AiOperatorProposalStatus.APPROVED);

    const plan = await materializeSocialPublishingDeliveryPlan(db, proposal.id);
    expect(plan).toMatchObject({
      proposalId: proposal.id,
      platform: 'FACEBOOK',
      accountRef,
      externalAccountId: `fb-${suffix}`,
      contentCalendarItemId: ready.id,
      contentRevision: ready.revision,
      caption: 'Exact reviewed caption',
      assetReference: `asset:social:${suffix}`,
    });

    await updateContentCalendarItem(db, {
      itemId: ready.id,
      expectedRevision: ready.revision,
      actorUserId: userId,
      title: ready.title,
      caption: 'Changed after approval',
      platform: ready.platform,
      accountRef: ready.accountRef,
      format: ready.format,
      assetReference: ready.assetReference,
      now: new Date(baseNow.getTime() + 3_000),
    });

    await expect(
      materializeSocialPublishingDeliveryPlan(db, proposal.id),
    ).rejects.toThrow('revision no longer matches approval');
  });
});
