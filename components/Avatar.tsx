import colors from '@/constants/colors';
import { fontSize, fontWeight } from '@/constants/typography';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface UserAvatarProps {
  uri?: string;
  name: string;
  size?: AvatarSize;
  showBadge?: boolean;
  badgeColor?: string;
}

const SIZE_MAP: Record<AvatarSize, number> = { sm: 32, md: 48, lg: 72 };
const FONT_MAP: Record<AvatarSize, number> = { sm: fontSize.sm, md: fontSize.lg, lg: fontSize.xxl };
const BADGE_MAP: Record<AvatarSize, number> = { sm: 8, md: 12, lg: 16 };

const UserAvatar = memo(function UserAvatar({
  uri,
  name,
  size = 'md',
  showBadge = false,
  badgeColor = colors.success,
}: UserAvatarProps) {
  const dim = SIZE_MAP[size];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('');

  return (
    <View style={{ width: dim, height: dim }}>
      <View style={[styles.circle, { width: dim, height: dim, borderRadius: dim / 2 }]}>
        {uri ? (
          <Image source={{ uri }} style={{ width: dim, height: dim, borderRadius: dim / 2 }} contentFit="cover" />
        ) : (
          <Text style={[styles.initials, { fontSize: FONT_MAP[size] }]}>{initials}</Text>
        )}
      </View>
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: BADGE_MAP[size],
              height: BADGE_MAP[size],
              borderRadius: BADGE_MAP[size] / 2,
              backgroundColor: badgeColor,
            },
          ]}
        />
      )}
    </View>
  );
});

export default UserAvatar;

const styles = StyleSheet.create({
  circle: {
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
