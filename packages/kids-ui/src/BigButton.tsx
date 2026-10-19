import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { KidsText } from './KidsText';
import { kidsColors, kidsRadii, kidsSpacing, touchTargets } from './tokens';

export type BigButtonVariant = 'primary' | 'secondary' | 'danger';

export type BigButtonProps = {
  label: string;
  onPress: () => void;
  variant?: BigButtonVariant;
  /** Child buttons are larger than parent-area buttons. */
  audience?: 'child' | 'parent';
  icon?: ReactNode;
  accessibilityHint?: string;
  disabled?: boolean;
  testID?: string;
};

const PALETTE: Record<
  BigButtonVariant,
  { background: string; border: string; text: 'onAccent' | 'ink' }
> = {
  primary: {
    background: kidsColors.accent,
    border: kidsColors.accent,
    text: 'onAccent',
  },
  secondary: {
    background: kidsColors.surface,
    border: kidsColors.line,
    text: 'ink',
  },
  danger: {
    background: kidsColors.danger,
    border: kidsColors.danger,
    text: 'onAccent',
  },
};

export function BigButton({
  label,
  onPress,
  variant = 'primary',
  audience = 'child',
  icon,
  accessibilityHint,
  disabled = false,
  testID,
}: BigButtonProps) {
  const palette = PALETTE[variant];
  const minHeight =
    audience === 'child' ? touchTargets.child : touchTargets.parent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight,
          minWidth: minHeight,
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {icon}
        <KidsText
          variant={audience === 'child' ? 'body' : 'parentBody'}
          tone={palette.text}
          align="center"
        >
          {label}
        </KidsText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: kidsRadii.control,
    borderWidth: 2,
    paddingHorizontal: kidsSpacing.lg,
    paddingVertical: kidsSpacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: kidsSpacing.sm,
  },
});
