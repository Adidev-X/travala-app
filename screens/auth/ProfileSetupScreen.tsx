/**
 * ProfileSetupScreen — redesigned 2025. WHITE theme.
 * Avatar picker, form card, role selector.
 */
import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { useProfileSetup } from '@/hooks/useProfileSetup';
import type { ProfileSetupParams } from '@/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
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

// ── Constants ─────────────────────────────────────────────────────────────
const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow',
  'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Goa',
];

type RoleOption = { role: 'rider' | 'traveler'; emoji: string; label: string; sub: string; color: string; bg: string };
const ROLES: RoleOption[] = [
  { role: 'traveler', emoji: '🧳', label: 'Traveler', sub: 'Looking for rides',  color: COLORS.primary, bg: COLORS.primaryBg },
  { role: 'rider',    emoji: '🚗', label: 'Rider',    sub: 'I have a vehicle',   color: COLORS.success, bg: COLORS.successLight },
];

// ── Avatar initials helper ────────────────────────────────────────────────
const PALETTE = ['#1A56DB','#10B981','#F59E0B','#7C3AED','#EF4444','#06B6D4','#F97316','#64748B'];
function getInitialsColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (name.slice(0, 2)).toUpperCase();
}

// ── Main screen ───────────────────────────────────────────────────────────
const ProfileSetupScreen = React.memo(function ProfileSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ProfileSetupParams>();
  const phone  = params.phone ?? '';

  const { form, errors, loading, handleChange, handleImagePick, handleSubmit } =
    useProfileSetup(phone);

  const totalSteps = form.role === 'rider' ? 2 : 1;
  const progress   = 1 / totalSteps;

  const onSubmit = useCallback(async () => {
    const ok = await handleSubmit();
    if (!ok) return;
    if (form.role === 'rider') {
      router.replace('/(tabs)/trips/verification');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [handleSubmit, form.role, router]);

  const avatarColor = getInitialsColor(form.name || 'U');
  const initials    = form.name ? getInitials(form.name) : '';

  const citySuggestions = form.city.length > 0
    ? CITIES.filter(c => c.toLowerCase().startsWith(form.city.toLowerCase()) && c !== form.city).slice(0, 4)
    : [];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* ── Header bar ──────────────────────────────────────────── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.slate700} />
        </TouchableOpacity>

        <View style={styles.progressArea}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
          </View>
        </View>

        <Text style={styles.stepLabel}>1 of {totalSteps}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ── Title ───────────────────────────────────────────────── */}
        <Text style={styles.heading}>Complete Your Profile</Text>
        <Text style={styles.subtext}>{'Let\'s get you set up in under a minute'}</Text>

        {/* ── Avatar ──────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={handleImagePick}
          activeOpacity={0.85}>
          {form.avatarUri ? (
            <>
              <Image source={{ uri: form.avatarUri }} style={styles.avatar} contentFit="cover" />
              <View style={styles.avatarOverlay}>
                <Text style={styles.avatarOverlayText}>Change</Text>
              </View>
            </>
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
              {initials ? (
                <Text style={styles.avatarInitials}>{initials}</Text>
              ) : (
                <Ionicons name="person" size={38} color="rgba(255,255,255,0.7)" />
              )}
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={14} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to add photo</Text>

        {/* ── Form card ───────────────────────────────────────────── */}
        <AppCard variant="elevated" style={styles.formCard}>
          <Text style={styles.sectionLabel}>YOUR DETAILS</Text>

          {/* Name */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Full Name <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputRow, errors.name ? styles.inputRowError : null]}>
              <Ionicons name="person-outline" size={16} color={COLORS.slate400} style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={COLORS.slate300}
                value={form.name}
                onChangeText={v => handleChange('name', v)}
                maxLength={50}
              />
            </View>
            {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
          </View>

          {/* City */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>City <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputRow, errors.city ? styles.inputRowError : null]}>
              <Ionicons name="location-outline" size={16} color={COLORS.slate400} style={styles.inputIcon} />
              <TextInput
                style={styles.inputInner}
                placeholder="Your city"
                placeholderTextColor={COLORS.slate300}
                value={form.city}
                onChangeText={v => handleChange('city', v)}
              />
            </View>
            {errors.city ? <Text style={styles.fieldError}>{errors.city}</Text> : null}
            {citySuggestions.length > 0 && (
              <View style={styles.suggestions}>
                {citySuggestions.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={styles.suggestionItem}
                    onPress={() => handleChange('city', c)}>
                    <Ionicons name="location-outline" size={13} color={COLORS.slate400} />
                    <Text style={styles.suggestionText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* WhatsApp */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{'WhatsApp Number (optional)'}</Text>
            <View style={[styles.inputRow, errors.whatsapp ? styles.inputRowError : null]}>
              <View style={styles.waIconBox}>
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
              </View>
              <View style={styles.vertDivider} />
              <TextInput
                style={styles.inputInner}
                placeholder="Same as mobile"
                placeholderTextColor={COLORS.slate300}
                keyboardType="phone-pad"
                maxLength={10}
                value={form.whatsapp}
                onChangeText={v => handleChange('whatsapp', v.replace(/D/g, ''))}
              />
            </View>
            {errors.whatsapp ? <Text style={styles.fieldError}>{errors.whatsapp}</Text> : null}
          </View>

          {/* Bio */}
          <View style={styles.fieldWrap}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>{'Bio (optional)'}</Text>
              <Text style={styles.charCount}>{form.bio.length}/150</Text>
            </View>
            <TextInput
              style={[styles.inputRow, styles.textArea]}
              placeholder="Tell travelers a bit about yourself…"
              placeholderTextColor={COLORS.slate300}
              multiline
              numberOfLines={3}
              maxLength={150}
              value={form.bio}
              onChangeText={v => handleChange('bio', v)}
              textAlignVertical="top"
            />
          </View>
        </AppCard>

        {/* ── Role selector ───────────────────────────────────────── */}
        <View style={styles.roleSection}>
          <Text style={styles.roleHeading}>I am joining as</Text>
          <View style={styles.roleRow}>
            {ROLES.map(opt => {
              const active = form.role === opt.role;
              return (
                <TouchableOpacity
                  key={opt.role}
                  style={[
                    styles.roleCard,
                    active && { borderColor: opt.color, backgroundColor: opt.bg },
                  ]}
                  onPress={() => handleChange('role', opt.role)}
                  activeOpacity={0.8}>
                  {active && (
                    <View style={[styles.roleCheckmark, { backgroundColor: opt.color }]}>
                      <Ionicons name="checkmark" size={12} color={COLORS.white} />
                    </View>
                  )}
                  <View style={[styles.roleEmojiCircle, { backgroundColor: active ? opt.color : COLORS.slate100 }]}>
                    <Text style={styles.roleEmoji}>{opt.emoji}</Text>
                  </View>
                  <Text style={[styles.roleLabel, active && { color: opt.color }]}>{opt.label}</Text>
                  <Text style={styles.roleSub}>{opt.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Submit ──────────────────────────────────────────────── */}
        <View style={styles.btnWrap}>
          <AppButton
            label={form.role === 'rider' ? 'Save & Upload Vehicle Docs' : 'Save & Continue'}
            variant="primary"
            fullWidth
            loading={loading}
            onPress={onSubmit}
            style={styles.submitBtn}
          />
          {form.role === 'rider' && (
            <Text style={styles.stepHint}>
              {'Next: Upload RC / DL for verification'}
            </Text>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
});

export default ProfileSetupScreen;

const AVATAR_SIZE = 88;

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: COLORS.background },

  // Header bar
  headerBar:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.slate100 },
  backBtn:         { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.slate100 },
  progressArea:    { flex: 1, paddingHorizontal: 12 },
  progressTrack:   { height: 4, backgroundColor: COLORS.slate200, borderRadius: 2, overflow: 'hidden' },
  progressFill:    { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  stepLabel:       { fontSize: 12, fontWeight: '600', color: COLORS.slate500, minWidth: 36, textAlign: 'right' },

  scroll:          { paddingBottom: 48 },
  heading:         { fontSize: 26, fontWeight: '800', color: COLORS.slate900, textAlign: 'center', marginTop: 24, letterSpacing: -0.3 },
  subtext:         { fontSize: 14, color: COLORS.slate400, textAlign: 'center', marginTop: 6, marginBottom: 24 },

  // Avatar
  avatarWrap:       { alignSelf: 'center', marginBottom: 4, position: 'relative' },
  avatar:           { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarPlaceholder:{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  avatarInitials:   { fontSize: 30, fontWeight: '800', color: COLORS.white },
  avatarOverlay:    { position: 'absolute', width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: 'rgba(0,0,0,0.38)', alignItems: 'center', justifyContent: 'center' },
  avatarOverlayText:{ fontSize: 13, fontWeight: '700', color: COLORS.white },
  cameraBadge:      { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white, ...SHADOWS.sm },
  avatarHint:       { textAlign: 'center', fontSize: 11, color: COLORS.slate400, marginBottom: 20 },

  // Form card
  formCard:         { marginHorizontal: 16, borderRadius: 20, padding: 20, marginBottom: 4 },
  sectionLabel:     { fontSize: 10, fontWeight: '700', color: COLORS.slate500, letterSpacing: 1.1, marginBottom: 16 },
  fieldWrap:        { marginBottom: 16 },
  fieldLabel:       { fontSize: 12, fontWeight: '600', color: COLORS.slate600, marginBottom: 6 },
  required:         { color: COLORS.danger },
  fieldLabelRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  charCount:        { fontSize: 11, color: COLORS.slate400 },
  inputRow:         { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.slate200, borderRadius: 12, backgroundColor: COLORS.white, minHeight: 48 },
  inputRowError:    { borderColor: COLORS.danger },
  inputIcon:        { paddingLeft: 12, paddingRight: 4 },
  inputInner:       { flex: 1, paddingHorizontal: 10, paddingVertical: 10, fontSize: 15, color: COLORS.slate900 },
  textArea:         { alignItems: 'flex-start', paddingHorizontal: 12, paddingVertical: 10, minHeight: 80, fontSize: 15, color: COLORS.slate900 },
  waIconBox:        { paddingHorizontal: 12, paddingVertical: 10 },
  vertDivider:      { width: 1, height: 28, backgroundColor: COLORS.slate200 },
  fieldError:       { fontSize: 11, color: COLORS.danger, marginTop: 4 },
  suggestions:      { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.slate200, borderRadius: 10, marginTop: 4, overflow: 'hidden', ...SHADOWS.xs },
  suggestionItem:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.slate100 },
  suggestionText:   { fontSize: 14, color: COLORS.slate700 },

  // Role selector
  roleSection:      { marginHorizontal: 16, marginTop: 20 },
  roleHeading:      { fontSize: 17, fontWeight: '700', color: COLORS.slate900, marginBottom: 12 },
  roleRow:          { flexDirection: 'row', gap: 12 },
  roleCard:         {
    flex: 1, borderWidth: 2, borderColor: COLORS.slate200, borderRadius: 16,
    padding: 16, alignItems: 'center', backgroundColor: COLORS.white,
    position: 'relative', ...SHADOWS.xs,
  },
  roleCheckmark:    { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  roleEmojiCircle:  { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  roleEmoji:        { fontSize: 26 },
  roleLabel:        { fontSize: 15, fontWeight: '700', color: COLORS.slate700, textAlign: 'center' },
  roleSub:          { fontSize: 11, color: COLORS.slate400, textAlign: 'center', marginTop: 3 },

  // Submit
  btnWrap:          { marginHorizontal: 16, marginTop: 24 },
  submitBtn:        { height: 56 },
  stepHint:         { textAlign: 'center', fontSize: 12, color: COLORS.slate400, marginTop: 10 },
});
