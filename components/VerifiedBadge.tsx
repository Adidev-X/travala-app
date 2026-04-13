import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { RADIUS } from '../constants/spacing';
import { FONTS } from '../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VerifiedBadgeType = 'rc' | 'dl' | 'permit' | 'full';

export interface VerifiedBadgeProps {
  type: VerifiedBadgeType;
}

// ─── Config ───────────────────────────────────────────────────────────────────

type BadgeConfig = {
  label: string;
  icon: string;
  bg: string;
  text: string;
};

const BADGE_MAP: Record<VerifiedBadgeType, BadgeConfig> = {
  rc: {
    label: 'RC',
    icon: '✓',
    bg: COLORS.successLight,
    text: COLORS.successDark,
  },
  dl: {
    label: 'DL',
    icon: '✓',
    bg: COLORS.successLight,
    text: COLORS.successDark,
  },
  permit: {
    label: 'Permit',
    icon: '✓',
    bg: COLORS.primaryBg,
    text: '#1E40AF',
  },
  full: {
    label: 'Verified',
    icon: '★',
    bg: COLORS.accentLight,
    text: '#92400E',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

const VerifiedBadge = React.memo<VerifiedBadgeProps>(({ type }) => {
  const config = BADGE_MAP[type];

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={[styles.icon, { color: config.text }]}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
});

VerifiedBadge.displayName = 'VerifiedBadge';

export default VerifiedBadge;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  icon: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  label: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
  },
});
