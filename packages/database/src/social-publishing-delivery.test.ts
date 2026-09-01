import { describe, expect, test } from 'vitest';

import {
  AiOperatorProposalStatus,
  ContentCalendarFormat,
  ContentCalendarPlatform,
  ContentCalendarStatus,
  type Prisma,
} from '../generated/prisma/client';
import { buildSocialPublishingDeliveryPlan } from './social-publishing-delivery';

const action = {
  version: '1',
  actionId: 'content-calendar:v1:publish:item-social:r3',
  kind: 'PUBLISH_SOCIAL_CONTENT',
  executionPolicy: 'approval_required',
  source: {
    surface: 'content_calendar',
    reference: 'item-social:r3',
  },
  target: {
    surface: 'social_account',
    platform: 'INSTAGRAM',
    accountRef: 'luminol-instagram',
  },
  payload: {
    contentCalendarItemId: 'item-social',
    contentRevision: 3,
  },
} as const;

function proposal(
  overrides: Partial<{
    actionId: string;
    actionVersion: string;
    actionKind: string;
    executionPolicy: string;
    sourceSurface: string;
    sourceReference: string;
    actionEnvelope: Prisma.JsonValue;
    status: AiOperatorProposalStatus;
  }> = {},
) {
  return {
    id: 'proposal-social',
    actionId: action.actionId,
    actionVersion: action.version,
    actionKind: action.kind,
    executionPolicy: action.executionPolicy,
    sourceSurface: action.source.surface,
    sourceReference: action.source.reference,
    actionEnvelope: action,
    status: AiOperatorProposalStatus.APPROVED,
    ...overrides,
  };
}

function content(
  overrides: Partial<{
    id: string;
    revision: number;
    status: ContentCalendarStatus;
    platform: ContentCalendarPlatform;
    accountRef: string;
    format: ContentCalendarFormat;
    caption: string;
    assetReference: string | null;
    scheduledFor: Date | null;
    timezone: string | null;
  }> = {},
) {
  return {
    id: 'item-social',
    revision: 3,
    status: ContentCalendarStatus.SCHEDULED,
    platform: ContentCalendarPlatform.INSTAGRAM,
    accountRef: 'luminol-instagram',
    format: ContentCalendarFormat.REEL,
    caption: 'Approved exact-revision caption',
    assetReference: 'asset://reel-003',
    scheduledFor: new Date('2026-09-03T16:00:00.000Z'),
    timezone: 'Africa/Algiers',
    ...overrides,
  };
}

function account(
  overrides: Partial<{
    accountRef: string;
    platform: ContentCalendarPlatform;
    externalAccountId: string;
    active: boolean;
  }> = {},
) {
  return {
    accountRef: 'luminol-instagram',
    platform: ContentCalendarPlatform.INSTAGRAM,
    externalAccountId: 'ig-business-123',
    active: true,
    ...overrides,
  };
}

describe('social publishing delivery materialization', () => {
  test('materializes only the exact approved content revision and active destination', () => {
    expect(
      buildSocialPublishingDeliveryPlan({
        proposal: proposal(),
        content: content(),
        account: account(),
      }),
    ).toEqual({
      proposalId: 'proposal-social',
      actionId: action.actionId,
      platform: 'INSTAGRAM',
      accountRef: 'luminol-instagram',
      externalAccountId: 'ig-business-123',
      contentCalendarItemId: 'item-social',
      contentRevision: 3,
      format: ContentCalendarFormat.REEL,
      caption: 'Approved exact-revision caption',
      assetReference: 'asset://reel-003',
      scheduledFor: new Date('2026-09-03T16:00:00.000Z'),
      timezone: 'Africa/Algiers',
    });
  });

  test('fails closed when content changed after approval', () => {
    expect(() =>
      buildSocialPublishingDeliveryPlan({
        proposal: proposal(),
        content: content({ revision: 4 }),
        account: account(),
      }),
    ).toThrow('revision no longer matches approval');
  });

  test('fails closed when the registered account is inactive', () => {
    expect(() =>
      buildSocialPublishingDeliveryPlan({
        proposal: proposal(),
        content: content(),
        account: account({ active: false }),
      }),
    ).toThrow('account is inactive');
  });

  test('fails closed when account platform does not match the approved target', () => {
    expect(() =>
      buildSocialPublishingDeliveryPlan({
        proposal: proposal(),
        content: content(),
        account: account({ platform: ContentCalendarPlatform.FACEBOOK }),
      }),
    ).toThrow('account target mismatch');
  });

  test('requires an asset before delivery can be materialized', () => {
    expect(() =>
      buildSocialPublishingDeliveryPlan({
        proposal: proposal(),
        content: content({ assetReference: null }),
        account: account(),
      }),
    ).toThrow('requires an asset reference');
  });

  test('keeps pending proposals out of delivery planning', () => {
    expect(() =>
      buildSocialPublishingDeliveryPlan({
        proposal: proposal({ status: AiOperatorProposalStatus.PENDING_APPROVAL }),
        content: content(),
        account: account(),
      }),
    ).toThrow('NOT_APPROVED');
  });
});
