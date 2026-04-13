import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
}

const VARIANT_STYLES = {
  primary:   { bg: colors.primary,    border: colors.primary,    text: colors.white },
  secondary: { bg: colors.secondary,  border: colors.secondary,  text: colors.white },
  outline:   { bg: colors.transparent, border: colors.primary,   text: colors.primary },
  danger:    { bg: colors.danger,     border: colors.danger,     text: colors.white },
};

const AppButton = memo(function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
}: AppButtonProps) {
  const v = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <View style={styles.inner}>
          {icon && <Ionicons name={icon} size={18} color={v.text} />}
          <Text style={[styles.label, { color: v.text }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default AppButton;

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.semiBold },
});
