import colors from '@/constants/colors';
import { Stack } from 'expo-router';

// ─── AuthStack — Splash → EnterPhone → OTP → ProfileSetup ───────────────────
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.text.primary },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="splash"        options={{ headerShown: false }} />
      <Stack.Screen name="enter-phone"    options={{ headerShown: false }} />
      <Stack.Screen name="otp"            options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
    </Stack>
  );
}
