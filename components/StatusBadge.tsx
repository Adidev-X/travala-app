import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { RADIUS } from '../constants/spacing';
import { FONTS } from '../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeType =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'neutral';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface StatusBadgeProps {
  type: BadgeType;
  label: string;
  showDot?: boolean;
  size?: BadgeSize;
}

// ─── Config ───────────────────────────────────────────────────────────────────

type BadgeConfig = {
  bg: string;
  text: string;
  dot: string;
};

const BADGE_CONFIG: Record<BadgeType, BadgeConfig> = {
  success: { bg: COLORS.successLight, text: COLORS.successDark, dot: COLORS.success },
  warning: { bg: COLORS.accentLight, text: '#92400E', dot: COLORS.accent },
  danger: { bg: COLORS.dangerLight, text: COLORS.dangerDark, dot: COLORS.danger },
  info: { bg: COLORS.primaryBg, text: '#1E40AF', dot: COLORS.primaryLight },
  purple: { bg: COLORS.purpleLight, text: '#5B21B6', dot: COLORS.purple },
  neutral: { bg: COLORS.slate100, text: COLORS.slate600, dot: COLORS.slate400 },
};

const FONT_SIZE_MAP: Record<BadgeSize, number> = {
  sm: 10,
  md: 11,
  lg: 13,
};

// ─── Component ────────────────────────────────────────────────────────────────

const StatusBadge = React.memo<StatusBadgeProps>(
  ({ type, label, showDot = true, size = 'md' }) => {
    const config = BADGE_CONFIG[type];
    const fontSize = FONT_SIZE_MAP[size];

    return (
      <View style={[styles.container, { backgroundColor: config.bg }]}>
        {showDot && (
          <View style={[styles.dot, { backgroundColor: config.dot }]} />
        )}
        <Text style={[styles.label, { color: config.text, fontSize }]}>
          {label}
        </Text>
      </View>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: FONTS.weights.semibold,
  },
});
