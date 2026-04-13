// ─── ReviewCard ───────────────────────────────────────────────────────────────
// A single review row: reviewer avatar, name, star rating, text, date.

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import { fontSize, fontWeight } from '../constants/typography';
import type { Review } from '../types';
import UserAvatar from './Avatar';

// ─── Star row helper ──────────────────────────────────────────────────────────

const StarRow = memo(function StarRow({ rating }: { rating: number }) {
  return (
    <View style={ss.starRow}>
      {[1, 2, 3, 4, 5].map(n => (
        <Ionicons
          key={n}
          name={n <= Math.round(rating) ? 'star' : 'star-outline'}
          size={12}
          color="#F59E0B"
          style={{ marginRight: 1 }}
        />
      ))}
    </View>
  );
});

// ─── ReviewCard ───────────────────────────────────────────────────────────────

export interface ReviewCardProps {
  review: Review;
}

const ReviewCard = memo(function ReviewCard({ review }: ReviewCardProps) {
  const dateLabel = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={ss.card}>
      {/* Top row: avatar + name + stars + date */}
      <View style={ss.topRow}>
        <UserAvatar
          uri={review.reviewerPhoto}
          name={review.reviewerName}
          size="sm"
        />
        <View style={ss.meta}>
          <Text style={ss.name} numberOfLines={1}>
            {review.reviewerName}
          </Text>
          <View style={ss.metaBottom}>
            <StarRow rating={review.rating} />
            <Text style={ss.date}>{dateLabel}</Text>
          </View>
        </View>
      </View>

      {/* Review text */}
      {!!review.text && (
        <Text style={ss.text}>{review.text}</Text>
      )}
    </View>
  );
});

export default ReviewCard;

// ─── Styles ───────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  metaBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.text.hint,
  },
  text: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
