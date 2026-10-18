import { phrase } from '@luminol/kids-content';
import {
  BigButton,
  kidsColors,
  kidsSpacing,
  ShapeGlyph,
} from '@luminol/kids-ui';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState } from '../state/AppState';

/**
 * Every child screen shares this frame so the schedule and calm buttons are
 * always in the same place. In RTL the schedule button sits on the right.
 */
export function ChildScreen({
  current,
  children,
}: {
  current: 'session' | 'activity' | 'calm';
  children: ReactNode;
}) {
  const router = useRouter();
  const { say } = useAppState();
  const schedule = phrase('nav.schedule');
  const calm = phrase('nav.calm');

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={styles.bar}>
        <BigButton
          label={schedule.text}
          variant="secondary"
          disabled={current === 'session'}
          icon={<ShapeGlyph shape="square" color="yellow" size={32} />}
          onPress={() => {
            say(schedule);
            router.dismissTo('/session');
          }}
          testID="nav-schedule"
        />
        <BigButton
          label={calm.text}
          variant="secondary"
          disabled={current === 'calm'}
          icon={<ShapeGlyph shape="circle" color="blue" size={32} />}
          onPress={() => {
            say(calm);
            router.push('/calm');
          }}
          testID="nav-calm"
        />
      </View>
      <View style={styles.content}>{children}</View>
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
    justifyContent: 'space-between',
    paddingHorizontal: kidsSpacing.lg,
    paddingTop: kidsSpacing.md,
  },
  content: {
    flex: 1,
    padding: kidsSpacing.lg,
  },
});
