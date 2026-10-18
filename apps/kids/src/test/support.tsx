import type { Utterance } from '@luminol/kids-content';
import {
  createChildProfile,
  type ChildProfile,
  type ChildProfileInput,
} from '@luminol/kids-learning';
import { useEffect, useState, type ReactNode } from 'react';
import initSqlJs from 'sql.js';

import type { CalmSoundService } from '../audio/calmSound';
import type { SpeechService, SpeechSettings } from '../audio/speech';
import {
  configureConnection,
  migrate,
  type SqlDatabase,
  type SqlValue,
} from '../data/database';
import { SqlRepository } from '../data/repository';
import type { KidsServices } from '../services/services';
import { AppStateProvider, useAppState } from '../state/AppState';

/** Runs the production SQL against an in-memory sql.js database. */
export async function createTestDatabase(): Promise<SqlDatabase> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  const all = <Row,>(source: string, params: SqlValue[]): Row[] => {
    const statement = db.prepare(source);
    statement.bind(params);
    const rows: Row[] = [];
    while (statement.step()) rows.push(statement.getAsObject() as Row);
    statement.free();
    return rows;
  };
  const database: SqlDatabase = {
    async execAsync(source) {
      db.exec(source);
    },
    async runAsync(source, params) {
      db.run(source, params);
    },
    async getAllAsync<Row>(source: string, params: SqlValue[]) {
      return all<Row>(source, params);
    },
    async getFirstAsync<Row>(source: string, params: SqlValue[]) {
      return all<Row>(source, params)[0] ?? null;
    },
    async withTransactionAsync(task) {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
  await configureConnection(database);
  await migrate(database);
  return database;
}

export class FakeSpeech implements SpeechService {
  readonly spoken: { utterance: Utterance; settings: SpeechSettings }[] = [];
  stops = 0;
  arabicVoice = true;

  say(utterance: Utterance, settings: SpeechSettings): void {
    this.spoken.push({ utterance, settings });
  }

  stop(): void {
    this.stops += 1;
  }

  async hasArabicVoice(): Promise<boolean> {
    return this.arabicVoice;
  }

  texts(): string[] {
    return this.spoken.map((entry) => entry.utterance.text);
  }

  last(): string | undefined {
    return this.spoken.at(-1)?.utterance.text;
  }
}

export class FakeCalmSound implements CalmSoundService {
  readonly events: string[] = [];

  start(volume: number): void {
    this.events.push(`start:${volume}`);
  }

  stop(): void {
    this.events.push('stop');
  }
}

export type TestServices = KidsServices & {
  speech: FakeSpeech;
  calmSound: FakeCalmSound;
  repository: SqlRepository;
  db: SqlDatabase;
};

export async function createTestServices(seed = 1): Promise<TestServices> {
  const db = await createTestDatabase();
  let ids = 0;
  let clock = Date.parse('2026-10-18T09:00:00.000Z');
  return {
    db,
    repository: new SqlRepository(db),
    speech: new FakeSpeech(),
    calmSound: new FakeCalmSound(),
    newId: () => {
      ids += 1;
      return `00000000-0000-4000-8000-${String(ids).padStart(12, '0')}`;
    },
    now: () => {
      clock += 1000;
      return new Date(clock);
    },
    seed: () => seed,
  };
}

export const CHILD_INPUT: ChildProfileInput = {
  nickname: 'ريم',
  avatar: 'heart-red',
  ageBand: '5-6',
  dialect: 'maghrebi',
};

export async function addChild(
  services: TestServices,
  overrides: Partial<ChildProfile> = {},
): Promise<ChildProfile> {
  const profile = {
    ...createChildProfile(CHILD_INPUT, services.newId(), services.now()),
    ...overrides,
  };
  await services.repository.saveProfile(profile);
  return profile;
}

function ActiveChild({
  childId,
  children,
}: {
  childId: string;
  children: ReactNode;
}) {
  const { selectChild, activeChild, session, startSession } = useAppState();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    selectChild(childId);
  }, [childId, selectChild]);

  useEffect(() => {
    if (activeChild && !requested) {
      setRequested(true);
      void startSession();
    }
  }, [activeChild, requested, startSession]);

  return session ? <>{children}</> : null;
}

/** Renders children with a selected child and a started session. */
export function WithChild({
  services,
  profiles,
  childId,
  children,
}: {
  services: TestServices;
  profiles: ChildProfile[];
  childId: string;
  children: ReactNode;
}) {
  return (
    <AppStateProvider services={services} initialProfiles={profiles}>
      <ActiveChild childId={childId}>{children}</ActiveChild>
    </AppStateProvider>
  );
}
