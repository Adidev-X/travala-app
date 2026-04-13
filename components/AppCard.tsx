import React, { useCallback, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SHADOWS } from '../constants/shadows';
import { RADIUS } from '../constants/spacing';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined';

export interface AppCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AppCard = React.memo<AppCardProps>(
  ({ children, variant = 'default', onPress, style, padding = 16 }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isPressable = Boolean(onPress);

    const handlePressIn = useCallback(() => {
      if (!isPressable) return;
      Animated.spring(scaleAnim, {
        toValue: 0.985,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    }, [isPressable, scaleAnim]);

    const handlePressOut = useCallback(() => {
      if (!isPressable) return;
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }, [isPressable, scaleAnim]);

    const cardStyle = [
      styles.base,
      styles[`variant_${variant}` as keyof typeof styles],
      { padding },
      style,
    ];

    if (!isPressable) {
      return (
        <View style={cardStyle}>
          {children}
        </View>
      );
    }

    return (
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible
        accessibilityRole="button"
      >
        <Animated.View
          style={[cardStyle, { transform: [{ scale: scaleAnim }] }]}
        >
          {children}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
);

AppCard.displayName = 'AppCard';

export default AppCard;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },

  variant_default: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    ...SHADOWS.sm,
  },
  variant_elevated: {
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
  },
  variant_flat: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  variant_outlined: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    // no shadow
  },
});
