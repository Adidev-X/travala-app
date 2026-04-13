// ─── PostTripTypeScreen ───────────────────────────────────────────────────────
// Entry point for trip creation. Rider picks Full Tour or One-Way.
// Selected card gets primary border + checkmark overlay.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../../constants/colors';
import spacing from '../../constants/spacing';
import { fontSize, fontWeight } from '../../constants/typography';

// ─── Config ───────────────────────────────────────────────────────────────────

type TripTypeKey = 'full_tour' | 'one_way';

interface TripTypeOption {
  key: TripTypeKey;
  route: '/(tabs)/trips/post-full-tour' | '/(tabs)/trips/post-one-way';
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  example: string;
  tag: string;
  tagColor: string;
}

const OPTIONS: TripTypeOption[] = [
  {
    key: 'full_tour',
    route: '/(tabs)/trips/post-full-tour',
    icon: 'map-outline',
    title: 'Full Tour Trip',
    subtitle: 'Multi-day with complete itinerary',
    example: 'Delhi → Manali → Kasol → Delhi',
    tag: 'Multi-day',
    tagColor: colors.secondary,
  },
  {
    key: 'one_way',
    route: '/(tabs)/trips/post-one-way',
    icon: 'arrow-forward-circle-outline',
    title: 'One-way Ride',
    subtitle: 'Single route, point A to B',
    example: 'Delhi → Shimla',
    tag: 'Most popular',
    tagColor: colors.success,
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PostTripTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<TripTypeKey | null>(null);

  const handleSelect = useCallback((key: TripTypeKey) => {
    setSelected(key);
  }, []);

  const handleContinue = useCallback(() => {
    const opt = OPTIONS.find(o => o.key === selected);
    if (!opt) return;
    router.push(opt.route);
  }, [selected, router]);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <Text style={styles.heading}>Create a Trip</Text>
      <Text style={styles.subheading}>
        Choose the type of trip you want to post
      </Text>

      {/* ── Option cards ── */}
      {OPTIONS.map(opt => {
        const isSelected = selected === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => handleSelect(opt.key)}
            activeOpacity={0.85}
          >
            {/* Icon circle */}
            <View
              style={[
                styles.iconCircle,
                isSelected && styles.iconCircleSelected,
              ]}
            >
              <Ionicons
                name={opt.icon}
                size={28}
                color={isSelected ? '#fff' : colors.primary}
              />
            </View>

            {/* Text block */}
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{opt.title}</Text>
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: `${opt.tagColor}22` },
                  ]}
                >
                  <Text
                    style={[styles.tagText, { color: opt.tagColor }]}
                  >
                    {opt.tag}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
              <View style={styles.exampleRow}>
                <Ionicons
                  name="navigate-outline"
                  size={12}
                  color={colors.text.hint}
                />
                <Text style={styles.exampleText}>{opt.example}</Text>
              </View>
            </View>

            {/* Checkmark  */}
            {isSelected ? (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.primary}
              />
            ) : (
              <Ionicons
                name="radio-button-off-outline"
                size={24}
                color={colors.border}
              />
            )}
          </TouchableOpacity>
        );
      })}

      {/* ── Continue button ── */}
      <TouchableOpacity
        style={[
          styles.continueBtn,
          !selected && styles.continueBtnDisabled,
        ]}
        onPress={handleContinue}
        disabled={!selected}
        activeOpacity={0.85}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },

  heading: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },

  // Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}06`,
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${colors.primary}14`,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconCircleSelected: {
    backgroundColor: colors.primary,
  },

  cardBody: { flex: 1 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  tag: {
    borderRadius: 99,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: fontWeight.semiBold,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exampleText: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
    fontStyle: 'italic',
  },

  // Continue button
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  continueBtnDisabled: { opacity: 0.45 },
  continueBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
});
