export type EnquiryFirstResponseStep =
  | 'acknowledge'
  | 'confirm-programme-objective'
  | 'clarify-service-objective'
  | 'clarify-location'
  | 'clarify-format'
  | 'clarify-timing'
  | 'agree-next-option'
  | 'use-email-preference'
  | 'confirm-phone-permission'
  | 'clarify-phone-number'
  | 'confirm-whatsapp-permission'
  | 'clarify-whatsapp-number'
  | 'clarify-contact-preference'
  | 'schedule-follow-up';

type EnquiryFirstResponseInput = {
  programmeTitleSnapshot: string | null;
  city: string | null;
  preferredContact: 'EMAIL' | 'PHONE' | 'WHATSAPP' | null;
  deliveryPreference: 'IN_PERSON' | 'ONLINE' | 'FLEXIBLE' | 'NOT_SURE' | null;
  timingPreference: 'SOON' | 'WITHIN_MONTH' | 'LATER' | 'NOT_SURE' | null;
  phone: string | null;
};

export function buildEnquiryFirstResponseSteps(
  enquiry: EnquiryFirstResponseInput,
): EnquiryFirstResponseStep[] {
  const steps: EnquiryFirstResponseStep[] = ['acknowledge'];

  steps.push(
    enquiry.programmeTitleSnapshot
      ? 'confirm-programme-objective'
      : 'clarify-service-objective',
  );

  if (!enquiry.city) steps.push('clarify-location');
  if (
    !enquiry.deliveryPreference ||
    enquiry.deliveryPreference === 'NOT_SURE'
  ) {
    steps.push('clarify-format');
  }
  if (!enquiry.timingPreference || enquiry.timingPreference === 'NOT_SURE') {
    steps.push('clarify-timing');
  }

  steps.push('agree-next-option');

  if (enquiry.preferredContact === 'EMAIL') {
    steps.push('use-email-preference');
  } else if (enquiry.preferredContact === 'PHONE') {
    steps.push(
      enquiry.phone ? 'confirm-phone-permission' : 'clarify-phone-number',
    );
  } else if (enquiry.preferredContact === 'WHATSAPP') {
    steps.push(
      enquiry.phone ? 'confirm-whatsapp-permission' : 'clarify-whatsapp-number',
    );
  } else {
    steps.push('clarify-contact-preference');
  }

  steps.push('schedule-follow-up');
  return steps;
}
