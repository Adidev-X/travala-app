import React, { useCallback, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TextStyle,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { RADIUS } from '../constants/spacing';
import { FONTS } from '../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  sm: 40,
  md: 48,
  lg: 56,
};

// ─── Variant style maps ────────────────────────────────────────────────────────
// Defined as plain objects (not StyleSheet registered) for simple typed access.

const VARIANT_CONTAINER_STYLES: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: COLORS.primary,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  secondary: {
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  accent: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.slate300,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.dangerLight,
  },
};

const VARIANT_LABEL_STYLES: Record<ButtonVariant, TextStyle> = {
  primary:   { color: COLORS.white },
  secondary: { color: COLORS.primary },
  accent:    { color: COLORS.white },
  outline:   { color: COLORS.slate700 },
  ghost:     { color: COLORS.primary },
  danger:    { color: COLORS.dangerDark },
};

// ─── Component ────────────────────────────────────────────────────────────────

const AppButton = React.memo<AppButtonProps>(
  ({
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = true,
    style,
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isDisabled = disabled || loading;

    const handlePressIn = useCallback(() => {
      if (isDisabled) return;
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    }, [isDisabled, scaleAnim]);

    const handlePressOut = useCallback(() => {
      if (isDisabled) return;
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }, [isDisabled, scaleAnim]);

    return (
      <TouchableWithoutFeedback
        onPress={!isDisabled ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        <Animated.View
          style={[
            styles.base,
            VARIANT_CONTAINER_STYLES[variant],
            { height: SIZE_HEIGHT[size] },
            fullWidth ? styles.fullWidth : undefined,
            isDisabled ? styles.disabled : undefined,
            style,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                variant === 'primary' || variant === 'accent'
                  ? COLORS.white
                  : COLORS.primary
              }
            />
          ) : (
            <View style={styles.inner}>
              {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
              <Text
                style={[styles.label, VARIANT_LABEL_STYLES[variant]]}
                numberOfLines={1}
              >
                {label}
              </Text>
              {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
);

AppButton.displayName = 'AppButton';

export default AppButton;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconLeft: {
    marginRight: 2,
  },
  iconRight: {
    marginLeft: 2,
  },
  label: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semibold,
  },
});
