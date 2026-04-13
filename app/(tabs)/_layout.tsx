import CustomTabBar from '@/components/CustomTabBar';
import { useAuthStore } from '@/store/authStore';
import { Tabs } from 'expo-router';
import React from 'react';

// ─── AppTabsLayout ────────────────────────────────────────────────────────────
// All visual tab-bar rendering is delegated to CustomTabBar.
// Screen definitions are kept for expo-router's file-based routing.
//
// Role routing handled in CustomTabBar:
//   Rider    → 5-tab bar (Home | My Trips | POST | Requests | Profile)
//   Traveler → 3-tab bar (Discover | Saved | Profile)
export default function AppTabsLayout() {
  const role = useAuthStore(s => s.user?.role);
  const isRider = role === 'rider' || role === 'both';

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>

      {/* "home" folder – Traveler Discover; hidden from default tab bar for riders */}
      <Tabs.Screen
        name="home"
        options={{ href: isRider ? null : undefined }}
      />

      {/* "trips" folder – Rider Dashboard OR Traveler Bookings */}
      <Tabs.Screen name="trips" />

      {/* "profile" – same for both roles */}
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
