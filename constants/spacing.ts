export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * Named spacing scale — used by legacy screens via
 * `import spacing from '@/constants/spacing'`
 */
export const namedSpacing = {
  // micro
  xxs:  2,
  xs:   4,
  sm:   8,
  // base
  md:   16,
  // large
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
} as const;

/** Default export — drop-in for `import spacing from '@/constants/spacing'` */
export default namedSpacing;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export type Spacing = typeof SPACING;
export type Radius = typeof RADIUS;
