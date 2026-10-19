import { PARENT_COPY } from '@luminol/kids-content';
import {
  childProfileInputSchema,
  createChildProfile,
} from '@luminol/kids-learning';
import { BigButton } from '@luminol/kids-ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { ParentScreen } from '../../src/components/ParentScreen';
import {
  ProfileFields,
  type ProfileDraft,
} from '../../src/parent/ProfileFields';
import { useAppState } from '../../src/state/AppState';

const EMPTY_DRAFT: ProfileDraft = {
  nickname: '',
  avatar: 'star-yellow',
  ageBand: '5-6',
  dialect: 'maghrebi',
  interests: ['shapes'],
  numeralStyle: 'western',
  disabledSkills: [],
};

export default function NewProfileScreen() {
  const router = useRouter();
  const { services, saveProfile } = useAppState();
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [nicknameError, setNicknameError] = useState(false);
  const [saving, setSaving] = useState(false);
  const copy = PARENT_COPY.profile;

  async function save() {
    const parsed = childProfileInputSchema.safeParse(draft);
    if (!parsed.success) {
      setNicknameError(true);
      return;
    }
    setSaving(true);
    try {
      await saveProfile(
        createChildProfile(parsed.data, services.newId(), services.now()),
      );
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ParentScreen title={copy.newTitle}>
      <ProfileFields
        draft={draft}
        onChange={(next) => {
          setDraft(next);
          setNicknameError(false);
        }}
        nicknameError={nicknameError}
      />
      <BigButton
        label={copy.save}
        audience="parent"
        disabled={saving}
        onPress={() => void save()}
        testID="profile-save"
      />
      <BigButton
        label={copy.cancel}
        variant="secondary"
        audience="parent"
        onPress={() => router.back()}
      />
    </ParentScreen>
  );
}
