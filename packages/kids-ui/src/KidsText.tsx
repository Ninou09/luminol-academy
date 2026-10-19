import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { kidsColors, kidsType } from './tokens';

export type KidsTextVariant = keyof typeof kidsType;

export type KidsTextProps = {
  children: ReactNode;
  variant?: KidsTextVariant;
  tone?: 'ink' | 'soft' | 'onAccent';
  align?: 'start' | 'center';
  heading?: boolean;
  style?: StyleProp<TextStyle>;
  testID?: string;
};

const TONES = {
  ink: kidsColors.ink,
  soft: kidsColors.inkSoft,
  onAccent: kidsColors.accentInk,
} as const;

/** Arabic text with generous line height; alignment follows the RTL layout. */
export function KidsText({
  children,
  variant = 'body',
  tone = 'ink',
  align = 'start',
  heading = false,
  style,
  testID,
}: KidsTextProps) {
  return (
    <Text
      accessibilityRole={heading ? 'header' : 'text'}
      testID={testID}
      style={[
        styles.base,
        kidsType[variant],
        {
          color: TONES[tone],
          textAlign: align === 'center' ? 'center' : 'left',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    writingDirection: 'rtl',
  },
});
