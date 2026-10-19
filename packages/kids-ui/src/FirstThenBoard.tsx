import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { KidsText } from './KidsText';
import { kidsColors, kidsRadii, kidsSpacing } from './tokens';

export type FirstThenItem = {
  label: string;
  picture: ReactNode;
};

export type FirstThenBoardProps = {
  firstLabel: string;
  thenLabel: string;
  first: FirstThenItem;
  then: FirstThenItem | null;
};

function Card({
  heading,
  item,
  current,
}: {
  heading: string;
  item: FirstThenItem;
  current: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${heading}: ${item.label}`}
      style={[styles.card, current ? styles.current : styles.upcoming]}
    >
      <KidsText variant="title" align="center" tone={current ? 'ink' : 'soft'}>
        {heading}
      </KidsText>
      <View style={styles.picture}>{item.picture}</View>
      <KidsText align="center">{item.label}</KidsText>
    </View>
  );
}

/** TEACCH-style "first → then" board. In RTL the first card sits on the right. */
export function FirstThenBoard({
  firstLabel,
  thenLabel,
  first,
  then,
}: FirstThenBoardProps) {
  return (
    <View style={styles.board}>
      <Card heading={firstLabel} item={first} current />
      {then && <Card heading={thenLabel} item={then} current={false} />}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    gap: kidsSpacing.lg,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  card: {
    flex: 1,
    maxWidth: 360,
    borderRadius: kidsRadii.card,
    padding: kidsSpacing.lg,
    alignItems: 'center',
    gap: kidsSpacing.md,
  },
  current: {
    backgroundColor: kidsColors.surface,
    borderWidth: 4,
    borderColor: kidsColors.accent,
  },
  upcoming: {
    backgroundColor: kidsColors.surfaceSoft,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  picture: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
