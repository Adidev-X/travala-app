// ─── InfoGrid ────────────────────────────────────────────────────────────────
// 2-column info display for trip metadata (date, vehicle, AC, etc.)

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import { fontSize, fontWeight } from '../constants/typography';

export interface InfoGridItem {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  valueColor?: string;
}

export interface InfoGridProps {
  items: InfoGridItem[];
}

export const InfoGrid = memo(function InfoGrid({ items }: InfoGridProps) {
  // Pair items into rows of 2
  const rows: InfoGridItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View style={ig.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={ig.row}>
          {row.map((item, ci) => (
            <View key={ci} style={ig.cell}>
              <View style={ig.labelRow}>
                {item.icon ? (
                  <Ionicons name={item.icon} size={12} color={colors.text.hint} />
                ) : null}
                <Text style={ig.label}>{item.label}</Text>
              </View>
              <Text
                style={[ig.value, item.valueColor ? { color: item.valueColor } : null]}
                numberOfLines={2}
              >
                {item.value}
              </Text>
            </View>
          ))}
          {/* Fill odd cell with empty */}
          {row.length === 1 && <View style={ig.cell} />}
        </View>
      ))}
    </View>
  );
});

export default InfoGrid;

const ig = StyleSheet.create({
  grid: {},
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cell: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: 3,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  label: { fontSize: fontSize.xs, color: colors.text.hint },
  value: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
  },
});
