// ─── RideShare — NavigationService ───────────────────────────────────────────
//
// Allows navigation from outside React components:
//   services/, store middleware, push-notification handlers, etc.
//
// Usage:
//   import NavigationService from '@/navigation/NavigationService';
//
//   // In an API service or push handler:
//   NavigationService.navigate('/(tabs)/home/trip-detail', { tripId: '123' });
//   NavigationService.replace('/(auth)/enter-phone');
//   NavigationService.goBack();
//
// ─────────────────────────────────────────────────────────────────────────────

import { CommonActions, type NavigationContainerRef, type ParamListBase } from '@react-navigation/native';
import { createRef } from 'react';
import type { AppRoute, RouteParams, RoutesWithParams, RoutesWithoutParams } from './types';

// ─── Shared navigation ref ────────────────────────────────────────────────────
// Pass this to expo-router's <NavigationContainer ref={navigationRef}>
// or use with useNavigationContainerRef() in the root layout.

export const navigationRef = createRef<NavigationContainerRef<ParamListBase>>();

// ─── Type-safe navigate overloads ─────────────────────────────────────────────

function navigate(route: RoutesWithoutParams): void;
function navigate<R extends RoutesWithParams>(route: R, params: RouteParams[R]): void;
function navigate(route: AppRoute, params?: Record<string, unknown>): void {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.dispatch(
      CommonActions.navigate({ name: route, params }),
    );
  } else {
    console.warn('[NavigationService] Navigator not ready. Queued route:', route);
  }
}

// ─── Replace current screen ───────────────────────────────────────────────────

function replace(route: AppRoute, params?: Record<string, unknown>): void {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.dispatch({
      type: 'REPLACE',
      payload: { name: route, params },
    });
  }
}

// ─── Go back ─────────────────────────────────────────────────────────────────

function goBack(): void {
  if (navigationRef.current?.isReady() && navigationRef.current.canGoBack()) {
    navigationRef.current.goBack();
  }
}

// ─── Reset to a root route ───────────────────────────────────────────────────

function resetToAuth(): void {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: '/(auth)/enter-phone' as never }],
    });
  }
}

function resetToApp(role: 'rider' | 'traveler' | 'both'): void {
  if (navigationRef.current?.isReady()) {
    const home = role === 'traveler'
      ? '/(tabs)/home'
      : '/(tabs)/trips';
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: home as never }],
    });
  }
}

// ─── Get current route name ───────────────────────────────────────────────────

function getCurrentRoute(): string | undefined {
  return navigationRef.current?.getCurrentRoute()?.name;
}

// ─── isReady guard ────────────────────────────────────────────────────────────

function isReady(): boolean {
  return navigationRef.current?.isReady() ?? false;
}

// ─── Export as default object ────────────────────────────────────────────────

const NavigationService = {
  navigate,
  replace,
  goBack,
  resetToAuth,
  resetToApp,
  getCurrentRoute,
  isReady,
};

export default NavigationService;
