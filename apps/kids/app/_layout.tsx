import { PARENT_COPY } from '@luminol/kids-content';
import type { ChildProfile } from '@luminol/kids-learning';
import { kidsColors, kidsSpacing, KidsText } from '@luminol/kids-ui';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createServices } from '../src/services/createServices';
import type { KidsServices } from '../src/services/services';
import { AppStateProvider } from '../src/state/AppState';

// Arabic-first: native builds force RTL through the expo-localization plugin;
// this keeps the JS layout engine in agreement.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type Startup =
  | { status: 'loading' }
  | { status: 'ready'; services: KidsServices; profiles: ChildProfile[] }
  | { status: 'error' };

export default function RootLayout() {
  const [startup, setStartup] = useState<Startup>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    createServices()
      .then(async (services) => {
        const profiles = await services.repository.listProfiles();
        if (!cancelled) setStartup({ status: 'ready', services, profiles });
      })
      .catch((error: unknown) => {
        console.error('Startup failed', error);
        if (!cancelled) setStartup({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {startup.status === 'ready' ? (
        <AppStateProvider
          services={startup.services}
          initialProfiles={startup.profiles}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'none',
              contentStyle: { backgroundColor: kidsColors.canvas },
            }}
          />
        </AppStateProvider>
      ) : (
        <View style={styles.splash}>
          <KidsText variant="display" align="center">
            {PARENT_COPY.appName}
          </KidsText>
          {startup.status === 'error' && (
            <KidsText align="center" tone="soft">
              {PARENT_COPY.startup.error}
            </KidsText>
          )}
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: kidsSpacing.lg,
    padding: kidsSpacing.xl,
    backgroundColor: kidsColors.canvas,
  },
});
