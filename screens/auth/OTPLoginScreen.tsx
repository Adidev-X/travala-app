import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import strings from '../../constants/strings';
import { fontSize, fontWeight } from '../../constants/typography';
import { validatePhone } from '../../utils/validatePhone';

export default function OTPLoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  // VALIDATION ADDED: errors Record state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const otpRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  // VALIDATION ADDED: validateForm returns errors Record
  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (step === 'phone') {
      if (!validatePhone(phone)) {
        errs.phone = 'Valid 10-digit number required';
      }
    } else {
      const digits = otp.replace(/\D/g, '');
      if (digits.length !== 6) {
        errs.otp = 'Enter complete OTP';
      }
    }
    return errs;
  };

  // CLICK FIX: wrap in useCallback — handler uses phone, otp, step state and
  // is passed to onPress; without it a new reference is created on every render
  const handleSendOTP = useCallback(() => {
    // VALIDATION ADDED: run validateForm before proceeding
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    // TODO: call authService.sendOTP({ phone })
    setStep('otp');
    setTimeout(() => otpRef.current?.focus(), 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, step]);

  // CLICK FIX: wrap in useCallback — handler uses otp, step state and router
  const handleVerifyOTP = useCallback(() => {
    // VALIDATION ADDED: run validateForm before proceeding
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    // TODO: call authService.verifyOTP → if isNewUser navigate to ProfileSetup
    router.replace('/(auth)/profile-setup');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* VALIDATION ADDED: ScrollView ref for scroll-to-first-error */}
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>
          {step === 'phone' ? strings.auth.enterPhone : strings.auth.verifyOTP}
        </Text>

        {step === 'phone' ? (
          <>
            <TextInput
              // VALIDATION ADDED: red border on error
              style={[styles.input, errors.phone ? { borderColor: colors.danger } : null]}
              placeholder={strings.auth.phonePlaceholder}
              placeholderTextColor={colors.text.hint}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              // VALIDATION ADDED: clear field error on change
              onChangeText={t => { setPhone(t.replace(/\D/g, '')); setErrors(prev => ({ ...prev, phone: '' })); }}
            />
            {/* VALIDATION ADDED: inline error display */}
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </>
        ) : (
          <>
            <TextInput
              ref={otpRef}
              // VALIDATION ADDED: red border on error
              style={[styles.input, errors.otp ? { borderColor: colors.danger } : null]}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor={colors.text.hint}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              // VALIDATION ADDED: clear field error on change
              onChangeText={t => { setOtp(t.replace(/\D/g, '')); setErrors(prev => ({ ...prev, otp: '' })); }}
            />
            {/* VALIDATION ADDED: inline error display */}
            {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={step === 'phone' ? handleSendOTP : handleVerifyOTP}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {step === 'phone' ? strings.auth.sendOTP : strings.auth.verifyOTP}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    justifyContent: 'center',
    flexGrow: 1,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.lg,
    color: colors.text.primary,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  // VALIDATION ADDED: errorText style per spec
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
  },
});
