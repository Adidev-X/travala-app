/**
 * PostTripTypeScreen — redesigned 2025. WHITE theme.
 * Two option cards for Full Tour vs One-Way selection.
 */
import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import { COLORS } from '@/constants/colors';
import { SHADOWS } from '@/constants/shadows';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TripTypeKey = 'full_tour' | 'one_way';

interface TripTypeOption {
  key: TripTypeKey;
  route: '/(tabs)/trips/post-full-tour' | '/(tabs)/trips/post-one-way';
  emoji: string;
  emojiCircleBg: string;
  title: string;
  subtitle: string;
  example: string;
  chips: string[];
  selectedBorder: string;
  selectedBg: string;
  selectedColor: string;
}

const OPTIONS: TripTypeOption[] = [
  {
    key: 'full_tour',
    route: '/(tabs)/trips/post-full-tour',
    emoji: '🗺',
    emojiCircleBg: '#EDE9FE',
    title: 'Full Tour Trip',
    subtitle: 'Multi-day with complete itinerary',
    example: 'Delhi → Manali → Kasol → Delhi, 3D2N',
    chips: ['Day-wise route', 'Multiple cities', 'Multi-night'],
    selectedBorder: '#7C3AED',
    selectedBg: '#F5F3FF',
    selectedColor: '#7C3AED',
  },
  {
    key: 'one_way',
    route: '/(tabs)/trips/post-one-way',
    emoji: '🏁',
    emojiCircleBg: COLORS.primaryBg,
    title: 'One-Way Ride',
    subtitle: 'Single route, point A to B',
    example: 'Delhi → Shimla',
    chips: ['Point-to-point', 'Single day', 'Most popular'],
    selectedBorder: COLORS.primary,
    selectedBg: COLORS.primaryBg,
    selectedColor: COLORS.primary,
  },
];

// ─── Option card ─────────────────────────────────────────────────────────
interface OptionCardProps {
  option: TripTypeOption;
  selected: boolean;
  onSelect: (key: TripTypeKey) => void;
}
const OptionCard = React.memo(function OptionCard({ option, selected, onSelect }: OptionCardProps) {
  return (
    <TouchableOpacity onPress={() => onSelect(option.key)} activeOpacity={0.85}>
      <AppCard
        variant="elevated"
        style={selected
          ? { ...StyleSheet.flatten(styles.optionCard), borderWidth: 2, borderColor: option.selectedBorder, backgroundColor: option.selectedBg }
          : styles.optionCard}>
        <View style={styles.optionRow}>
          {/* Left: emoji circle */}
          <View style={[styles.emojiCircle, { backgroundColor: option.emojiCircleBg }]}>
            <Text style={styles.emoji}>{option.emoji}</Text>
          </View>

          {/* Right: text block */}
          <View style={styles.optionTextBlock}>
            <View style={styles.titleRow}>
              <Text style={[styles.optionTitle, selected && { color: option.selectedColor }]}>
                {option.title}
              </Text>
              {selected && (
                <Ionicons name="checkmark-circle" size={18} color={option.selectedColor} />
              )}
            </View>
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>

            {/* Chips */}
            <View style={styles.chipsRow}>
              {option.chips.map(chip => (
                <View key={chip} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Example route */}
        <View style={styles.exampleRow}>
          <Ionicons name="navigate-outline" size={12} color={COLORS.slate400} />
          <Text style={styles.exampleText}>{option.example}</Text>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────
const PostTripTypeScreen = React.memo(function PostTripTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<TripTypeKey | null>(null);

  const handleSelect = useCallback((key: TripTypeKey) => setSelected(key), []);

  const handleContinue = useCallback(() => {
    const opt = OPTIONS.find(o => o.key === selected);
    if (!opt) return;
    router.push(opt.route);
  }, [selected, router]);

  return (
    <View style={styles.root}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.slate700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create a Trip</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Create a Trip</Text>
        <Text style={styles.subheading}>Choose your trip type</Text>

        {/* ── Option cards ─────────────────────────────────────── */}
        <View style={styles.cardsList}>
          {OPTIONS.map(opt => (
            <OptionCard
              key={opt.key}
              option={opt}
              selected={selected === opt.key}
              onSelect={handleSelect}
            />
          ))}
        </View>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <AppButton
          label="Continue →"
          variant="primary"
          fullWidth
          disabled={!selected}
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </View>
  );
});

export default PostTripTypeScreen;

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: COLORS.background },
  headerBar:   {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.slate100,
    ...SHADOWS.xs,
  },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.slate100, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.slate900 },
  content:     { flex: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 },
  heading:     { fontSize: 24, fontWeight: '800', color: COLORS.slate900, letterSpacing: -0.3 },
  subheading:  { fontSize: 14, color: COLORS.slate400, marginTop: 4, marginBottom: 20 },
  cardsList:   { gap: 14 },
  optionCard:  { borderRadius: 20, padding: 18, borderWidth: 2, borderColor: 'transparent' },
  optionRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  emojiCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emoji:       { fontSize: 22 },
  optionTextBlock: { flex: 1 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  optionTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.slate900, flex: 1 },
  optionSubtitle: { fontSize: 13, color: COLORS.slate500, marginBottom: 8 },
  chipsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:        { backgroundColor: COLORS.slate100, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  chipText:    { fontSize: 11, color: COLORS.slate600, fontWeight: '600' },
  exampleRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.slate100 },
  exampleText: { fontSize: 11, color: COLORS.slate400, fontStyle: 'italic', flex: 1 },
  continueBtn: { marginTop: 24, height: 56 },
});
