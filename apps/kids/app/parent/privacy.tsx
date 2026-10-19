import {
  formatDate,
  MEDIA_CREDITS,
  PARENT_COPY,
  PRIVACY_POLICY,
  PRIVACY_POLICY_UPDATED,
} from '@luminol/kids-content';
import { kidsSpacing, KidsText } from '@luminol/kids-ui';
import { StyleSheet, View } from 'react-native';

import { ParentScreen } from '../../src/components/ParentScreen';

/** The privacy policy, readable without a connection. */
export default function PrivacyScreen() {
  return (
    <ParentScreen title={PARENT_COPY.privacy.title}>
      <KidsText variant="parentBody" tone="soft">
        {formatDate(PRIVACY_POLICY_UPDATED)}
      </KidsText>
      {PRIVACY_POLICY.map((section) => (
        <View key={section.heading} style={styles.section}>
          <KidsText heading>{section.heading}</KidsText>
          <KidsText variant="parentBody">{section.body}</KidsText>
        </View>
      ))}
      <View style={styles.section} testID="media-credits">
        <KidsText heading>{MEDIA_CREDITS.heading}</KidsText>
        <KidsText variant="parentBody">{MEDIA_CREDITS.body}</KidsText>
        <KidsText variant="parentBody" tone="soft">
          {MEDIA_CREDITS.original}
        </KidsText>
      </View>
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: kidsSpacing.xs,
  },
});
