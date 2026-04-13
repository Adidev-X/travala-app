import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Tab icon helper ──────────────────────────────────────────────────────────
function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  return (
    <View style={styles.iconWrapper}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? colors.primary : colors.text.hint}
      />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

// ─── AppTabs ──────────────────────────────────────────────────────────────────
// Role-based tab management:
//   Rider    → Dashboard (trips tab) + Profile  |  home tab hidden
//   Traveler → Discover (home tab) + Bookings (trips tab) + Profile
export default function AppTabsLayout() {
  const role = useAuthStore(s => s.user?.role);
  const isRider = role === 'rider' || role === 'both';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.hint,
      }}>

      {/* ── "home" folder: Traveler Discover — hidden for riders ── */}
      <Tabs.Screen
        name="home"
        options={
          isRider
            ? { href: null }          // riders never land here; redirect sends to /trips
            : {
                title: 'Discover',
                tabBarIcon: ({ focused }) => (
                  <TabIcon name={focused ? 'compass' : 'compass-outline'} focused={focused} />
                ),
              }
        }
      />

      {/* ── "trips" folder:
            Rider    → Dashboard   (home icon)
            Traveler → Bookings    (ticket icon) ── */}
      <Tabs.Screen
        name="trips"
        options={{
          title: isRider ? 'Dashboard' : 'Bookings',
          tabBarIcon: ({ focused }) =>
            isRider ? (
              <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
            ) : (
              <TabIcon name={focused ? 'ticket' : 'ticket-outline'} focused={focused} />
            ),
        }}
      />

      {/* ── Profile (same for both roles) ── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'person-circle' : 'person-circle-outline'}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 3,
  },
});
