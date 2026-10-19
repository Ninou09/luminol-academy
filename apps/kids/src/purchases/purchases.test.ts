import { createPurchases } from '../services/createServices';
import { TestingPurchases, UnavailablePurchases } from './purchases';

// jest.mock calls are hoisted above the imports, so no native module loads.

jest.mock('./revenueCat', () => ({
  RevenueCatPurchases: class {
    readonly available = true;
    readonly testing = false;
  },
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'id' }));
jest.mock('../data/openEncryptedDatabase', () => ({}));
jest.mock('../audio/speech', () => ({}));
jest.mock('../audio/calmSound', () => ({}));
jest.mock('../media/deviceMedia', () => ({}));
jest.mock('../reports/deviceShare', () => ({}));

const KEY = 'goog_AbCdEf123';

describe('choosing the purchases service', () => {
  it('uses RevenueCat when an Android build has a valid key', () => {
    const service = createPurchases(
      {
        EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: KEY,
        EXPO_PUBLIC_UNLOCK_PLUS_FOR_TESTING: 'true',
      },
      'android',
    );
    expect(service.available).toBe(true);
    expect(service.testing).toBe(false);
  });

  it('stays on Free without a key, or with a malformed one', async () => {
    for (const key of [undefined, 'sk_secret', '']) {
      const service = createPurchases(
        { EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: key },
        'android',
      );
      expect(service).toBeInstanceOf(UnavailablePurchases);
      expect(await service.currentPlan()).toBe('free');
    }
  });

  it('opens Plus for testers only in builds without a key', async () => {
    const service = createPurchases(
      { EXPO_PUBLIC_UNLOCK_PLUS_FOR_TESTING: 'true' },
      'android',
    );
    expect(service).toBeInstanceOf(TestingPurchases);
    expect(service.testing).toBe(true);
    expect(await service.currentPlan()).toBe('plus');
    expect(service.available).toBe(false);
  });
});
