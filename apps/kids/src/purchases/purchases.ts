import type { Plan } from '@luminol/kids-learning';

export type OfferPeriod = 'monthly' | 'annual' | 'other';

/** A subscription option as the store prices it for this parent. */
export type PlusOffer = {
  id: string;
  period: OfferPeriod;
  /** Localised by the store, such as "3,99 €". */
  price: string;
};

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'pending' | 'failed';

/** The RevenueCat entitlement that unlocks Plus. */
export const PLUS_ENTITLEMENT = 'plus';

/**
 * Subscriptions. Every call is made from the parent area, behind the
 * parental gate; the child never sees a price or a purchase.
 */
export interface PurchasesService {
  /** False when this build has no store key; the app then stays on Free. */
  readonly available: boolean;
  /** True only in testing builds that open Plus without selling it. */
  readonly testing: boolean;
  currentPlan(): Promise<Plan>;
  offers(): Promise<PlusOffer[]>;
  purchase(offerId: string): Promise<{ outcome: PurchaseOutcome; plan: Plan }>;
  restore(): Promise<Plan>;
  /** Calls `listener` whenever the store reports a change of plan. */
  onPlanChange(listener: (plan: Plan) => void): () => void;
  /** Where the parent manages or cancels the subscription. */
  readonly manageUrl: string;
}

export const ANDROID_PACKAGE = 'com.luminolacademy.noor';
export const PLAY_SUBSCRIPTIONS_URL = `https://play.google.com/store/account/subscriptions?package=${ANDROID_PACKAGE}`;

/** Builds without a store key: Free only, and the parent area says why. */
export class UnavailablePurchases implements PurchasesService {
  readonly available = false;
  readonly testing: boolean = false;
  readonly manageUrl = PLAY_SUBSCRIPTIONS_URL;

  async currentPlan(): Promise<Plan> {
    return 'free';
  }

  async offers(): Promise<PlusOffer[]> {
    return [];
  }

  async purchase(): Promise<{ outcome: PurchaseOutcome; plan: Plan }> {
    return { outcome: 'failed', plan: 'free' };
  }

  async restore(): Promise<Plan> {
    return 'free';
  }

  onPlanChange(): () => void {
    return () => undefined;
  }
}

/**
 * For builds handed to testers before the store is set up: Plus is open and
 * nothing is sold. It is only used when a build has no store key, so a store
 * build can never be unlocked this way, and the parent area says it is on.
 */
export class TestingPurchases extends UnavailablePurchases {
  override readonly testing = true;

  override async currentPlan(): Promise<Plan> {
    return 'plus';
  }

  override async restore(): Promise<Plan> {
    return 'plus';
  }
}
