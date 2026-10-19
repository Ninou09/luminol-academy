import {
  ANIMATION_LEVEL_LABELS,
  minutesLabel,
  PARENT_COPY,
  REWARD_STYLE_LABELS,
  VOICE_SPEED_LABELS,
  volumeLabel,
} from '@luminol/kids-content';
import {
  ANIMATION_LEVELS,
  REWARD_STYLES,
  SESSION_MINUTES,
  VOICE_SPEEDS,
  VOLUME_STEPS,
  type SensorySettings,
} from '@luminol/kids-learning';
import { kidsSpacing, KidsText, SegmentedChoice } from '@luminol/kids-ui';
import { StyleSheet, View } from 'react-native';

export function SensoryFields({
  value,
  onChange,
}: {
  value: SensorySettings;
  onChange: (value: SensorySettings) => void;
}) {
  const copy = PARENT_COPY.sensory;
  return (
    <View style={styles.fields}>
      <KidsText variant="title" heading>
        {copy.title}
      </KidsText>
      <SegmentedChoice
        label={copy.volume}
        options={VOLUME_STEPS.map((step) => ({
          value: step,
          label: volumeLabel(step),
        }))}
        value={value.volume}
        onChange={(volume) => onChange({ ...value, volume })}
        testID="sensory-volume"
      />
      <SegmentedChoice
        label={copy.voiceSpeed}
        options={VOICE_SPEEDS.map((speed) => ({
          value: speed,
          label: VOICE_SPEED_LABELS[speed],
        }))}
        value={value.voiceSpeed}
        onChange={(voiceSpeed) => onChange({ ...value, voiceSpeed })}
        testID="sensory-voice"
      />
      <SegmentedChoice
        label={copy.animationLevel}
        options={ANIMATION_LEVELS.map((level) => ({
          value: level,
          label: ANIMATION_LEVEL_LABELS[level],
        }))}
        value={value.animationLevel}
        onChange={(animationLevel) => onChange({ ...value, animationLevel })}
        note={copy.animationNote}
        testID="sensory-animation"
      />
      <SegmentedChoice
        label={copy.rewardStyle}
        options={REWARD_STYLES.map((style) => ({
          value: style,
          label: REWARD_STYLE_LABELS[style],
        }))}
        value={value.rewardStyle}
        onChange={(rewardStyle) => onChange({ ...value, rewardStyle })}
        testID="sensory-reward"
      />
      <SegmentedChoice
        label={copy.sessionMinutes}
        options={SESSION_MINUTES.map((minutes) => ({
          value: minutes,
          label: minutesLabel(minutes),
        }))}
        value={value.sessionMinutes}
        onChange={(sessionMinutes) => onChange({ ...value, sessionMinutes })}
        note={copy.sessionNote}
        testID="sensory-session"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: kidsSpacing.lg,
  },
});
