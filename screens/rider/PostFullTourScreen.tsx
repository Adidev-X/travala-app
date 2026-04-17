/**
 * PostFullTourScreen — redesigned 2025. WHITE theme.
 * Sticky header, sectioned form cards, photo grid, sticky bottom CTA.
 */
import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import config from '@/constants/config';
import { usePostTrip } from '@/hooks/usePostTrip';
import { useAuthStore } from '@/store/authStore';
import TagInput from '@/components/TagInput';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import {
  Alert,
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

// ─── Section card (visual grouping) ───────────────────────────────────────
interface SectionCardProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}
const SectionCard = React.memo(function SectionCard({ iconName, iconColor, iconBg, title, subtitle, children }: SectionCardProps) {
  return (
    <View style={ss.sectionCard}>
      <View style={ss.sectionHeaderRow}>
        <View style={[ss.sectionIconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={16} color={iconColor} />
        </View>
        <View>
          <Text style={ss.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={ss.sectionSub}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={ss.sectionDivider} />
      {children}
    </View>
  );
});

// ─── Field with label ─────────────────────────────────────────────────────
interface FieldProps { label: string; error?: string; children: React.ReactNode }
const Field = React.memo(function Field({ label, error, children }: FieldProps) {
  return (
    <View style={ss.fieldWrap}>
      <Text style={ss.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={ss.fieldError}>{error}</Text> : null}
      <View style={ss.fieldDivider} />
    </View>
  );
});

// ─── Stepper ─────────────────────────────────────────────────────────────
interface StepperProps { label: string; value: number; min?: number; max?: number; onChange: (v: number) => void }
const Stepper = React.memo(function Stepper({ label, value, min = 0, max = 99, onChange }: StepperProps) {
  return (
    <View style={ss.stepperRow}>
      <Text style={ss.stepperLabel}>{label}</Text>
      <View style={ss.stepperControls}>
        <TouchableOpacity
          style={[ss.stepBtn, value <= min && ss.stepBtnDisabled]}
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          activeOpacity={0.75}>
          <Ionicons name="remove" size={16} color={value <= min ? COLORS.slate300 : COLORS.primary} />
        </TouchableOpacity>
        <Text style={ss.stepValue}>{value}</Text>
        <TouchableOpacity
          style={[ss.stepBtn, value >= max && ss.stepBtnDisabled]}
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          activeOpacity={0.75}>
          <Ionicons name="add" size={16} color={value >= max ? COLORS.slate300 : COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─── Toggle row ────────────────────────────────────────────────────────────
interface ToggleRowProps { label: string; value: boolean; onChange: (v: boolean) => void }
const ToggleRow = React.memo(function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <View style={ss.toggleRow}>
      <Text style={ss.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: COLORS.primary, false: COLORS.slate200 }}
        thumbColor={COLORS.white}
      />
    </View>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────
const PostFullTourScreen = React.memo(function PostFullTourScreen() {
  const router = useRouter();
  const vehicle = null;

  const {
    form, errors, loading, submitError,
    setField, addStop, removeStop,
    addDestination, removeDestination,
    addDay, removeDay, updateDayDesc,
    addPhoto, removePhoto, submit, validateForm,
  } = usePostTrip('full_tour', vehicle);

  const maxSeats = config.MAX_SEATS;
  // VALIDATION ADDED: scrollRef for scroll-to-first-error
  const scrollRef = useRef<ScrollView>(null);

  const handleSubmit = useCallback(async () => {
    // VALIDATION ADDED: validate before API call, scroll to first error if any
    const valid = validateForm();
    if (!valid) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const trip = await submit();
    if (trip) {
      Alert.alert('Trip Posted!', 'Your Full Tour has been posted.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/trips') },
      ]);
    }
  }, [submit, validateForm, router]);

  return (
    <View style={ss.root}>
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <View style={ss.stickyHeader}>
        <TouchableOpacity style={ss.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/trips')}>
          <Ionicons name="arrow-back" size={22} color={COLORS.slate700} />
        </TouchableOpacity>
        <Text style={ss.headerTitle}>Post Full Tour</Text>
        <View style={ss.stepPill}>
          <Text style={ss.stepPillText}>1/3</Text>
        </View>
      </View>

      {/* FIX: Android needs 'height' — undefined disables KAV on Android */}
      <KeyboardAvoidingView style={ss.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* VALIDATION ADDED: scrollRef for scroll-to-first-error */}
        <ScrollView
          ref={scrollRef}
          style={ss.scroll}
          contentContainerStyle={ss.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Error banner */}
          {submitError ? (
            <View style={ss.errorBanner}>
              <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} />
              <Text style={ss.errorBannerText}>{submitError}</Text>
            </View>
          ) : null}

          {/* ── Section 1: Basic Info ──────────────────────────────── */}
          <SectionCard
            iconName="information-circle-outline"
            iconColor={COLORS.primary}
            iconBg={COLORS.primaryBg}
            title="Basic Info"
            subtitle="Trip title, dates & departure">

            <Field label="Trip Title *" error={errors.title}>
              <TextInput
                style={[ss.input, errors.title && ss.inputError]}
                value={form.title}
                onChangeText={v => setField('title', v)}
                placeholder="e.g. Himalayan Circuit 2026"
                placeholderTextColor={COLORS.slate300}
                returnKeyType="next"
              />
            </Field>

            <Field label="Starting Point *" error={errors.from}>
              <TextInput
                style={[ss.input, errors.from && ss.inputError]}
                value={form.from}
                onChangeText={v => setField('from', v)}
                placeholder="Departure city"
                placeholderTextColor={COLORS.slate300}
                returnKeyType="next"
              />
            </Field>

            <View style={ss.stepperPair}>
              <Stepper label="Days" value={form.days} min={1} max={30} onChange={v => setField('days', v)} />
              <Stepper label="Nights" value={form.nights} min={0} max={30} onChange={v => setField('nights', v)} />
            </View>

            <Field label="Start Date (YYYY-MM-DD) *" error={errors.startDate}>
              <TextInput
                style={[ss.input, errors.startDate && ss.inputError]}
                value={form.startDate}
                onChangeText={v => setField('startDate', v)}
                placeholder="2026-06-15"
                placeholderTextColor={COLORS.slate300}
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
                placeholderTextColor={COLORS.slate300}
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
                placeholderTextColor={COLORS.slate300}
              />
            </Field>
          </SectionCard>

          {/* ── Section 2: Route ───────────────────────────────────── */}
          <SectionCard
            iconName="map-outline"
            iconColor={COLORS.purple}
            iconBg={COLORS.purpleLight}
            title="Route"
            subtitle="Destinations, itinerary & stops">

            <Field label="Destinations *" error={errors.destinations}>
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
                  <View style={ss.dayBadge}>
                    <Text style={ss.dayBadgeText}>D{day.day}</Text>
                  </View>
                  <TextInput
                    style={[ss.input, ss.dayInput]}
                    value={day.description}
                    onChangeText={v => updateDayDesc(idx, v)}
                    placeholder={`Day ${day.day}: activities, places, stay…`}
                    placeholderTextColor={COLORS.slate300}
                  />
                  {form.itinerary.length > 1 && (
                    <TouchableOpacity onPress={() => removeDay(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={ss.addRowBtn} onPress={addDay} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
                <Text style={ss.addRowText}>Add Day</Text>
              </TouchableOpacity>
              <View style={ss.fieldDivider} />
            </View>

            <Field label="Stops / Halts (optional)">
              <TagInput
                tags={form.stops}
                onAdd={addStop}
                onRemove={removeStop}
                placeholder="Add intermediate stop"
              />
            </Field>

            <Field label="Restrictions (optional)">
              <TextInput
                style={[ss.input, ss.textArea]}
                value={form.restrictions}
                onChangeText={v => setField('restrictions', v)}
                placeholder="e.g. No Leh due to road conditions"
                placeholderTextColor={COLORS.slate300}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </Field>
          </SectionCard>

          {/* ── Section 3: Seats & Cost ────────────────────────────── */}
          <SectionCard
            iconName="cash-outline"
            iconColor={COLORS.success}
            iconBg={COLORS.successLight}
            title="Seats &amp; Cost"
            subtitle="How many can join &amp; at what price">

            <View style={ss.fieldWrap}>
              <Text style={ss.fieldLabel}>Seats Available (max {maxSeats}) *</Text>
              <View style={ss.seatsRow}>
                <TouchableOpacity
                  style={[ss.stepBtn, form.seats <= 1 && ss.stepBtnDisabled]}
                  onPress={() => setField('seats', Math.max(1, form.seats - 1))}
                  disabled={form.seats <= 1}
                  activeOpacity={0.75}>
                  <Ionicons name="remove" size={20} color={form.seats <= 1 ? COLORS.slate300 : COLORS.primary} />
                </TouchableOpacity>
                <Text style={ss.seatsValueLarge}>{form.seats}</Text>
                <TouchableOpacity
                  style={[ss.stepBtn, form.seats >= maxSeats && ss.stepBtnDisabled]}
                  onPress={() => setField('seats', Math.min(maxSeats, form.seats + 1))}
                  disabled={form.seats >= maxSeats}
                  activeOpacity={0.75}>
                  <Ionicons name="add" size={20} color={form.seats >= maxSeats ? COLORS.slate300 : COLORS.primary} />
                </TouchableOpacity>
              </View>
              {errors.seats ? <Text style={ss.fieldError}>{errors.seats}</Text> : null}
              <View style={ss.fieldDivider} />
            </View>

            <Field label="Cost per Person (₹) *" error={errors.costPerPerson}>
              <View style={ss.costRow}>
                <View style={ss.rupeeBox}><Text style={ss.rupeeSign}>₹</Text></View>
                <TextInput
                  style={[ss.input, ss.costInput, errors.costPerPerson && ss.inputError]}
                  value={form.costPerPerson > 0 ? String(form.costPerPerson) : ''}
                  onChangeText={v => setField('costPerPerson', parseFloat(v) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.slate300}
                />
              </View>
              <Text style={ss.costNote}>Estimate — payment settled directly with travelers</Text>
            </Field>
          </SectionCard>

          {/* ── Section 4: Preferences ─────────────────────────────── */}
          <SectionCard
            iconName="options-outline"
            iconColor={COLORS.accent}
            iconBg={COLORS.accentLight}
            title="Preferences"
            subtitle="Filters &amp; special notes">

            <ToggleRow label="Ladies Only" value={form.ladiesOnly} onChange={v => setField('ladiesOnly', v)} />
            <ToggleRow label="AC Available" value={form.ac} onChange={v => setField('ac', v)} />

            <Field label="Luggage Policy (optional)">
              <TextInput
                style={ss.input}
                value={form.luggagePolicy}
                onChangeText={v => setField('luggagePolicy', v)}
                placeholder="e.g. One bag per person, no large luggage"
                placeholderTextColor={COLORS.slate300}
              />
            </Field>

            <Field label="Special Notes (optional)">
              <TextInput
                style={[ss.input, ss.textArea]}
                value={form.notes}
                onChangeText={v => setField('notes', v)}
                placeholder="Any extra information for travelers…"
                placeholderTextColor={COLORS.slate300}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </Field>
          </SectionCard>

          {/* ── Section 5: Photos ──────────────────────────────────── */}
          <SectionCard
            iconName="camera-outline"
            iconColor={COLORS.purple}
            iconBg={COLORS.purpleLight}
            title={`Photos (${form.photos.length}/${config.MAX_PHOTOS})`}
            subtitle="Show travelers what to expect">

            <View style={ss.photoGrid}>
              {/* Filled slots */}
              {form.photos.map((uri, idx) => (
                <View key={idx} style={ss.photoSlot}>
                  <Image source={{ uri }} style={ss.photoImage} contentFit="cover" />
                  <TouchableOpacity
                    style={ss.photoRemoveBtn}
                    onPress={() => removePhoto(idx)}>
                    <Ionicons name="close" size={10} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {/* Empty slots */}
              {form.photos.length < config.MAX_PHOTOS && (
                <TouchableOpacity style={ss.photoEmpty} onPress={addPhoto} activeOpacity={0.8}>
                  <Ionicons name="camera-outline" size={24} color={COLORS.slate300} />
                  <Text style={ss.photoEmptyText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </SectionCard>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Sticky bottom bar ─────────────────────────────────────── */}
      <View style={ss.stickyBottom}>
        <AppButton
          label={loading ? 'Posting…' : 'Preview & Post'}
          variant="accent"
          fullWidth
          loading={loading}
          onPress={handleSubmit}
          style={ss.submitBtn}
        />
      </View>
    </View>
  );
});

export default PostFullTourScreen;

const ss = StyleSheet.create({
  root:    { flex: 1, backgroundColor: COLORS.background },
  flex:    { flex: 1 },
  scroll:  { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Sticky header
  stickyHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.slate100,
    ...SHADOWS.xs,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.slate100, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.slate900 },
  stepPill:    { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  stepPillText:{ fontSize: 12, fontWeight: '700', color: COLORS.white },

  // Section card
  sectionCard:       { backgroundColor: COLORS.white, borderRadius: 16, margin: 16, marginBottom: 0, padding: 16, ...SHADOWS.xs },
  sectionHeaderRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sectionTitle:      { fontSize: 15, fontWeight: '700', color: COLORS.slate900 },
  sectionSub:        { fontSize: 12, color: COLORS.slate400, marginTop: 1 },
  sectionDivider:    { height: 1, backgroundColor: COLORS.slate100, marginBottom: 14 },

  // Fields
  fieldWrap:   { marginBottom: 4 },
  fieldLabel:  { fontSize: 12, fontWeight: '600', color: COLORS.slate600, marginBottom: 8 },
  fieldError:  { fontSize: 11, color: COLORS.danger, marginTop: 4 },
  // VALIDATION ADDED: errorText style per spec
  errorText:   { fontSize: 12, color: COLORS.danger, marginTop: 4, marginLeft: 4 },
  fieldDivider:{ height: 1, backgroundColor: COLORS.slate100, marginTop: 12, marginBottom: 12 },
  input:       {
    backgroundColor: COLORS.slate50, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 15, color: COLORS.slate900,
  },
  inputError:  { backgroundColor: COLORS.dangerLight },
  textArea:    { minHeight: 76, textAlignVertical: 'top' },

  // Steppers
  stepperPair:      { flexDirection: 'row', gap: 16, marginBottom: 12 },
  stepperRow:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.slate50, borderRadius: 10, padding: 10, marginBottom: 8 },
  stepperLabel:     { fontSize: 13, fontWeight: '600', color: COLORS.slate700 },
  stepperControls:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn:          { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOWS.xs },
  stepBtnDisabled:  { opacity: 0.4 },
  stepValue:        { fontSize: 16, fontWeight: '700', color: COLORS.slate900, minWidth: 20, textAlign: 'center' },

  // Seats stepper (full-width)
  seatsRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, backgroundColor: COLORS.slate50, borderRadius: 12, padding: 12, marginBottom: 4 },
  seatsValueLarge:  { fontSize: 32, fontWeight: '800', color: COLORS.slate900, minWidth: 40, textAlign: 'center' },

  // Day itinerary
  dayRow:           { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dayBadge:         { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center' },
  dayBadgeText:     { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  dayInput:         { flex: 1 },
  addRowBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  addRowText:       { fontSize: 14, color: COLORS.primary, fontWeight: '600' },

  // Cost
  costRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rupeeBox:   { width: 40, height: 44, backgroundColor: COLORS.slate100, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rupeeSign:  { fontSize: 18, fontWeight: '700', color: COLORS.slate600 },
  costInput:  { flex: 1 },
  costNote:   { fontSize: 11, color: COLORS.slate400, marginTop: 6, fontStyle: 'italic' },

  // Toggles
  toggleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.slate100 },
  toggleLabel:  { fontSize: 14, fontWeight: '600', color: COLORS.slate700 },

  // Photo grid (3 columns)
  photoGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoSlot:        { width: '31%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoImage:       { width: '100%', height: '100%' },
  photoRemoveBtn:   { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  photoEmpty:       { width: '31%', aspectRatio: 1, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.slate300, borderStyle: 'dashed', backgroundColor: COLORS.slate50, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoEmptyText:   { fontSize: 10, color: COLORS.slate300, fontWeight: '600' },

  // Error banner
  errorBanner:     { flexDirection: 'row', alignItems: 'center', gap: 6, margin: 16, padding: 12, backgroundColor: COLORS.dangerLight, borderRadius: 10 },
  errorBannerText: { flex: 1, fontSize: 13, color: COLORS.danger },

  // Sticky bottom
  stickyBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: COLORS.slate100,
    ...SHADOWS.lg,
  },
  submitBtn: { height: 52 },
});
