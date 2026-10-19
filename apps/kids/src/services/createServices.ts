import { randomUUID } from 'expo-crypto';

import { DeviceCalmSound } from '../audio/calmSound';
import { RECORDED_AUDIO } from '../audio/recordedAudio';
import { DeviceSpeechService } from '../audio/speech';
import { openEncryptedDatabase } from '../data/openEncryptedDatabase';
import { SqlRepository } from '../data/repository';
import { DeviceMediaService } from '../media/deviceMedia';
import { DeviceShareService } from '../reports/deviceShare';
import type { KidsServices } from './services';

export async function createServices(): Promise<KidsServices> {
  const db = await openEncryptedDatabase();
  return {
    repository: new SqlRepository(db),
    speech: new DeviceSpeechService(RECORDED_AUDIO),
    calmSound: new DeviceCalmSound(),
    media: new DeviceMediaService(randomUUID),
    share: new DeviceShareService(),
    newId: randomUUID,
    now: () => new Date(),
    seed: () => Date.now() >>> 0,
  };
}
