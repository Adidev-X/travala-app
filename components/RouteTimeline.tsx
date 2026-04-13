// ─── RouteTimeline ───────────────────────────────────────────────────────────
// Day-wise vertical timeline for full_tour trips.
// Horizontal dots path for one_way trips.

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import { fontSize, fontWeight } from '../constants/typography';
import type { TripItineraryDay } from '../types';

export interface RouteTimelineProps {
  type: 'full_tour' | 'one_way';
  from: string;
  to: string;
  stops?: string[];
  itinerary?: TripItineraryDay[];
}

// ─── One-way horizontal path ──────────────────────────────────────────────────

const OneWayPath = memo(function OneWayPath({
  from,
  to,
  stops = [],
}: {
  from: string;
  to: string;
  stops: string[];
}) {
  const allPoints = [from, ...stops, to];
  return (
    <View>
      {/* Node row */}
      <View style={rt.pathRow}>
        {allPoints.map((_, i) => (
          <React.Fragment key={i}>
            <View
              style={[
                rt.pathDot,
                i === 0 && rt.pathDotStart,
                i === allPoints.length - 1 && rt.pathDotEnd,
              ]}
            />
            {i < allPoints.length - 1 && <View style={rt.pathLine} />}
          </React.Fragment>
        ))}
      </View>
      {/* Label row */}
      <View style={rt.pathLabelRow}>
        {allPoints.map((pt, i) => (
          <Text
            key={i}
            style={[
              rt.pathLabel,
              i === 0 && rt.pathLabelStart,
              i === allPoints.length - 1 && rt.pathLabelEnd,
            ]}
            numberOfLines={1}
          >
            {pt}
          </Text>
        ))}
      </View>
    </View>
  );
});

// ─── Full-tour vertical timeline ──────────────────────────────────────────────

const DayTimeline = memo(function DayTimeline({
  from,
  to,
  itinerary = [],
}: {
  from: string;
  to: string;
  itinerary: TripItineraryDay[];
}) {
  const rows: Array<{ label: string; desc?: string; isFirst?: boolean; isLast?: boolean }> = [
    { label: `Depart: ${from}`, isFirst: true },
    ...itinerary.map(d => ({ label: `Day ${d.day}`, desc: d.description })),
    { label: `Arrive: ${to}`, isLast: true },
  ];

  return (
    <View>
      {rows.map((row, i) => (
        <View key={i} style={dt.row}>
          {/* Connector */}
          <View style={dt.connectorWrap}>
            <View
              style={[
                dt.dot,
                row.isFirst && dt.dotStart,
                row.isLast && dt.dotEnd,
              ]}
            />
            {i < rows.length - 1 && <View style={dt.connector} />}
          </View>
          {/* Content */}
          <View style={dt.content}>
            <Text style={[dt.label, (row.isFirst || row.isLast) && dt.labelBold]}>
              {row.label}
            </Text>
            {row.desc ? <Text style={dt.desc}>{row.desc}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
});

// ─── Public component ─────────────────────────────────────────────────────────

export const RouteTimeline = memo(function RouteTimeline({
  type,
  from,
  to,
  stops = [],
  itinerary = [],
}: RouteTimelineProps) {
  if (type === 'one_way') {
    return <OneWayPath from={from} to={to} stops={stops} />;
  }
  return <DayTimeline from={from} to={to} itinerary={itinerary} />;
});

export default RouteTimeline;

// ─── Styles ───────────────────────────────────────────────────────────────────

// One-way
const rt = StyleSheet.create({
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  pathDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    flexShrink: 0,
  },
  pathDotStart: { backgroundColor: colors.primary, width: 14, height: 14, borderRadius: 7 },
  pathDotEnd: { backgroundColor: colors.success, width: 14, height: 14, borderRadius: 7 },
  pathLine: { flex: 1, height: 2, backgroundColor: colors.border },
  pathLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  pathLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    flex: 1,
  },
  pathLabelStart: { textAlign: 'left', color: colors.primary, fontWeight: fontWeight.semiBold },
  pathLabelEnd: { textAlign: 'right', color: colors.success, fontWeight: fontWeight.semiBold },
});

// Day-wise
const dt = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.xs },
  connectorWrap: { alignItems: 'center', width: 20 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    marginTop: 3,
    flexShrink: 0,
  },
  dotStart: { backgroundColor: colors.primary, width: 14, height: 14, borderRadius: 7, marginTop: 1 },
  dotEnd: { backgroundColor: colors.success, width: 14, height: 14, borderRadius: 7, marginTop: 1 },
  connector: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 3 },
  content: { flex: 1, paddingBottom: spacing.xs },
  label: { fontSize: fontSize.sm, color: colors.text.secondary },
  labelBold: { fontWeight: fontWeight.semiBold, color: colors.text.primary },
  desc: { fontSize: fontSize.xs, color: colors.text.hint, marginTop: 2, lineHeight: 16 },
});
