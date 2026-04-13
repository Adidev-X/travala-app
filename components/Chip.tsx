import React, { useCallback, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { RADIUS } from '../constants/spacing';
import { FONTS } from '../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  count?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Chip = React.memo<ChipProps>(
  ({ label, selected = false, onPress, icon, count }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isPressable = Boolean(onPress);

    const handlePressIn = useCallback(() => {
      if (!isPressable) return;
      Animated.spring(scaleAnim, {
        toValue: 0.94,
        useNativeDriver: true,
        speed: 60,
        bounciness: 0,
      }).start();
    }, [isPressable, scaleAnim]);

    const handlePressOut = useCallback(() => {
      if (!isPressable) return;
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 5,
      }).start();
    }, [isPressable, scaleAnim]);

    const chipStyle = [
      styles.chip,
      selected ? styles.chipSelected : styles.chipUnselected,
    ];

    const labelStyle = [
      styles.label,
      selected ? styles.labelSelected : styles.labelUnselected,
    ];

    const inner = (
      <Animated.View
        style={[chipStyle, { transform: [{ scale: scaleAnim }] }]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={labelStyle}>{label}</Text>
        {count != null ? (
          <View style={[styles.countBadge, selected && styles.countBadgeSelected]}>
            <Text style={[styles.countText, selected && styles.countTextSelected]}>
              {count}
            </Text>
          </View>
        ) : null}
      </Animated.View>
    );

    if (!isPressable) return inner;

    return (
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        {inner}
      </TouchableWithoutFeedback>
    );
  }
);

Chip.displayName = 'Chip';

export default Chip;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    gap: 5,
  },
  chipUnselected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.slate200,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  labelUnselected: {
    color: COLORS.slate600,
  },
  labelSelected: {
    color: COLORS.primary,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: COLORS.slate200,
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  countBadgeSelected: {
    backgroundColor: COLORS.primaryBorder,
  },
  countText: {
    fontSize: 10,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate600,
  },
  countTextSelected: {
    color: COLORS.primary,
  },
});
