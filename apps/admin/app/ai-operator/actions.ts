'use server';

import { requirePermission } from '@luminol/auth';
import {
  db,
  decideAiOperatorProposal,
  executeApprovedAiOperatorProposal,
} from '@luminol/database';
import { revalidatePath } from 'next/cache';

function requireFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== 'string') throw new Error(`Missing ${name}`);
  const normalized = value.trim();
  if (!normalized || normalized.length > 255)
    throw new Error(`Invalid ${name}`);
  return normalized;
}

export async function decideAiOperatorProposalAction(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const proposalId = requireFormString(formData, 'proposalId');
  const rawDecision = requireFormString(formData, 'decision');
  if (rawDecision !== 'APPROVED' && rawDecision !== 'REJECTED') {
    throw new Error('Unsupported AI Operator proposal decision');
  }

  const rawNote = formData.get('note');
  if (rawNote !== null && typeof rawNote !== 'string') {
    throw new Error('Invalid AI Operator proposal note');
  }
  const note = rawNote?.trim() || null;
  if (note && note.length > 500) {
    throw new Error('AI Operator proposal note is too long');
  }

  await decideAiOperatorProposal(db, {
    proposalId,
    actorUserId: administrator.id,
    decision: rawDecision,
    note,
  });

  revalidatePath('/');
  revalidatePath('/ai-operator');
}

export async function executeAiOperatorProposalAction(formData: FormData) {
  const administrator = await requirePermission('academy:manage');
  const proposalId = requireFormString(formData, 'proposalId');

  await executeApprovedAiOperatorProposal(db, {
    proposalId,
    actorUserId: administrator.id,
  });

  revalidatePath('/');
  revalidatePath('/ai-operator');
  revalidatePath('/enquiries');
}
