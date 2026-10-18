import { PARENT_COPY } from '@luminol/kids-content';
import { avatarPiece } from '@luminol/kids-learning';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
  ShapeGlyph,
} from '@luminol/kids-ui';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ParentScreen } from '../../src/components/ParentScreen';
import { useAppState } from '../../src/state/AppState';

export default function ParentHomeScreen() {
  const router = useRouter();
  const { profiles, services } = useAppState();
  const [voiceMissing, setVoiceMissing] = useState(false);
  const copy = PARENT_COPY.home;

  useEffect(() => {
    let mounted = true;
    services.speech
      .hasArabicVoice()
      .then((available) => {
        if (mounted) setVoiceMissing(!available);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [services]);

  return (
    <ParentScreen title={copy.title}>
      <View style={styles.notice}>
        <KidsText variant="parentBody">{copy.privacy}</KidsText>
      </View>
      {voiceMissing && (
        <View style={styles.notice} testID="voice-missing">
          <KidsText variant="parentBody">{copy.noArabicVoice}</KidsText>
        </View>
      )}

      <KidsText variant="title" heading>
        {copy.profiles}
      </KidsText>
      {profiles.length === 0 && (
        <KidsText variant="parentBody" tone="soft">
          {copy.empty}
        </KidsText>
      )}
      {profiles.map((profile) => {
        const piece = avatarPiece(profile.avatar);
        return (
          <View key={profile.id} style={styles.row}>
            <ShapeGlyph shape={piece.shape} color={piece.color} size={48} />
            <View style={styles.name}>
              <KidsText>{profile.nickname}</KidsText>
            </View>
            <BigButton
              label={copy.edit}
              variant="secondary"
              audience="parent"
              accessibilityHint={profile.nickname}
              onPress={() =>
                router.push({
                  pathname: '/parent/[childId]',
                  params: { childId: profile.id },
                })
              }
              testID={`edit-${profile.id}`}
            />
          </View>
        );
      })}

      <BigButton
        label={copy.addChild}
        audience="parent"
        onPress={() => router.push('/parent/new')}
        testID="add-child"
      />
      <BigButton
        label={copy.exit}
        variant="secondary"
        audience="parent"
        onPress={() => router.dismissTo('/')}
        testID="parent-exit"
      />
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  notice: {
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.control,
    backgroundColor: kidsColors.accentSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: kidsSpacing.md,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  name: {
    flex: 1,
  },
});
