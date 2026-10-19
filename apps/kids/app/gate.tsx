import { PARENT_COPY } from '@luminol/kids-content';
import { createRandom } from '@luminol/kids-learning';
import { BigButton, kidsSpacing, KidsText } from '@luminol/kids-ui';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ParentScreen } from '../src/components/ParentScreen';
import { createGateQuestion } from '../src/parent/gate';
import { useAppState } from '../src/state/AppState';

/** Parental gate in front of every parent route and external action. */
export default function GateScreen() {
  const router = useRouter();
  const { services, unlockParent } = useAppState();
  const random = useRef(createRandom(services.seed())).current;
  const [question, setQuestion] = useState(() => createGateQuestion(random));
  const [retry, setRetry] = useState(false);
  const copy = PARENT_COPY.gate;

  return (
    <ParentScreen title={copy.title}>
      <KidsText variant="parentBody">{copy.instruction}</KidsText>
      <KidsText variant="title" testID="gate-prompt">
        {question.prompt}
      </KidsText>
      <View style={styles.options}>
        {question.options.map((option) => (
          <BigButton
            key={option}
            label={String(option)}
            variant="secondary"
            audience="parent"
            onPress={() => {
              if (option === question.answer) {
                unlockParent();
                router.replace('/parent');
                return;
              }
              setRetry(true);
              setQuestion(createGateQuestion(random));
            }}
            testID={
              option === question.answer
                ? 'gate-answer'
                : `gate-option-${option}`
            }
          />
        ))}
      </View>
      {retry && (
        <KidsText variant="parentBody" tone="soft" testID="gate-retry">
          {copy.retry}
        </KidsText>
      )}
      <BigButton
        label={copy.cancel}
        variant="secondary"
        audience="parent"
        onPress={() => router.back()}
      />
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.md,
  },
});
