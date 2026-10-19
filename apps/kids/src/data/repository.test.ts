import {
  createSkillProgress,
  EMPTY_AAC_BOARD,
  setOverride,
  type TrialRecord,
} from '@luminol/kids-learning';

import { SCHEMA_VERSION } from './database';
import { addChild, createTestServices } from '../test/support';

function trialFor(childId: string, sessionId: string): TrialRecord {
  return {
    childId,
    sessionId,
    skillId: 'match-shapes',
    level: 1,
    promptLevel: 'full',
    firstTryCorrect: true,
    wrongAttempts: 0,
    escalatedToGuide: false,
    responseMs: 900,
    at: '2026-10-18T09:05:00.000Z',
  };
}

async function setup() {
  const services = await createTestServices();
  const child = await addChild(services);
  const sessionId = services.newId();
  await services.repository.saveSession({
    id: sessionId,
    childId: child.id,
    startedAt: '2026-10-18T09:01:00.000Z',
    endedAt: null,
    activitiesCompleted: 0,
    calmVisits: 0,
  });
  return { services, child, sessionId };
}

describe('SqlRepository', () => {
  it('migrates to the current schema version', async () => {
    const { services } = await setup();
    const row = await services.db.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
      [],
    );
    expect(row?.user_version).toBe(SCHEMA_VERSION);
  });

  it('saves, updates and lists profiles in creation order', async () => {
    const { services, child } = await setup();
    const second = await addChild(services, { nickname: 'آدم' });
    await services.repository.saveProfile({ ...child, nickname: 'ريما' });
    const profiles = await services.repository.listProfiles();
    expect(profiles.map((profile) => profile.nickname)).toEqual([
      'ريما',
      second.nickname,
    ]);
  });

  it('skips stored rows that fail validation instead of crashing', async () => {
    const { services } = await setup();
    await services.db.runAsync(
      'INSERT INTO child_profiles (id, data, created_at) VALUES (?, ?, ?)',
      ['broken', '{"nickname":42}', '2026-10-18T10:00:00.000Z'],
    );
    await services.db.runAsync(
      'INSERT INTO child_profiles (id, data, created_at) VALUES (?, ?, ?)',
      ['not-json', '{', '2026-10-18T10:00:01.000Z'],
    );
    expect(await services.repository.listProfiles()).toHaveLength(1);
  });

  it('stores a trial together with the progress it produced', async () => {
    const { services, child, sessionId } = await setup();
    const progress = {
      ...createSkillProgress('match-shapes'),
      trialCount: 1,
      promptStreak: 1,
    };
    await services.repository.recordTrial(
      trialFor(child.id, sessionId),
      progress,
    );
    expect(
      await services.repository.getProgress(child.id, 'match-shapes'),
    ).toEqual(progress);
    expect(await services.repository.listTrials(child.id)).toHaveLength(1);
    expect(
      await services.repository.getProgress(child.id, 'sort-color'),
    ).toBeNull();
  });

  it('rolls back the trial when the progress is invalid', async () => {
    const { services, child, sessionId } = await setup();
    const mismatched = createSkillProgress('sort-color');
    await expect(
      services.repository.recordTrial(
        trialFor(child.id, sessionId),
        mismatched,
      ),
    ).rejects.toThrow();
    expect(await services.repository.listTrials(child.id)).toHaveLength(0);
  });

  it('counts sessions per child', async () => {
    const { services, child } = await setup();
    expect(await services.repository.countSessions(child.id)).toBe(1);
    expect(
      await services.repository.countSessions(
        '00000000-0000-4000-8000-999999999999',
      ),
    ).toBe(0);
  });

  it('deletes a child together with all of their history', async () => {
    const { services, child, sessionId } = await setup();
    await services.repository.recordTrial(
      trialFor(child.id, sessionId),
      createSkillProgress('match-shapes'),
    );
    await services.repository.deleteProfile(child.id);
    expect(await services.repository.listProfiles()).toEqual([]);
    for (const table of ['skill_progress', 'sessions', 'trials']) {
      const row = await services.db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) AS total FROM ${table}`,
        [],
      );
      expect(row?.total).toBe(0);
    }
  });

  it('returns an empty board until one is saved, then the saved board', async () => {
    const { services, child } = await setup();
    expect(await services.repository.getBoard(child.id)).toEqual(
      EMPTY_AAC_BOARD,
    );
    const board = setOverride(EMPTY_AAC_BOARD, 'milk', {
      hidden: true,
      picture: null,
      voicePath: null,
    });
    await services.repository.saveBoard(child.id, board, services.now());
    expect(await services.repository.getBoard(child.id)).toEqual(board);
  });

  it('falls back to an empty board when the stored board is invalid', async () => {
    const { services, child } = await setup();
    await services.db.runAsync(
      'INSERT INTO aac_boards (child_id, data, updated_at) VALUES (?, ?, ?)',
      [
        child.id,
        '{"overrides":{"water":{"hidden":"yes"}}}',
        '2026-10-18T10:00:00.000Z',
      ],
    );
    expect(await services.repository.getBoard(child.id)).toEqual(
      EMPTY_AAC_BOARD,
    );
  });

  it('deletes the board with the child', async () => {
    const { services, child } = await setup();
    await services.repository.saveBoard(
      child.id,
      EMPTY_AAC_BOARD,
      services.now(),
    );
    await services.repository.deleteProfile(child.id);
    const row = await services.db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) AS total FROM aac_boards',
      [],
    );
    expect(row?.total).toBe(0);
  });

  it('keeps valid routines when another stored one is damaged', async () => {
    const { services, child } = await setup();
    expect(await services.repository.getSequences(child.id)).toEqual({
      items: [],
    });
    const routine = {
      id: services.newId(),
      kind: 'routine' as const,
      title: 'الصباح',
      steps: [
        {
          id: services.newId(),
          text: 'أتناول الفطور',
          picture: { kind: 'builtin' as const, id: 'food' as const },
          voicePath: null,
        },
      ],
    };
    await services.repository.saveSequences(
      child.id,
      { items: [routine] },
      services.now(),
    );
    expect(await services.repository.getSequences(child.id)).toEqual({
      items: [routine],
    });
    await services.db.runAsync(
      'UPDATE child_sequences SET data = ? WHERE child_id = ?',
      [
        JSON.stringify({ items: [{ ...routine, title: '' }, routine] }),
        child.id,
      ],
    );
    expect(await services.repository.getSequences(child.id)).toEqual({
      items: [routine],
    });
  });

  it('deletes routines and stories with the child', async () => {
    const { services, child } = await setup();
    await services.repository.saveSequences(
      child.id,
      { items: [] },
      services.now(),
    );
    await services.repository.deleteProfile(child.id);
    const row = await services.db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) AS total FROM child_sequences',
      [],
    );
    expect(row?.total).toBe(0);
  });

  it('lists sessions newest first and keeps the board when clearing history', async () => {
    const { services, child } = await setup();
    for (const startedAt of [
      '2026-10-01T08:00:00.000Z',
      '2026-10-03T08:00:00.000Z',
    ]) {
      await services.repository.saveSession({
        id: services.newId(),
        childId: child.id,
        startedAt,
        endedAt: null,
        activitiesCompleted: 1,
        calmVisits: 0,
      });
    }
    const sessions = await services.repository.listSessions(child.id);
    const starts = sessions.map((session) => session.startedAt);
    expect(starts).toEqual([...starts].sort().reverse());
    expect(starts.slice(-2)).toEqual([
      '2026-10-03T08:00:00.000Z',
      '2026-10-01T08:00:00.000Z',
    ]);
    await services.repository.saveGoals(
      child.id,
      {
        items: [
          {
            id: services.newId(),
            skillId: 'match-shapes',
            targetLevel: 2,
            createdAt: '2026-10-01T08:00:00.000Z',
          },
        ],
      },
      services.now(),
    );
    const board = setOverride(EMPTY_AAC_BOARD, 'milk', {
      hidden: true,
      picture: null,
      voicePath: null,
    });
    await services.repository.saveBoard(child.id, board, services.now());
    await services.repository.clearHistory(child.id);
    expect(await services.repository.listSessions(child.id)).toEqual([]);
    expect((await services.repository.getGoals(child.id)).items).toEqual([]);
    expect(await services.repository.getBoard(child.id)).toEqual(board);
  });
});
