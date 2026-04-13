import { COLORS } from './colors';

export const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
    widest: 1.2,
  },
} as const;

export const TEXT_STYLES = {
  displayLarge: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  displayMedium: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    letterSpacing: -0.3,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
  },
  heading2: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
  },
  heading3: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: COLORS.text.secondary,
    lineHeight: 19,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: COLORS.text.hint,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.text.secondary,
    letterSpacing: 0.3,
  },
  overline: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: COLORS.text.hint,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
} as const;

export type Fonts = typeof FONTS;
export type TextStyles = typeof TEXT_STYLES;

/**
 * Legacy named exports — used by older files via
 * `import { fontSize, fontWeight } from '@/constants/typography'`
 */
export const fontSize = {
  xs:   FONTS.sizes.xs,    // 10
  sm:   FONTS.sizes.sm,    // 12
  md:   FONTS.sizes.md,    // 14
  base: FONTS.sizes.base,  // 15
  lg:   FONTS.sizes.lg,    // 17
  xl:   FONTS.sizes.xl,    // 20
  xxl:  28,                // legacy
  '2xl': FONTS.sizes['2xl'], // 24
  '3xl': FONTS.sizes['3xl'], // 30
} as const;

export const fontWeight = {
  regular:   FONTS.weights.regular,   // '400'
  medium:    FONTS.weights.medium,    // '500'
  semiBold:  FONTS.weights.semibold,  // '600'
  semibold:  FONTS.weights.semibold,  // '600' (alternate casing)
  bold:      FONTS.weights.bold,      // '700'
  extrabold: FONTS.weights.extrabold, // '800'
  extraBold: FONTS.weights.extrabold, // '800' (PascalCase alias)
} as const;

/** Default export — drop-in for `import typography from '@/constants/typography'` */
const typography = { fontSize, fontWeight, FONTS, TEXT_STYLES };
export default typography;
