import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import {
    KeyboardTypeOptions,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export interface AppInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  leftIcon?: React.ComponentProps<typeof Ionicons>['name'];
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

const AppInput = memo(function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  maxLength,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
}: AppInputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error ? styles.inputRowError : null, !editable && styles.inputRowDisabled]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={18} color={colors.text.hint} style={styles.iconLeft} />
        )}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeft, rightIcon && styles.inputWithRight]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.hint}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
        />
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={18}
            color={colors.text.hint}
            style={styles.iconRight}
            onPress={onRightIconPress}
          />
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

export default AppInput;

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.sm },
  label: { fontSize: fontSize.sm, color: colors.text.secondary, marginBottom: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  inputRowError: { borderColor: colors.danger },
  inputRowDisabled: { backgroundColor: colors.background, opacity: 0.6 },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  inputWithLeft: { paddingLeft: 0 },
  inputWithRight: { paddingRight: 0 },
  iconLeft: { paddingLeft: spacing.sm },
  iconRight: { paddingRight: spacing.sm },
  error: { fontSize: fontSize.xs, color: colors.danger, marginTop: 4 },
});
