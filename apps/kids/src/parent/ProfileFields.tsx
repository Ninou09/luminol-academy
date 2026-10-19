import {
  AGE_BAND_LABELS,
  avatarLabel,
  DIALECT_LABELS,
  NUMERAL_STYLE_LABELS,
  PARENT_COPY,
  skillTitle,
  THEME_LABELS,
} from '@luminol/kids-content';
import {
  AGE_BANDS,
  avatarPiece,
  AVATARS,
  DIALECTS,
  NICKNAME_MAX_LENGTH,
  NUMERAL_STYLES,
  type NumeralStyle,
  skillsForAge,
  type SkillId,
  THEMES,
  type AgeBand,
  type Avatar,
  type Dialect,
  type ThemeId,
} from '@luminol/kids-learning';
import {
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
  MultiChoice,
  SegmentedChoice,
  ShapeGlyph,
  touchTargets,
} from '@luminol/kids-ui';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

export type ProfileDraft = {
  nickname: string;
  avatar: Avatar;
  ageBand: AgeBand;
  dialect: Dialect;
  interests: ThemeId[];
  numeralStyle: NumeralStyle;
  disabledSkills: SkillId[];
  religiousPack: boolean;
};

/**
 * Switches activities of the chosen age band on or off, keeping choices made
 * for other age bands in case the age band changes back.
 */
function withEnabled(
  draft: ProfileDraft,
  band: readonly SkillId[],
  enabled: readonly SkillId[],
): SkillId[] {
  return [
    ...draft.disabledSkills.filter((skillId) => !band.includes(skillId)),
    ...band.filter((skillId) => !enabled.includes(skillId)),
  ];
}

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
  const band = skillsForAge(draft.ageBand);
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

      <SegmentedChoice
        label={copy.numeralStyle}
        options={NUMERAL_STYLES.map((value) => ({
          value,
          label: NUMERAL_STYLE_LABELS[value],
        }))}
        value={draft.numeralStyle}
        onChange={(numeralStyle) => onChange({ ...draft, numeralStyle })}
        testID="profile-numerals"
      />

      <MultiChoice
        label={copy.interests}
        options={THEMES.map((value) => ({ value, label: THEME_LABELS[value] }))}
        value={draft.interests}
        onChange={(interests) => onChange({ ...draft, interests })}
        minimum={1}
        note={copy.interestsNote}
        testID="profile-interests"
      />

      <SegmentedChoice
        label={copy.religiousPack}
        options={[
          { value: 'off', label: copy.religiousOff },
          { value: 'on', label: copy.religiousOn },
        ]}
        value={draft.religiousPack ? 'on' : 'off'}
        onChange={(value) =>
          onChange({ ...draft, religiousPack: value === 'on' })
        }
        note={copy.religiousNote}
        testID="profile-religious"
      />

      <MultiChoice
        label={copy.activities}
        options={band.map((value) => ({
          value,
          label: skillTitle(value).text,
        }))}
        value={band.filter(
          (skillId) => !draft.disabledSkills.includes(skillId),
        )}
        onChange={(enabled) =>
          onChange({
            ...draft,
            disabledSkills: withEnabled(draft, band, enabled),
          })
        }
        minimum={1}
        note={copy.activitiesNote}
        testID="profile-activities"
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
