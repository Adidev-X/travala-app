import { useAuthStore } from '@/store/authStore';
import { Stack, useRootNavigation, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Reactively redirect whenever isAuthenticated or user.role changes.
// useRootNavigation + the "state" listener is the pattern recommended by the
// expo-router docs to guarantee the navigator is fully mounted before we call
// router.replace.  useRootNavigationState().key is NOT sufficient — it becomes
// truthy before the Stack has processed its first route.
function useAuthGuard() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const rootNavigation = useRootNavigation();

  const [isNavReady, setIsNavReady] = useState(false);

  useEffect(() => {
    if (!rootNavigation) return;
    // The "state" event fires once the navigator has mounted and processed
    // its first route — safe to call router.replace after this point.
    const unsub = rootNavigation.addListener('state', () => setIsNavReady(true));
    return unsub;
  }, [rootNavigation]);

  useEffect(() => {
    if (!isNavReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not signed in — send to login
      router.replace('/(auth)/enter-phone');
    } else if (isAuthenticated && inAuthGroup) {
      // Signed in but still in auth flow — redirect to app
      if (user?.role === 'traveler') {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(tabs)/trips');
      }
    }
  }, [isNavReady, isAuthenticated, segments, user, router]);
}

// ─── RideShare root layout ────────────────────────────────────────────────────
export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  useAuthGuard();

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1F4E79' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
        }}>
        {/* Entry — redirects based on auth */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* Auth flow */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Main app */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Shared stack screens */}
        <Stack.Screen
          name="notifications"
          options={{ title: 'Notifications', presentation: 'modal' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Settings', presentation: 'modal' }}
        />
        <Stack.Screen
          name="safety"
          options={{ title: 'Safety', presentation: 'modal' }}
        />
        <Stack.Screen
          name="help"
          options={{ title: 'Help & Support', presentation: 'modal' }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
