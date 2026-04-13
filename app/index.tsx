import { useAuthStore } from '@/store/authStore';
import { Redirect } from 'expo-router';

/**
 * Entry point — redirects to the correct navigator based on auth + role.
 */
export default function Index() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/enter-phone" />;
  }

  if (user?.role === 'traveler') {
    return <Redirect href="/(tabs)/home" />;
  }

  // rider or both → rider tabs
  return <Redirect href="/(tabs)/trips" />;
}
