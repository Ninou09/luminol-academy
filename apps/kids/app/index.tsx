import { PARENT_COPY, phrase } from '@luminol/kids-content';
import { avatarPiece } from '@luminol/kids-learning';
import {
  BigButton,
  ChoiceTile,
  kidsColors,
  kidsSpacing,
  KidsText,
  ShapeGlyph,
} from '@luminol/kids-ui';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpeakableText } from '../src/components/SpeakableText';
import { useAppState } from '../src/state/AppState';

/** Who is playing today? With no profiles yet, a parent starts the setup. */
export default function ChooserScreen() {
  const router = useRouter();
  const { profiles, selectChild, say, lockParent } = useAppState();

  // Every way out of the parent area lands here, so this is where it locks.
  useFocusEffect(useCallback(() => lockParent(), [lockParent]));

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={styles.bar}>
        <BigButton
          label={PARENT_COPY.home.open}
          variant="secondary"
          audience="parent"
          onPress={() => router.push('/gate')}
          testID="open-parent"
        />
      </View>
      {profiles.length === 0 ? (
        <View style={styles.center}>
          <KidsText variant="display" align="center" heading>
            {PARENT_COPY.welcome.title}
          </KidsText>
          <KidsText align="center" tone="soft">
            {PARENT_COPY.welcome.body}
          </KidsText>
          <BigButton
            label={PARENT_COPY.welcome.start}
            onPress={() => router.push('/gate')}
            testID="welcome-start"
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.center}>
          <SpeakableText
            utterance={phrase('chooser.title')}
            variant="display"
            heading
          />
          <View style={styles.grid}>
            {profiles.map((profile) => {
              const piece = avatarPiece(profile.avatar);
              return (
                <ChoiceTile
                  key={profile.id}
                  accessibilityLabel={profile.nickname}
                  onPress={() => {
                    selectChild(profile.id);
                    say({
                      key: `nickname.${profile.id}`,
                      text: profile.nickname,
                    });
                    router.push('/session');
                  }}
                  size={200}
                  testID={`child-${profile.id}`}
                >
                  <ShapeGlyph
                    shape={piece.shape}
                    color={piece.color}
                    size={110}
                    face
                  />
                  <KidsText variant="title" align="center">
                    {profile.nickname}
                  </KidsText>
                </ChoiceTile>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: kidsColors.canvas,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: kidsSpacing.md,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: kidsSpacing.xl,
    padding: kidsSpacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.xl,
  },
});
