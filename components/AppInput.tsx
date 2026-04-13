import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SHADOWS } from '../constants/shadows';
import { RADIUS } from '../constants/spacing';
import { FONTS } from '../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  errorText?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerStyle?: object;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AppInput = React.memo<AppInputProps>(
  ({
    label,
    errorText,
    helperText,
    leftIcon,
    rightSlot,
    containerStyle,
    multiline = false,
    onFocus,
    onBlur,
    ...textInputProps
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const borderColorAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
        setIsFocused(true);
        Animated.timing(borderColorAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }).start();
        onFocus?.(e);
      },
      [borderColorAnim, onFocus]
    );

    const handleBlur = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
        setIsFocused(false);
        Animated.timing(borderColorAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }).start();
        onBlur?.(e);
      },
      [borderColorAnim, onBlur]
    );

    const hasError = Boolean(errorText);

    const borderColor = hasError
      ? COLORS.danger
      : isFocused
      ? COLORS.primary
      : COLORS.slate200;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View
          style={[
            styles.inputContainer,
            { borderColor },
            hasError && styles.inputContainerError,
          ]}
        >
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

          <TextInput
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              leftIcon ? styles.inputWithLeft : null,
              rightSlot ? styles.inputWithRight : null,
            ]}
            placeholderTextColor={COLORS.slate400}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={multiline}
            {...textInputProps}
          />

          {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
        </View>

        {hasError ? (
          <View style={styles.subRow}>
            <Text style={styles.errorText}>⚠ {errorText}</Text>
          </View>
        ) : helperText ? (
          <View style={styles.subRow}>
            <Text style={styles.helperText}>{helperText}</Text>
          </View>
        ) : null}
      </View>
    );
  }
);

AppInput.displayName = 'AppInput';

export default AppInput;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.slate500,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    minHeight: 52,
    ...SHADOWS.xs,
  },
  inputContainerError: {
    backgroundColor: '#FEF2F2',
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.slate900,
    paddingHorizontal: 14,
    paddingVertical: 0,
    height: 52,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 52,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  inputWithLeft: {
    paddingLeft: 4,
  },
  inputWithRight: {
    paddingRight: 4,
  },
  leftIcon: {
    paddingLeft: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSlot: {
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subRow: {
    marginTop: 4,
    paddingHorizontal: 2,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.dangerDark,
    fontWeight: FONTS.weights.medium,
  },
  helperText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.slate400,
  },
});
