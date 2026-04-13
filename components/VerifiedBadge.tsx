import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type VerifiedBadgeType = 'rc' | 'dl' | 'permit' | 'full';
export type VerifiedBadgeSize = 'sm' | 'md';

export interface VerifiedBadgeProps {
  type: VerifiedBadgeType;
  size?: VerifiedBadgeSize;
}

const LABELS: Record<VerifiedBadgeType, string> = {
  rc:     'RC Verified',
  dl:     'DL Verified',
  permit: 'Permit',
  full:   'Fully Verified',
};

const ICON_SIZE: Record<VerifiedBadgeSize, number> = { sm: 10, md: 13 };
const TEXT_SIZE: Record<VerifiedBadgeSize, number> = { sm: fontSize.xs - 1, md: fontSize.xs };

const VerifiedBadge = memo(function VerifiedBadge({ type, size = 'md' }: VerifiedBadgeProps) {
  return (
    <View style={[styles.pill, size === 'sm' && styles.pillSm]}>
      <Ionicons name="checkmark-circle" size={ICON_SIZE[size]} color={colors.success} />
      <Text style={[styles.label, { fontSize: TEXT_SIZE[size] }]}>{LABELS[type]}</Text>
    </View>
  );
});

export default VerifiedBadge;

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs - 1,
    backgroundColor: `${colors.success}18`,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
    alignSelf: 'flex-start',
  },
  pillSm: { paddingHorizontal: spacing.xs + 2 },
  label: {
    color: colors.success,
    fontWeight: fontWeight.semiBold,
  },
});
