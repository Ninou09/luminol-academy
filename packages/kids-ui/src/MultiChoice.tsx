import { Pressable, StyleSheet, View } from 'react-native';

import { KidsText } from './KidsText';
import type { SegmentedOption } from './SegmentedChoice';
import { kidsColors, kidsRadii, kidsSpacing, touchTargets } from './tokens';

export type MultiChoiceProps<Value extends string> = {
  label: string;
  options: readonly SegmentedOption<Value>[];
  value: readonly Value[];
  onChange: (value: Value[]) => void;
  /** At least this many options stay selected. */
  minimum?: number;
  note?: string;
  testID?: string;
};

/** A labelled group of checkboxes for the parent area, in option order. */
export function MultiChoice<Value extends string>({
  label,
  options,
  value,
  onChange,
  minimum = 0,
  note,
  testID,
}: MultiChoiceProps<Value>) {
  return (
    <View style={styles.group} testID={testID}>
      <KidsText variant="parentBody" heading>
        {label}
      </KidsText>
      <View accessibilityLabel={label} style={styles.options}>
        {options.map((option) => {
          const checked = value.includes(option.value);
          const locked = checked && value.length <= minimum;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="checkbox"
              accessibilityLabel={option.label}
              accessibilityState={{ checked, disabled: locked }}
              disabled={locked}
              onPress={() =>
                onChange(
                  options
                    .map((candidate) => candidate.value)
                    .filter((candidate) =>
                      candidate === option.value
                        ? !checked
                        : value.includes(candidate),
                    ),
                )
              }
              testID={testID ? `${testID}-${option.value}` : undefined}
              style={[
                styles.option,
                checked ? styles.checked : styles.unchecked,
              ]}
            >
              <KidsText variant="parentBody" align="center">
                {checked ? `✓ ${option.label}` : option.label}
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
  checked: {
    backgroundColor: kidsColors.accentSoft,
    borderColor: kidsColors.accent,
  },
  unchecked: {
    backgroundColor: kidsColors.surface,
    borderColor: kidsColors.line,
  },
});
