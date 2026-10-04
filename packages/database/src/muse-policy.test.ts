import { describe, expect, test } from 'vitest';
import {
  museAttentionScore,
  routeMuseCommand,
  museKnowledgeTerms,
} from './muse-policy';
import { approvedMuseWhatsAppHandoff } from './muse-handoff';

describe('Muse routing and attention policy', () => {
  test.each([
    ['ملخص الإيرادات', 'revenue'],
    ['فرز العملاء', 'triage'],
    ['حضّر المتابعة', 'follow-up'],
    ['دورة التواصل', 'faq'],
    ['Fettouma knowledge', 'faq'],
    ['plan my tasks', 'plan'],
    ['rendez-vous', 'booking'],
    ['performance Instagram', 'social'],
    ['caption de formation', 'content'],
  ])('%s delegates to %s', (text, intent) =>
    expect(routeMuseCommand(text)).toBe(intent),
  );
  test('scores only workflow state and exposes the reasons', () => {
    const now = new Date('2026-10-04T12:00:00Z');
    expect(
      museAttentionScore(
        {
          createdAt: new Date('2026-10-01'),
          nextFollowUpAt: new Date('2026-10-03'),
          ownerUserId: null,
        },
        now,
      ),
    ).toEqual({ score: 100, overdue: true, unassigned: true, waiting: true });
    expect(
      museAttentionScore(
        { createdAt: now, nextFollowUpAt: null, ownerUserId: 'owner' },
        now,
      ).score,
    ).toBe(0);
  });
  test('extracts bounded unicode search terms without SQL or instructions', () => {
    expect(museKnowledgeTerms('دورة التواصل التواصل')).toEqual(['التواصل']);
    expect(museKnowledgeTerms('course')).toEqual([]);
    expect(museKnowledgeTerms('a '.repeat(1000))).toHaveLength(0);
  });
});

function handoff() {
  return {
    proposal: {
      status: 'APPROVED',
      actionEnvelope: {
        version: '1',
        actionId: 'muse-message:test',
        kind: 'SEND_OUTBOUND_MESSAGE',
        executionPolicy: 'approval_required',
        source: { surface: 'ai_operator', reference: 'muse:draft1' },
        target: {
          surface: 'outbound_recipient',
          channel: 'WHATSAPP',
          recipientRef: 'lead1',
        },
        payload: { templateKey: 'muse_follow_up_v1', messageRef: 'draft1' },
      },
    },
    draft: {
      id: 'draft1',
      enquiryId: 'lead1',
      text: 'مرحباً & welcome?',
      recipient: '+213555123456',
    },
    lead: {
      id: 'lead1',
      consent: true,
      status: 'NEW',
      phone: '+213 555 123 456',
      preferredContact: 'WHATSAPP',
    },
  };
}
describe('manual WhatsApp handoff requires approval for the exact draft', () => {
  test('returns an encoded link, never invokes an outbound provider', () =>
    expect(approvedMuseWhatsAppHandoff(handoff())).toBe(
      `https://wa.me/213555123456?text=${encodeURIComponent('مرحباً & welcome?')}`,
    ));
  test.each(['PENDING_APPROVAL', 'REJECTED', 'CANCELLED', 'EXECUTED'])(
    'blocks %s',
    (status) => {
      const input = handoff();
      input.proposal.status = status;
      expect(() => approvedMuseWhatsAppHandoff(input)).toThrow(
        'MUSE_APPROVAL_REQUIRED',
      );
    },
  );
  test('blocks another draft or recipient', () => {
    const input = handoff();
    input.draft.id = 'other';
    expect(() => approvedMuseWhatsAppHandoff(input)).toThrow();
  });
  test('rechecks consent and channel at handoff time', () => {
    const input = handoff();
    input.lead.consent = false;
    expect(() => approvedMuseWhatsAppHandoff(input)).toThrow(
      'MUSE_CONTACT_NOT_ALLOWED',
    );
    input.lead.consent = true;
    input.lead.preferredContact = 'EMAIL';
    expect(() => approvedMuseWhatsAppHandoff(input)).toThrow(
      'MUSE_CONTACT_NOT_ALLOWED',
    );
  });
  test('never guesses a country code', () => {
    const input = handoff();
    input.lead.phone = '0555123456';
    expect(() => approvedMuseWhatsAppHandoff(input)).toThrow(
      'MUSE_INTERNATIONAL_PHONE_REQUIRED',
    );
  });
  test('blocks closed contacts', () => {
    const input = handoff();
    input.lead.status = 'CLOSED';
    expect(() => approvedMuseWhatsAppHandoff(input)).toThrow();
  });
  test('invalidates a handoff if the destination changes after approval', () => {
    const input = handoff();
    input.lead.phone = '+213555000000';
    expect(() => approvedMuseWhatsAppHandoff(input)).toThrow(
      'MUSE_RECIPIENT_CHANGED',
    );
  });
});
