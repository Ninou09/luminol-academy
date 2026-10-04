import { aiOperatorSendOutboundMessageActionSchema } from '@luminol/validation/ai-operator';

export function museInternationalPhone(raw: string | null) {
  const phone = raw?.replace(/[\s()-]/g, '') ?? '';
  if (!/^\+[1-9]\d{6,14}$/.test(phone))
    throw new Error('MUSE_INTERNATIONAL_PHONE_REQUIRED');
  return phone;
}

export function approvedMuseWhatsAppHandoff(input: {
  proposal: { status: string; actionEnvelope: unknown };
  draft: { id: string; enquiryId: string; text: string; recipient: string };
  lead: {
    id: string;
    consent: boolean;
    status: string;
    phone: string | null;
    preferredContact: string | null;
  };
}) {
  const action = aiOperatorSendOutboundMessageActionSchema.parse(
    input.proposal.actionEnvelope,
  );
  if (
    input.proposal.status !== 'APPROVED' ||
    action.target.channel !== 'WHATSAPP' ||
    action.payload.templateKey !== 'muse_follow_up_v1' ||
    action.payload.messageRef !== input.draft.id ||
    action.target.recipientRef !== input.draft.enquiryId ||
    input.lead.id !== input.draft.enquiryId
  )
    throw new Error('MUSE_APPROVAL_REQUIRED');
  if (
    !input.lead.consent ||
    input.lead.preferredContact !== 'WHATSAPP' ||
    ['CLOSED', 'SPAM'].includes(input.lead.status)
  )
    throw new Error('MUSE_CONTACT_NOT_ALLOWED');
  const phone = museInternationalPhone(input.lead.phone);
  if (phone !== input.draft.recipient)
    throw new Error('MUSE_RECIPIENT_CHANGED');
  return `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(input.draft.text)}`;
}
