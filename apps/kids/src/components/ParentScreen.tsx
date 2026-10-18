import { kidsColors, kidsSpacing, KidsText } from '@luminol/kids-ui';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ParentScreen({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <KidsText variant="title" heading>
          {title}
        </KidsText>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: kidsColors.canvas,
  },
  content: {
    padding: kidsSpacing.lg,
    gap: kidsSpacing.lg,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
});
