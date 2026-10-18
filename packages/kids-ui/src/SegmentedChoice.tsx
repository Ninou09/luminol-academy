import { Pressable, StyleSheet, View } from 'react-native';

import { KidsText } from './KidsText';
import { kidsColors, kidsRadii, kidsSpacing, touchTargets } from './tokens';

export type SegmentedOption<Value extends string | number> = {
  value: Value;
  label: string;
};

export type SegmentedChoiceProps<Value extends string | number> = {
  label: string;
  options: readonly SegmentedOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  note?: string;
  testID?: string;
};

/** A labelled radio group for the parent area. */
export function SegmentedChoice<Value extends string | number>({
  label,
  options,
  value,
  onChange,
  note,
  testID,
}: SegmentedChoiceProps<Value>) {
  return (
    <View style={styles.group} testID={testID}>
      <KidsText variant="parentBody" heading>
        {label}
      </KidsText>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={styles.options}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={String(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected, checked: selected }}
              onPress={() => onChange(option.value)}
              testID={testID ? `${testID}-${option.value}` : undefined}
              style={[
                styles.option,
                selected ? styles.selected : styles.unselected,
              ]}
            >
              <KidsText variant="parentBody" align="center">
                {option.label}
              </KidsText>
            </Pressable>
          );
        })}
      </View>
      {note && (
        <KidsText variant="parentBody" tone="soft">
          {note}
        </KidsText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: kidsSpacing.sm,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.sm,
  },
  option: {
    minHeight: touchTargets.parent,
    minWidth: touchTargets.parent * 2,
    paddingHorizontal: kidsSpacing.md,
    borderRadius: kidsRadii.control,
    justifyContent: 'center',
    borderWidth: 2,
  },
  selected: {
    backgroundColor: kidsColors.accentSoft,
    borderColor: kidsColors.accent,
  },
  unselected: {
    backgroundColor: kidsColors.surface,
    borderColor: kidsColors.line,
  },
});
