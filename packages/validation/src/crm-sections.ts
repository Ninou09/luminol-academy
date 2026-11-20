import { z } from 'zod';

import {
  clientEmailSchema,
  clientPhoneSchema,
  localDateSchema,
} from './consultations';

/** Luminol's CRM sections; each owns its offers, deals and pipeline. */
export const crmSections = [
  'PSYCHOLOGY',
  'LANGUAGES',
  'PROFESSIONAL',
  'EVENTS',
] as const;
export type CrmSectionValue = (typeof crmSections)[number];
export const crmSectionSchema = z.enum(crmSections);

/** URL segment for each section (`/crm/sections/<slug>`). */
export const crmSectionSlugs: Record<CrmSectionValue, string> = {
  PSYCHOLOGY: 'psychology',
  LANGUAGES: 'languages',
  PROFESSIONAL: 'professional-development',
  EVENTS: 'events',
};

export function crmSectionFromSlug(slug: string): CrmSectionValue | null {
  const match = crmSections.find(
    (section) => crmSectionSlugs[section] === slug,
  );
  return match ?? null;
}

/** Default section for a lead's school; general enquiries have none. */
export function crmSectionForSchool(school: string): CrmSectionValue | null {
  switch (school) {
    case 'PSYCHOLOGY':
      return 'PSYCHOLOGY';
    case 'LANGUAGES':
      return 'LANGUAGES';
    case 'TRAINING':
      return 'PROFESSIONAL';
    default:
      return null;
  }
}

export type CrmDealStateValue = 'OPEN' | 'WON' | 'LOST';

export type CrmStageDefinition = {
  key: string;
  state: CrmDealStateValue;
  /** Lost stages that need an operational reason when entered. */
  requiresReason?: boolean;
};

/**
 * Pipeline stages per section, in board order. This is the single source of
 * truth; the database stores the stage key and its derived state.
 */
export const crmSectionStages = {
  PSYCHOLOGY: [
    { key: 'NEW', state: 'OPEN' },
    { key: 'CONTACTED', state: 'OPEN' },
    { key: 'QUALIFIED', state: 'OPEN' },
    { key: 'CONSULTATION_BOOKED', state: 'OPEN' },
    { key: 'CONSULTATION_DONE', state: 'OPEN' },
    { key: 'WON', state: 'WON' },
    { key: 'LOST', state: 'LOST', requiresReason: true },
  ],
  LANGUAGES: [
    { key: 'NEW', state: 'OPEN' },
    { key: 'CONTACTED', state: 'OPEN' },
    { key: 'PLACEMENT_TEST', state: 'OPEN' },
    { key: 'LEVEL_ASSIGNED', state: 'OPEN' },
    { key: 'REGISTERED', state: 'OPEN' },
    { key: 'WON', state: 'WON' },
    { key: 'LOST', state: 'LOST', requiresReason: true },
  ],
  PROFESSIONAL: [
    { key: 'NEW', state: 'OPEN' },
    { key: 'CONTACTED', state: 'OPEN' },
    { key: 'QUALIFIED', state: 'OPEN' },
    { key: 'REGISTERED', state: 'OPEN' },
    { key: 'PAYMENT_PENDING', state: 'OPEN' },
    { key: 'WON', state: 'WON' },
    { key: 'LOST', state: 'LOST', requiresReason: true },
  ],
  EVENTS: [
    { key: 'REGISTERED', state: 'OPEN' },
    { key: 'CONFIRMED', state: 'OPEN' },
    { key: 'ATTENDED', state: 'OPEN' },
    { key: 'FOLLOWED_UP', state: 'OPEN' },
    { key: 'CONVERTED', state: 'WON' },
    { key: 'NO_SHOW', state: 'LOST' },
    { key: 'NOT_INTERESTED', state: 'LOST', requiresReason: true },
  ],
} as const satisfies Record<CrmSectionValue, readonly CrmStageDefinition[]>;

export function getCrmSectionStages(
  section: CrmSectionValue,
): readonly CrmStageDefinition[] {
  return crmSectionStages[section];
}

export function getCrmStage(section: CrmSectionValue, stage: string) {
  return getCrmSectionStages(section).find(({ key }) => key === stage) ?? null;
}

export function getCrmInitialStage(section: CrmSectionValue) {
  return getCrmSectionStages(section)[0]!.key;
}

/** Every stage key used by any section (for labels and DB checks). */
export const crmStageKeys = [
  ...new Set(
    crmSections.flatMap((section) =>
      getCrmSectionStages(section).map(({ key }) => key),
    ),
  ),
];

/** Open deals move to any other stage of their section; closed deals stay. */
export function getCrmStageTransitions(
  section: CrmSectionValue,
  stage: string,
): string[] {
  const current = getCrmStage(section, stage);
  if (!current || current.state !== 'OPEN') return [];
  return getCrmSectionStages(section)
    .map(({ key }) => key)
    .filter((key) => key !== stage);
}

export type CrmStageMoveViolation =
  'stage-invalid' | 'stage-closed' | 'reason-required';

export function checkCrmStageMove(input: {
  section: CrmSectionValue;
  fromStage: string;
  toStage: string;
  reason: string | null;
}): CrmStageMoveViolation | null {
  const target = getCrmStage(input.section, input.toStage);
  if (!target || input.fromStage === input.toStage) return 'stage-invalid';
  if (!getCrmStageTransitions(input.section, input.fromStage).length) {
    return 'stage-closed';
  }
  if ('requiresReason' in target && target.requiresReason && !input.reason) {
    return 'reason-required';
  }
  return null;
}

export const crmOfferKinds = [
  'CONSULTATION',
  'LANGUAGE_COURSE',
  'PROFESSIONAL_PROGRAMME',
  'FAMILY_WORKSHOP',
  'FREE_SESSION',
  'EVENT',
] as const;
export type CrmOfferKindValue = (typeof crmOfferKinds)[number];
export const crmOfferKindSchema = z.enum(crmOfferKinds);

export const crmSectionOfferKinds: Record<
  CrmSectionValue,
  readonly CrmOfferKindValue[]
> = {
  PSYCHOLOGY: ['CONSULTATION', 'FAMILY_WORKSHOP'],
  LANGUAGES: ['LANGUAGE_COURSE'],
  PROFESSIONAL: ['PROFESSIONAL_PROGRAMME', 'FAMILY_WORKSHOP'],
  EVENTS: ['FREE_SESSION', 'EVENT'],
};

export const crmOfferStatuses = [
  'DRAFT',
  'OPEN',
  'FULL',
  'DONE',
  'CANCELLED',
] as const;
export type CrmOfferStatusValue = (typeof crmOfferStatuses)[number];
export const crmOfferStatusSchema = z.enum(crmOfferStatuses);

export const crmOfferTransitions: Record<
  CrmOfferStatusValue,
  readonly CrmOfferStatusValue[]
> = {
  DRAFT: ['OPEN', 'CANCELLED'],
  OPEN: ['FULL', 'DONE', 'CANCELLED'],
  FULL: ['OPEN', 'DONE', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
};

/** Offers new deals may attach to. */
export const crmBookableOfferStatuses: readonly CrmOfferStatusValue[] = [
  'DRAFT',
  'OPEN',
];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : null));

const optionalNumber = <T extends z.ZodType<number>>(schema: T) =>
  z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? null
        : typeof value === 'string'
          ? Number(value)
          : value,
    schema.nullable(),
  );

const optionalDate = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  localDateSchema.nullable(),
);

/** Whole dinars typed by staff; empty means "not set", never zero. */
export const crmDinarsSchema = optionalNumber(
  z.number().int().min(0).max(20_000_000),
);

export const crmOfferInputSchema = z
  .object({
    section: crmSectionSchema,
    kind: crmOfferKindSchema,
    title: z.string().trim().min(2).max(160),
    priceDinars: crmDinarsSchema,
    startsOn: optionalDate,
    endsOn: optionalDate,
    capacity: optionalNumber(z.number().int().min(1).max(10_000)),
    trainerUserId: optionalText(128),
  })
  .superRefine((data, context) => {
    if (!crmSectionOfferKinds[data.section].includes(data.kind)) {
      context.addIssue({
        code: 'custom',
        message: 'This kind of offer does not belong to the section',
        path: ['kind'],
      });
    }
    if (data.startsOn && data.endsOn && data.endsOn < data.startsOn) {
      context.addIssue({
        code: 'custom',
        message: 'The end date is before the start date',
        path: ['endsOn'],
      });
    }
  });
export type CrmOfferInput = z.infer<typeof crmOfferInputSchema>;

export const crmDealInputSchema = z
  .object({
    section: crmSectionSchema,
    enquiryId: optionalText(128),
    clientId: optionalText(128),
    offerId: optionalText(128),
    valueDinars: crmDinarsSchema,
    expectedCloseOn: optionalDate,
  })
  .refine((data) => Boolean(data.enquiryId || data.clientId), {
    message: 'An opportunity needs a lead or a contact',
    path: ['enquiryId'],
  });
export type CrmDealInput = z.infer<typeof crmDealInputSchema>;

export const crmDealReasonSchema = optionalText(240);

/** Where a lead captured by staff came from. */
export const crmQuickLeadSources = [
  'walk-in',
  'phone-call',
  'whatsapp',
  'facebook',
] as const;
export type CrmQuickLeadSource = (typeof crmQuickLeadSources)[number];

export const crmQuickLeadSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    phone: z.preprocess(
      (value) => (value === '' ? undefined : value),
      clientPhoneSchema.optional(),
    ),
    email: z.preprocess(
      (value) => (typeof value === 'string' ? value.trim() : value),
      z.union([z.literal(''), clientEmailSchema]).default(''),
    ),
    source: z.enum(crmQuickLeadSources),
    school: z.enum(['PSYCHOLOGY', 'LANGUAGES', 'TRAINING', 'GENERAL']),
    timingPreference: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.enum(['SOON', 'WITHIN_MONTH', 'LATER', 'NOT_SURE']).optional(),
    ),
    note: z.string().trim().max(1000).default(''),
    /** Explicit staff answer to "did the person agree to be contacted?". */
    consent: z.enum(['yes', 'no']),
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: 'A phone number or an email address is required',
    path: ['phone'],
  });
export type CrmQuickLeadInput = z.infer<typeof crmQuickLeadSchema>;

/** Preferred channel implied by how the person reached Luminol. */
export function crmQuickLeadPreferredContact(
  input: Pick<CrmQuickLeadInput, 'source' | 'phone'>,
): 'PHONE' | 'WHATSAPP' | 'EMAIL' {
  if (input.source === 'whatsapp') return 'WHATSAPP';
  return input.phone ? 'PHONE' : 'EMAIL';
}

export type CrmLeadScoreBand = 'hot' | 'warm' | 'cold';
export type CrmLeadScoreReason =
  | 'consent'
  | 'no-consent'
  | 'phone'
  | 'timing-soon'
  | 'timing-month'
  | 'timing-later'
  | 'programme'
  | 'recent-activity'
  | 'waiting-contact';

export type CrmLeadScore = {
  score: number;
  band: CrmLeadScoreBand;
  reasons: CrmLeadScoreReason[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Transparent lead priority (0–100). Without contact consent a lead cannot be
 * called back, so it never ranks above cold.
 */
export function scoreCrmLead(input: {
  consent: boolean;
  phone: string | null;
  timingPreference: string | null;
  hasProgramme: boolean;
  contacted: boolean;
  createdAt: Date;
  lastActivityAt: Date | null;
  now: Date;
}): CrmLeadScore {
  const reasons: CrmLeadScoreReason[] = [];
  let score = 10;

  if (input.consent) {
    score += 20;
    reasons.push('consent');
  } else {
    reasons.push('no-consent');
  }
  if (input.phone?.trim()) {
    score += 15;
    reasons.push('phone');
  }
  if (input.timingPreference === 'SOON') {
    score += 25;
    reasons.push('timing-soon');
  } else if (input.timingPreference === 'WITHIN_MONTH') {
    score += 15;
    reasons.push('timing-month');
  } else if (input.timingPreference === 'LATER') {
    score += 5;
    reasons.push('timing-later');
  }
  if (input.hasProgramme) {
    score += 15;
    reasons.push('programme');
  }
  if (
    input.lastActivityAt &&
    input.now.getTime() - input.lastActivityAt.getTime() <= 7 * DAY_MS
  ) {
    score += 15;
    reasons.push('recent-activity');
  }
  if (!input.contacted) {
    const waitingDays =
      (input.now.getTime() - input.createdAt.getTime()) / DAY_MS;
    if (waitingDays > 7) {
      score -= 20;
      reasons.push('waiting-contact');
    } else if (waitingDays > 2) {
      score -= 10;
      reasons.push('waiting-contact');
    }
  }

  score = Math.max(0, Math.min(100, score));
  if (!input.consent) score = Math.min(score, 34);
  const band: CrmLeadScoreBand =
    score >= 60 ? 'hot' : score >= 35 ? 'warm' : 'cold';
  return { score, band, reasons };
}

/** Share of an offer's capacity taken by open and won deals (0–100). */
export function crmOfferFillRate(
  taken: number,
  capacity: number | null,
): number | null {
  if (!capacity || capacity <= 0) return null;
  return Math.min(100, Math.round((taken / capacity) * 100));
}
