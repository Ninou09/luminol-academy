export type SqlValue = string | number | null;

/**
 * The slice of expo-sqlite the app relies on. Tests run the same SQL through
 * sql.js, so migrations and queries are exercised without native code.
 */
export interface SqlDatabase {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params: SqlValue[]): Promise<unknown>;
  getAllAsync<Row>(source: string, params: SqlValue[]): Promise<Row[]>;
  getFirstAsync<Row>(source: string, params: SqlValue[]): Promise<Row | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE child_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE skill_progress (
    child_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (child_id, skill_id)
  );
  CREATE TABLE sessions (
    id TEXT PRIMARY KEY NOT NULL,
    child_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    started_at TEXT NOT NULL
  );
  CREATE TABLE trials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    data TEXT NOT NULL,
    at TEXT NOT NULL
  );
  CREATE INDEX trials_by_child_skill ON trials (child_id, skill_id, at);
  CREATE INDEX sessions_by_child ON sessions (child_id, started_at);
  `,
  `
  CREATE TABLE aac_boards (
    child_id TEXT PRIMARY KEY NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `,
];

export const SCHEMA_VERSION = MIGRATIONS.length;

/** Per-connection settings: enforce relations and overwrite deleted rows. */
export async function configureConnection(db: SqlDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA secure_delete = ON;');
}

export async function migrate(db: SqlDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
    [],
  );
  const current = row?.user_version ?? 0;
  for (let version = current; version < MIGRATIONS.length; version += 1) {
    const migration = MIGRATIONS[version];
    if (migration === undefined) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
