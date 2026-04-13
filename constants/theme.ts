import { COLORS, type Colors } from './colors';
import { FONTS, TEXT_STYLES, type Fonts, type TextStyles } from './typography';
import { SHADOWS, type Shadows } from './shadows';
import { SPACING, RADIUS, type Spacing, type Radius } from './spacing';

export const theme = {
  colors: COLORS,
  fonts: FONTS,
  textStyles: TEXT_STYLES,
  shadows: SHADOWS,
  spacing: SPACING,
  radius: RADIUS,
} as const;

export type Theme = {
  colors: Colors;
  fonts: Fonts;
  textStyles: TextStyles;
  shadows: Shadows;
  spacing: Spacing;
  radius: Radius;
};

// Named re-exports for convenience
export { COLORS, FONTS, TEXT_STYLES, SHADOWS, SPACING, RADIUS };
