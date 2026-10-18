import {
  AGE_BAND_LABELS,
  avatarLabel,
  DIALECT_LABELS,
  PARENT_COPY,
} from '@luminol/kids-content';
import {
  AGE_BANDS,
  avatarPiece,
  AVATARS,
  DIALECTS,
  NICKNAME_MAX_LENGTH,
  type ChildProfileInput,
} from '@luminol/kids-learning';
import {
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
  SegmentedChoice,
  ShapeGlyph,
  touchTargets,
} from '@luminol/kids-ui';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

export type ProfileDraft = {
  nickname: string;
  avatar: ChildProfileInput['avatar'];
  ageBand: ChildProfileInput['ageBand'];
  dialect: ChildProfileInput['dialect'];
};

export function ProfileFields({
  draft,
  onChange,
  nicknameError,
}: {
  draft: ProfileDraft;
  onChange: (draft: ProfileDraft) => void;
  nicknameError: boolean;
}) {
  const copy = PARENT_COPY.profile;
  return (
    <View style={styles.fields}>
      <View style={styles.group}>
        <KidsText variant="parentBody" heading>
          {copy.nickname}
        </KidsText>
        <TextInput
          value={draft.nickname}
          onChangeText={(nickname) => onChange({ ...draft, nickname })}
          maxLength={NICKNAME_MAX_LENGTH}
          accessibilityLabel={copy.nickname}
          accessibilityHint={copy.nicknameHint}
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          style={[styles.input, nicknameError && styles.inputError]}
          testID="profile-nickname"
        />
        <KidsText variant="parentBody" tone="soft">
          {nicknameError ? copy.nicknameError : copy.nicknameHint}
        </KidsText>
      </View>

      <View style={styles.group}>
        <KidsText variant="parentBody" heading>
          {copy.avatar}
        </KidsText>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={copy.avatar}
          style={styles.avatars}
        >
          {AVATARS.map((avatar) => {
            const piece = avatarPiece(avatar);
            const selected = draft.avatar === avatar;
            return (
              <Pressable
                key={avatar}
                accessibilityRole="radio"
                accessibilityLabel={avatarLabel(avatar).text}
                accessibilityState={{ selected, checked: selected }}
                onPress={() => onChange({ ...draft, avatar })}
                style={[styles.avatar, selected && styles.avatarSelected]}
                testID={`profile-avatar-${avatar}`}
              >
                <ShapeGlyph shape={piece.shape} color={piece.color} size={52} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <SegmentedChoice
        label={copy.ageBand}
        options={AGE_BANDS.map((value) => ({
          value,
          label: AGE_BAND_LABELS[value],
        }))}
        value={draft.ageBand}
        onChange={(ageBand) => onChange({ ...draft, ageBand })}
        testID="profile-age"
      />

      <SegmentedChoice
        label={copy.dialect}
        options={DIALECTS.map((value) => ({
          value,
          label: DIALECT_LABELS[value],
        }))}
        value={draft.dialect}
        onChange={(dialect) => onChange({ ...draft, dialect })}
        note={copy.dialectNote}
        testID="profile-dialect"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: kidsSpacing.lg,
  },
  group: {
    gap: kidsSpacing.sm,
  },
  input: {
    minHeight: touchTargets.parent,
    borderWidth: 2,
    borderColor: kidsColors.line,
    borderRadius: kidsRadii.control,
    backgroundColor: kidsColors.surface,
    paddingHorizontal: kidsSpacing.md,
    fontSize: 18,
    color: kidsColors.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputError: {
    borderColor: kidsColors.danger,
  },
  avatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.sm,
  },
  avatar: {
    width: touchTargets.child,
    height: touchTargets.child,
    borderRadius: kidsRadii.control,
    borderWidth: 2,
    borderColor: kidsColors.line,
    backgroundColor: kidsColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    borderWidth: 4,
    borderColor: kidsColors.accent,
    backgroundColor: kidsColors.accentSoft,
  },
});
