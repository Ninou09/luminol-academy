from pathlib import Path

migration = Path(
    'packages/database/prisma/migrations/20260814190000_milestone_16_verified_organization_integrations/migration.sql'
)
text = migration.read_text()

# Temporary expand-phase parent guards, before routine-update early return.
temp_marker = '''    -- Backfills in this migration only populate organizationRecordId. They must
    -- not be mistaken for legacy application identity changes by this temporary
    -- expand-phase guard.
    IF NOT legacy_identity_changed THEN
      RETURN NEW;
    END IF;
'''
temp_replacement = '''    -- Parent identities cannot move away from already-materialized children.
    -- Enforce this during the migration window as well as after permanent guards
    -- are installed so opaque legacy scope cannot become internally inconsistent.
    IF TG_TABLE_NAME = 'Invoice'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
       AND EXISTS (
         SELECT 1
         FROM "CorporateBillingRecord" AS billing
         WHERE billing."invoiceId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Invoice organization is immutable once corporate billing exists';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
       AND EXISTS (
         SELECT 1
         FROM "Notification" AS notification
         WHERE notification."eventId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Notification event organization is immutable once notifications exist';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId"
       AND EXISTS (
         SELECT 1
         FROM "Notification" AS notification
         WHERE notification."eventId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Notification event recipient is immutable once notifications exist';
    END IF;

    -- Backfills in this migration only populate organizationRecordId. They must
    -- not be mistaken for legacy application identity changes by this temporary
    -- expand-phase guard.
    IF NOT legacy_identity_changed THEN
      RETURN NEW;
    END IF;
'''
if temp_marker not in text:
    raise SystemExit('temporary early-return marker not found')
text = text.replace(temp_marker, temp_replacement, 1)

# Permanent parent organization guards in the generic organization trigger.
perm_marker = '''    identity_changed := OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
      OR OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId";

    IF OLD."organizationRecordId" IS NOT NULL
       AND OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId" THEN
      RAISE EXCEPTION 'Verified organization identity is immutable';
    END IF;
'''
perm_replacement = '''    identity_changed := OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
      OR OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId";

    IF TG_TABLE_NAME = 'Invoice'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
       AND EXISTS (
         SELECT 1
         FROM "CorporateBillingRecord" AS billing
         WHERE billing."invoiceId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Invoice organization is immutable once corporate billing exists';
    END IF;

    IF TG_TABLE_NAME = 'NotificationEvent'
       AND OLD."organizationId" IS DISTINCT FROM NEW."organizationId"
       AND EXISTS (
         SELECT 1
         FROM "Notification" AS notification
         WHERE notification."eventId" = OLD."id"
       ) THEN
      RAISE EXCEPTION 'Notification event organization is immutable once notifications exist';
    END IF;

    IF OLD."organizationRecordId" IS NOT NULL
       AND OLD."organizationRecordId" IS DISTINCT FROM NEW."organizationRecordId" THEN
      RAISE EXCEPTION 'Verified organization identity is immutable';
    END IF;
'''
if perm_marker not in text:
    raise SystemExit('permanent generic update marker not found')
text = text.replace(perm_marker, perm_replacement, 1)

# Permanent recipient guard applies to opaque events with children too.
recipient_marker = '''BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD."organizationRecordId" IS NOT NULL
     AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId" THEN
    RAISE EXCEPTION 'Verified notification event recipient is immutable';
  END IF;
'''
recipient_replacement = '''BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId"
     AND EXISTS (
       SELECT 1
       FROM "Notification" AS notification
       WHERE notification."eventId" = OLD."id"
     ) THEN
    RAISE EXCEPTION 'Notification event recipient is immutable once notifications exist';
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD."organizationRecordId" IS NOT NULL
     AND OLD."recipientId" IS DISTINCT FROM NEW."recipientId" THEN
    RAISE EXCEPTION 'Verified notification event recipient is immutable';
  END IF;
'''
if recipient_marker not in text:
    raise SystemExit('notification recipient guard marker not found')
text = text.replace(recipient_marker, recipient_replacement, 1)

migration.write_text(text)

test_file = Path('packages/database/src/milestone16-parent-opaque-identity.integration.test.ts')
test_file.write_text(r'''import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const userId = `m16e-parent-opaque-user-${suffix}`;

suite('Milestone 16 opaque parent identity constraints', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: userId,
        clerkId: `m16e-parent-opaque-clerk-${suffix}`,
        email: `m16e-parent-opaque-${suffix}@example.test`,
      },
    });
  });

  test('rejects changing an opaque invoice organization after corporate billing exists', async () => {
    const organizationId = `opaque-invoice-parent-${suffix}`;
    const invoice = await db.invoice.create({
      data: {
        number: `M16E-OPAQUE-PARENT-${suffix}`,
        customerId: userId,
        organizationId,
        currency: 'DZD',
        subtotalMinor: 100,
        taxMinor: 0,
        totalMinor: 100,
      },
      select: { id: true },
    });

    await db.corporateBillingRecord.create({
      data: {
        organizationId,
        invoiceId: invoice.id,
        billingContactName: 'Opaque Billing Parent',
        billingContactEmail: `opaque-billing-parent-${suffix}@example.test`,
        seatCount: 1,
        pricePerSeatMinor: 100,
        paymentTermsDays: 30,
      },
    });

    await expect(
      db.invoice.update({
        where: { id: invoice.id },
        data: { organizationId: `opaque-invoice-moved-${suffix}` },
      }),
    ).rejects.toThrow(
      'Invoice organization is immutable once corporate billing exists',
    );
  });

  test('rejects changing an opaque event recipient after a notification exists', async () => {
    const organizationId = `opaque-event-recipient-org-${suffix}`;
    const otherUserId = `m16e-parent-opaque-other-user-${suffix}`;
    await db.user.create({
      data: {
        id: otherUserId,
        clerkId: `m16e-parent-opaque-other-clerk-${suffix}`,
        email: `m16e-parent-opaque-other-${suffix}@example.test`,
      },
    });

    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-parent-opaque-event-recipient-${suffix}`,
        organizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Opaque event recipient',
          message: 'Child notification fixes the parent recipient identity.',
        },
      },
      select: { id: true },
    });

    await db.notification.create({
      data: {
        eventId: event.id,
        recipientId: userId,
        organizationId,
        channel: 'IN_APP',
        title: 'Opaque event recipient',
        preview: 'Parent recipient must remain stable.',
        body: 'Parent recipient must remain stable.',
      },
    });

    await expect(
      db.notificationEvent.update({
        where: { id: event.id },
        data: { recipientId: otherUserId },
      }),
    ).rejects.toThrow(
      'Notification event recipient is immutable once notifications exist',
    );
  });

  test('rejects changing an opaque event organization after a notification exists', async () => {
    const organizationId = `opaque-event-organization-${suffix}`;
    const event = await db.notificationEvent.create({
      data: {
        idempotencyKey: `m16e-parent-opaque-event-org-${suffix}`,
        organizationId,
        recipientId: userId,
        templateKey: 'account_notice',
        category: 'TRANSACTIONAL',
        payload: {
          subject: 'Opaque event organization',
          message: 'Child notification fixes the parent organization identity.',
        },
      },
      select: { id: true },
    });

    await db.notification.create({
      data: {
        eventId: event.id,
        recipientId: userId,
        organizationId,
        channel: 'IN_APP',
        title: 'Opaque event organization',
        preview: 'Parent organization must remain stable.',
        body: 'Parent organization must remain stable.',
      },
    });

    await expect(
      db.notificationEvent.update({
        where: { id: event.id },
        data: { organizationId: `opaque-event-organization-moved-${suffix}` },
      }),
    ).rejects.toThrow(
      'Notification event organization is immutable once notifications exist',
    );
  });
});
''')
