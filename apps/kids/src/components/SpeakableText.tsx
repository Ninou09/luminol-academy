import type { Utterance } from '@luminol/kids-content';
import { KidsText, type KidsTextVariant } from '@luminol/kids-ui';
import { Pressable } from 'react-native';

import { useAppState } from '../state/AppState';

/** Child-facing text: tapping it reads it aloud, because many children can't read yet. */
export function SpeakableText({
  utterance,
  variant = 'body',
  heading = false,
  testID,
}: {
  utterance: Utterance;
  variant?: KidsTextVariant;
  heading?: boolean;
  testID?: string;
}) {
  const { say } = useAppState();
  return (
    <Pressable
      accessibilityRole={heading ? 'header' : 'button'}
      accessibilityLabel={utterance.text}
      accessibilityHint="اضغط للاستماع"
      onPress={() => say(utterance)}
      hitSlop={12}
      testID={testID}
    >
      <KidsText variant={variant} align="center">
        {utterance.text}
      </KidsText>
    </Pressable>
  );
}
