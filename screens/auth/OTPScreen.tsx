import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import { useOTPTimer } from '@/hooks/useOTPTimer';
import type { OTPParams, ProfileSetupParams } from '@/navigation/types';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<OTPParams>();
  const setUser = useAuthStore(s => s.setUser);
  const setTokens = useAuthStore(s => s.setTokens);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  const { timeLeft, isExpired, restart } = useOTPTimer(60);

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH;

  // ── Shake animation ───────────────────────────────────────────────────────
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // ── Digit input handling ──────────────────────────────────────────────────
  const handleDigitChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    setError('');
    const updated = [...digits];
    updated[index] = digit;
    setDigits(updated);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const updated = [...digits];
      updated[index - 1] = '';
      setDigits(updated);
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  // ── Verify ────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(async () => {
    if (!isComplete) return;
    setError('');
    setLoading(true);
    try {
      const result = await authService.verifyOTP({ phone, otp });
      setTokens(result.data.tokens);
      if (result.data.isNewUser) {
        const params: ProfileSetupParams = { phone, isNewUser: '1' };
        router.replace({ pathname: '/(auth)/profile-setup', params });
      } else {
        setUser(result.data.user);
        // Auth guard in _layout.tsx handles redirect to tabs
      }
    } catch {
      setError('Invalid or expired OTP. Please try again.');
      triggerShake();
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }, [otp, isComplete, phone, router, setTokens, setUser, triggerShake]);

  // ── Resend ────────────────────────────────────────────────────────────────
  const handleResend = useCallback(async () => {
    if (!isExpired) return;
    try {
      await authService.sendOTP({ phone });
      restart();
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError('Failed to resend OTP. Please try again.');
    }
  }, [isExpired, phone, restart]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>

        {/* Header */}
        <Text style={styles.heading}>Verify your number</Text>
        <View style={styles.subRow}>
          <Text style={styles.subText}>OTP sent to </Text>
          <Text style={styles.phone}>+91 {phone}</Text>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="pencil" size={14} color={colors.secondary} style={styles.editIcon} />
          </TouchableOpacity>
        </View>

        {/* 6-box OTP input */}
        <Animated.View style={[styles.boxRow, { transform: [{ translateX: shakeAnim }] }]}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <TextInput
              key={i}
              ref={ref => { inputRefs.current[i] = ref; }}
              style={[styles.box, digits[i] ? styles.boxFilled : null, !!error && styles.boxError]}
              value={digits[i]}
              onChangeText={text => handleDigitChange(text, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              autoFocus={i === 0}
            />
          ))}
        </Animated.View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.button, (!isComplete || loading) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={!isComplete || loading}
          activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.buttonText}>Verify OTP</Text>}
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity onPress={handleResend} disabled={!isExpired} style={styles.resendRow}>
          <Text style={[styles.resendText, !isExpired && styles.resendDisabled]}>
            {isExpired
              ? 'Resend OTP'
              : `Resend OTP in ${timeLeft}s`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const BOX_SIZE = 48;

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  content:        { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, alignItems: 'center' },
  heading:        { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.sm },
  subRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  subText:        { fontSize: fontSize.md, color: colors.text.secondary },
  phone:          { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.primary },
  editIcon:       { marginLeft: spacing.xs },
  boxRow:         { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE + 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    backgroundColor: colors.card,
  },
  boxFilled:      { borderColor: colors.primary, backgroundColor: `${colors.primary}0D` },
  boxError:       { borderColor: colors.danger, backgroundColor: `${colors.danger}0D` },
  errorRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  errorText:      { color: colors.danger, fontSize: fontSize.xs },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    height: 52,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText:     { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semiBold },
  resendRow:      { marginTop: spacing.lg },
  resendText:     { fontSize: fontSize.sm, color: colors.secondary, fontWeight: fontWeight.medium },
  resendDisabled: { color: colors.text.hint },
});
