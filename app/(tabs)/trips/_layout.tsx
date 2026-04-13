import colors from '@/constants/colors';
import { Stack } from 'expo-router';

// ─── RiderStack — nested inside Trips tab ────────────────────────────────────
export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.text.primary },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
      <Stack.Screen
        name="post-trip-type"
        options={{ title: 'Post a Trip', presentation: 'modal' }}
      />
      <Stack.Screen name="post-full-tour" options={{ title: 'Full Tour Trip' }} />
      <Stack.Screen name="post-one-way" options={{ title: 'One-Way Trip' }} />
      <Stack.Screen name="my-trips" options={{ title: 'My Trips' }} />
      <Stack.Screen name="join-requests" options={{ title: 'Join Requests' }} />
      <Stack.Screen
        name="verification"
        options={{ title: 'Document Verification' }}
      />
    </Stack>
  );
}
