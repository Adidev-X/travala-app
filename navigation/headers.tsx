/**
 * navigation/headers.ts — RideShare shared screen option presets.
 *
 * Usage:
 *   import { defaultScreenOptions, modalScreenOptions } from '@/navigation/headers';
 *
 *   <Stack screenOptions={defaultScreenOptions}>
 *     <Stack.Screen name="my-screen" options={{ title: 'My Screen' }} />
 *   </Stack>
 */
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// ─── Custom back button ────────────────────────────────────────────────────────

interface HeaderBackProps {
  canGoBack: boolean;
  tintColor?: string;
  onPress?: () => void;
}

/**
 * 36px white circle back button with chevron icon and subtle shadow.
 * Used as headerLeft in stack screen options.
 */
export function HeaderBackButton({ canGoBack, onPress }: HeaderBackProps): React.ReactElement | null {
  if (!canGoBack) return null;
  return (
    <TouchableOpacity
      style={backStyles.btn}
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name="chevron-back" size={20} color={COLORS.slate700} />
    </TouchableOpacity>
  );
}

const backStyles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    ...SHADOWS.xs,
  },
});

// ─── Default stack screen options ──────────────────────────────────────────────

export const defaultScreenOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: COLORS.white,
  },
  headerTitleStyle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: {
    backgroundColor: COLORS.background,
  },
};

// ─── Header with custom back button ────────────────────────────────────────────
// Use this in <Stack.Screen options={screenOptionsWithBack(navigation)}> 
// Since NativeStack doesn't support React components in headerLeft via static options,
// use this in a screen component directly:
//
//   navigation.setOptions({ headerLeft: () => <HeaderBackButton canGoBack onPress={() => router.back()} /> })

// ─── Modal screen options ──────────────────────────────────────────────────────
// For bottom-sheet style modal presentation

export const modalScreenOptions: NativeStackNavigationOptions = {
  presentation: 'modal',
  headerShown: false,
  gestureEnabled: true,
  contentStyle: {
    backgroundColor: COLORS.background,
  },
};

// ─── Full-screen modal (card) ──────────────────────────────────────────────────

export const cardModalOptions: NativeStackNavigationOptions = {
  presentation: 'card',
  headerShown: false,
  gestureEnabled: true,
  contentStyle: {
    backgroundColor: COLORS.background,
  },
};

// ─── Transparent modal (for overlays) ─────────────────────────────────────────

export const transparentModalOptions: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  headerShown: false,
  gestureEnabled: true,
};

// ─── Auth/onboarding screen options (no header) ───────────────────────────────

export const authScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  gestureEnabled: false,
  contentStyle: {
    backgroundColor: COLORS.white,
  },
};

// ─── Stack screen options with slide-up transition ────────────────────────────
// Attach to the parent <Stack> component's screenOptions

export const slideUpTransitionOptions: NativeStackNavigationOptions = {
  animation: 'slide_from_bottom',
};

// ─── Stack screen options with slide-right transition (default) ───────────────

export const slideRightTransitionOptions: NativeStackNavigationOptions = {
  animation: 'slide_from_right',
};

// ─── Fade transition ──────────────────────────────────────────────────────────

export const fadeTransitionOptions: NativeStackNavigationOptions = {
  animation: 'fade',
};

// ─── Header separator helper ──────────────────────────────────────────────────
/** Optional thin bottom border for headers that need a visual separator */
export const HeaderSeparator = React.memo(function HeaderSeparator() {
  return <View style={sepStyles.line} />;
});
HeaderSeparator.displayName = 'HeaderSeparator';

const sepStyles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: COLORS.slate100,
  },
});
