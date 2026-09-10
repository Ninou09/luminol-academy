export const CONVERSION_EVENTS = {
  CONSULTATION_CTA_CLICKED: 'CONSULTATION_CTA_CLICKED',
  ENQUIRY_STARTED: 'ENQUIRY_STARTED',
  ENQUIRY_SUBMITTED: 'ENQUIRY_SUBMITTED',
  PROGRAMME_ENQUIRY_SUBMITTED: 'PROGRAMME_ENQUIRY_SUBMITTED',
} as const;

export type ConversionEventName =
  (typeof CONVERSION_EVENTS)[keyof typeof CONVERSION_EVENTS];

export type ConversionEvent = {
  name: ConversionEventName;
  properties?: Readonly<Record<string, string | number | boolean>>;
};

export function createConversionEvent(
  name: ConversionEventName,
  properties?: ConversionEvent['properties'],
): ConversionEvent {
  if (properties) {
    return { name, properties };
  }

  return { name };
}
