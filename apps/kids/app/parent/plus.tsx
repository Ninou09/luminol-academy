import { PARENT_COPY } from '@luminol/kids-content';
import { PLUS_FEATURES } from '@luminol/kids-learning';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
} from '@luminol/kids-ui';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { ParentScreen } from '../../src/components/ParentScreen';
import type { PlusOffer } from '../../src/purchases/purchases';
import { useAppState } from '../../src/state/AppState';

const copy = PARENT_COPY.plus;

const PERIOD_LABELS: Record<PlusOffer['period'], string> = {
  monthly: copy.monthly,
  annual: copy.annual,
  other: copy.other,
};

const PER_PERIOD: Record<PlusOffer['period'], string> = {
  monthly: copy.perMonth,
  annual: copy.perYear,
  other: '',
};

/**
 * What Plus adds, the store's prices, and buying, restoring or managing the
 * subscription. It sits behind the parental gate like the rest of the area.
 */
export default function PlusScreen() {
  const { services, plan, setPlan } = useAppState();
  const { purchases } = services;
  const [offers, setOffers] = useState<PlusOffer[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!purchases.available) return;
    let active = true;
    void purchases.offers().then((loaded) => {
      if (active) setOffers(loaded);
    });
    return () => {
      active = false;
    };
  }, [purchases]);

  async function buy(offer: PlusOffer) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await purchases.purchase(offer.id);
      setPlan(result.plan);
      if (result.outcome === 'pending') setNotice(copy.pending);
      if (result.outcome === 'failed') setNotice(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    setBusy(true);
    try {
      const restored = await purchases.restore();
      setPlan(restored);
      setNotice(restored === 'plus' ? copy.restored : copy.nothingToRestore);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ParentScreen title={copy.title}>
      <KidsText variant="parentBody">{copy.intro}</KidsText>
      <View style={styles.features}>
        {PLUS_FEATURES.map((feature) => (
          <KidsText key={feature} variant="parentBody">
            {`✓ ${copy.features[feature]}`}
          </KidsText>
        ))}
      </View>

      {plan === 'plus' && (
        <View style={styles.notice} testID="plus-active">
          <KidsText variant="parentBody">{copy.active}</KidsText>
        </View>
      )}

      {!purchases.available ? (
        <KidsText variant="parentBody" testID="plus-unavailable">
          {purchases.testing ? copy.testing : copy.unavailable}
        </KidsText>
      ) : (
        <>
          {plan !== 'plus' &&
            (offers === null ? (
              <KidsText variant="parentBody" tone="soft">
                {copy.loading}
              </KidsText>
            ) : offers.length === 0 ? (
              <KidsText variant="parentBody">{copy.noOffers}</KidsText>
            ) : (
              offers.map((offer) => (
                <View key={offer.id} style={styles.offer}>
                  <View style={styles.grow}>
                    <KidsText heading>{PERIOD_LABELS[offer.period]}</KidsText>
                    <KidsText variant="parentBody">
                      {`${offer.price} ${PER_PERIOD[offer.period]}`.trim()}
                    </KidsText>
                  </View>
                  <BigButton
                    label={copy.subscribe}
                    audience="parent"
                    disabled={busy}
                    accessibilityHint={`${PERIOD_LABELS[offer.period]} ${offer.price}`}
                    onPress={() => void buy(offer)}
                    testID={`plus-buy-${offer.id}`}
                  />
                </View>
              ))
            ))}
          <KidsText variant="parentBody" tone="soft">
            {copy.terms}
          </KidsText>
          <BigButton
            label={copy.restore}
            variant="secondary"
            audience="parent"
            disabled={busy}
            onPress={() => void restore()}
            testID="plus-restore"
          />
          <BigButton
            label={copy.manage}
            variant="secondary"
            audience="parent"
            onPress={() => void Linking.openURL(purchases.manageUrl)}
            testID="plus-manage"
          />
        </>
      )}
      {notice && (
        <KidsText variant="parentBody" testID="plus-notice">
          {notice}
        </KidsText>
      )}
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  features: {
    gap: kidsSpacing.xs,
  },
  notice: {
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.control,
    backgroundColor: kidsColors.accentSoft,
  },
  offer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: kidsSpacing.md,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderColor: kidsColors.line,
    backgroundColor: kidsColors.surface,
  },
  grow: {
    flex: 1,
    minWidth: 160,
  },
});
