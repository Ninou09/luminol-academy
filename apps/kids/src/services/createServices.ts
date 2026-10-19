import { randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';
import { z } from 'zod';

import { DeviceCalmSound } from '../audio/calmSound';
import { RECORDED_AUDIO } from '../audio/recordedAudio';
import { DeviceSpeechService } from '../audio/speech';
import { openEncryptedDatabase } from '../data/openEncryptedDatabase';
import { SqlRepository } from '../data/repository';
import { DeviceMediaService } from '../media/deviceMedia';
import {
  UnavailablePurchases,
  type PurchasesService,
} from '../purchases/purchases';
import { RevenueCatPurchases } from '../purchases/revenueCat';
import { DeviceShareService } from '../reports/deviceShare';
import type { KidsServices } from './services';

/** RevenueCat's public Google Play SDK key; it identifies the app, not a secret. */
const revenueCatKeySchema = z.string().regex(/^goog_[A-Za-z0-9]+$/);

/**
 * The key is set per build (EXPO_PUBLIC_REVENUECAT_ANDROID_KEY in the EAS
 * environment). Without a valid key the app runs on Free and says so.
 */
function createPurchases(): PurchasesService {
  const key = revenueCatKeySchema.safeParse(
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  );
  return Platform.OS === 'android' && key.success
    ? new RevenueCatPurchases(key.data)
    : new UnavailablePurchases();
}

export async function createServices(): Promise<KidsServices> {
  const db = await openEncryptedDatabase();
  return {
    repository: new SqlRepository(db),
    speech: new DeviceSpeechService(RECORDED_AUDIO),
    calmSound: new DeviceCalmSound(),
    media: new DeviceMediaService(randomUUID),
    share: new DeviceShareService(),
    purchases: createPurchases(),
    newId: randomUUID,
    now: () => new Date(),
    seed: () => Date.now() >>> 0,
  };
}
