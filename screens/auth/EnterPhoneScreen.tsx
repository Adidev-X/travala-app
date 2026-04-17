/**
 * EnterPhoneScreen — redesigned 2025. WHITE theme.
 */
import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import type { OTPParams } from '@/navigation/types';
import { authService } from '@/services/auth';
import { normalisePhone, validatePhone } from '@/utils/validatePhone';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const EnterPhoneScreen = React.memo(function EnterPhoneScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  // VALIDATION ADDED: errors Record state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const scrollRef = useRef<ScrollView>(null);

  const isValid = validatePhone(phone);

  // VALIDATION ADDED: validateForm returns errors Record
  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!validatePhone(phone)) {
      errs.phone = 'Valid 10-digit number required';
    }
    return errs;
  };

  const handleSendOTP = useCallback(async () => {
    // VALIDATION ADDED: run validateForm before API call
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setLoading(true);
    try {
      await authService.sendOTP({ phone: normalisePhone(phone) });
      const params: OTPParams = { phone: normalisePhone(phone) };
      router.push({ pathname: '/(auth)/otp', params });
    } catch {
      setErrors({ phone: 'Failed to send OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [phone, router]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      // FIX: Android needs 'height' — undefined disables KAV on Android
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ── Illustration area ───────────────────────────────── */}
        <View style={styles.heroArea}>
          <View style={styles.illustCircle}>
            <Ionicons name="phone-portrait-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.heading}>Welcome to RideShare</Text>
          <Text style={styles.subtext}>
            {'Find rides, share trips \u2014 connect with\ntravelers across India'}
          </Text>
        </View>

        {/* ── Input card ──────────────────────────────────────── */}
        <AppCard variant="elevated" style={styles.card}>
          <Text style={styles.cardLabel}>ENTER YOUR MOBILE NUMBER</Text>

          <TouchableOpacity
            style={[styles.phoneRow, errors.phone ? styles.phoneRowError : null]}
            activeOpacity={0.85}
            onPress={() => inputRef.current?.focus()}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixFlag}>🇮🇳</Text>
              <Text style={styles.prefixCode}>+91</Text>
            </View>
            <View style={styles.vertDivider} />
            <TextInput
              ref={inputRef}
              style={styles.numberInput}
              placeholder="98765 43210"
              placeholderTextColor={COLORS.slate300}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={t => {
                // VALIDATION ADDED: clear field error on change
                setErrors(prev => ({ ...prev, phone: '' }));
                // FIX: was /D/g (removes literal 'D'); must be /\D/g to remove all non-digits
                setPhone(t.replace(/\D/g, ''));
              }}
              returnKeyType="done"
              onSubmitEditing={handleSendOTP}
            />
            {phone.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => { setPhone(''); setErrors({}); inputRef.current?.focus(); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={COLORS.slate300} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* VALIDATION ADDED: inline error display below phone input */}
          {errors.phone ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={13} color={COLORS.danger} />
              <Text style={styles.errorText}>{errors.phone}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />
          <Text style={styles.otpHint}>
            {"We'll send a 6-digit OTP to verify your number"}
          </Text>
        </AppCard>

        {/* ── Send OTP button ─────────────────────────────────── */}
        <View style={styles.btnWrap}>
          <AppButton
            label="Send OTP  →"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!isValid || loading}
            onPress={handleSendOTP}
            style={styles.sendBtn}
          />
        </View>

        {/* ── Trust row ───────────────────────────────────────── */}
        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.success} />
          <Text style={styles.trustText}>Secure</Text>
          <View style={styles.trustDot} />
          <Ionicons name="lock-closed-outline" size={13} color={COLORS.slate400} />
          <Text style={styles.trustText}>Private</Text>
          <View style={styles.trustDot} />
          <Ionicons name="flash-outline" size={13} color={COLORS.accent} />
          <Text style={styles.trustText}>Instant OTP</Text>
        </View>

        {/* ── Terms ───────────────────────────────────────────── */}
        <Text style={styles.terms}>
          {'By continuing you agree to our '}
          <Text style={styles.termsLink}>Terms</Text>
          {' & '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

export default EnterPhoneScreen;

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: COLORS.background },
  scroll:         { flexGrow: 1, paddingBottom: 40 },
  heroArea:       { alignItems: 'center', paddingTop: 56, paddingBottom: 8, paddingHorizontal: 24 },
  illustCircle:   {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.sm,
  },
  heading:        { fontSize: 28, fontWeight: '800', color: COLORS.slate900, textAlign: 'center', marginTop: 24, letterSpacing: -0.3 },
  subtext:        { fontSize: 15, color: COLORS.slate400, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  card:           { marginHorizontal: 16, marginTop: 28, borderRadius: 20, padding: 20 },
  cardLabel:      { fontSize: 10, fontWeight: '700', color: COLORS.slate500, letterSpacing: 1.1, marginBottom: 12 },
  phoneRow:       {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.slate200, borderRadius: 14,
    overflow: 'hidden', minHeight: 56,
  },
  phoneRowError:  { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  prefixBox:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.slate100, gap: 6 },
  prefixFlag:     { fontSize: 16 },
  prefixCode:     { fontSize: 15, fontWeight: '600', color: COLORS.slate700 },
  vertDivider:    { width: 1, height: 28, backgroundColor: COLORS.slate200 },
  numberInput:    { flex: 1, paddingHorizontal: 14, fontSize: 20, fontWeight: '600', color: COLORS.slate900, letterSpacing: 3 },
  clearBtn:       { paddingRight: 12 },
  errorRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  errorText:      { fontSize: 12, color: COLORS.danger, flex: 1 },
  divider:        { height: 1, backgroundColor: COLORS.slate100, marginTop: 14, marginBottom: 10 },
  otpHint:        { fontSize: 12, color: COLORS.slate400, textAlign: 'center' },
  btnWrap:        { marginHorizontal: 16, marginTop: 16 },
  sendBtn:        { height: 56 },
  trustRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18, gap: 6 },
  trustText:      { fontSize: 12, color: COLORS.slate400 },
  trustDot:       { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.slate200 },
  terms:          { fontSize: 11, color: COLORS.slate400, textAlign: 'center', marginTop: 24, marginHorizontal: 32, lineHeight: 16 },
  termsLink:      { color: COLORS.primary, fontWeight: '600' },
});
