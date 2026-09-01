import { describe, expect, test } from 'vitest';

import { getAiOperatorProposalQueueCopy } from './ai-operator-proposal-localization';

const locales = ['en', 'fr', 'ar'] as const;

describe('AI Operator proposal queue localization', () => {
  test.each(locales)('provides complete %s approval queue copy', (locale) => {
    const copy = getAiOperatorProposalQueueCopy(locale);

    expect(copy.eyebrow).toBe('Luminol AI Operator');
    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.navLabel.length).toBeGreaterThan(0);
    expect(copy.noExecution.length).toBeGreaterThan(0);
    expect(copy.readinessTitle.length).toBeGreaterThan(0);
    expect(copy.readinessIntro.length).toBeGreaterThan(0);
    expect(copy.readinessPassed.length).toBeGreaterThan(0);
    expect(copy.readinessFailed.length).toBeGreaterThan(0);
    expect(copy.readinessCheck.envelopeValid.length).toBeGreaterThan(0);
    expect(copy.readinessCheck.metadataMatches.length).toBeGreaterThan(0);
    expect(copy.readinessCheck.approvalState.length).toBeGreaterThan(0);
    expect(copy.readinessCheck.policyRegistered.length).toBeGreaterThan(0);
    expect(copy.readinessStatus.READY_FOR_EXECUTOR.length).toBeGreaterThan(0);
    expect(copy.readinessStatus.NOT_APPROVED.length).toBeGreaterThan(0);
    expect(copy.readinessStatus.INVALID_ENVELOPE.length).toBeGreaterThan(0);
    expect(copy.readinessStatus.METADATA_MISMATCH.length).toBeGreaterThan(0);
    expect(copy.statusLabel.PENDING_APPROVAL.length).toBeGreaterThan(0);
    expect(copy.statusLabel.APPROVED.length).toBeGreaterThan(0);
    expect(copy.statusLabel.REJECTED.length).toBeGreaterThan(0);
    expect(copy.statusLabel.CANCELLED.length).toBeGreaterThan(0);
    expect(copy.kindLabel.UPDATE_ENQUIRY_WORKFLOW.length).toBeGreaterThan(0);
    expect(copy.kindLabel.SEND_OUTBOUND_MESSAGE.length).toBeGreaterThan(0);
    expect(copy.kindLabel.PUBLISH_SOCIAL_CONTENT.length).toBeGreaterThan(0);
  });

  test('English copy states that approval and readiness do not execute side effects', () => {
    const copy = getAiOperatorProposalQueueCopy('en');

    expect(copy.intro).toContain('does not update CRM records');
    expect(copy.intro).toContain('send messages');
    expect(copy.intro).toContain('publish social content');
    expect(copy.noExecution).toContain('No side effect');
    expect(copy.readinessIntro).toContain('future executor');
    expect(copy.readinessIntro).toContain('nothing is executed here');
  });
});
