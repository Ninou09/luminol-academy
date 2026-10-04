'use server';

import { requirePermission } from '@luminol/auth';
import {
  db,
  queueAiOperatorProposal,
  runMuseCommand,
  routeMuseCommand,
} from '@luminol/database';
import {
  approvedMuseWhatsAppHandoff,
  museInternationalPhone,
} from '@luminol/database/muse-handoff';
import {
  museCommandSchema,
  museDraftSchema,
  museFollowUpSchema,
  museKnowledgeSchema,
  museResourceIdSchema,
  museTaskSchema,
} from '@luminol/validation/muse';
import { localizeHref } from '@luminol/localization';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminRequestLocale } from '../../lib/request-locale';

function refresh() {
  revalidatePath('/muse');
  revalidatePath('/ai-operator');
}
export type MuseActionState = { error: boolean };

export async function commandAction(
  _state: MuseActionState,
  form: FormData,
): Promise<MuseActionState> {
  const actor = await requirePermission('academy:manage');
  const parsed = museCommandSchema.safeParse({
    requestId: form.get('requestId'),
    prompt: form.get('prompt'),
    locale: await getAdminRequestLocale(),
    ...(form.get('intent') ? { intent: form.get('intent') } : {}),
  });
  if (!parsed.success) return { error: true };
  const intent = parsed.data.intent ?? routeMuseCommand(parsed.data.prompt);
  if (intent === 'revenue') await requirePermission('finance:manage');
  try {
    await runMuseCommand(db, actor.id, parsed.data);
    refresh();
    return { error: false };
  } catch {
    return { error: true };
  }
}

export async function knowledgeAction(form: FormData) {
  const actor = await requirePermission('academy:manage');
  const input = museKnowledgeSchema.parse({
    title: form.get('title'),
    content: form.get('content'),
    source: form.get('source'),
    agent: form.get('agent'),
    locale: await getAdminRequestLocale(),
  });
  if (input.agent === 'revenue') await requirePermission('finance:manage');
  await db.$transaction(async (tx) => {
    const entry = await tx.museKnowledge.create({
      data: { ...input, actorId: actor.id },
    });
    await tx.museEvent.create({
      data: {
        actorId: actor.id,
        kind: 'KNOWLEDGE_APPROVED',
        reference: entry.id,
      },
    });
  });
  refresh();
}

export async function archiveKnowledgeAction(form: FormData) {
  const actor = await requirePermission('academy:manage');
  const id = museResourceIdSchema.parse(form.get('id'));
  const entry = await db.museKnowledge.findUniqueOrThrow({ where: { id } });
  if (entry.agent === 'revenue') await requirePermission('finance:manage');
  await db.$transaction(async (tx) => {
    const changed = await tx.museKnowledge.updateMany({
      where: { id, active: true },
      data: { active: false },
    });
    if (changed.count !== 1) throw new Error('MUSE_KNOWLEDGE_UNAVAILABLE');
    await tx.museEvent.create({
      data: { actorId: actor.id, kind: 'KNOWLEDGE_ARCHIVED', reference: id },
    });
  });
  refresh();
}

export async function taskAction(form: FormData) {
  const actor = await requirePermission('academy:manage');
  const input = museTaskSchema.parse({
    title: form.get('title'),
    goal: form.get('goal') ?? '',
    dueOn: form.get('dueOn'),
    agent: form.get('agent'),
  });
  if (input.agent === 'revenue') await requirePermission('finance:manage');
  await db.$transaction(async (tx) => {
    const task = await tx.museTask.create({
      data: {
        title: input.title,
        goal: input.goal,
        dueAt: new Date(`${input.dueOn}T00:00:00Z`),
        agent: input.agent,
        actorId: actor.id,
      },
    });
    await tx.museEvent.create({
      data: { actorId: actor.id, kind: 'TASK_CREATED', reference: task.id },
    });
  });
  refresh();
}

export async function completeTaskAction(form: FormData) {
  const actor = await requirePermission('academy:manage');
  const id = museResourceIdSchema.parse(form.get('id'));
  const canFinance = actor.roles.some(({ role }) =>
    role.permissions.some(
      ({ permission }) => permission.key === 'finance:manage',
    ),
  );
  await db.$transaction(async (tx) => {
    const changed = await tx.museTask.updateMany({
      where: {
        id,
        actorId: actor.id,
        done: false,
        ...(!canFinance ? { agent: { not: 'revenue' } } : {}),
      },
      data: { done: true },
    });
    if (changed.count !== 1) throw new Error('MUSE_TASK_UNAVAILABLE');
    await tx.museEvent.create({
      data: { actorId: actor.id, kind: 'TASK_COMPLETED', reference: id },
    });
  });
  refresh();
}

export async function followUpAction(form: FormData) {
  const actor = await requirePermission('academy:manage');
  const input = museFollowUpSchema.parse({
    requestId: form.get('requestId'),
    enquiryId: form.get('enquiryId'),
    nextFollowUpOn: form.get('nextFollowUpOn'),
    nextAction: form.get('nextAction'),
  });
  await db.enquiry.findFirstOrThrow({
    where: {
      id: input.enquiryId,
      status: { in: ['NEW', 'IN_REVIEW', 'CONTACTED'] },
    },
  });
  await queueAiOperatorProposal(
    db,
    {
      version: '1',
      actionId: `muse-plan:${input.requestId}`,
      kind: 'UPDATE_ENQUIRY_WORKFLOW',
      executionPolicy: 'approval_required',
      source: { surface: 'ai_operator', reference: `muse:${input.enquiryId}` },
      target: { surface: 'crm_enquiry', enquiryId: input.enquiryId },
      payload: {
        operation: 'SET_FOLLOW_UP',
        parameters: {
          nextFollowUpOn: input.nextFollowUpOn,
          nextAction: input.nextAction,
        },
      },
    },
    actor.id,
  );
  refresh();
  redirect(localizeHref(await getAdminRequestLocale(), '/ai-operator'));
}

export async function draftApprovalAction(form: FormData) {
  const actor = await requirePermission('academy:manage');
  const input = museDraftSchema.parse({
    requestId: form.get('requestId'),
    enquiryId: form.get('enquiryId'),
    text: form.get('text'),
  });
  const lead = await db.enquiry.findFirstOrThrow({
    where: {
      id: input.enquiryId,
      consent: true,
      preferredContact: 'WHATSAPP',
      status: { in: ['NEW', 'IN_REVIEW', 'CONTACTED'] },
    },
  });
  const recipient = museInternationalPhone(lead.phone);
  const draft = await db.museDraft.upsert({
    where: { requestId: input.requestId },
    create: { ...input, recipient, actorId: actor.id },
    update: {},
  });
  if (
    draft.actorId !== actor.id ||
    draft.enquiryId !== input.enquiryId ||
    draft.text !== input.text ||
    draft.recipient !== recipient
  )
    throw new Error('MUSE_REQUEST_CONFLICT');
  await queueAiOperatorProposal(
    db,
    {
      version: '1',
      actionId: `muse-message:${input.requestId}`,
      kind: 'SEND_OUTBOUND_MESSAGE',
      executionPolicy: 'approval_required',
      source: { surface: 'ai_operator', reference: `muse:${draft.id}` },
      target: {
        surface: 'outbound_recipient',
        channel: 'WHATSAPP',
        recipientRef: input.enquiryId,
      },
      payload: { templateKey: 'muse_follow_up_v1', messageRef: draft.id },
    },
    actor.id,
  );
  refresh();
  redirect(localizeHref(await getAdminRequestLocale(), '/ai-operator'));
}

export async function whatsappHandoffAction(form: FormData) {
  const actor = await requirePermission('academy:manage');
  const id = museResourceIdSchema.parse(form.get('proposalId'));
  const url = await db.$transaction(async (tx) => {
    const proposal = await tx.aiOperatorProposal.findUniqueOrThrow({
      where: { id },
    });
    const draft = await tx.museDraft.findUniqueOrThrow({
      where: { requestId: proposal.actionId.replace('muse-message:', '') },
    });
    const lead = await tx.enquiry.findUniqueOrThrow({
      where: { id: draft.enquiryId },
    });
    const handoff = approvedMuseWhatsAppHandoff({ proposal, draft, lead });
    await tx.museEvent.create({
      data: {
        actorId: actor.id,
        kind: 'MANUAL_HANDOFF_OPENED_NOT_SENT',
        reference: id,
      },
    });
    return handoff;
  });
  redirect(url);
}
