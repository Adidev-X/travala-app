// ─── PostOneWayScreen ─────────────────────────────────────────────────────────
// Simpler single-day one-way trip posting form.
// Uses usePostTrip('one_way', vehicle) for all state + validation.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import TagInput from '../../components/TagInput';
import colors from '../../constants/colors';
import config from '../../constants/config';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';
import { usePostTrip } from '../../hooks/usePostTrip';

// ─── Shared sub-components ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={ss.section}>
      <Text style={ss.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={ss.fieldWrap}>
      <Text style={ss.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={ss.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PostOneWayScreen() {
  const router = useRouter();

  // Vehicle comes from auth store / vehicle store; pass null until wired up
  const vehicle = null; // TODO: wire when vehicle store is ready

  const {
    form,
    errors,
    loading,
    submitError,
    setField,
    addStop,
    removeStop,
    addPhoto,
    removePhoto,
    submit,
  } = usePostTrip('one_way', vehicle);

  const maxSeats = config.MAX_SEATS;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    const trip = await submit();
    if (trip) {
      Alert.alert('Trip Posted!', 'Your One-Way ride has been posted.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/trips') },
      ]);
    }
  }, [submit, router]);

  const decSeats = useCallback(
    () => setField('seats', Math.max(1, form.seats - 1)),
    [setField, form.seats],
  );
  const incSeats = useCallback(
    () => setField('seats', Math.min(maxSeats, form.seats + 1)),
    [setField, form.seats, maxSeats],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={ss.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={ss.container}
        contentContainerStyle={ss.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Error banner */}
        {submitError ? (
          <View style={ss.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={ss.errorBannerText}>{submitError}</Text>
          </View>
        ) : null}

        {/* ════════════════════════════════════════════
            Section 1 — Route
        ════════════════════════════════════════════ */}
        <Section title="Route">
          <Field label="From (Starting city) *" error={errors.from}>
            <TextInput
              style={[ss.input, errors.from && ss.inputError]}
              value={form.from}
              onChangeText={v => setField('from', v)}
              placeholder="e.g. Chandigarh"
              placeholderTextColor={colors.text.hint}
              returnKeyType="next"
            />
          </Field>

          <Field label="To (Destination city) *" error={errors.to}>
            <TextInput
              style={[ss.input, errors.to && ss.inputError]}
              value={form.to}
              onChangeText={v => setField('to', v)}
              placeholder="e.g. Manali"
              placeholderTextColor={colors.text.hint}
              returnKeyType="next"
            />
          </Field>

          <Field label="Intermediate Stops (optional)">
            <TagInput
              tags={form.stops}
              onAdd={addStop}
              onRemove={removeStop}
              placeholder="Add stop, press Enter"
            />
          </Field>

          <Field label="Restrictions (optional)">
            <TextInput
              style={[ss.input, ss.textArea]}
              value={form.restrictions}
              onChangeText={v => setField('restrictions', v)}
              placeholder="e.g. No Rohtang Pass if closed"
              placeholderTextColor={colors.text.hint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Field>
        </Section>

        {/* ════════════════════════════════════════════
            Section 2 — Schedule
        ════════════════════════════════════════════ */}
        <Section title="Schedule">
          <Field label="Date (YYYY-MM-DD) *" error={errors.date}>
            <TextInput
              style={[ss.input, errors.date && ss.inputError]}
              value={form.date}
              onChangeText={v => setField('date', v)}
              placeholder="2026-06-15"
              placeholderTextColor={colors.text.hint}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </Field>

          <Field label="Departure Time *" error={errors.departureTime}>
            <TextInput
              style={[ss.input, errors.departureTime && ss.inputError]}
              value={form.departureTime}
              onChangeText={v => setField('departureTime', v)}
              placeholder="e.g. 06:30 AM"
              placeholderTextColor={colors.text.hint}
            />
          </Field>
        </Section>

        {/* ════════════════════════════════════════════
            Section 3 — Seats & Cost
        ════════════════════════════════════════════ */}
        <Section title="Seats & Cost">
          {/* Seats stepper */}
          <View style={ss.fieldWrap}>
            <Text style={ss.fieldLabel}>Seats Available (max {maxSeats}) *</Text>
            <View style={ss.stepperRow}>
              <TouchableOpacity
                style={[ss.stepBtn, form.seats <= 1 && ss.stepBtnDisabled]}
                onPress={decSeats}
                disabled={form.seats <= 1}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={form.seats <= 1 ? colors.text.hint : colors.primary}
                />
              </TouchableOpacity>
              <Text style={ss.stepValue}>{form.seats}</Text>
              <TouchableOpacity
                style={[ss.stepBtn, form.seats >= maxSeats && ss.stepBtnDisabled]}
                onPress={incSeats}
                disabled={form.seats >= maxSeats}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={form.seats >= maxSeats ? colors.text.hint : colors.primary}
                />
              </TouchableOpacity>
            </View>
            {errors.seats ? <Text style={ss.fieldError}>{errors.seats}</Text> : null}
          </View>

          {/* Cost */}
          <Field label="Cost per Seat (₹) *" error={errors.costPerPerson}>
            <View style={ss.costRow}>
              <Text style={ss.rupeeSign}>₹</Text>
              <TextInput
                style={[ss.input, ss.costInput, errors.costPerPerson && ss.inputError]}
                value={form.costPerPerson > 0 ? String(form.costPerPerson) : ''}
                onChangeText={v => setField('costPerPerson', parseFloat(v) || 0)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text.hint}
              />
            </View>
            <Text style={ss.costNote}>
              This is an estimate — payment is settled directly with travelers.
            </Text>
          </Field>
        </Section>

        {/* ════════════════════════════════════════════
            Section 4 — Preferences
        ════════════════════════════════════════════ */}
        <Section title="Preferences">
          <View style={ss.toggleRow}>
            <Text style={ss.toggleLabel}>AC Available</Text>
            <Switch
              value={form.ac}
              onValueChange={v => setField('ac', v)}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

          <Field label="Luggage Policy (optional)">
            <TextInput
              style={ss.input}
              value={form.luggagePolicy}
              onChangeText={v => setField('luggagePolicy', v)}
              placeholder="e.g. One carry-on bag per person"
              placeholderTextColor={colors.text.hint}
            />
          </Field>

          <Field label="Special Notes (optional)">
            <TextInput
              style={[ss.input, ss.textArea]}
              value={form.notes}
              onChangeText={v => setField('notes', v)}
              placeholder="Any extra info for travelers…"
              placeholderTextColor={colors.text.hint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Field>
        </Section>

        {/* ════════════════════════════════════════════
            Section 5 — Photos
        ════════════════════════════════════════════ */}
        <Section title={`Photos (${form.photos.length}/${config.MAX_PHOTOS})`}>
          <View style={ss.photoGrid}>
            {form.photos.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                style={ss.photoSlot}
                onPress={() => removePhoto(idx)}
                activeOpacity={0.85}
              >
                <Image source={{ uri }} style={ss.photoImage} resizeMode="cover" />
                <View style={ss.photoOverlay}>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
            {form.photos.length < config.MAX_PHOTOS && (
              <TouchableOpacity
                style={ss.photoAdd}
                onPress={addPhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={28} color={colors.primary} />
                <Text style={ss.photoAddText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={ss.photoHint}>Tap a photo to remove it. Max 5 photos.</Text>
        </Section>

        {/* Submit */}
        <TouchableOpacity
          style={[ss.submitBtn, loading && ss.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={ss.submitBtnText}>
            {loading ? 'Posting…' : 'Preview & Post'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.danger}0d`,
    borderWidth: 1,
    borderColor: `${colors.danger}44`,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: { flex: 1, fontSize: fontSize.sm, color: colors.danger, lineHeight: 18 },

  section: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },

  fieldWrap: { marginBottom: spacing.sm },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: 5,
  },
  fieldError: { fontSize: fontSize.xs, color: colors.danger, marginTop: 3 },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: fontSize.sm,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.danger },
  textArea: { height: 80, textAlignVertical: 'top' },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}14`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: { backgroundColor: colors.border },
  stepValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    minWidth: 36,
    textAlign: 'center',
  },

  costRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rupeeSign: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    fontWeight: fontWeight.semiBold,
  },
  costInput: { flex: 1, marginBottom: 0 },
  costNote: { fontSize: fontSize.xs, color: colors.text.hint, marginTop: 4, lineHeight: 16 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  toggleLabel: { fontSize: fontSize.sm, color: colors.text.primary },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xs },
  photoSlot: { width: 88, height: 88, borderRadius: 10, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoAdd: {
    width: 88,
    height: 88,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  photoAddText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.medium },
  photoHint: { fontSize: fontSize.xs, color: colors.text.hint },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 13,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.xs,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: '#fff' },
});
