import type { Plan } from '@luminol/kids-learning';
import Purchases, {
  LOG_LEVEL,
  PACKAGE_TYPE,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';

import {
  PLAY_SUBSCRIPTIONS_URL,
  PLUS_ENTITLEMENT,
  type OfferPeriod,
  type PlusOffer,
  type PurchaseOutcome,
  type PurchasesService,
} from './purchases';

function planOf(info: CustomerInfo): Plan {
  return info.entitlements.active[PLUS_ENTITLEMENT] ? 'plus' : 'free';
}

function periodOf(type: PACKAGE_TYPE): OfferPeriod {
  if (type === PACKAGE_TYPE.MONTHLY) return 'monthly';
  if (type === PACKAGE_TYPE.ANNUAL) return 'annual';
  if (type === PACKAGE_TYPE.LIFETIME) return 'lifetime';
  return 'other';
}

function errorCode(error: unknown): unknown {
  return error && typeof error === 'object' && 'code' in error
    ? error.code
    : null;
}

/**
 * Plus through RevenueCat and Google Play Billing. The app user is anonymous:
 * RevenueCat makes up its own id, and the app never sends a name, an email,
 * child data or a device advertising id.
 */
export class RevenueCatPurchases implements PurchasesService {
  readonly available = true;
  readonly testing = false;
  readonly manageUrl = PLAY_SUBSCRIPTIONS_URL;
  private packages = new Map<string, PurchasesPackage>();

  constructor(apiKey: string) {
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });
  }

  async currentPlan(): Promise<Plan> {
    try {
      return planOf(await Purchases.getCustomerInfo());
    } catch (error: unknown) {
      console.warn('Could not read the subscription', error);
      return 'free';
    }
  }

  async offers(): Promise<PlusOffer[]> {
    try {
      const offerings = await Purchases.getOfferings();
      const available = offerings.current?.availablePackages ?? [];
      this.packages = new Map(available.map((item) => [item.identifier, item]));
      return available.map((item) => ({
        id: item.identifier,
        period: periodOf(item.packageType),
        price: item.product.priceString,
      }));
    } catch (error: unknown) {
      console.warn('Could not load subscription offers', error);
      return [];
    }
  }

  async purchase(
    offerId: string,
  ): Promise<{ outcome: PurchaseOutcome; plan: Plan }> {
    const item = this.packages.get(offerId);
    if (!item) return { outcome: 'failed', plan: await this.currentPlan() };
    try {
      const { customerInfo } = await Purchases.purchasePackage(item);
      const plan = planOf(customerInfo);
      return { outcome: plan === 'plus' ? 'purchased' : 'pending', plan };
    } catch (error: unknown) {
      const code = errorCode(error);
      const outcome: PurchaseOutcome =
        code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
          ? 'cancelled'
          : code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR
            ? 'pending'
            : 'failed';
      return { outcome, plan: await this.currentPlan() };
    }
  }

  async restore(): Promise<Plan> {
    try {
      return planOf(await Purchases.restorePurchases());
    } catch (error: unknown) {
      console.warn('Could not restore purchases', error);
      return 'free';
    }
  }

  onPlanChange(listener: (plan: Plan) => void): () => void {
    const handler = (info: CustomerInfo) => listener(planOf(info));
    Purchases.addCustomerInfoUpdateListener(handler);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(handler);
    };
  }
}
