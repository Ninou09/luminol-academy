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
    expect(copy.executed.length).toBeGreaterThan(0);
    expect(copy.executedBy.length).toBeGreaterThan(0);
    expect(copy.executionTime.length).toBeGreaterThan(0);
    expect(copy.execute.length).toBeGreaterThan(0);
    expect(copy.executionTitle.length).toBeGreaterThan(0);
    expect(copy.executionIntro.length).toBeGreaterThan(0);
    expect(copy.executionUnavailable.length).toBeGreaterThan(0);
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
    expect(copy.statusLabel.EXECUTED.length).toBeGreaterThan(0);
    expect(copy.kindLabel.UPDATE_ENQUIRY_WORKFLOW.length).toBeGreaterThan(0);
    expect(copy.kindLabel.SEND_OUTBOUND_MESSAGE.length).toBeGreaterThan(0);
    expect(copy.kindLabel.PUBLISH_SOCIAL_CONTENT.length).toBeGreaterThan(0);
  });

  test('English copy distinguishes approval, readiness, controlled CRM execution, and disabled channels', () => {
    const copy = getAiOperatorProposalQueueCopy('en');

    expect(copy.intro).toContain('Approval changes proposal state only');
    expect(copy.intro).toContain('controlled executor');
    expect(copy.intro).toContain(
      'messaging and social publishing remain disabled',
    );
    expect(copy.noExecution).toContain('CRM follow-up proposals');
    expect(copy.noExecution).toContain('not executable here');
    expect(copy.readinessIntro).toContain('controlled executor');
    expect(copy.readinessIntro).toContain('never performs the action');
    expect(copy.executionIntro).toContain('exact stored envelope');
    expect(copy.executionIntro).toContain('explicit operator action');
  });
});
