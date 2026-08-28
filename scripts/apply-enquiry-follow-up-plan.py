from pathlib import Path

schema = Path('packages/database/prisma/schema.prisma')
text = schema.read_text()

user_anchor = '''  enquiryOwnershipEvents      EnquiryOwnershipEvent[]      @relation("EnquiryOwnershipActor")
  enrollmentStatusEvents      EnrollmentStatusEvent[]'''
user_replacement = '''  enquiryOwnershipEvents      EnquiryOwnershipEvent[]      @relation("EnquiryOwnershipActor")
  enquiryFollowUpEvents       EnquiryFollowUpEvent[]       @relation("EnquiryFollowUpActor")
  enrollmentStatusEvents      EnrollmentStatusEvent[]'''
if user_anchor not in text:
    raise SystemExit('User follow-up relation anchor not found')
text = text.replace(user_anchor, user_replacement, 1)

enquiry_fields_anchor = '''  source          String                  @default("website")
  ownerUserId     String?
  createdAt       DateTime                @default(now())'''
enquiry_fields_replacement = '''  source          String                  @default("website")
  ownerUserId     String?
  nextFollowUpAt  DateTime?
  nextAction      String?
  createdAt       DateTime                @default(now())'''
if enquiry_fields_anchor not in text:
    raise SystemExit('Enquiry follow-up field anchor not found')
text = text.replace(enquiry_fields_anchor, enquiry_fields_replacement, 1)

enquiry_relations_anchor = '''  statusEvents    EnquiryStatusEvent[]
  ownershipEvents EnquiryOwnershipEvent[]

  @@index([status, createdAt])
  @@index([ownerUserId, status, createdAt])'''
enquiry_relations_replacement = '''  statusEvents    EnquiryStatusEvent[]
  ownershipEvents EnquiryOwnershipEvent[]
  followUpEvents  EnquiryFollowUpEvent[]

  @@index([status, createdAt])
  @@index([ownerUserId, status, createdAt])
  @@index([nextFollowUpAt, status])'''
if enquiry_relations_anchor not in text:
    raise SystemExit('Enquiry follow-up relation anchor not found')
text = text.replace(enquiry_relations_anchor, enquiry_relations_replacement, 1)

ownership_model = '''model EnquiryOwnershipEvent {
  id              String   @id @default(cuid())
  enquiryId       String
  actorUserId     String
  fromOwnerUserId String?
  toOwnerUserId   String?
  createdAt       DateTime @default(now())
  enquiry         Enquiry  @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  actor           User     @relation("EnquiryOwnershipActor", fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([enquiryId, createdAt])
  @@index([actorUserId, createdAt])
}
'''
follow_up_model = ownership_model + '''
model EnquiryFollowUpEvent {
  id                 String   @id @default(cuid())
  enquiryId          String
  actorUserId        String
  fromNextFollowUpAt DateTime?
  toNextFollowUpAt   DateTime?
  fromNextAction     String?
  toNextAction       String?
  createdAt          DateTime @default(now())
  enquiry            Enquiry  @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  actor              User     @relation("EnquiryFollowUpActor", fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([enquiryId, createdAt])
  @@index([actorUserId, createdAt])
}
'''
if ownership_model not in text:
    raise SystemExit('Enquiry ownership model anchor not found')
text = text.replace(ownership_model, follow_up_model, 1)
schema.write_text(text)

migration = Path(
    'packages/database/prisma/migrations/20260828224500_enquiry_follow_up_plan/migration.sql'
)
migration.parent.mkdir(parents=True, exist_ok=True)
migration.write_text('''-- Add an internal, auditable next-action plan to enquiries.
ALTER TABLE "Enquiry"
ADD COLUMN "nextFollowUpAt" TIMESTAMP(3),
ADD COLUMN "nextAction" TEXT;

ALTER TABLE "Enquiry"
ADD CONSTRAINT "Enquiry_follow_up_plan_pair_check"
CHECK (
  ("nextFollowUpAt" IS NULL AND "nextAction" IS NULL)
  OR (
    "nextFollowUpAt" IS NOT NULL
    AND "nextAction" IS NOT NULL
    AND length(btrim("nextAction")) BETWEEN 1 AND 240
  )
);

CREATE INDEX "Enquiry_nextFollowUpAt_status_idx"
ON "Enquiry"("nextFollowUpAt", "status");

CREATE TABLE "EnquiryFollowUpEvent" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromNextFollowUpAt" TIMESTAMP(3),
    "toNextFollowUpAt" TIMESTAMP(3),
    "fromNextAction" TEXT,
    "toNextAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryFollowUpEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EnquiryFollowUpEvent_enquiryId_createdAt_idx"
ON "EnquiryFollowUpEvent"("enquiryId", "createdAt");

CREATE INDEX "EnquiryFollowUpEvent_actorUserId_createdAt_idx"
ON "EnquiryFollowUpEvent"("actorUserId", "createdAt");

ALTER TABLE "EnquiryFollowUpEvent"
ADD CONSTRAINT "EnquiryFollowUpEvent_enquiryId_fkey"
FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EnquiryFollowUpEvent"
ADD CONSTRAINT "EnquiryFollowUpEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "prevent_enquiry_follow_up_event_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Enquiry follow-up history is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "EnquiryFollowUpEvent_append_only"
BEFORE UPDATE OR DELETE ON "EnquiryFollowUpEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_enquiry_follow_up_event_mutation"();
''')

Path('apps/admin/app/enquiries/actions.ts').write_text('''\'use server\';

import { requirePermission } from '@luminol/auth';
import { db, type Prisma } from '@luminol/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  enquiryStatuses,
  isEnquiryTransitionAllowed,
} from '../../lib/operations';

const enquiryIdSchema = z.string().min(1).max(128);

const transitionSchema = z.object({
  enquiryId: enquiryIdSchema,
  toStatus: z.enum(enquiryStatuses),
});

const ownershipSchema = z.object({
  enquiryId: enquiryIdSchema,
  operation: z.enum(['assign-to-me', 'unassign']),
});

const dateOnlySchema = z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/);
const followUpPlanSchema = z.discriminatedUnion('operation', [
  z.object({
    enquiryId: enquiryIdSchema,
    operation: z.literal('save'),
    nextFollowUpOn: dateOnlySchema,
    nextAction: z.string().trim().min(1).max(240),
  }),
  z.object({
    enquiryId: enquiryIdSchema,
    operation: z.literal('clear'),
  }),
]);

function parseDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error('Invalid follow-up date');
  }
  return date;
}

export async function transitionEnquiryStatus(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const input = transitionSchema.parse({
    enquiryId: formData.get('enquiryId'),
    toStatus: formData.get('toStatus'),
  });

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const enquiry = await transaction.enquiry.findUnique({
      where: { id: input.enquiryId },
      select: { id: true, status: true },
    });

    if (!enquiry) throw new Error('Enquiry not found');
    if (!isEnquiryTransitionAllowed(enquiry.status, input.toStatus)) {
      throw new Error('Invalid enquiry status transition');
    }

    const updated = await transaction.enquiry.updateMany({
      where: { id: enquiry.id, status: enquiry.status },
      data: { status: input.toStatus },
    });

    if (updated.count !== 1) {
      throw new Error('Enquiry was updated by another administrator');
    }

    await transaction.enquiryStatusEvent.create({
      data: {
        enquiryId: enquiry.id,
        actorUserId: administrator.id,
        fromStatus: enquiry.status,
        toStatus: input.toStatus,
      },
    });
  });

  revalidatePath('/');
  revalidatePath('/enquiries');
}

export async function updateEnquiryOwnership(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const input = ownershipSchema.parse({
    enquiryId: formData.get('enquiryId'),
    operation: formData.get('operation'),
  });

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const enquiry = await transaction.enquiry.findUnique({
      where: { id: input.enquiryId },
      select: { id: true, ownerUserId: true },
    });

    if (!enquiry) throw new Error('Enquiry not found');

    const toOwnerUserId =
      input.operation === 'assign-to-me' ? administrator.id : null;

    if (enquiry.ownerUserId === toOwnerUserId) return;

    const updated = await transaction.enquiry.updateMany({
      where: { id: enquiry.id, ownerUserId: enquiry.ownerUserId },
      data: { ownerUserId: toOwnerUserId },
    });

    if (updated.count !== 1) {
      throw new Error('Enquiry ownership was updated by another administrator');
    }

    await transaction.enquiryOwnershipEvent.create({
      data: {
        enquiryId: enquiry.id,
        actorUserId: administrator.id,
        fromOwnerUserId: enquiry.ownerUserId,
        toOwnerUserId,
      },
    });
  });

  revalidatePath('/enquiries');
}

export async function updateEnquiryFollowUpPlan(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const operation = formData.get('operation');
  const input = followUpPlanSchema.parse({
    enquiryId: formData.get('enquiryId'),
    operation,
    ...(operation === 'save'
      ? {
          nextFollowUpOn: formData.get('nextFollowUpOn'),
          nextAction: formData.get('nextAction'),
        }
      : {}),
  });
  const toNextFollowUpAt =
    input.operation === 'save' ? parseDateOnly(input.nextFollowUpOn) : null;
  const toNextAction = input.operation === 'save' ? input.nextAction : null;

  await db.$transaction(async (transaction: Prisma.TransactionClient) => {
    const enquiry = await transaction.enquiry.findUnique({
      where: { id: input.enquiryId },
      select: { id: true, nextFollowUpAt: true, nextAction: true },
    });

    if (!enquiry) throw new Error('Enquiry not found');

    const currentDate = enquiry.nextFollowUpAt?.getTime() ?? null;
    const nextDate = toNextFollowUpAt?.getTime() ?? null;
    if (currentDate === nextDate && enquiry.nextAction === toNextAction) return;

    const updated = await transaction.enquiry.updateMany({
      where: {
        id: enquiry.id,
        nextFollowUpAt: enquiry.nextFollowUpAt,
        nextAction: enquiry.nextAction,
      },
      data: {
        nextFollowUpAt: toNextFollowUpAt,
        nextAction: toNextAction,
      },
    });

    if (updated.count !== 1) {
      throw new Error('Enquiry follow-up plan was updated by another administrator');
    }

    await transaction.enquiryFollowUpEvent.create({
      data: {
        enquiryId: enquiry.id,
        actorUserId: administrator.id,
        fromNextFollowUpAt: enquiry.nextFollowUpAt,
        toNextFollowUpAt,
        fromNextAction: enquiry.nextAction,
        toNextAction,
      },
    });
  });

  revalidatePath('/enquiries');
}
''')

Path('apps/admin/lib/enquiry-desk-localization.ts').write_text('''import type { Locale } from '@luminol/localization';

export type EnquiryDeskCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  filterByStatus: string;
  filterByFollowUp: string;
  all: string;
  allFollowUps: string;
  dueToday: string;
  overdue: string;
  enquiries: string;
  received: string;
  contact: string;
  email: string;
  call: string;
  noPhone: string;
  school: string;
  language: string;
  source: string;
  owner: string;
  unassigned: string;
  assignedToYou: string;
  assignToMe: string;
  unassign: string;
  message: string;
  protectedMessage: string;
  followUpPlan: string;
  nextFollowUp: string;
  noFollowUp: string;
  nextAction: string;
  noNextAction: string;
  saveFollowUp: string;
  clearFollowUp: string;
  updateStatus: string;
  moveTo: string;
  update: string;
  noMatches: string;
};

const ENQUIRY_DESK_COPY: Record<Locale, EnquiryDeskCopy> = {
  en: {
    eyebrow: 'Growth operations',
    title: 'Enquiry follow-up desk',
    intro:
      'Review the submitted context, assign ownership, schedule the next action, contact the lead, and move each enquiry through the audited workflow.',
    back: 'Back to overview',
    filterByStatus: 'Filter by status',
    filterByFollowUp: 'Filter by follow-up',
    all: 'All',
    allFollowUps: 'Any follow-up',
    dueToday: 'Due today',
    overdue: 'Overdue',
    enquiries: 'enquiries',
    received: 'Received',
    contact: 'Contact',
    email: 'Email',
    call: 'Call',
    noPhone: 'No phone provided',
    school: 'School',
    language: 'Language',
    source: 'Source',
    owner: 'Owner',
    unassigned: 'Unassigned',
    assignedToYou: 'Assigned to you',
    assignToMe: 'Assign to me',
    unassign: 'Unassign',
    message: 'Message',
    protectedMessage:
      'Protected enquiry message — use only for operational follow-up.',
    followUpPlan: 'Next follow-up plan',
    nextFollowUp: 'Follow-up date',
    noFollowUp: 'No follow-up scheduled',
    nextAction: 'Next action',
    noNextAction: 'No next action recorded',
    saveFollowUp: 'Save follow-up',
    clearFollowUp: 'Clear follow-up',
    updateStatus: 'Update enquiry status',
    moveTo: 'Move to…',
    update: 'Update',
    noMatches: 'No enquiries match these filters.',
  },
  fr: {
    eyebrow: 'Opérations de développement',
    title: 'Suivi des demandes',
    intro:
      'Consultez le contexte transmis, attribuez un responsable, planifiez la prochaine action, contactez le prospect et faites avancer chaque demande dans le flux audité.',
    back: 'Retour à la vue d’ensemble',
    filterByStatus: 'Filtrer par statut',
    filterByFollowUp: 'Filtrer par suivi',
    all: 'Toutes',
    allFollowUps: 'Tous les suivis',
    dueToday: 'À faire aujourd’hui',
    overdue: 'En retard',
    enquiries: 'demandes',
    received: 'Reçue le',
    contact: 'Contact',
    email: 'E-mail',
    call: 'Appeler',
    noPhone: 'Aucun téléphone fourni',
    school: 'Pôle',
    language: 'Langue',
    source: 'Source',
    owner: 'Responsable',
    unassigned: 'Non attribuée',
    assignedToYou: 'Attribuée à vous',
    assignToMe: 'Me l’attribuer',
    unassign: 'Désattribuer',
    message: 'Message',
    protectedMessage:
      'Message de demande protégé — à utiliser uniquement pour le suivi opérationnel.',
    followUpPlan: 'Prochain suivi',
    nextFollowUp: 'Date de suivi',
    noFollowUp: 'Aucun suivi planifié',
    nextAction: 'Prochaine action',
    noNextAction: 'Aucune prochaine action enregistrée',
    saveFollowUp: 'Enregistrer le suivi',
    clearFollowUp: 'Effacer le suivi',
    updateStatus: 'Modifier le statut de la demande',
    moveTo: 'Passer à…',
    update: 'Mettre à jour',
    noMatches: 'Aucune demande ne correspond à ces filtres.',
  },
  ar: {
    eyebrow: 'عمليات النمو',
    title: 'مكتب متابعة الطلبات',
    intro:
      'راجع المعلومات المرسلة، وحدد مسؤول المتابعة، وخطط للخطوة التالية، وتواصل مع صاحب الطلب، ثم انقل الطلب عبر المسار الموثق.',
    back: 'العودة إلى النظرة العامة',
    filterByStatus: 'التصفية حسب الحالة',
    filterByFollowUp: 'التصفية حسب المتابعة',
    all: 'الكل',
    allFollowUps: 'كل مواعيد المتابعة',
    dueToday: 'مستحق اليوم',
    overdue: 'متأخر',
    enquiries: 'طلبات',
    received: 'تاريخ الاستلام',
    contact: 'التواصل',
    email: 'البريد الإلكتروني',
    call: 'اتصال',
    noPhone: 'لم يتم تقديم رقم هاتف',
    school: 'المجال',
    language: 'اللغة',
    source: 'المصدر',
    owner: 'مسؤول المتابعة',
    unassigned: 'غير مسند',
    assignedToYou: 'مسند إليك',
    assignToMe: 'إسناده إليّ',
    unassign: 'إلغاء الإسناد',
    message: 'الرسالة',
    protectedMessage:
      'رسالة طلب محمية — تُستخدم فقط لأغراض المتابعة التشغيلية.',
    followUpPlan: 'خطة المتابعة التالية',
    nextFollowUp: 'تاريخ المتابعة',
    noFollowUp: 'لا توجد متابعة مجدولة',
    nextAction: 'الخطوة التالية',
    noNextAction: 'لم تُسجل خطوة تالية',
    saveFollowUp: 'حفظ المتابعة',
    clearFollowUp: 'مسح المتابعة',
    updateStatus: 'تحديث حالة الطلب',
    moveTo: 'نقل إلى…',
    update: 'تحديث',
    noMatches: 'لا توجد طلبات تطابق هذه الفلاتر.',
  },
};

export function getEnquiryDeskCopy(locale: Locale): EnquiryDeskCopy {
  return ENQUIRY_DESK_COPY[locale];
}
''')

Path('apps/admin/lib/enquiry-desk-localization.test.ts').write_text('''import { describe, expect, it } from 'vitest';

import { getEnquiryDeskCopy } from './enquiry-desk-localization';

describe('enquiry desk localization', () => {
  it('keeps ownership and next-action follow-up controls available in every admin locale', () => {
    expect(getEnquiryDeskCopy('en')).toMatchObject({
      title: 'Enquiry follow-up desk',
      owner: 'Owner',
      assignToMe: 'Assign to me',
      nextAction: 'Next action',
      dueToday: 'Due today',
      overdue: 'Overdue',
      saveFollowUp: 'Save follow-up',
    });
    expect(getEnquiryDeskCopy('fr')).toMatchObject({
      title: 'Suivi des demandes',
      owner: 'Responsable',
      assignToMe: 'Me l’attribuer',
      nextAction: 'Prochaine action',
      dueToday: 'À faire aujourd’hui',
      overdue: 'En retard',
      saveFollowUp: 'Enregistrer le suivi',
    });
    expect(getEnquiryDeskCopy('ar')).toMatchObject({
      title: 'مكتب متابعة الطلبات',
      owner: 'مسؤول المتابعة',
      assignToMe: 'إسناده إليّ',
      nextAction: 'الخطوة التالية',
      dueToday: 'مستحق اليوم',
      overdue: 'متأخر',
      saveFollowUp: 'حفظ المتابعة',
    });
  });
});
''')

Path('apps/admin/app/enquiries/page.tsx').write_text('''import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminEnumLabel } from '../../lib/admin-localization';
import { getEnquiryDeskCopy } from '../../lib/enquiry-desk-localization';
import {
  displayPersonName,
  enquiryStatuses,
  getEnquiryTransitions,
  type EnquiryStatusValue,
} from '../../lib/operations';
import { getAdminRequestLocale } from '../../lib/request-locale';
import {
  transitionEnquiryStatus,
  updateEnquiryFollowUpPlan,
  updateEnquiryOwnership,
} from './actions';
import styles from './page.module.css';

type FollowUpFilter = 'due-today' | 'overdue';

type EnquiryPageProps = {
  searchParams?: Promise<{
    status?: string | string[] | undefined;
    followUp?: string | string[] | undefined;
  }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(
  value: string | string[] | undefined,
): EnquiryStatusValue | null {
  const candidate = firstParam(value);
  if (!candidate) return null;

  return (enquiryStatuses as readonly string[]).includes(candidate)
    ? (candidate as EnquiryStatusValue)
    : null;
}

function parseFollowUp(
  value: string | string[] | undefined,
): FollowUpFilter | null {
  const candidate = firstParam(value);
  return candidate === 'due-today' || candidate === 'overdue'
    ? candidate
    : null;
}

function enquiryHref(
  locale: Locale,
  status: EnquiryStatusValue | null,
  followUp: FollowUpFilter | null,
) {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (followUp) query.set('followUp', followUp);
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return localizeHref(locale, `/enquiries${suffix}`);
}

function dateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : '';
}

export default async function EnquiriesAdminPage({
  searchParams,
}: EnquiryPageProps) {
  const administrator = await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getEnquiryDeskCopy(locale);
  const common = getCommonDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  const activeStatus = parseStatus(params?.status);
  const activeFollowUp = parseFollowUp(params?.followUp);
  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  const tomorrowUtc = new Date(todayUtc.getTime() + 86_400_000);
  const statusFilter = activeStatus ? { status: activeStatus } : {};
  const followUpFilter =
    activeFollowUp === 'overdue'
      ? { nextFollowUpAt: { lt: todayUtc } }
      : activeFollowUp === 'due-today'
        ? { nextFollowUpAt: { gte: todayUtc, lt: tomorrowUtc } }
        : {};
  const enquiries = await db.enquiry.findMany({
    ...(activeStatus || activeFollowUp
      ? { where: { ...statusFilter, ...followUpFilter } }
      : {}),
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      school: true,
      message: true,
      locale: true,
      status: true,
      source: true,
      createdAt: true,
      nextFollowUpAt: true,
      nextAction: true,
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) => formatLocalizedDate(value, locale);

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
            </div>
            <div className={styles.toolbar}>
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.filterByStatus}</p>
                <h2>
                  {number(enquiries.length)} {copy.enquiries}
                </h2>
              </div>
            </div>

            <div className={styles.filterGroups}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>{copy.filterByStatus}</span>
                <nav className={styles.filters} aria-label={copy.filterByStatus}>
                  <Link
                    className={`${styles.filterLink} ${
                      activeStatus === null ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(locale, null, activeFollowUp)}
                    aria-current={activeStatus === null ? 'page' : undefined}
                  >
                    <span>{copy.all}</span>
                  </Link>
                  {enquiryStatuses.map((status) => (
                    <Link
                      key={status}
                      className={`${styles.filterLink} ${
                        activeStatus === status ? styles.activeFilter : ''
                      }`}
                      href={enquiryHref(locale, status, activeFollowUp)}
                      aria-current={activeStatus === status ? 'page' : undefined}
                    >
                      <span>{getAdminEnumLabel(locale, status)}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>{copy.filterByFollowUp}</span>
                <nav className={styles.filters} aria-label={copy.filterByFollowUp}>
                  <Link
                    className={`${styles.filterLink} ${
                      activeFollowUp === null ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(locale, activeStatus, null)}
                    aria-current={activeFollowUp === null ? 'page' : undefined}
                  >
                    <span>{copy.allFollowUps}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeFollowUp === 'due-today' ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(locale, activeStatus, 'due-today')}
                    aria-current={
                      activeFollowUp === 'due-today' ? 'page' : undefined
                    }
                  >
                    <span>{copy.dueToday}</span>
                  </Link>
                  <Link
                    className={`${styles.filterLink} ${
                      activeFollowUp === 'overdue' ? styles.activeFilter : ''
                    }`}
                    href={enquiryHref(locale, activeStatus, 'overdue')}
                    aria-current={
                      activeFollowUp === 'overdue' ? 'page' : undefined
                    }
                  >
                    <span>{copy.overdue}</span>
                  </Link>
                </nav>
              </div>
            </div>
          </section>

          {enquiries.length > 0 ? (
            <section className={styles.list} aria-live="polite">
              {enquiries.map((enquiry) => {
                const ownerName = enquiry.owner
                  ? displayPersonName(
                      enquiry.owner.firstName,
                      enquiry.owner.lastName,
                      enquiry.owner.email,
                    )
                  : copy.unassigned;
                const ownedByAdministrator =
                  enquiry.owner?.id === administrator.id;
                const hasFollowUpPlan = Boolean(
                  enquiry.nextFollowUpAt && enquiry.nextAction,
                );

                return (
                  <article className={styles.card} key={enquiry.id}>
                    <header className={styles.cardHeader}>
                      <div className={styles.identity}>
                        <h2 dir="auto">{enquiry.name}</h2>
                        <p dir="auto">{enquiry.email}</p>
                      </div>
                      <div>
                        <span
                          className={`data-status status-${enquiry.status.toLowerCase()}`}
                        >
                          {getAdminEnumLabel(locale, enquiry.status)}
                        </span>
                      </div>
                    </header>

                    <div className={styles.metaGrid}>
                      <div className={styles.metaItem}>
                        <span>{copy.received}</span>
                        <p>{date(enquiry.createdAt)}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.school}</span>
                        <p>{getAdminEnumLabel(locale, enquiry.school)}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.language}</span>
                        <p dir="auto">{enquiry.locale.toUpperCase()}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.source}</span>
                        <p dir="auto">{enquiry.source}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.contact}</span>
                        <p dir="auto">{enquiry.phone || copy.noPhone}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.owner}</span>
                        <p dir="auto">
                          {ownedByAdministrator ? copy.assignedToYou : ownerName}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.nextFollowUp}</span>
                        <p>
                          {enquiry.nextFollowUpAt
                            ? date(enquiry.nextFollowUpAt)
                            : copy.noFollowUp}
                        </p>
                      </div>
                    </div>

                    <div className={styles.messageBlock}>
                      <span className={styles.messageLabel}>{copy.message}</span>
                      <p className={styles.messageBody} dir="auto">
                        {enquiry.message}
                      </p>
                      <p className={styles.privacyNote}>
                        {copy.protectedMessage}
                      </p>
                    </div>

                    <section className={styles.followUpBlock}>
                      <div className={styles.followUpHeading}>
                        <div>
                          <span className={styles.messageLabel}>
                            {copy.followUpPlan}
                          </span>
                          <p dir="auto">
                            {enquiry.nextAction || copy.noNextAction}
                          </p>
                        </div>
                      </div>
                      <form
                        action={updateEnquiryFollowUpPlan}
                        className={styles.followUpForm}
                      >
                        <input type="hidden" name="enquiryId" value={enquiry.id} />
                        <input type="hidden" name="operation" value="save" />
                        <label className={styles.followUpField}>
                          <span>{copy.nextFollowUp}</span>
                          <input
                            type="date"
                            name="nextFollowUpOn"
                            defaultValue={dateInputValue(enquiry.nextFollowUpAt)}
                            required
                          />
                        </label>
                        <label className={styles.followUpField}>
                          <span>{copy.nextAction}</span>
                          <input
                            type="text"
                            name="nextAction"
                            defaultValue={enquiry.nextAction ?? ''}
                            maxLength={240}
                            required
                            dir="auto"
                          />
                        </label>
                        <button type="submit">{copy.saveFollowUp}</button>
                      </form>
                      {hasFollowUpPlan ? (
                        <form action={updateEnquiryFollowUpPlan}>
                          <input type="hidden" name="enquiryId" value={enquiry.id} />
                          <input type="hidden" name="operation" value="clear" />
                          <button
                            className={styles.clearFollowUpButton}
                            type="submit"
                          >
                            {copy.clearFollowUp}
                          </button>
                        </form>
                      ) : null}
                    </section>

                    <div className={styles.statusRow}>
                      <div className={styles.actions}>
                        <a
                          className={styles.contactLink}
                          href={`mailto:${enquiry.email}`}
                        >
                          {copy.email}
                        </a>
                        {enquiry.phone ? (
                          <a
                            className={styles.contactLink}
                            href={`tel:${enquiry.phone}`}
                          >
                            {copy.call}
                          </a>
                        ) : (
                          <span className={styles.muted}>{copy.noPhone}</span>
                        )}
                        {!ownedByAdministrator ? (
                          <form action={updateEnquiryOwnership}>
                            <input type="hidden" name="enquiryId" value={enquiry.id} />
                            <input
                              type="hidden"
                              name="operation"
                              value="assign-to-me"
                            />
                            <button
                              className={styles.ownershipButton}
                              type="submit"
                            >
                              {copy.assignToMe}
                            </button>
                          </form>
                        ) : null}
                        {enquiry.owner ? (
                          <form action={updateEnquiryOwnership}>
                            <input type="hidden" name="enquiryId" value={enquiry.id} />
                            <input type="hidden" name="operation" value="unassign" />
                            <button
                              className={styles.ownershipButton}
                              type="submit"
                            >
                              {copy.unassign}
                            </button>
                          </form>
                        ) : null}
                      </div>

                      <form
                        action={transitionEnquiryStatus}
                        className={styles.statusForm}
                      >
                        <input type="hidden" name="enquiryId" value={enquiry.id} />
                        <label>
                          <span className="sr-only">
                            {copy.updateStatus}: {enquiry.name}
                          </span>
                          <select
                            name="toStatus"
                            defaultValue=""
                            required
                            aria-label={`${copy.updateStatus}: ${enquiry.name}`}
                          >
                            <option value="" disabled>
                              {copy.moveTo}
                            </option>
                            {getEnquiryTransitions(enquiry.status).map(
                              (status) => (
                                <option key={status} value={status}>
                                  {getAdminEnumLabel(locale, status)}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <button type="submit">{copy.update}</button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="admin-panel">
              <p className="admin-empty">{copy.noMatches}</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
''')

Path('apps/admin/app/enquiries/page.module.css').write_text('''.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.filterGroups,
.filterGroup {
  display: grid;
  gap: 0.55rem;
}

.filterGroups {
  gap: 0.9rem;
}

.filterLabel {
  font-size: 0.76rem;
  font-weight: 700;
  opacity: 0.72;
}

.filters {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.filterLink {
  display: inline-flex;
  align-items: center;
  min-height: 2.25rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 999px;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 650;
}

.activeFilter {
  background: currentColor;
}

.activeFilter > span {
  color: var(--admin-surface, white);
}

.list {
  display: grid;
  gap: 1rem;
}

.card {
  display: grid;
  gap: 1rem;
  padding: 1.15rem;
  border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--admin-surface, white) 96%, transparent);
}

.cardHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.identity {
  display: grid;
  gap: 0.25rem;
}

.identity h2 {
  margin: 0;
  font-size: 1.08rem;
}

.identity p,
.metaGrid p,
.messageBlock p,
.followUpBlock p {
  margin: 0;
}

.metaGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.8rem;
}

.metaItem {
  display: grid;
  gap: 0.2rem;
}

.metaItem span,
.messageLabel,
.followUpField span {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.66;
}

.messageBlock,
.followUpBlock {
  display: grid;
  gap: 0.65rem;
  padding: 0.9rem;
  border-radius: 0.8rem;
  background: color-mix(in srgb, currentColor 5%, transparent);
}

.followUpBlock {
  background: color-mix(in srgb, currentColor 3%, transparent);
  border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
}

.followUpHeading {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.followUpHeading > div {
  display: grid;
  gap: 0.3rem;
}

.followUpForm {
  display: grid;
  grid-template-columns: minmax(150px, 0.55fr) minmax(220px, 1.45fr) auto;
  align-items: end;
  gap: 0.65rem;
}

.followUpField {
  display: grid;
  gap: 0.3rem;
}

.followUpField input,
.followUpForm button,
.clearFollowUpButton {
  min-height: 2.4rem;
  font: inherit;
}

.followUpField input {
  width: 100%;
  padding-inline: 0.6rem;
}

.followUpForm button,
.clearFollowUpButton {
  padding: 0.45rem 0.8rem;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: 0.65rem;
  cursor: pointer;
}

.clearFollowUpButton {
  background: transparent;
  color: inherit;
}

.messageBody {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.55;
}

.privacyNote {
  font-size: 0.78rem;
  opacity: 0.68;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.actions form {
  display: inline-flex;
}

.contactLink,
.ownershipButton {
  display: inline-flex;
  align-items: center;
  min-height: 2.35rem;
  padding: 0.45rem 0.8rem;
  border-radius: 0.65rem;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  font: inherit;
  font-weight: 650;
}

.contactLink {
  text-decoration: none;
}

.ownershipButton {
  cursor: pointer;
  background: transparent;
  color: inherit;
}

.muted {
  font-size: 0.85rem;
  opacity: 0.62;
}

.statusRow {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.statusForm {
  display: flex;
  align-items: end;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.statusForm label {
  display: grid;
  gap: 0.25rem;
}

.statusForm select,
.statusForm button {
  min-height: 2.35rem;
}

@media (max-width: 800px) {
  .followUpForm {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .card {
    padding: 1rem;
  }

  .followUpForm,
  .followUpForm label,
  .followUpForm input,
  .followUpForm button,
  .statusForm,
  .statusForm label,
  .statusForm select,
  .statusForm button {
    width: 100%;
  }
}
''')

Path('packages/database/src/enquiry-follow-up.integration.test.ts').write_text('''import { beforeAll, describe, expect, test } from 'vitest';

import { db } from './index';

const runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);
const suite = runDatabaseTests ? describe : describe.skip;
const suffix = `${process.pid}-${Date.now()}`;
const actorUserId = `enquiry-follow-up-actor-${suffix}`;
const enquiryId = `enquiry-follow-up-enquiry-${suffix}`;
const followUpAt = new Date('2030-05-12T00:00:00.000Z');
let eventId: string;

suite('enquiry follow-up plan persistence invariants', () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        id: actorUserId,
        clerkId: `enquiry-follow-up-clerk-${suffix}`,
        email: `enquiry-follow-up-actor-${suffix}@example.test`,
      },
    });

    await db.enquiry.create({
      data: {
        id: enquiryId,
        name: `Follow-up Test ${suffix}`,
        email: `enquiry-follow-up-lead-${suffix}@example.test`,
        school: 'GENERAL',
        message: 'Please contact me about the available learning pathways.',
        consent: true,
        nextFollowUpAt: followUpAt,
        nextAction: 'Confirm the preferred consultation format.',
      },
    });

    const event = await db.enquiryFollowUpEvent.create({
      data: {
        enquiryId,
        actorUserId,
        fromNextFollowUpAt: null,
        toNextFollowUpAt: followUpAt,
        fromNextAction: null,
        toNextAction: 'Confirm the preferred consultation format.',
      },
      select: { id: true },
    });
    eventId = event.id;
  });

  test('persists the next follow-up date and action as one plan', async () => {
    const enquiry = await db.enquiry.findUniqueOrThrow({
      where: { id: enquiryId },
      select: { nextFollowUpAt: true, nextAction: true },
    });

    expect(enquiry.nextFollowUpAt?.toISOString()).toBe(followUpAt.toISOString());
    expect(enquiry.nextAction).toBe(
      'Confirm the preferred consultation format.',
    );
  });

  test('rejects a partial follow-up plan at the database boundary', async () => {
    await expect(
      db.enquiry.create({
        data: {
          id: `enquiry-follow-up-invalid-${suffix}`,
          name: `Invalid Follow-up ${suffix}`,
          email: `enquiry-follow-up-invalid-${suffix}@example.test`,
          school: 'GENERAL',
          message: 'Please contact me.',
          consent: true,
          nextAction: 'Call tomorrow.',
        },
      }),
    ).rejects.toThrow();
  });

  test('keeps enquiry follow-up history append-only', async () => {
    await expect(
      db.enquiryFollowUpEvent.update({
        where: { id: eventId },
        data: { toNextAction: 'Changed after the fact.' },
      }),
    ).rejects.toThrow('Enquiry follow-up history is append-only');

    await expect(
      db.enquiryFollowUpEvent.delete({ where: { id: eventId } }),
    ).rejects.toThrow('Enquiry follow-up history is append-only');
  });
});
''')
