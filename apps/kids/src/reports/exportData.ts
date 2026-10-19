import type { ChildProfile } from '@luminol/kids-learning';

import type { KidsRepository } from '../data/repository';

export const EXPORT_FORMAT = 'luminol-noor-child-export';
export const EXPORT_VERSION = 1;

/**
 * Everything stored about one child, as JSON the parent can keep or give to
 * a therapist. Photos and recordings are referenced by path, not included.
 */
export async function exportChildData(
  repository: KidsRepository,
  child: ChildProfile,
  now: Date,
): Promise<string> {
  const [progress, sessions, trials, goals, board, sequences] =
    await Promise.all([
      repository.listProgress(child.id),
      repository.listSessions(child.id),
      repository.listTrials(child.id),
      repository.getGoals(child.id),
      repository.getBoard(child.id),
      repository.getSequences(child.id),
    ]);
  return JSON.stringify(
    {
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      exportedAt: now.toISOString(),
      profile: child,
      progress,
      sessions,
      trials,
      goals: goals.items,
      board,
      sequences: sequences.items,
    },
    null,
    2,
  );
}

/** Dates in file names keep shared files sorted and free of the child's name. */
export function datedFileName(prefix: string, now: Date, extension: string) {
  return `${prefix}-${now.toISOString().slice(0, 10)}.${extension}`;
}
