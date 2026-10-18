import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { openDatabaseAsync } from 'expo-sqlite';

import { configureConnection, migrate, type SqlDatabase } from './database';

const DATABASE_NAME = 'noor.db';
const KEY_NAME = 'noor.database-key.v1';
const KEY_PATTERN = /^[0-9a-f]{64}$/;

export class EncryptionUnavailableError extends Error {
  constructor() {
    super(
      'SQLCipher is not available in this build; refusing to store child data unencrypted.',
    );
    this.name = 'EncryptionUnavailableError';
  }
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

/** A random 256-bit key that never leaves this device's secure storage. */
async function loadOrCreateKey(): Promise<string> {
  const options = {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  const existing = await SecureStore.getItemAsync(KEY_NAME, options);
  if (existing !== null && KEY_PATTERN.test(existing)) return existing;
  const key = toHex(getRandomBytes(32));
  await SecureStore.setItemAsync(KEY_NAME, key, options);
  return key;
}

/**
 * Opens the on-device database with SQLCipher. Release builds refuse to run
 * unencrypted; Expo Go (development only) has no SQLCipher and logs a warning.
 */
export async function openEncryptedDatabase(): Promise<SqlDatabase> {
  const key = await loadOrCreateKey();
  const db = await openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(`PRAGMA key = "x'${key}'";`);
  const cipher = await db.getFirstAsync<{ cipher_version: string }>(
    'PRAGMA cipher_version',
  );
  if (!cipher?.cipher_version) {
    if (!__DEV__) {
      await db.closeAsync();
      throw new EncryptionUnavailableError();
    }
    console.warn(
      'Development build without SQLCipher: child data is not encrypted.',
    );
  }
  await configureConnection(db);
  await migrate(db);
  return db;
}
