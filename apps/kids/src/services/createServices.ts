import { randomUUID } from 'expo-crypto';

import { DeviceCalmSound } from '../audio/calmSound';
import { RECORDED_AUDIO } from '../audio/recordedAudio';
import { DeviceSpeechService } from '../audio/speech';
import { openEncryptedDatabase } from '../data/openEncryptedDatabase';
import { SqlRepository } from '../data/repository';
import type { KidsServices } from './services';

export async function createServices(): Promise<KidsServices> {
  const db = await openEncryptedDatabase();
  return {
    repository: new SqlRepository(db),
    speech: new DeviceSpeechService(RECORDED_AUDIO),
    calmSound: new DeviceCalmSound(),
    newId: randomUUID,
    now: () => new Date(),
    seed: () => Date.now() >>> 0,
  };
}
