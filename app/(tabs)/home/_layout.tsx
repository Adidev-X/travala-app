import colors from '@/constants/colors';
import { Stack } from 'expo-router';

// ─── TravelerStack — nested inside Home tab ───────────────────────────────────
export default function HomeLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search-results" options={{ title: 'Search Results' }} />
      <Stack.Screen name="trip-detail" options={{ title: 'Trip Details' }} />
      <Stack.Screen
        name="rider-profile"
        options={{ title: 'Rider Profile' }}
      />
      <Stack.Screen
        name="contact-rider"
        options={{ title: 'Contact Rider', presentation: 'modal' }}
      />
    </Stack>
  );
}
