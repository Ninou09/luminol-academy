import { kidsColors } from '@luminol/kids-ui';
import { Redirect, Stack } from 'expo-router';

import { useAppState } from '../../src/state/AppState';

/**
 * Every parent route requires a passed gate. Returning to the child chooser
 * (by any route, including the Android back button) or leaving the app locks
 * it again.
 */
export default function ParentLayout() {
  const { parentUnlocked } = useAppState();
  if (!parentUnlocked) return <Redirect href="/gate" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: kidsColors.canvas },
      }}
    />
  );
}
