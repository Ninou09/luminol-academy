import {
  aacBoardSchema,
  childGoalsSchema,
  childProfileSchema,
  childSequencesSchema,
  EMPTY_AAC_BOARD,
  MAX_SEQUENCES,
  sequenceSchema,
  goalSchema,
  MAX_GOALS,
  type ChildGoals,
  type ChildSequences,
  type AacBoard,
  sessionRecordSchema,
  skillProgressSchema,
  trialRecordSchema,
  type ChildProfile,
  type SessionRecord,
  type SkillId,
  type SkillProgress,
  type TrialRecord,
} from '@luminol/kids-learning';
import type { z } from 'zod';

import type { SqlDatabase } from './database';

export interface KidsRepository {
  listProfiles(): Promise<ChildProfile[]>;
  saveProfile(profile: ChildProfile): Promise<void>;
  /** Removes the profile and, through cascades, all of its history. */
  deleteProfile(childId: string): Promise<void>;
  getProgress(childId: string, skillId: SkillId): Promise<SkillProgress | null>;
  /** Stores a finished trial and the progress it produced atomically. */
  recordTrial(trial: TrialRecord, progress: SkillProgress): Promise<void>;
  saveSession(session: SessionRecord): Promise<void>;
  countSessions(childId: string): Promise<number>;
  listTrials(childId: string): Promise<TrialRecord[]>;
  /** Sessions newest first. */
  listSessions(childId: string): Promise<SessionRecord[]>;
  listProgress(childId: string): Promise<SkillProgress[]>;
  getGoals(childId: string): Promise<ChildGoals>;
  saveGoals(childId: string, goals: ChildGoals, now: Date): Promise<void>;
  /**
   * Removes the child's sessions, trials, levels and goals; the profile,
   * board, routines and stories stay.
   */
  clearHistory(childId: string): Promise<void>;
  /** The child's communication board; an empty board if none is saved. */
  getBoard(childId: string): Promise<AacBoard>;
  saveBoard(childId: string, board: AacBoard, now: Date): Promise<void>;
  /** The child's routines and stories; any that fail validation are skipped. */
  getSequences(childId: string): Promise<ChildSequences>;
  saveSequences(
    childId: string,
    sequences: ChildSequences,
    now: Date,
  ): Promise<void>;
}

type DataRow = { data: string };

/** Stored rows are treated as untrusted input and validated on the way out. */
function parseRow<Schema extends z.ZodType>(
  schema: Schema,
  row: DataRow,
): z.infer<Schema> | null {
  try {
    const result = schema.safeParse(JSON.parse(row.data));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function parseRows<Schema extends z.ZodType>(
  schema: Schema,
  rows: DataRow[],
): z.infer<Schema>[] {
  return rows
    .map((row) => parseRow(schema, row))
    .filter((value): value is z.infer<Schema> => value !== null);
}

/**
 * Reads a stored `{ items: [...] }` list, keeping the items that validate, so
 * one damaged entry never hides the others.
 */
function parseItems<Schema extends z.ZodType>(
  schema: Schema,
  row: DataRow | null,
  max: number,
): z.infer<Schema>[] {
  if (!row) return [];
  let stored: unknown;
  try {
    stored = JSON.parse(row.data);
  } catch {
    return [];
  }
  const items =
    stored && typeof stored === 'object' && 'items' in stored
      ? stored.items
      : null;
  if (!Array.isArray(items)) return [];
  return items
    .map((item: unknown) => schema.safeParse(item))
    .flatMap((result) => (result.success ? [result.data] : []))
    .slice(0, max);
}

export class SqlRepository implements KidsRepository {
  constructor(private readonly db: SqlDatabase) {}

  async listProfiles(): Promise<ChildProfile[]> {
    const rows = await this.db.getAllAsync<DataRow>(
      'SELECT data FROM child_profiles ORDER BY created_at ASC',
      [],
    );
    return parseRows(childProfileSchema, rows);
  }

  async saveProfile(profile: ChildProfile): Promise<void> {
    const valid = childProfileSchema.parse(profile);
    await this.db.runAsync(
      `INSERT INTO child_profiles (id, data, created_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
      [valid.id, JSON.stringify(valid), valid.createdAt],
    );
  }

  async deleteProfile(childId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM child_profiles WHERE id = ?', [
      childId,
    ]);
  }

  async getProgress(
    childId: string,
    skillId: SkillId,
  ): Promise<SkillProgress | null> {
    const row = await this.db.getFirstAsync<DataRow>(
      'SELECT data FROM skill_progress WHERE child_id = ? AND skill_id = ?',
      [childId, skillId],
    );
    if (row === null) return null;
    const progress = parseRow(skillProgressSchema, row);
    return progress?.skillId === skillId ? progress : null;
  }

  async recordTrial(
    trial: TrialRecord,
    progress: SkillProgress,
  ): Promise<void> {
    const validTrial = trialRecordSchema.parse(trial);
    const validProgress = skillProgressSchema.parse(progress);
    if (validProgress.skillId !== validTrial.skillId) {
      throw new Error('Trial and progress belong to different skills.');
    }
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        'INSERT INTO trials (child_id, session_id, skill_id, data, at) VALUES (?, ?, ?, ?, ?)',
        [
          validTrial.childId,
          validTrial.sessionId,
          validTrial.skillId,
          JSON.stringify(validTrial),
          validTrial.at,
        ],
      );
      await this.db.runAsync(
        `INSERT INTO skill_progress (child_id, skill_id, data, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(child_id, skill_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
        [
          validTrial.childId,
          validTrial.skillId,
          JSON.stringify(validProgress),
          validTrial.at,
        ],
      );
    });
  }

  async saveSession(session: SessionRecord): Promise<void> {
    const valid = sessionRecordSchema.parse(session);
    await this.db.runAsync(
      `INSERT INTO sessions (id, child_id, data, started_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
      [valid.id, valid.childId, JSON.stringify(valid), valid.startedAt],
    );
  }

  async countSessions(childId: string): Promise<number> {
    const row = await this.db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) AS total FROM sessions WHERE child_id = ?',
      [childId],
    );
    return row?.total ?? 0;
  }

  async getBoard(childId: string): Promise<AacBoard> {
    const row = await this.db.getFirstAsync<DataRow>(
      'SELECT data FROM aac_boards WHERE child_id = ?',
      [childId],
    );
    return (row && parseRow(aacBoardSchema, row)) ?? EMPTY_AAC_BOARD;
  }

  async saveBoard(childId: string, board: AacBoard, now: Date): Promise<void> {
    const valid = aacBoardSchema.parse(board);
    await this.db.runAsync(
      `INSERT INTO aac_boards (child_id, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(child_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
      [childId, JSON.stringify(valid), now.toISOString()],
    );
  }

  async getSequences(childId: string): Promise<ChildSequences> {
    const row = await this.db.getFirstAsync<DataRow>(
      'SELECT data FROM child_sequences WHERE child_id = ?',
      [childId],
    );
    return { items: parseItems(sequenceSchema, row, MAX_SEQUENCES) };
  }

  async saveSequences(
    childId: string,
    sequences: ChildSequences,
    now: Date,
  ): Promise<void> {
    const valid = childSequencesSchema.parse(sequences);
    await this.db.runAsync(
      `INSERT INTO child_sequences (child_id, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(child_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
      [childId, JSON.stringify(valid), now.toISOString()],
    );
  }

  async listTrials(childId: string): Promise<TrialRecord[]> {
    const rows = await this.db.getAllAsync<DataRow>(
      'SELECT data FROM trials WHERE child_id = ? ORDER BY id ASC',
      [childId],
    );
    return parseRows(trialRecordSchema, rows);
  }

  async listSessions(childId: string): Promise<SessionRecord[]> {
    const rows = await this.db.getAllAsync<DataRow>(
      'SELECT data FROM sessions WHERE child_id = ? ORDER BY started_at DESC',
      [childId],
    );
    return parseRows(sessionRecordSchema, rows);
  }

  async listProgress(childId: string): Promise<SkillProgress[]> {
    const rows = await this.db.getAllAsync<DataRow & { skill_id: string }>(
      'SELECT data, skill_id FROM skill_progress WHERE child_id = ?',
      [childId],
    );
    return rows.flatMap((row) => {
      const progress = parseRow(skillProgressSchema, row);
      return progress && progress.skillId === row.skill_id ? [progress] : [];
    });
  }

  async getGoals(childId: string): Promise<ChildGoals> {
    const row = await this.db.getFirstAsync<DataRow>(
      'SELECT data FROM child_goals WHERE child_id = ?',
      [childId],
    );
    return { items: parseItems(goalSchema, row, MAX_GOALS) };
  }

  async saveGoals(
    childId: string,
    goals: ChildGoals,
    now: Date,
  ): Promise<void> {
    const valid = childGoalsSchema.parse(goals);
    await this.db.runAsync(
      `INSERT INTO child_goals (child_id, data, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(child_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
      [childId, JSON.stringify(valid), now.toISOString()],
    );
  }

  async clearHistory(childId: string): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (const table of [
        'trials',
        'sessions',
        'skill_progress',
        'child_goals',
      ]) {
        await this.db.runAsync(`DELETE FROM ${table} WHERE child_id = ?`, [
          childId,
        ]);
      }
    });
  }
}
