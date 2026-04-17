/**
 * OTPScreen — redesigned 2025. WHITE theme.
 * Modern 6-box OTP, animated focus/filled/error states, shake on wrong OTP.
 */
import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { useOTPTimer } from '@/hooks/useOTPTimer';
import type { OTPParams, ProfileSetupParams } from '@/navigation/types';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
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

// ── OTP Box sub-component ──────────────────────────────────────────────────
interface OTPBoxProps {
  digit:   string;
  focused: boolean;
  error:   boolean;
  index:   number;
  inputRef: (ref: TextInput | null) => void;
  onChangeText: (text: string, index: number) => void;
  onKeyPress:   (key: string,  index: number) => void;
}

const OTPBox = React.memo(function OTPBox({
  digit, focused, error, index, inputRef, onChangeText, onKeyPress,
}: OTPBoxProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true, tension: 200, friction: 10 }).start();
    } else {
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 10 }).start();
    }
  }, [focused, scaleAnim]);

  const boxStyle = error
    ? styles.boxError
    : digit
    ? styles.boxFilled
    : focused
    ? styles.boxFocused
    : null;

  const textStyle = error
    ? styles.boxTextError
    : digit
    ? styles.boxTextFilled
    : styles.boxText;

  return (
    <Animated.View style={[styles.boxWrap, { transform: [{ scale: scaleAnim }] }]}>
      <TextInput
        ref={inputRef}
        style={[styles.box, boxStyle]}
        value={digit}
        onChangeText={t => onChangeText(t, index)}
        onKeyPress={({ nativeEvent }) => onKeyPress(nativeEvent.key, index)}
        keyboardType="number-pad"
        maxLength={1}
        textAlign="center"
        selectTextOnFocus
        autoFocus={index === 0}
        caretHidden
      />
      {digit ? <Text style={textStyle}>{digit}</Text> : null}
    </Animated.View>
  );
});

// ── Main screen ───────────────────────────────────────────────────────────
const OTPScreen = React.memo(function OTPScreen() {
  const router    = useRouter();
  const { phone } = useLocalSearchParams<OTPParams>();
  const setUser   = useAuthStore(s => s.setUser);
  const setTokens = useAuthStore(s => s.setTokens);

  const [digits,       setDigits]       = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  // VALIDATION ADDED: errors Record state (per spec)
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  // FIX: track wrong attempts — show lockout message after 3 failures
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const inputRefs  = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  // FIX: isSubmitting prevents double-tap submit while request is in flight
  const isSubmitting = useRef(false);

  const { timeLeft, isExpired, restart } = useOTPTimer(45);

  const otp        = digits.join('');
  const isComplete = otp.length === OTP_LENGTH && !digits.includes('');

  // VALIDATION ADDED: validateForm returns errors Record
  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!isComplete || digits.some(d => !/^[0-9]$/.test(d))) {
      errs.otp = 'Enter complete OTP';
    }
    return errs;
  };

  // Pulse when complete
  useEffect(() => {
    if (isComplete) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isComplete, pulseAnim]);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleDigitChange = useCallback((text: string, index: number) => {
    // FIX: was /D/g (removes literal 'D'); must be /\D/g to strip all non-digit chars
    const digit = text.replace(/\D/g, '').slice(-1);
    setError('');
    // VALIDATION ADDED: clear field error on digit change
    setErrors({});
    const updated = [...digits];
    updated[index] = digit;
    setDigits(updated);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  }, [digits]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const updated = [...digits];
      updated[index - 1] = '';
      setDigits(updated);
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  }, [digits]);

  const handleVerify = useCallback(async () => {
    // VALIDATION ADDED: run validateForm before API call
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      triggerShake();
      setError(errs.otp ?? 'Enter complete OTP');
      return;
    }
    // FIX: isSubmitting guard — prevents double submit on rapid taps
    if (isSubmitting.current || loading) return;
    // FIX: lockout after 3 wrong attempts
    if (wrongAttempts >= 3) {
      setError('Too many attempts. Please request a new OTP.');
      return;
    }
    isSubmitting.current = true;
    setErrors({});
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
      }
    } catch {
      // FIX: increment wrong attempt count; lock out after 3
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      if (newAttempts >= 3) {
        setError('Too many attempts. Request a new OTP.');
      } else {
        setError('Invalid or expired OTP. Please try again.');
      }
      triggerShake();
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => { inputRefs.current[0]?.focus(); setFocusedIndex(0); }, 100);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  }, [otp, isComplete, loading, wrongAttempts, phone, router, setTokens, setUser, triggerShake]);

  const handleResend = useCallback(async () => {
    if (!isExpired) return;
    try {
      await authService.sendOTP({ phone });
      restart();
      setDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      // FIX: reset wrong attempts counter on resend so user gets fresh 3 tries
      setWrongAttempts(0);
      setTimeout(() => { inputRefs.current[0]?.focus(); setFocusedIndex(0); }, 100);
    } catch {
      setError('Failed to resend OTP. Please try again.');
    }
  }, [isExpired, phone, restart]);

  const fmtTime = (s: number) => `0:${String(s).padStart(2, '0')}`;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      // FIX: Android needs 'height' not undefined — undefined disables KeyboardAvoidingView on Android
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>

        {/* ── Header ──────────────────────────────────────── */}
        <View style={styles.iconWrap}>
          <Ionicons name="mail-outline" size={44} color={COLORS.primary} />
        </View>
        <Text style={styles.heading}>Verify Your Number</Text>
        <TouchableOpacity
          style={styles.subRow}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/enter-phone')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.subText}>{'OTP sent to +91 '}</Text>
          <Text style={styles.phoneText}>{phone}</Text>
          <Ionicons name="pencil" size={13} color={COLORS.slate400} style={styles.editIcon} />
        </TouchableOpacity>

        {/* ── OTP boxes ───────────────────────────────────── */}
        <Animated.View
          style={[styles.boxRow, { transform: [{ translateX: shakeAnim }] }]}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <OTPBox
              key={i}
              digit={digits[i]}
              focused={focusedIndex === i}
              error={error !== '' && digits[i] !== ''}
              index={i}
              inputRef={ref => { inputRefs.current[i] = ref; }}
              onChangeText={handleDigitChange}
              onKeyPress={handleKeyPress}
            />
          ))}
        </Animated.View>

        {/* ── Error ───────────────────────────────────────── */}
        {error ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Verify button ────────────────────────────────── */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
          <AppButton
            label="Verify OTP"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!isComplete || loading}
            onPress={handleVerify}
            style={styles.verifyBtn}
          />
        </Animated.View>

        {/* ── Resend ──────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.resendRow}
          onPress={handleResend}
          disabled={!isExpired}>
          {isExpired ? (
            <Text style={styles.resendActive}>Resend OTP</Text>
          ) : (
            <Text style={styles.resendTimer}>
              {'Resend OTP in '}
              <Text style={styles.resendCountdown}>{fmtTime(timeLeft)}</Text>
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Bottom hint ─────────────────────────────────── */}
        <View style={styles.hintRow}>
          <Ionicons name="information-circle-outline" size={13} color={COLORS.slate400} />
          <Text style={styles.hintText}>
            {'Check SMS or WhatsApp for OTP'}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

export default OTPScreen;

const BOX = 48;
const BOX_H = 58;

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 52, alignItems: 'center' },

  // Header
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  heading:  { fontSize: 26, fontWeight: '800', color: COLORS.slate900, marginBottom: 10, letterSpacing: -0.3 },
  subRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 36 },
  subText:  { fontSize: 14, color: COLORS.slate400 },
  phoneText:{ fontSize: 14, fontWeight: '700', color: COLORS.slate700 },
  editIcon: { marginLeft: 6 },

  // OTP Boxes
  boxRow:   { flexDirection: 'row', gap: 10, marginBottom: 16 },
  boxWrap:  { position: 'relative', width: BOX, height: BOX_H },
  box: {
    position: 'absolute',
    width: BOX, height: BOX_H,
    borderWidth: 2, borderColor: COLORS.slate200,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    fontSize: BOX_H * 0.4,
    fontWeight: '700',
    color: 'transparent', // hide native caret text, use overlay Text
    textAlign: 'center',
    ...SHADOWS.xs,
  },
  boxFocused: { borderColor: COLORS.primary,  backgroundColor: COLORS.primaryBg },
  boxFilled:  { borderColor: COLORS.success,   backgroundColor: COLORS.successLight },
  boxError:   { borderColor: COLORS.danger,    backgroundColor: COLORS.dangerLight },
  boxText:       { position: 'absolute', width: BOX, height: BOX_H, textAlign: 'center', lineHeight: BOX_H, fontSize: BOX_H * 0.42, fontWeight: '700', color: COLORS.slate900 },
  boxTextFilled: { position: 'absolute', width: BOX, height: BOX_H, textAlign: 'center', lineHeight: BOX_H, fontSize: BOX_H * 0.42, fontWeight: '700', color: COLORS.successDark },
  boxTextError:  { position: 'absolute', width: BOX, height: BOX_H, textAlign: 'center', lineHeight: BOX_H, fontSize: BOX_H * 0.42, fontWeight: '700', color: COLORS.dangerDark },

  // Error
  errorRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  // VALIDATION ADDED: errorText style per spec
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 4, marginLeft: 4 },

  // Button
  verifyBtn: { height: 52 },

  // Resend
  resendRow:       { marginTop: 20 },
  resendActive:    { fontSize: 14, color: COLORS.primary, fontWeight: '600', textDecorationLine: 'underline' },
  resendTimer:     { fontSize: 14, color: COLORS.slate400 },
  resendCountdown: { fontWeight: '700', color: COLORS.slate700 },

  // Hint
  hintRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 28, opacity: 0.7 },
  hintText: { fontSize: 12, color: COLORS.slate400 },
});
