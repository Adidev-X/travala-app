import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import type { TripType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface TripTypeChipProps {
  type: TripType;
  selected?: boolean;
  onPress?: () => void;
}

const CONFIG: Record<TripType, { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }> = {
  one_way:   { icon: 'arrow-forward-circle-outline', label: 'One-Way' },
  full_tour: { icon: 'map-outline',                  label: 'Full Tour' },
};

const TripTypeChip = memo(function TripTypeChip({ type, selected = false, onPress }: TripTypeChipProps) {
  const { icon, label } = CONFIG[type];

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.75 } : {};

  return (
    <Wrapper
      style={[styles.chip, selected && styles.chipSelected]}
      {...wrapperProps}>
      <Ionicons
        name={icon}
        size={14}
        color={selected ? colors.primary : colors.text.hint}
      />
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Wrapper>
  );
});

export default TripTypeChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    fontWeight: fontWeight.medium,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semiBold,
  },
});
