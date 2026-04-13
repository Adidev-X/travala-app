// ─── PostFullTourScreen ───────────────────────────────────────────────────────
// Multi-section form for creating a full-tour trip (multi-day itinerary).
// Uses usePostTrip hook for all state + validation.

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
import { useAuthStore } from '../../store/authStore';

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
      {error ? (
        <Text style={ss.fieldError}>{error}</Text>
      ) : null}
    </View>
  );
}

interface StepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}
function Stepper({ label, value, min = 0, max = 99, onChange }: StepperProps) {
  return (
    <View style={ss.stepperRow}>
      <Text style={ss.stepperLabel}>{label}</Text>
      <View style={ss.stepperControls}>
        <TouchableOpacity
          style={[ss.stepBtn, value <= min && ss.stepBtnDisabled]}
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          activeOpacity={0.75}
        >
          <Ionicons name="remove" size={18} color={value <= min ? colors.text.hint : colors.primary} />
        </TouchableOpacity>
        <Text style={ss.stepValue}>{value}</Text>
        <TouchableOpacity
          style={[ss.stepBtn, value >= max && ss.stepBtnDisabled]}
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          activeOpacity={0.75}
        >
          <Ionicons name="add" size={18} color={value >= max ? colors.text.hint : colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PostFullTourScreen() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  // Vehicle info comes from auth store (profile has vehicle after verification)
  // We pass null here; hook uses vehicle?.ac for AC default, vehicle?.seats for max
  const vehicle = null; // TODO: wire up when vehicle store is available

  const {
    form,
    errors,
    loading,
    submitError,
    setField,
    addStop,
    removeStop,
    addDestination,
    removeDestination,
    addDay,
    removeDay,
    updateDayDesc,
    addPhoto,
    removePhoto,
    submit,
  } = usePostTrip('full_tour', vehicle);

  const maxSeats = config.MAX_SEATS;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    const trip = await submit();
    if (trip) {
      Alert.alert('Trip Posted!', 'Your Full Tour has been posted.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/trips') },
      ]);
    }
  }, [submit, router]);

  const handleSeatsInc = useCallback(
    () => setField('seats', Math.min(maxSeats, form.seats + 1)),
    [setField, form.seats, maxSeats],
  );
  const handleSeatsDec = useCallback(
    () => setField('seats', Math.max(1, form.seats - 1)),
    [setField, form.seats],
  );

  const handleDaysInc = useCallback(
    () => setField('days', form.days + 1),
    [setField, form.days],
  );
  const handleDaysDec = useCallback(
    () => setField('days', Math.max(1, form.days - 1)),
    [setField, form.days],
  );
  const handleNightsInc = useCallback(
    () => setField('nights', form.nights + 1),
    [setField, form.nights],
  );
  const handleNightsDec = useCallback(
    () => setField('nights', Math.max(0, form.nights - 1)),
    [setField, form.nights],
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
        {/* ── Error banner ── */}
        {submitError ? (
          <View style={ss.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={ss.errorBannerText}>{submitError}</Text>
          </View>
        ) : null}

        {/* ════════════════════════════════════════════
            Section 1 — Basic Info
        ════════════════════════════════════════════ */}
        <Section title="Basic Info">
          <Field label="Trip Title *" error={errors.title}>
            <TextInput
              style={[ss.input, errors.title && ss.inputError]}
              value={form.title}
              onChangeText={v => setField('title', v)}
              placeholder="e.g. Himalayan Circuit 2026"
              placeholderTextColor={colors.text.hint}
              returnKeyType="next"
            />
          </Field>

          <Field label="Starting Point *" error={errors.from}>
            <TextInput
              style={[ss.input, errors.from && ss.inputError]}
              value={form.from}
              onChangeText={v => setField('from', v)}
              placeholder="Departure city"
              placeholderTextColor={colors.text.hint}
              returnKeyType="next"
            />
          </Field>

          {/* Days + Nights steppers */}
          <View style={ss.stepperPair}>
            <Stepper
              label="Days"
              value={form.days}
              min={1}
              max={30}
              onChange={v => setField('days', v)}
            />
            <Stepper
              label="Nights"
              value={form.nights}
              min={0}
              max={30}
              onChange={v => setField('nights', v)}
            />
          </View>

          <Field label="Start Date (YYYY-MM-DD) *" error={errors.startDate}>
            <TextInput
              style={[ss.input, errors.startDate && ss.inputError]}
              value={form.startDate}
              onChangeText={v => setField('startDate', v)}
              placeholder="2026-06-15"
              placeholderTextColor={colors.text.hint}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </Field>

          <Field label="End Date (YYYY-MM-DD) *" error={errors.endDate}>
            <TextInput
              style={[ss.input, errors.endDate && ss.inputError]}
              value={form.endDate}
              onChangeText={v => setField('endDate', v)}
              placeholder="2026-06-20"
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
              placeholder="e.g. 06:00 AM"
              placeholderTextColor={colors.text.hint}
            />
          </Field>
        </Section>

        {/* ════════════════════════════════════════════
            Section 2 — Route
        ════════════════════════════════════════════ */}
        <Section title="Route">
          <Field label="Destinations (Kahan jayenge) *" error={errors.destinations}>
            <TagInput
              tags={form.destinations}
              onAdd={addDestination}
              onRemove={removeDestination}
              placeholder="Add city/place, press Enter"
              error={errors.destinations}
            />
          </Field>

          {/* Day-wise Itinerary */}
          <View style={ss.fieldWrap}>
            <Text style={ss.fieldLabel}>Day-wise Itinerary</Text>
            {form.itinerary.map((day, idx) => (
              <View key={idx} style={ss.dayRow}>
                <Text style={ss.dayLabel}>Day {day.day}</Text>
                <TextInput
                  style={[ss.input, ss.dayInput]}
                  value={day.description}
                  onChangeText={v => updateDayDesc(idx, v)}
                  placeholder="Activities, places, stay…"
                  placeholderTextColor={colors.text.hint}
                />
                {form.itinerary.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeDay(idx)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={ss.addDayBtn} onPress={addDay} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
              <Text style={ss.addDayText}>Add Day</Text>
            </TouchableOpacity>
          </View>

          <Field label="Stops / Halts (optional)">
            <TagInput
              tags={form.stops}
              onAdd={addStop}
              onRemove={removeStop}
              placeholder="Add intermediate stop"
            />
          </Field>

          <Field label="Restrictions (Kahan nahi jayenge — optional)">
            <TextInput
              style={[ss.input, ss.textArea]}
              value={form.restrictions}
              onChangeText={v => setField('restrictions', v)}
              placeholder="e.g. No Leh due to road conditions"
              placeholderTextColor={colors.text.hint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Field>
        </Section>

        {/* ════════════════════════════════════════════
            Section 3 — Seats & Cost
        ════════════════════════════════════════════ */}
        <Section title="Seats & Cost">
          {/* Seats stepper */}
          <View style={ss.fieldWrap}>
            <Text style={ss.fieldLabel}>
              Seats Available (max {maxSeats}) *
            </Text>
            <View style={ss.inlineRow}>
              <TouchableOpacity
                style={[ss.stepBtn, form.seats <= 1 && ss.stepBtnDisabled]}
                onPress={handleSeatsDec}
                disabled={form.seats <= 1}
                activeOpacity={0.75}
              >
                <Ionicons name="remove" size={18} color={form.seats <= 1 ? colors.text.hint : colors.primary} />
              </TouchableOpacity>
              <Text style={ss.stepValueLarge}>{form.seats}</Text>
              <TouchableOpacity
                style={[ss.stepBtn, form.seats >= maxSeats && ss.stepBtnDisabled]}
                onPress={handleSeatsInc}
                disabled={form.seats >= maxSeats}
                activeOpacity={0.75}
              >
                <Ionicons name="add" size={18} color={form.seats >= maxSeats ? colors.text.hint : colors.primary} />
              </TouchableOpacity>
            </View>
            {errors.seats ? <Text style={ss.fieldError}>{errors.seats}</Text> : null}
          </View>

          <Field label="Cost per Person (₹) *" error={errors.costPerPerson}>
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
            <Text style={ss.toggleLabel}>Ladies Only</Text>
            <Switch
              value={form.ladiesOnly}
              onValueChange={v => setField('ladiesOnly', v)}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

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
              placeholder="e.g. One bag per person, no large luggage"
              placeholderTextColor={colors.text.hint}
            />
          </Field>

          <Field label="Special Notes (optional)">
            <TextInput
              style={[ss.input, ss.textArea]}
              value={form.notes}
              onChangeText={v => setField('notes', v)}
              placeholder="Any extra information for travelers…"
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
                <View style={ss.photoRemoveOverlay}>
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

        {/* ── Submit ── */}
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

  // Error banner
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

  // Section
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

  // Fields
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

  // Steppers
  stepperPair: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  stepperRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  stepperLabel: { fontSize: fontSize.sm, color: colors.text.secondary },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.primary}14`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: { backgroundColor: colors.border },
  stepValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },

  // Itinerary
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  dayLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.primary,
    width: 42,
  },
  dayInput: { flex: 1, marginBottom: 0 },
  addDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  addDayText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },

  // Seats
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepValueLarge: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    minWidth: 36,
    textAlign: 'center',
  },

  // Cost
  costRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rupeeSign: { fontSize: fontSize.lg, color: colors.text.secondary, fontWeight: fontWeight.semiBold },
  costInput: { flex: 1, marginBottom: 0 },
  costNote: { fontSize: fontSize.xs, color: colors.text.hint, marginTop: 4, lineHeight: 16 },

  // Toggles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  toggleLabel: { fontSize: fontSize.sm, color: colors.text.primary },

  // Photos
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xs },
  photoSlot: { width: 88, height: 88, borderRadius: 10, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoRemoveOverlay: {
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

  // Submit
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
