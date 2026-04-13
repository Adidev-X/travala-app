import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface UserAvatarProps {
  name?: string;
  uri?: string;
  size?: AvatarSize;
  isOnline?: boolean;
  verified?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 88,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 9,
  sm: 13,
  md: 17,
  lg: 22,
  xl: 32,
};

// 8 soft deterministic background colors
const GRADIENT_COLORS = [
  '#DBEAFE', // light blue
  '#D1FAE5', // light green
  '#FEF3C7', // light amber
  '#EDE9FE', // light purple
  '#FCE7F3', // light pink
  '#DBEAFE', // sky
  '#E0F2FE', // cyan
  '#F0FDF4', // mint
];

const TEXT_COLORS = [
  '#1E40AF',
  '#065F46',
  '#92400E',
  '#5B21B6',
  '#9D174D',
  '#1E3A8A',
  '#164E63',
  '#14532D',
];

// Deterministic hash of name → index
function nameToIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % GRADIENT_COLORS.length;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

const UserAvatar = React.memo<UserAvatarProps>(
  ({ name = '', uri, size = 'md', isOnline = false, verified = false }) => {
    const diameter = SIZE_MAP[size];
    const fontSize = FONT_SIZE_MAP[size];

    const { bgColor, textColor, initials } = useMemo(() => {
      const idx = nameToIndex(name || 'U');
      return {
        bgColor: GRADIENT_COLORS[idx],
        textColor: TEXT_COLORS[idx],
        initials: getInitials(name || 'U'),
      };
    }, [name]);

    // Online dot sizing
    const dotSize = Math.max(8, Math.round(diameter * 0.22));
    const dotOffset = Math.round(diameter * 0.04);

    // Verified ring padding
    const ringPadding = verified ? 3 : 0; // 2px ring + 1px gap on each side = 3
    const outerSize = diameter + ringPadding * 2;

    return (
      <View
        style={[
          styles.outerWrapper,
          { width: outerSize, height: outerSize },
          verified && styles.verifiedRing,
        ]}
      >
        <View
          style={[
            styles.circle,
            { width: diameter, height: diameter, borderRadius: diameter / 2 },
            uri ? null : { backgroundColor: bgColor },
          ]}
        >
          {!uri && (
            <Text style={[styles.initials, { fontSize, color: textColor }]}>
              {initials}
            </Text>
          )}
        </View>

        {isOnline && (
          <View
            style={[
              styles.onlineDot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                bottom: dotOffset,
                right: dotOffset,
              },
            ]}
          />
        )}
      </View>
    );
  }
);

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    // soft shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  verifiedRing: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 9999,
    padding: 1, // white gap between ring and avatar
    backgroundColor: COLORS.white,
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: FONTS.weights.semibold,
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
