import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../../features/home/screens/HomeScreen';
import DiscoverScreen from '../../features/discover/screens/DiscoverScreen';
import PostScreen from '../../features/post/screens/PostScreen';
import TripsScreen from '../../features/trips/screens/TripsScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import { Colors } from '../../constants/colors';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', emoji: '🏠' },
  { name: 'Discover', emoji: '🧭' },
  { name: 'Post', emoji: '➕', isFab: true },
  { name: 'Trips', emoji: '🗺️' },
  { name: 'Profile', emoji: '👤' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function TabItem({ route, isFocused, navigation }: { route: any; isFocused: boolean; navigation: any }) {
  const tab = TABS.find(t => t.name === route.name);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPress = () => {
    scale.value = withSpring(0.9, {}, () => { scale.value = withSpring(1); });
    if (!isFocused) {
      navigation.navigate(route.name);
    }
  };

  if (tab?.isFab) {
    return (
      <View style={tabStyles.fabWrapper}>
        <Animated.View style={animStyle}>
          <TouchableOpacity onPress={onPress} style={tabStyles.fab} activeOpacity={0.85}>
            <Text style={tabStyles.fabIcon}>➕</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View style={[tabStyles.tabItem, animStyle]}>
      <TouchableOpacity onPress={onPress} style={tabStyles.tabButton} activeOpacity={0.7}>
        <Text style={[tabStyles.tabIcon, isFocused && tabStyles.tabIconActive]}>
          {tab?.emoji}
        </Text>
        {isFocused && <View style={tabStyles.activeDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.nav}>
        <View style={tabStyles.glassSheen} />
        {state.routes.map((route, index) => (
          <TabItem
            key={route.key}
            route={route}
            isFocused={state.index === index}
            navigation={navigation}
          />
        ))}
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
    pointerEvents: 'box-none',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 50,
    paddingHorizontal: 12,
    width: Math.min(340, SCREEN_WIDTH - 80),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  glassSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabButton: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 22, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  fabWrapper: { alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { fontSize: 20, color: '#fff' },
});

export function MainTabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: 'TripShare',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: 'rgba(255,248,247,0.95)' },
        headerTitleStyle: { fontWeight: '900', fontSize: 20, color: '#e31e25', letterSpacing: -0.5 },
        headerLeft: () => (
          <TouchableOpacity style={{ marginLeft: 16 }}>
            <Text style={{ fontSize: 22 }}>⛰️</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
