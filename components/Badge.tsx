import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type BadgeType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  label: string;
  type: BadgeType;
}

const TYPE_STYLES: Record<BadgeType, { bg: string; text: string }> = {
  success: { bg: colors.statusAccepted,  text: colors.statusAcceptedText },
  warning: { bg: colors.statusPending,   text: colors.statusPendingText },
  danger:  { bg: colors.statusDeclined,  text: colors.statusDeclinedText },
  info:    { bg: '#D1ECF1',              text: '#0C5460' },
  neutral: { bg: '#E2E3E5',              text: '#383D41' },
};

const StatusBadge = memo(function StatusBadge({ label, type }: StatusBadgeProps) {
  const s = TYPE_STYLES[type];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{label}</Text>
    </View>
  );
});

export default StatusBadge;

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
  },
});
