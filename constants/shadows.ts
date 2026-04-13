import { Platform } from 'react-native';

type ShadowStyle = {
  elevation?: number;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
};

const shadowColor = '#0F172A';

const iosShadow = (
  height: number,
  opacity: number,
  radius: number
): ShadowStyle => ({
  shadowColor,
  shadowOffset: { width: 0, height },
  shadowOpacity: opacity,
  shadowRadius: radius,
});

const androidShadow = (elevation: number): ShadowStyle => ({ elevation });

const makeShadow = (
  elevation: number,
  height: number,
  opacity: number,
  radius: number
): ShadowStyle =>
  Platform.OS === 'ios'
    ? iosShadow(height, opacity, radius)
    : androidShadow(elevation);

export const SHADOWS = {
  none: Platform.OS === 'ios'
    ? { shadowColor, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 }
    : { elevation: 0 },

  xs: makeShadow(1, 1, 0.06, 2),
  sm: makeShadow(2, 2, 0.07, 4),
  md: makeShadow(4, 4, 0.09, 8),
  lg: makeShadow(8, 8, 0.11, 16),
  xl: makeShadow(12, 16, 0.13, 24),
} as const;

export type Shadows = typeof SHADOWS;
