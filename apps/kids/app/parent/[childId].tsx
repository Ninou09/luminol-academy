import { PARENT_COPY } from '@luminol/kids-content';
import {
  childProfileInputSchema,
  type SensorySettings,
} from '@luminol/kids-learning';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
} from '@luminol/kids-ui';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ParentScreen } from '../../src/components/ParentScreen';
import {
  ProfileFields,
  type ProfileDraft,
} from '../../src/parent/ProfileFields';
import { SensoryFields } from '../../src/parent/SensoryFields';
import { useAppState } from '../../src/state/AppState';

export default function EditProfileScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { profiles, saveProfile, deleteProfile } = useAppState();
  const profile = profiles.find((candidate) => candidate.id === childId);
  const [draft, setDraft] = useState<ProfileDraft | null>(() =>
    profile
      ? {
          nickname: profile.nickname,
          avatar: profile.avatar,
          ageBand: profile.ageBand,
          dialect: profile.dialect,
          interests: profile.interests,
        }
      : null,
  );
  const [sensory, setSensory] = useState<SensorySettings | null>(
    profile?.sensory ?? null,
  );
  const [nicknameError, setNicknameError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const copy = PARENT_COPY.profile;

  if (!profile || !draft || !sensory) return <Redirect href="/parent" />;

  async function save() {
    if (!profile || !sensory) return;
    const parsed = childProfileInputSchema.safeParse(draft);
    if (!parsed.success) {
      setNicknameError(true);
      return;
    }
    await saveProfile({ ...profile, ...parsed.data, sensory });
    setSaved(true);
  }

  return (
    <ParentScreen title={copy.editTitle}>
      <ProfileFields
        draft={draft}
        onChange={(next) => {
          setDraft(next);
          setNicknameError(false);
          setSaved(false);
        }}
        nicknameError={nicknameError}
      />
      <BigButton
        label={PARENT_COPY.board.open}
        variant="secondary"
        audience="parent"
        onPress={() =>
          router.push({
            pathname: '/parent/board/[childId]',
            params: { childId: profile.id },
          })
        }
        testID="profile-board"
      />
      <SensoryFields
        value={sensory}
        onChange={(next) => {
          setSensory(next);
          setSaved(false);
        }}
      />
      <BigButton
        label={copy.save}
        audience="parent"
        onPress={() => void save()}
        testID="profile-save"
      />
      {saved && (
        <KidsText variant="parentBody" tone="soft" testID="profile-saved">
          {copy.saved}
        </KidsText>
      )}

      {confirmingDelete ? (
        <View style={styles.confirm}>
          <KidsText variant="parentBody">{copy.deleteConfirm}</KidsText>
          <BigButton
            label={copy.deleteConfirmAction}
            variant="danger"
            audience="parent"
            onPress={() => {
              void deleteProfile(profile.id).then(() => router.back());
            }}
            testID="profile-delete-confirm"
          />
          <BigButton
            label={copy.cancel}
            variant="secondary"
            audience="parent"
            onPress={() => setConfirmingDelete(false)}
          />
        </View>
      ) : (
        <BigButton
          label={copy.delete}
          variant="secondary"
          audience="parent"
          onPress={() => setConfirmingDelete(true)}
          testID="profile-delete"
        />
      )}
      <BigButton
        label={PARENT_COPY.gate.cancel}
        variant="secondary"
        audience="parent"
        onPress={() => router.back()}
      />
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  confirm: {
    gap: kidsSpacing.md,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderColor: kidsColors.danger,
    backgroundColor: kidsColors.surface,
  },
});
