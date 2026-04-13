import colors from '@/constants/colors';
import spacing from '@/constants/spacing';
import { fontSize, fontWeight } from '@/constants/typography';
import { useProfileSetup } from '@/hooks/useProfileSetup';
import type { ProfileSetupParams } from '@/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow',
  'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Goa',
];

type RoleCard = { role: 'rider' | 'traveler'; icon: string; title: string; sub: string };

const ROLE_CARDS: RoleCard[] = [
  { role: 'traveler', icon: '🧳', title: 'I want to travel', sub: 'Find rides & join trips' },
  { role: 'rider',    icon: '🚗', title: 'I have a vehicle', sub: 'Post trips & earn' },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ProfileSetupParams>();
  const phone = params.phone ?? '';

  const { form, errors, loading, handleChange, handleImagePick, handleSubmit } =
    useProfileSetup(phone);

  const totalSteps = form.role === 'rider' ? 2 : 1;
  const progress = 1 / totalSteps;

  const onSubmit = useCallback(async () => {
    const ok = await handleSubmit();
    if (!ok) return;
    if (form.role === 'rider') {
      router.replace('/(tabs)/trips/verification');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [handleSubmit, form.role, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <Text style={styles.progressLabel}>Step 1 of {totalSteps}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>Complete Your Profile</Text>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarWrap} onPress={handleImagePick} activeOpacity={0.85}>
          {form.avatarUri ? (
            <Image source={{ uri: form.avatarUri }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.text.hint} />
            </View>
          )}
          <View style={styles.cameraOverlay}>
            <Ionicons name="camera" size={16} color={colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to add photo</Text>

        {/* Full Name */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor={colors.text.hint}
            value={form.name}
            onChangeText={v => handleChange('name', v)}
            maxLength={50}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        {/* City */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={[styles.input, errors.city ? styles.inputError : null]}
            placeholder="Your city"
            placeholderTextColor={colors.text.hint}
            value={form.city}
            onChangeText={v => handleChange('city', v)}
          />
          {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
          {/* City suggestions */}
          {form.city.length > 0 && (
            <View style={styles.suggestions}>
              {CITIES.filter(c =>
                c.toLowerCase().startsWith(form.city.toLowerCase()) && c !== form.city,
              )
                .slice(0, 4)
                .map(c => (
                  <TouchableOpacity
                    key={c}
                    style={styles.suggestionItem}
                    onPress={() => handleChange('city', c)}>
                    <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
                    <Text style={styles.suggestionText}>{c}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>

        {/* WhatsApp */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>WhatsApp Number (optional)</Text>
          <View style={[styles.inputRow, errors.whatsapp ? styles.inputRowError : null]}>
            <Text style={styles.prefix}>🇮🇳 +91</Text>
            <TextInput
              style={styles.inputInline}
              placeholder="Same as mobile"
              placeholderTextColor={colors.text.hint}
              keyboardType="phone-pad"
              maxLength={10}
              value={form.whatsapp}
              onChangeText={v => handleChange('whatsapp', v.replace(/\D/g, ''))}
            />
          </View>
          {errors.whatsapp ? <Text style={styles.errorText}>{errors.whatsapp}</Text> : null}
        </View>

        {/* Bio */}
        <View style={styles.fieldWrap}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Bio (optional)</Text>
            <Text style={styles.charCount}>{form.bio.length}/150</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell travelers a bit about yourself…"
            placeholderTextColor={colors.text.hint}
            multiline
            numberOfLines={3}
            maxLength={150}
            value={form.bio}
            onChangeText={v => handleChange('bio', v)}
            textAlignVertical="top"
          />
        </View>

        {/* Role selector */}
        <Text style={styles.label}>I am a…</Text>
        <View style={styles.roleRow}>
          {ROLE_CARDS.map(card => (
            <TouchableOpacity
              key={card.role}
              style={[styles.roleCard, form.role === card.role && styles.roleCardActive]}
              onPress={() => handleChange('role', card.role)}
              activeOpacity={0.8}>
              <Text style={styles.roleCardIcon}>{card.icon}</Text>
              <Text style={[styles.roleCardTitle, form.role === card.role && styles.roleCardTitleActive]}>
                {card.title}
              </Text>
              <Text style={styles.roleCardSub}>{card.sub}</Text>
              {form.role === card.role && (
                <View style={styles.roleCheck}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={loading}
          activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={colors.white} />
            : (
              <Text style={styles.buttonText}>
                {form.role === 'rider' ? 'Save & Upload Vehicle Docs' : 'Save & Continue'}
              </Text>
            )}
        </TouchableOpacity>

        {form.role === 'rider' && (
          <Text style={styles.stepHint}>Next: Upload RC / DL for verification</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: colors.background },
  progressWrap:       { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  progressLabel:      { fontSize: fontSize.xs, color: colors.text.hint, marginBottom: spacing.xs },
  progressTrack:      { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill:       { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  content:            { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading:            { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text.primary, marginBottom: spacing.lg },
  avatarWrap:         { alignSelf: 'center', marginBottom: spacing.xs },
  avatar:             { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarPlaceholder:  { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  cameraOverlay:      { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.white },
  avatarHint:         { textAlign: 'center', fontSize: fontSize.xs, color: colors.text.hint, marginBottom: spacing.lg },
  fieldWrap:          { marginBottom: spacing.md },
  labelRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label:              { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: fontWeight.medium, marginBottom: spacing.xs },
  charCount:          { fontSize: fontSize.xs, color: colors.text.hint },
  input:              { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: fontSize.md, color: colors.text.primary, backgroundColor: colors.card },
  inputError:         { borderColor: colors.danger },
  inputRow:           { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.card, overflow: 'hidden' },
  inputRowError:      { borderColor: colors.danger },
  prefix:             { paddingHorizontal: spacing.sm, fontSize: fontSize.sm, color: colors.text.primary, borderRightWidth: 1, borderRightColor: colors.border, paddingVertical: spacing.sm + 2 },
  inputInline:        { flex: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm + 2, fontSize: fontSize.md, color: colors.text.primary },
  textArea:           { height: 80, textAlignVertical: 'top' },
  errorText:          { color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs },
  suggestions:        { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginTop: 4, overflow: 'hidden' },
  suggestionItem:     { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestionText:     { fontSize: fontSize.sm, color: colors.text.primary },
  roleRow:            { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleCard:           { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, padding: spacing.md, alignItems: 'center', backgroundColor: colors.card, position: 'relative' },
  roleCardActive:     { borderColor: colors.primary, backgroundColor: `${colors.primary}0D` },
  roleCardIcon:       { fontSize: 28, marginBottom: spacing.xs },
  roleCardTitle:      { fontSize: fontSize.sm, fontWeight: fontWeight.semiBold, color: colors.text.secondary, textAlign: 'center' },
  roleCardTitleActive:{ color: colors.primary },
  roleCardSub:        { fontSize: fontSize.xs, color: colors.text.hint, textAlign: 'center', marginTop: 2 },
  roleCheck:          { position: 'absolute', top: spacing.xs, right: spacing.xs },
  button:             { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', height: 52, marginTop: spacing.sm },
  buttonDisabled:     { opacity: 0.5 },
  buttonText:         { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semiBold },
  stepHint:           { textAlign: 'center', fontSize: fontSize.xs, color: colors.text.hint, marginTop: spacing.sm },
});
