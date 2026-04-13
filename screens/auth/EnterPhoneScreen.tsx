import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import type { OTPParams } from '@/navigation/types';
import { authService } from '@/services/auth';
import { normalisePhone, validatePhone } from '@/utils/validatePhone';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EnterPhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = validatePhone(phone);

  const handleSendOTP = useCallback(async () => {
    if (!isValid) {
      setError('Please enter a valid 10-digit mobile number (starts with 6-9).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.sendOTP({ phone: normalisePhone(phone) });
      const params: OTPParams = { phone: normalisePhone(phone) };
      router.push({ pathname: '/(auth)/otp', params });
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [phone, isValid, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Brand header */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Ionicons name="car" size={40} color={colors.white} />
        </View>
        <Text style={styles.appName}>Welcome to RideShare</Text>
        <Text style={styles.tagline}>Enter your mobile number to continue</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Mobile Number</Text>
        <View style={[styles.phoneRow, !!error && styles.phoneRowError]}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>🇮🇳 +91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="9876543210"
            placeholderTextColor={colors.text.hint}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={t => { setError(''); setPhone(t.replace(/\D/g, '')); }}
            returnKeyType="done"
            onSubmitEditing={handleSendOTP}
          />
        </View>

        {!!error && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            (!isValid || loading) && styles.buttonDisabled,
          ]}
          onPress={handleSendOTP}
          disabled={!isValid || loading}
          activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.buttonText}>Send OTP</Text>}
        </TouchableOpacity>

        <Text style={styles.hint}>
          You'll receive a 6-digit OTP via SMS
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  tagline: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  phoneRowError: { borderColor: colors.danger },
  prefix: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  prefixText: { fontSize: fontSize.md, color: colors.text.primary },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.xl,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  errorText: { color: colors.danger, fontSize: fontSize.xs },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    height: 52,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semiBold },
  hint: {
    textAlign: 'center',
    color: colors.text.hint,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
  },
});
