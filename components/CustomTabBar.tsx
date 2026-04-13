/**
 * components/CustomTabBar.tsx — RideShare custom bottom tab bar.
 *
 * Designed for use as the `tabBar` prop in expo-router's <Tabs>:
 *   <Tabs tabBar={props => <CustomTabBar {...props} />}>
 *
 * Features:
 * - Role-based layouts: 5 tabs for rider, 3 for traveler
 * - Floating POST button (center, rider only): scale spring 0.92→1.08→1.0
 * - Tab icon scale animation on press: 0.85→1.0 spring
 * - Active dot indicator (4px circle below icon)
 * - Badge on Requests tab from useUIStore
 * - Safe-area aware height
 */
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { postButtonPop, tabPop } from '@/utils/animations';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabDef {
  key: string;
  label: string;
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
  /** Tab route name (for state.routes matching & navigation.navigate) */
  routeName?: string;
  /** When set, use router.push() instead of navigation.navigate() */
  pushPath?: string;
  /** Substrings that mark this tab as active in the current pathname */
  matchPaths?: string[];
  /** Badge count from store */
  badge?: number;
  /** Center POST FAB */
  isPost?: true;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const buildRiderTabs = (pendingCount: number): TabDef[] => [
  {
    key:          'rider-home',
    label:        'Home',
    activeIcon:   'home',
    inactiveIcon: 'home-outline',
    routeName:    'trips',
    matchPaths:   ['/trips'],
  },
  {
    key:          'my-trips',
    label:        'My Trips',
    activeIcon:   'car',
    inactiveIcon: 'car-outline',
    pushPath:     '/(tabs)/trips/my-trips',
    matchPaths:   ['/trips/my-trips'],
  },
  {
    key:     'post',
    label:   'Post',
    activeIcon:   'add',
    inactiveIcon: 'add',
    isPost:  true,
    pushPath: '/(tabs)/trips/post-trip-type',
  },
  {
    key:          'requests',
    label:        'Requests',
    activeIcon:   'people',
    inactiveIcon: 'people-outline',
    pushPath:     '/(tabs)/trips/join-requests',
    matchPaths:   ['/trips/join-requests'],
    badge:        pendingCount,
  },
  {
    key:          'rider-profile',
    label:        'Profile',
    activeIcon:   'person-circle',
    inactiveIcon: 'person-circle-outline',
    routeName:    'profile',
    matchPaths:   ['/profile'],
  },
];

const TRAVELER_TABS: TabDef[] = [
  {
    key:          'traveler-home',
    label:        'Discover',
    activeIcon:   'compass',
    inactiveIcon: 'compass-outline',
    routeName:    'home',
    matchPaths:   ['/home'],
  },
  {
    key:          'saved',
    label:        'Saved',
    activeIcon:   'bookmark',
    inactiveIcon: 'bookmark-outline',
    pushPath:     '/(tabs)/home',
    matchPaths:   ['/saved'],
  },
  {
    key:          'traveler-profile',
    label:        'Profile',
    activeIcon:   'person-circle',
    inactiveIcon: 'person-circle-outline',
    routeName:    'profile',
    matchPaths:   ['/profile'],
  },
];

// ─── Badge pill ───────────────────────────────────────────────────────────────

const BadgePill = React.memo(function BadgePill({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : String(count)}</Text>
    </View>
  );
});

// ─── Regular tab item ─────────────────────────────────────────────────────────

interface TabItemProps {
  tab: TabDef;
  isActive: boolean;
  onPress: () => void;
  scaleAnim: Animated.Value;
}

const TabItem = React.memo(function TabItem({ tab, isActive, onPress, scaleAnim }: TabItemProps) {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View
        style={[styles.tabItem, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={isActive ? tab.activeIcon : tab.inactiveIcon}
            size={22}
            color={isActive ? COLORS.primary : COLORS.slate400}
          />
          {tab.badge !== undefined && <BadgePill count={tab.badge} />}
        </View>
        {isActive && <View style={styles.activeDot} />}
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

// ─── POST FAB ────────────────────────────────────────────────────────────────

interface PostFABProps {
  onPress: () => void;
  scaleAnim: Animated.Value;
}

const PostFAB = React.memo(function PostFAB({ onPress, scaleAnim }: PostFABProps) {
  return (
    <TouchableOpacity
      style={styles.postSlot}
      onPress={onPress}
      activeOpacity={1}>
      <Animated.View
        style={[styles.postCircle, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </Animated.View>
      <Text style={[styles.tabLabel, styles.tabLabelInactive]}>Post</Text>
    </TouchableOpacity>
  );
});

// ─── CustomTabBar ─────────────────────────────────────────────────────────────

const CustomTabBar = React.memo(function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets      = useSafeAreaInsets();
  const router      = useRouter();
  const pathname    = usePathname();
  const role        = useAuthStore(s => s.user?.role);
  const pendingCount = useUIStore(s => s.pendingRequestCount);

  const isRider = role === 'rider' || role === 'both';
  const tabs = isRider ? buildRiderTabs(pendingCount) : TRAVELER_TABS;

  // ── Per-tab scale animations (max 5 tabs) ──────────────────────────────
  const scaleAnims = useRef<Animated.Value[]>(
    Array.from({ length: 5 }, () => new Animated.Value(1)),
  ).current;

  // POST button scale
  const postScaleAnim = useRef(new Animated.Value(1)).current;

  // ── Active state ───────────────────────────────────────────────────────
  const isTabActive = useCallback((tab: TabDef): boolean => {
    // For tabs with no matchPaths, fall back to route name matching
    if (!tab.matchPaths?.length && tab.routeName) {
      const activeRoute = state.routes[state.index];
      return activeRoute?.name === tab.routeName;
    }
    // Check if current pathname contains any of the matchPaths
    if (tab.matchPaths) {
      return tab.matchPaths.some(p => pathname.includes(p));
    }
    return false;
  }, [pathname, state]);

  // ── Tab press handler ──────────────────────────────────────────────────
  const handleTabPress = useCallback((tab: TabDef, animIdx: number) => {
    // Animate icon
    const animCtrl = tabPop(scaleAnims[animIdx]);
    animCtrl.start();

    if (tab.isPost) {
      // POST FAB: use postButtonPop on postScaleAnim
      const postCtrl = postButtonPop(postScaleAnim);
      postCtrl.start(() => {
        router.push(tab.pushPath as never);
      });
      return;
    }

    if (tab.pushPath) {
      router.push(tab.pushPath as never);
    } else if (tab.routeName) {
      const targetRoute = state.routes.find(r => r.name === tab.routeName);
      if (targetRoute) {
        navigation.navigate(tab.routeName as never);
      }
    }
  }, [scaleAnims, postScaleAnim, router, navigation, state.routes]);

  const barHeight = 64 + insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          height: barHeight,
          paddingBottom: insets.bottom,
        },
      ]}>
      {tabs.map((tab, idx) => {
        if (tab.isPost) {
          return (
            <PostFAB
              key={tab.key}
              scaleAnim={postScaleAnim}
              onPress={() => handleTabPress(tab, idx)}
            />
          );
        }
        return (
          <TabItem
            key={tab.key}
            tab={tab}
            isActive={isTabActive(tab)}
            scaleAnim={scaleAnims[idx]}
            onPress={() => handleTabPress(tab, idx)}
          />
        );
      })}
    </View>
  );
});

export default CustomTabBar;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    paddingTop: 8,
    // Upward shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
    // Clip the top border radius
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },

  // Regular tab item
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.slate400,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  tabLabelInactive: {
    color: COLORS.slate400,
  },

  // Badge
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
  },

  // POST FAB slot
  postSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  postCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22, // Float above tab bar
    ...SHADOWS.md,
  },
});
