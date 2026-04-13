// ─── PhotoCarousel ───────────────────────────────────────────────────────────
// Horizontal paginated FlatList for trip photos.
// Falls back to a gradient-style placeholder when no photos are provided.

import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import { fontSize, fontWeight } from '../constants/typography';
import type { VehicleType } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
export const CAROUSEL_HEIGHT = 230;

const VEHICLE_ICON: Record<VehicleType, keyof typeof Ionicons.glyphMap> = {
  car: 'car',
  bike: 'bicycle',
  van: 'bus-outline',
  bus: 'bus',
};

export interface PhotoCarouselProps {
  photos?: string[];
  vehicleType?: VehicleType;
  title?: string;
}

export const PhotoCarousel = memo(function PhotoCarousel({
  photos = [],
  vehicleType = 'car',
  title,
}: PhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList<string>>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
      setActiveIndex(idx);
    },
    [],
  );

  const keyExtractor = useCallback((_: string, i: number) => String(i), []);

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Image
        source={{ uri: item }}
        style={cs.photo}
        resizeMode="cover"
      />
    ),
    [],
  );

  if (photos.length === 0) {
    // Placeholder card
    return (
      <View style={cs.placeholder}>
        <View style={cs.placeholderIcon}>
          <Ionicons name={VEHICLE_ICON[vehicleType]} size={56} color={colors.white} />
        </View>
        {title ? <Text style={cs.placeholderText} numberOfLines={2}>{title}</Text> : null}
      </View>
    );
  }

  return (
    <View>
      <FlatList
        ref={flatRef}
        data={photos}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        style={cs.list}
      />
      {/* Pagination dots */}
      {photos.length > 1 && (
        <View style={cs.dots}>
          {photos.map((_, i) => (
            <View
              key={i}
              style={[cs.dot, i === activeIndex && cs.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
});

export default PhotoCarousel;

const cs = StyleSheet.create({
  list: { width: SCREEN_W, height: CAROUSEL_HEIGHT },
  photo: { width: SCREEN_W, height: CAROUSEL_HEIGHT },

  // Placeholder
  placeholder: {
    width: SCREEN_W,
    height: CAROUSEL_HEIGHT,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  placeholderIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.white}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: `${colors.white}cc`,
    paddingHorizontal: spacing.xl,
    textAlign: 'center',
  },

  // Dots
  dots: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: `${colors.white}66`,
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 16,
    borderRadius: 3,
  },
});
