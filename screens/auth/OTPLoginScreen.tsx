import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
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
  const [error, setError] = useState('');
  const otpRef = useRef<TextInput>(null);

  const handleSendOTP = () => {
    if (!validatePhone(phone)) {
      setError(strings.auth.invalidPhone);
      return;
    }
    setError('');
    // TODO: call authService.sendOTP({ phone })
    setStep('otp');
    setTimeout(() => otpRef.current?.focus(), 300);
  };

  const handleVerifyOTP = () => {
    if (otp.length < 4) {
      setError(strings.auth.invalidOTP);
      return;
    }
    setError('');
    // TODO: call authService.verifyOTP → if isNewUser navigate to ProfileSetup
    router.replace('/(auth)/profile-setup');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.heading}>
        {step === 'phone' ? strings.auth.enterPhone : strings.auth.verifyOTP}
      </Text>

      {step === 'phone' ? (
        <TextInput
          style={styles.input}
          placeholder={strings.auth.phonePlaceholder}
          placeholderTextColor={colors.text.hint}
          keyboardType="phone-pad"
          maxLength={13}
          value={phone}
          onChangeText={setPhone}
        />
      ) : (
        <TextInput
          ref={otpRef}
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor={colors.text.hint}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />
      )}

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={step === 'phone' ? handleSendOTP : handleVerifyOTP}
        activeOpacity={0.8}>
        <Text style={styles.buttonText}>
          {step === 'phone' ? strings.auth.sendOTP : strings.auth.verifyOTP}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
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
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
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
